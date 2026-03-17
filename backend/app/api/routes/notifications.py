import asyncio
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import joinedload
from starlette.responses import StreamingResponse

from app.api.deps import CurrentUser, SessionDep
from app.api.services.notifications import notification_manager
from app.models import Notification

router = APIRouter()

KEEPALIVE_INTERVAL = 15  # seconds


class NotificationResponse(BaseModel):
    id: int
    type: str
    review_id: int
    repo_name: str
    pr_number: int
    provider: str
    error: str | None
    read: bool
    created_at: str


@router.get("", response_model=List[NotificationResponse])
def list_notifications(current_user: CurrentUser, db: SessionDep):
    """Lists notifications for the current user, ordered by most recent first."""
    notifications = (
        db.query(Notification)
        .options(joinedload(Notification.review))
        .filter(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .limit(50)
        .all()
    )
    return [
        NotificationResponse(
            id=n.id,
            type=n.type,
            review_id=n.review_id,
            repo_name=n.review.repo_name,
            pr_number=n.review.pr_number,
            provider=n.review.provider,
            error=n.review.error_message,
            read=n.read,
            created_at=n.created_at.isoformat() if n.created_at else "",
        )
        for n in notifications
    ]


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int, current_user: CurrentUser, db: SessionDep
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notification:
        return {"detail": "Not found"}
    notification.read = True
    db.commit()
    return {"success": True}


@router.patch("/read-all")
def mark_all_read(current_user: CurrentUser, db: SessionDep):
    """Marks all notifications as read for the current user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False,
    ).update({"read": True})
    db.commit()
    return {"success": True}


@router.get("/stream")
async def notification_stream(current_user: CurrentUser) -> StreamingResponse:
    """Streams real-time notifications for the current user using SSE"""
    queue = notification_manager.subscribe(current_user.id)

    async def event_generator():
        try:
            while True:
                try:
                    message = await asyncio.wait_for(
                        queue.get(), timeout=KEEPALIVE_INTERVAL
                    )
                    yield message
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            notification_manager.unsubscribe(current_user.id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

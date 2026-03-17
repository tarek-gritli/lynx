import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.logging import get_logger
from app.models import Notification

logger = get_logger(__name__)


class NotificationManager:
    """In-memory pub/sub for SSE notifications, keyed by user_id."""

    def __init__(self) -> None:
        self._subscribers: dict[int, list[asyncio.Queue[str]]] = {}

    def subscribe(self, user_id: int) -> asyncio.Queue[str]:
        queue: asyncio.Queue[str] = asyncio.Queue()
        self._subscribers.setdefault(user_id, []).append(queue)
        logger.info(f"User {user_id} subscribed to notifications")
        return queue

    def unsubscribe(self, user_id: int, queue: asyncio.Queue[str]) -> None:
        queues = self._subscribers.get(user_id, [])
        if queue in queues:
            queues.remove(queue)
        if not queues:
            self._subscribers.pop(user_id, None)
        logger.info(f"User {user_id} unsubscribed from notifications")

    async def publish(
        self, user_id: int, event: str, review_id: int, db: Session
    ) -> None:
        notification = Notification(
            user_id=user_id,
            review_id=review_id,
            type=event,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        sse_data = {"id": notification.id, "review_id": review_id, "type": event}
        payload = _format_sse(event=event, data=sse_data)
        for queue in self._subscribers.get(user_id, []):
            await queue.put(payload)
        logger.info(f"Published '{event}' notification to user {user_id}")


def _format_sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


notification_manager = NotificationManager()

import hashlib
import hmac
import re

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

from app.api.deps import SessionDep
from app.core.config import settings
from app.logging import get_logger
from app.models import User
from ..services.review import perform_review

logger = get_logger(__name__)

router = APIRouter()


def verify_github_signature(payload, signature_header) -> bool:
    """Verify GitHub webhook signature"""
    if not signature_header:
        raise HTTPException(status_code=403, detail="Missing signature header")

    hash_object = hmac.new(
        settings.github_webhook_secret.encode("utf-8"),
        msg=payload,
        digestmod=hashlib.sha256,
    )

    expected_signature = "sha256=" + hash_object.hexdigest()

    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(status_code=403, detail="Invalid signature")

    return True


def verify_gitlab_token(token: str) -> bool:
    """Verify GitLab webhook token"""
    if not token:
        raise HTTPException(status_code=403, detail="Missing GitLab token")

    if not hmac.compare_digest(token, settings.gitlab_webhook_secret):
        raise HTTPException(status_code=403, detail="Invalid GitLab token")

    return True


@router.post("/github")
async def github_webhook(
    req: Request,
    background_tasks: BackgroundTasks,
    db: SessionDep,
):
    """Handle GitHub webhook events"""
    signature = req.headers.get("X-Hub-Signature-256")

    payload = await req.body()

    verify_github_signature(payload, signature)

    event = req.headers.get("X-Github-Event")
    data = await req.json()

    installation_id = data["installation"]["id"]
    sender_username = data["sender"]["login"]

    logger.info(
        f"GitHub webhook received - Event: {event}, Action: {data.get('action')}, User: {sender_username}"
    )

    if event == "pull_request" and data.get("action") == "opened":
        pr_number = data["pull_request"]["number"]
        repo_name = data["repository"]["full_name"]

        user = db.query(User).filter(User.github_username == sender_username).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        background_tasks.add_task(
            perform_review,
            repo_name=repo_name,
            pr_number=pr_number,
            user_id=user.id,
            db=db,
            platform="github",
            installation_id=installation_id,
        )

        return {"status": "queued for review"}

    elif event == "issue_comment" and data.get("action") == "created":
        comment_body = data["comment"]["body"].strip()
        if re.match(r"^/review\b", comment_body, re.IGNORECASE):
            pr_number = data["issue"]["number"]
            repo_name = data["repository"]["full_name"]

            user = (
                db.query(User).filter(User.github_username == sender_username).first()
            )
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            background_tasks.add_task(
                perform_review,
                repo_name=repo_name,
                pr_number=pr_number,
                user_id=user.id,
                db=db,
                platform="github",
                installation_id=installation_id,
            )

            return {"status": "queued for review"}

    return {"status": "event_ignored"}


@router.post("/gitlab")
async def gitlab_webhook(
    req: Request,
    background_tasks: BackgroundTasks,
    db: SessionDep,
):
    """Handle GitLab webhook events"""
    token = req.headers.get("X-Gitlab-Token")

    verify_gitlab_token(token)

    data = await req.json()

    sender_username = data["user"]["username"]
    event_type = data.get("event_type")
    object_attributes = data.get("object_attributes", {})
    action = object_attributes.get("action")

    logger.info(
        f"GitLab webhook received - Event: {event_type}, Action: {action}, User: {sender_username}"
    )

    if event_type == "merge_request" and action == "open":
        mr_number = object_attributes.get("iid")
        repo_name = data["project"]["path_with_namespace"]

        user = db.query(User).filter(User.gitlab_username == sender_username).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        background_tasks.add_task(
            perform_review,
            repo_name=repo_name,
            pr_number=mr_number,
            user_id=user.id,
            db=db,
            platform="gitlab",
        )

        return {"status": "queued for review"}

    elif (
        event_type == "note"
        and object_attributes.get("noteable_type") == "MergeRequest"
    ):
        comment_body = object_attributes.get("note", "").strip()
        if re.match(r"^/review\b", comment_body, re.IGNORECASE):
            mr_number = data["merge_request"]["iid"]
            repo_name = data["project"]["path_with_namespace"]

            user = (
                db.query(User).filter(User.gitlab_username == sender_username).first()
            )
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            background_tasks.add_task(
                perform_review,
                repo_name=repo_name,
                pr_number=mr_number,
                user_id=user.id,
                db=db,
                platform="gitlab",
            )

            return {"status": "queued for review"}

    return {"status": "event_ignored"}

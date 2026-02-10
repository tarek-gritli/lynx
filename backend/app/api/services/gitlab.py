from datetime import datetime, timedelta, timezone

import httpx
from gitlab import Gitlab
from sqlalchemy.orm import Session

from app.core.config import settings
from app.utils.crypto import decrypt_key, encrypt_key


def get_gitlab_client(oauth_token: str) -> Gitlab:
    """Get a GitLab client using the user's OAuth token"""
    return Gitlab(settings.gitlab_url, oauth_token=oauth_token)


def is_token_expired(expires_at: datetime, buffer_minutes: int = 5) -> bool:
    """Check if token is expired or will expire soon"""
    if expires_at is None:
        return False

    buffer = timedelta(minutes=buffer_minutes)
    return datetime.now(timezone.utc) >= (expires_at - buffer)


def refresh_gitlab_token(user, db: Session) -> str:
    """Refresh gitlab Oauth token and store"""

    if not user.gitlab_refresh_token:
        raise ValueError(
            "No refresh token available. User needs to re-authenticate with GitLab."
        )

    refresh_token = decrypt_key(user.gitlab_refresh_token)

    with httpx.Client() as client:
        response = client.post(
            f"{settings.gitlab_url}/oauth/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.gitlab_client_id,
                "client_secret": settings.gitlab_client_secret,
            },
        )

    if response.status_code != 200:
        raise ValueError(
            "Failed to refresh GitLab token. User needs to re-authenticate."
        )

    token_data = response.json()
    new_access_token = token_data.get("access_token")
    new_refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in")

    if not new_access_token:
        raise ValueError(
            "No access token in refresh response. User needs to re-authenticate."
        )

    token_expires_at = None
    if expires_in:
        token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    user.gitlab_access_token = encrypt_key(new_access_token)
    if new_refresh_token:
        user.gitlab_refresh_token = encrypt_key(new_refresh_token)
    user.gitlab_token_expires_at = token_expires_at
    db.commit()

    return new_access_token


def get_valid_gitlab_token(user, db: Session) -> str:
    """Get valid Gitlab token"""
    if not user.gitlab_access_token:
        raise ValueError(
            "User has no GitLab access token. Please connect GitLab account."
        )

    if is_token_expired(user.gitlab_token_expires_at):
        return refresh_gitlab_token(user, db)

    return decrypt_key(user.gitlab_access_token)


def get_project(gl: Gitlab, project_path: str):
    """Get a GitLab project by path"""
    return gl.projects.get(project_path)


def get_merge_request(project, mr_iid: int):
    """Get a merge request by iid"""
    return project.mergerequests.get(mr_iid)


def create_mr_note(mr, body: str):
    """Create a comment/note on a merge request"""
    return mr.notes.create({"body": body})


def get_mr_changes(mr) -> list:
    """Get the changes/diffs for a merge request"""
    return mr.changes()["changes"]

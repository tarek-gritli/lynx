from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import RedirectResponse

from app.api.deps import (
    COOKIE_NAME,
    CurrentUser,
    SessionDep,
    create_access_token,
)
from app.core.config import settings
from app.models import User
from app.utils.crypto import encrypt_key

router = APIRouter()

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITLAB_AUTHORIZE_URL = f"{settings.gitlab_url}/oauth/authorize"
GITLAB_TOKEN_URL = f"{settings.gitlab_url}/oauth/token"
GITLAB_USER_URL = f"{settings.gitlab_url}/api/v4/user"


@router.get("/github")
async def github_login():
    """Redirect to GitHub OAuth authorization page"""
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": f"{settings.backend_url}/auth/github/callback",
        "scope": "read:user user:email",
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GITHUB_AUTHORIZE_URL}?{query_string}")


@router.get("/github/callback")
async def github_callback(code: str, db: SessionDep):
    """Handle GitHub OAuth callback"""
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )

    if token_response.status_code != 200:

        raise HTTPException(status_code=400, detail="Failed to get access token")

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="No access token received")

    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            GITHUB_USER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

    if user_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get user info")

    github_user = user_response.json()
    github_id = github_user["id"]
    github_username = github_user["login"]
    github_image_url = github_user["avatar_url"]
    email = github_user["email"]

    user = db.query(User).filter(User.github_id == github_id).first()

    if user:
        if (
            user.github_username != github_username
            or user.github_image_url != github_image_url
            or user.email != email
        ):
            user.github_username = github_username
            user.github_image_url = github_image_url
            if email:
                user.email = email
            db.commit()
    elif email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.github_id = github_id
            user.github_username = github_username
            user.github_image_url = github_image_url
            db.commit()
        else:
            user = User(
                github_id=github_id,
                github_username=github_username,
                github_image_url=github_image_url,
                email=email,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        user = User(
            github_id=github_id,
            github_username=github_username,
            github_image_url=github_image_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token(
        {"sub": str(user.id), "github_username": github_username}
    )

    response = RedirectResponse(url=f"{settings.frontend_url}/auth/callback")
    response.set_cookie(
        key=COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        domain=None,
    )
    return response


@router.get("/gitlab")
async def gitlab_login():
    """Redirect to GitLab OAuth authorization page"""
    if not settings.gitlab_client_id:
        raise HTTPException(status_code=501, detail="GitLab OAuth not configured")

    params = {
        "client_id": settings.gitlab_client_id,
        "redirect_uri": f"{settings.backend_url}/auth/gitlab/callback",
        "response_type": "code",
        "scope": "read_user api",
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GITLAB_AUTHORIZE_URL}?{query_string}")


@router.get("/gitlab/callback")
async def gitlab_callback(code: str, db: SessionDep):
    """Handle GitLab OAuth callback"""
    if not settings.gitlab_client_id:
        raise HTTPException(status_code=501, detail="GitLab OAuth not configured")

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GITLAB_TOKEN_URL,
            data={
                "client_id": settings.gitlab_client_id,
                "client_secret": settings.gitlab_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{settings.backend_url}/auth/gitlab/callback",
            },
            headers={"Accept": "application/json"},
        )

    if token_response.status_code != 200:
        raise HTTPException(
            status_code=400, detail="Failed to get access token from GitLab"
        )

    token_data = token_response.json()

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in")

    if not access_token:
        raise HTTPException(
            status_code=400, detail="No access token received from GitLab"
        )

    token_expires_at = None
    if expires_in:
        token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    encrypted_access_token = encrypt_key(access_token)
    encrypted_refresh_token = encrypt_key(refresh_token) if refresh_token else None

    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            GITLAB_USER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

    if user_response.status_code != 200:
        raise HTTPException(
            status_code=400, detail="Failed to get user info from GitLab"
        )

    gitlab_user = user_response.json()
    gitlab_id = gitlab_user["id"]
    gitlab_username = gitlab_user["username"]
    gitlab_image_url = gitlab_user["avatar_url"]
    email = gitlab_user["email"]

    user = db.query(User).filter(User.gitlab_id == gitlab_id).first()

    if user:
        user.gitlab_access_token = encrypted_access_token
        user.gitlab_refresh_token = encrypted_refresh_token
        user.gitlab_token_expires_at = token_expires_at
        if (
            user.gitlab_username != gitlab_username
            or user.gitlab_image_url != gitlab_image_url
            or user.email != email
        ):
            user.gitlab_username = gitlab_username
            user.gitlab_image_url = gitlab_image_url
            if email:
                user.email = email
        db.commit()
    elif email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.gitlab_id = gitlab_id
            user.gitlab_username = gitlab_username
            user.gitlab_image_url = gitlab_image_url
            user.gitlab_access_token = encrypted_access_token
            user.gitlab_refresh_token = encrypted_refresh_token
            user.gitlab_token_expires_at = token_expires_at
            db.commit()
        else:
            user = User(
                gitlab_id=gitlab_id,
                gitlab_username=gitlab_username,
                gitlab_image_url=gitlab_image_url,
                email=email,
                gitlab_access_token=encrypted_access_token,
                gitlab_refresh_token=encrypted_refresh_token,
                gitlab_token_expires_at=token_expires_at,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        user = User(
            gitlab_id=gitlab_id,
            gitlab_username=gitlab_username,
            gitlab_image_url=gitlab_image_url,
            gitlab_access_token=encrypted_access_token,
            gitlab_refresh_token=encrypted_refresh_token,
            gitlab_token_expires_at=token_expires_at,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token(
        {"sub": str(user.id), "gitlab_username": gitlab_username}
    )

    response = RedirectResponse(url=f"{settings.frontend_url}/auth/callback")
    response.set_cookie(
        key=COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        domain=None,
    )
    return response


@router.get("/me")
async def get_current_user_info(current_user: CurrentUser):
    """Get current authenticated user info"""
    return {
        "id": current_user.id,
        "github_username": current_user.github_username,
        "github_id": current_user.github_id,
        "github_image_url": current_user.github_image_url,
        "gitlab_username": current_user.gitlab_username,
        "gitlab_id": current_user.gitlab_id,
        "gitlab_image_url": current_user.gitlab_image_url,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookie and logout user"""
    response.delete_cookie(key=COOKIE_NAME)
    return {"message": "Logged out successfully"}

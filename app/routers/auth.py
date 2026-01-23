from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
import jwt
from datetime import datetime, timedelta, timezone

from app.config import settings
from app.database import get_db
from app.models import User

router = APIRouter()

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"

COOKIE_NAME = "lynx_token"


def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Dependency to get current user from JWT cookie"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )
    
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    
    return user


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
async def github_callback(code: str, db: Session = Depends(get_db)):
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
    github_image_url = github_user.get("avatar_url")
    
    user = db.query(User).filter(User.github_id == github_id).first()
    
    if not user:
        user = User(github_id=github_id, github_username=github_username, github_image_url=github_image_url)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.github_username != github_username or user.github_image_url != github_image_url:
        user.github_username = github_username
        user.github_image_url = github_image_url
        db.commit()
    
    jwt_token = create_access_token({"sub": str(user.id), "github_username": github_username})
    
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
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info"""
    return {
        "id": current_user.id,
        "github_username": current_user.github_username,
        "github_image_url": current_user.github_image_url,
        "created_at": current_user.created_at,
    }


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookie and logout user"""
    response.delete_cookie(key=COOKIE_NAME)
    return {"message": "Logged out successfully"}
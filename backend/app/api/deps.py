from datetime import datetime, timedelta, timezone
from typing import Annotated, Generator

import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models import User

COOKIE_NAME = "lynx_token"


def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(
    data: dict, expires_delta: timedelta = timedelta(days=7)
) -> str:
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


# Type aliases for cleaner dependency injection (FastAPI template pattern)
SessionDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    github_id = Column(Integer, unique=True, index=True, nullable=True)
    github_username = Column(String, unique=True, index=True, nullable=True)
    github_image_url = Column(String, nullable=True)

    gitlab_id = Column(Integer, unique=True, index=True, nullable=True)
    gitlab_username = Column(String, unique=True, index=True, nullable=True)
    gitlab_image_url = Column(String, nullable=True)
    gitlab_access_token = Column(Text, nullable=True)
    gitlab_refresh_token = Column(Text, nullable=True)
    gitlab_token_expires_at = Column(DateTime(timezone=True), nullable=True)

    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    api_keys = relationship(
        "APIKey", back_populates="user", cascade="all, delete-orphan"
    )


class APIKey(Base):
    __tablename__ = "api_keys"
    __table_args__ = (UniqueConstraint("user_id", "provider", name="uq_user_provider"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    encrypted_key = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="api_keys")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    repo_name = Column(String, nullable=False)
    status = Column(String, default="success", nullable=False)
    error_message = Column(Text, nullable=True)

    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)

    review_text = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

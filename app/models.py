from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id=Column(Integer, primary_key=True, index=True)
    github_username = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 
    

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    encrypted_key = Column(Text, nullable=False)
    provider = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models import User, APIKey
from app.database import get_db
from .auth import get_current_user
from app.utils.crypto import encrypt_api_key
from app.services.validation import validate_api_key

router = APIRouter()

SUPPORTED_PROVIDERS = ["openai", "gemini", "claude"]

class SetAPIKeyRequest(BaseModel):
    provider: str
    model: str
    api_key: str


@router.post("/api-key")
def set_api_key(
    req: SetAPIKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    is_valid, message = validate_api_key(req.provider, req.api_key)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid API key: {message}")

    encrypted = encrypt_api_key(req.api_key)
    
    existing = db.query(APIKey).filter(APIKey.user_id == current_user.id, APIKey.provider == req.provider).first()
    
    if existing:
        existing.encrypted_key = encrypted
    else:
        new_key = APIKey(
            user_id = current_user.id,
            encrypted_key = encrypted,
            provider = req.provider,
            model = req.model
        )
        db.add(new_key)
    db.commit()
    
    return {"status": "success"}

class DeleteAPIKeyRequest(BaseModel):
    provider: str
    
@router.delete("/api-key")
def delete_api_key(
    req: DeleteAPIKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported provider")
    
    existing = db.query(APIKey).filter(APIKey.user_id == current_user.id, APIKey.provider == req.provider).first()
    
    if existing:
        db.delete(existing)
        db.commit()
    
    return {"status": "success"}


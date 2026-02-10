from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.deps import CurrentUser, SessionDep
from app.constants import PROVIDER_MODELS, Provider
from app.models import APIKey
from app.utils.crypto import encrypt_key

from ..services.validation import validate_api_key

router = APIRouter()


class SetAPIKeyRequest(BaseModel):
    provider: Provider
    model: str
    api_key: str


def validate_model_for_provider(provider: Provider, model: str) -> bool:
    """Check if the model is valid for the given provider"""
    return model in PROVIDER_MODELS.get(provider, set())


@router.post("/api-key")
def set_api_key(
    req: SetAPIKeyRequest,
    db: SessionDep,
    current_user: CurrentUser,
):
    if not validate_model_for_provider(req.provider, req.model):
        valid_models = ", ".join(sorted(PROVIDER_MODELS[req.provider]))
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model '{req.model}' for provider '{req.provider}'. Valid models: {valid_models}",
        )

    is_valid, message = validate_api_key(req.provider, req.api_key)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid API key: {message}")

    encrypted = encrypt_key(req.api_key)

    existing = (
        db.query(APIKey)
        .filter(APIKey.user_id == current_user.id, APIKey.provider == req.provider)
        .first()
    )

    if existing:
        existing.encrypted_key = encrypted
        if req.model and req.model != existing.model:
            existing.model = req.model
    else:
        new_key = APIKey(
            user_id=current_user.id,
            encrypted_key=encrypted,
            provider=req.provider,
            model=req.model,
        )
        db.add(new_key)
    db.commit()

    return {"status": "success"}


class DeleteAPIKeyRequest(BaseModel):
    provider: Provider


@router.delete("/api-key")
def delete_api_key(
    req: DeleteAPIKeyRequest,
    db: SessionDep,
    current_user: CurrentUser,
):
    existing = (
        db.query(APIKey)
        .filter(APIKey.user_id == current_user.id, APIKey.provider == req.provider)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()

    return {"status": "success"}

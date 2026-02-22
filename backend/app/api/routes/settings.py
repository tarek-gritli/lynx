from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.deps import CurrentUser, SessionDep
from app.constants import PROVIDER_MODELS, Provider
from app.models import APIKey
from app.utils.crypto import encrypt_key

from ..services.validation import validate_api_key

router = APIRouter()


class ProviderModels(BaseModel):
    provider: str
    models: list[str]


class SetAPIKeyRequest(BaseModel):
    provider: Provider
    model: str
    api_key: str


class DeleteAPIKeyRequest(BaseModel):
    provider: Provider


class ToggleAPIKeyRequest(BaseModel):
    provider: Provider
    is_active: bool


class BulkSetAPIKeysRequest(BaseModel):
    api_keys: list[SetAPIKeyRequest]


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


@router.patch("/api-key/toggle")
def toggle_api_key(
    req: ToggleAPIKeyRequest,
    db: SessionDep,
    current_user: CurrentUser,
):
    existing = (
        db.query(APIKey)
        .filter(APIKey.user_id == current_user.id, APIKey.provider == req.provider)
        .first()
    )

    if not existing:
        raise HTTPException(status_code=404, detail="API key not found")

    existing.is_active = req.is_active
    db.commit()

    return {"status": "success", "is_active": req.is_active}


@router.get("/api-keys")
def get_current_api_keys(
    db: SessionDep,
    current_user: CurrentUser,
):
    """Get all API keys for the current user"""
    api_keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).all()

    return [
        {
            "provider": key.provider,
            "model": key.model,
            "is_active": key.is_active,
        }
        for key in api_keys
    ]


@router.get("/models")
def get_supported_models() -> list[ProviderModels]:
    """Get all supported models for each provider"""
    result = []

    for provider, models in PROVIDER_MODELS.items():
        result.append(ProviderModels(provider=provider, models=sorted(models)))

    return result


@router.post("/api-keys/bulk")
def bulk_set_api_keys(
    req: BulkSetAPIKeysRequest,
    db: SessionDep,
    current_user: CurrentUser,
):
    """Save multiple API keys at once"""
    results = []
    errors = []

    for key_req in req.api_keys:
        try:
            if not validate_model_for_provider(key_req.provider, key_req.model):
                valid_models = ", ".join(sorted(PROVIDER_MODELS[key_req.provider]))
                errors.append(
                    {
                        "provider": key_req.provider,
                        "error": f"Invalid model '{key_req.model}'. Valid models: {valid_models}",
                    }
                )
                continue

            is_valid, message = validate_api_key(key_req.provider, key_req.api_key)
            if not is_valid:
                errors.append(
                    {
                        "provider": key_req.provider,
                        "error": f"Invalid API key",
                    }
                )
                continue

            encrypted = encrypt_key(key_req.api_key)

            existing = (
                db.query(APIKey)
                .filter(
                    APIKey.user_id == current_user.id,
                    APIKey.provider == key_req.provider,
                )
                .first()
            )

            if existing:
                existing.encrypted_key = encrypted
                if key_req.model and key_req.model != existing.model:
                    existing.model = key_req.model
            else:
                new_key = APIKey(
                    user_id=current_user.id,
                    encrypted_key=encrypted,
                    provider=key_req.provider,
                    model=key_req.model,
                )
                db.add(new_key)

            results.append({"provider": key_req.provider, "status": "success"})
        except Exception as e:
            errors.append({"provider": key_req.provider, "error": str(e)})

    db.commit()

    return {
        "status": "completed",
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }

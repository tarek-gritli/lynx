from fastapi import APIRouter

from app.api.routes import auth, dashboard, settings, templates, webhooks

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(dashboard.router, prefix="/usage", tags=["dashboard"])

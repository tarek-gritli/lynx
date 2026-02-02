from contextlib import asynccontextmanager

from fastapi import FastAPI

from .logging import get_logger, setup_logging
from .routers import auth, settings, webhooks

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Lynx API starting up")
    yield
    logger.info("Lynx API shutting down")


app = FastAPI(title="Lynx", lifespan=lifespan)

app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])


@app.get("/")
def root():
    return {"message": "Lynx is alive"}

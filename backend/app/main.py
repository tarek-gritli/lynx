from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.main import api_router
from app.core.config import settings
from app.logging import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Lynx API starting up")
    yield
    logger.info("Lynx API shutting down")


app = FastAPI(title="Lynx", lifespan=lifespan)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {"message": "Lynx is alive"}

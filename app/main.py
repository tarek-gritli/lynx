from fastapi import FastAPI

from .routers import webhooks
from .database import engine
from .models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lynx")

app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

@app.get("/")
def root():
    return {"message": "Lynx is alive"}
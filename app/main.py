from fastapi import FastAPI

from .routers import auth, settings, webhooks

app = FastAPI(title="Lynx")

app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])


@app.get("/")
def root():
    return {"message": "Lynx is alive"}

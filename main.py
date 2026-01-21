from typing import Union

from fastapi import FastAPI

app = FastAPI(title="Lynx")


@app.get("/")
def root():
    return {"message": "Lynx is alive"}
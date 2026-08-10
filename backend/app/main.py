from fastapi import FastAPI

from .database import Base, engine
from . import models


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Coding Assessment API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "AI Coding Assessment API is running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
    }
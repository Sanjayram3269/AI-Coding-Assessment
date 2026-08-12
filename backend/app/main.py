import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, run_lightweight_migrations
from . import models
from .routes.tests import router as tests_router
from .routes.submissions import router as submissions_router


Base.metadata.create_all(bind=engine)
run_lightweight_migrations()


app = FastAPI(
    title="AI Coding Assessment API",
    version="1.0.0",
)


# Local dev origins are always allowed. Add your deployed frontend
# origin(s) via FRONTEND_URL (comma-separated for more than one,
# e.g. a production domain plus Vercel preview URLs).
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_url = os.getenv("FRONTEND_URL")

if frontend_url:
    allowed_origins.extend(
        origin.strip()
        for origin in frontend_url.split(",")
        if origin.strip()
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(tests_router)
app.include_router(
    submissions_router
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
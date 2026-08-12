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


# Allow the Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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
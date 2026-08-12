import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker


load_dotenv()


DATABASE_URL = os.getenv(
    "DATABASE_URL", "sqlite:///./assessment.db"
)

# Render (and some other hosts) hand out "postgres://", which
# SQLAlchemy 2.0 no longer accepts — it requires "postgresql://".
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

IS_SQLITE = DATABASE_URL.startswith("sqlite")


class Base(DeclarativeBase):
    pass


engine = create_engine(
    DATABASE_URL,
    connect_args=(
        {"check_same_thread": False} if IS_SQLITE else {}
    ),
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def run_lightweight_migrations():
    """
    SQLAlchemy's create_all() only creates tables that don't exist
    yet — it never alters an existing table. This adds any columns
    introduced after a database was first created, so an existing
    local/production database doesn't need to be dropped whenever
    the schema grows.
    """

    inspector = inspect(engine)

    if "test_invites" not in inspector.get_table_names():
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("test_invites")
    }

    with engine.begin() as connection:

        if "profile_id" not in existing_columns:
            connection.execute(
                text(
                    "ALTER TABLE test_invites "
                    "ADD COLUMN profile_id VARCHAR(100)"
                )
            )

        if "scheduled_at" not in existing_columns:
            connection.execute(
                text(
                    "ALTER TABLE test_invites "
                    "ADD COLUMN scheduled_at VARCHAR(40)"
                )
            )
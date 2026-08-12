from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker


DATABASE_URL = "sqlite:///./assessment.db"


class Base(DeclarativeBase):
    pass


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
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
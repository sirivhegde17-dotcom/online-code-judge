from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator
from app.core.config import settings

engine = create_engine(
    settings.sync_database_url,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db() -> None:
    """
    Initialize database tables safely.
    Safe to run repeatedly as Base.metadata.create_all only creates non-existing tables.
    """
    import app.models  # noqa: F401 - Ensures all models are registered with Base.metadata
    Base.metadata.create_all(bind=engine)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


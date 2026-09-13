"""
Database connection and session factory for PS-26009 MOIL Mining Intelligence Platform.
Supports PostgreSQL and SQLite fallback for local demo mode.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database.models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/processed/moil_mining.db")

# Ensure directory exists if SQLite
if DATABASE_URL.startswith("sqlite"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables in the configured database."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency for database session management."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

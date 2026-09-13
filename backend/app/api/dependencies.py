"""
FastAPI dependency injectors.
"""
from database.connection import get_db

# Re-export get_db for route dependencies
__all__ = ["get_db"]

"""
Application configuration using Pydantic Settings.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "MOIL AI/ML Mining Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    APP_MODE: str = "demo"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./data/processed/moil_mining.db"
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

"""
Application configuration using Pydantic Settings.
"""
import os
from typing import List, Union, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "MOIL AI/ML Mining Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    APP_MODE: str = "demo"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/processed/moil_mining.db")
    WEATHERSTACK_API_KEY: Optional[str] = os.getenv("WEATHERSTACK_API_KEY", None)
    NASA_FIRMS_MAP_KEY: Optional[str] = os.getenv("NASA_FIRMS_MAP_KEY", None)
    FIRMS_SOURCE: str = os.getenv("FIRMS_SOURCE", "VIIRS_NOAA21_NRT")
    FIRMS_RADIUS_KM: float = float(os.getenv("FIRMS_RADIUS_KM", "20.0"))
    FIRMS_LOOKBACK_DAYS: int = int(os.getenv("FIRMS_LOOKBACK_DAYS", "1"))
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(env_file=[".env", "backend/app/.env"], extra="ignore")


settings = Settings()

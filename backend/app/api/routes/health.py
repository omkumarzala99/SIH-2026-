from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.api.dependencies import get_db
from backend.app.config import settings
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])


def check_models_health():
    # Health route is located at backend/app/api/routes/health.py (5 levels deep from project root)
    root_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    models_dir = root_dir / "ai_ml" / "models"
    if not models_dir.exists():
        models_dir = Path.cwd() / "ai_ml" / "models"

    reserve_path = models_dir / "reserve_model.joblib"
    production_path = models_dir / "production_model.joblib"
    return {
        "reserve_model": "available" if reserve_path.exists() else "missing",
        "production_model": "available" if production_path.exists() else "missing"
    }


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint validating API, database connectivity, and ML model readiness."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"degraded: {str(e)}"

    models_status = check_models_health()
    overall_status = "online" if db_status == "connected" else "degraded"

    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "mode": settings.APP_MODE,
        "database": db_status,
        "models": models_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

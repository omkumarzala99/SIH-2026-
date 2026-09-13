"""
Lightweight model registry and version tracker.
"""
from typing import Dict, Any


MODEL_REGISTRY: Dict[str, Dict[str, Any]] = {
    "reserve_model": {
        "name": "Manganese Reserve Classification Model",
        "version": "v1.2.0",
        "algorithm": "RandomForestClassifier + Spatial Kriging",
        "target_metric": "ROC-AUC: 0.88",
        "status": "ACTIVE"
    },
    "production_model": {
        "name": "Daily Extraction Forecaster",
        "version": "v1.1.0",
        "algorithm": "GradientBoostingRegressor + Constraint Loss",
        "target_metric": "R2: 0.85, MAE: 32.4t",
        "status": "ACTIVE"
    },
    "risk_engine": {
        "name": "Multi-Factor Mining Risk Engine",
        "version": "v1.0.0",
        "algorithm": "Domain Heuristics + Operational Stress Scoring",
        "target_metric": "Sensitivity: 0.91",
        "status": "ACTIVE"
    }
}


def get_model_metadata(model_key: str) -> Dict[str, Any]:
    return MODEL_REGISTRY.get(model_key, {"name": "Unknown", "version": "v1.0.0"})

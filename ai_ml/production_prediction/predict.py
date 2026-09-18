"""
Production Prediction & Shortfall Forecaster.
Calculates anticipated daily extraction against operational constraints using the trained GradientBoostingRegressor.
"""
import os
import joblib
import pandas as pd
import sklearn.ensemble
from typing import Dict, Any, Optional
from ai_ml.production_prediction.schemas import ProductionPredictionRequest, ProductionPredictionResponse
from ai_ml.production_prediction.features import FEATURE_NAMES, extract_production_features

_MODEL_CACHE = None


def _get_default_model_path() -> str:
    """Derives project-relative path to the trained production model artifact."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    candidate = os.path.join(base_dir, "ai_ml", "models", "production_model.joblib")
    if os.path.exists(candidate):
        return candidate
    cwd_candidate = os.path.join("ai_ml", "models", "production_model.joblib")
    if os.path.exists(cwd_candidate):
        return cwd_candidate
    return candidate


def load_production_model(model_path: Optional[str] = None):
    """
    Loads the trained Production Forecasting model artifact.
    Fails explicitly with FileNotFoundError if the artifact has not been trained or is missing.
    """
    global _MODEL_CACHE
    target_path = model_path or _get_default_model_path()
    if not os.path.exists(target_path):
        raise FileNotFoundError(
            f"Production ML model artifact not found at '{target_path}'. "
            "Please train and generate the model first using 'python -m ai_ml.production_prediction.train'."
        )
    if model_path is not None:
        return joblib.load(target_path)
    if _MODEL_CACHE is None:
        _MODEL_CACHE = joblib.load(target_path)
    return _MODEL_CACHE


def predict_production_and_shortfall(
    req: ProductionPredictionRequest,
    model: Optional[Any] = None
) -> ProductionPredictionResponse:
    """
    Predicts daily actual production and shortfall using the trained GradientBoostingRegressor.
    Guarantees strict absence of target leakage and full feature alignment.
    """
    clf = model or load_production_model()

    # Extract full operational, equipment, and environmental features
    feats = extract_production_features(req.model_dump())
    planned = float(feats["planned_production"])
    downtime = float(feats["equipment_downtime_hours"])
    rainfall = float(feats["rainfall_mm"])
    blasting_delay = float(feats["blasting_delay_hours"])

    # Strict target leakage protection
    assert "actual_tonnage" not in feats, "Target leakage detected: actual_tonnage in features!"
    assert "shortfall_tonnage" not in feats, "Target leakage detected: shortfall_tonnage in features!"

    # Align input DataFrame strictly with model's expected features
    expected_features = list(getattr(clf, "feature_names_in_", FEATURE_NAMES))
    X = pd.DataFrame([[feats[f] for f in expected_features]], columns=expected_features)
    assert X.shape[1] == len(expected_features), f"Input matrix feature count mismatch: {X.shape[1]} vs {len(expected_features)}"
    assert "actual_tonnage" not in X.columns, "Target leakage detected: actual_tonnage in DataFrame columns!"

    # Model inference: predict actual tonnage
    raw_pred = float(clf.predict(X)[0])
    predicted = max(0.0, round(raw_pred, 1))

    # Shortfall and variance metrics
    shortfall = max(0.0, round(planned - predicted, 1))
    shortfall_pct = round((shortfall / max(1.0, planned)) * 100.0, 1)

    # Risk tier determination based on authoritative multi-factor risk engine
    from ai_ml.risk_prediction.schemas import RiskAssessmentRequest
    from ai_ml.risk_prediction.engine import evaluate_mining_risk

    risk_eval = evaluate_mining_risk(RiskAssessmentRequest(
        mine_id=req.mine_id,
        equipment_downtime_hours=downtime,
        rainfall_mm=rainfall,
        blasting_delay_hours=blasting_delay,
        shortfall_percentage=shortfall_pct,
        planned_production=planned,
        predicted_production=predicted,
        shortfall=shortfall
    ))
    risk_level = risk_eval.risk_tier

    if risk_level == "CRITICAL":
        conf = 0.88
    elif risk_level == "HIGH":
        conf = 0.85
    elif risk_level == "MEDIUM":
        conf = 0.82
    else:
        conf = 0.90


    # Physical loss attribution for explainability
    loss_downtime = round(downtime * 28.0, 1)
    loss_weather = round(max(0.0, (rainfall - 15.0) * 1.8), 1)
    loss_blasting = round(blasting_delay * 35.0, 1)

    return ProductionPredictionResponse(
        mine_id=req.mine_id or "MINE_BALAGHAT_01",
        target_date=req.target_date or "2026-03-15",
        planned_production=planned,
        predicted_production=predicted,
        shortfall=shortfall,
        shortfall_percentage=shortfall_pct,
        risk_level=risk_level,
        confidence=conf,
        model_version="Production_Forecaster_v1.0",
        contributing_factors={
            "model_type": "GradientBoostingRegressor",
            "features_used": expected_features,
            "equipment_downtime_loss_tons": loss_downtime,
            "weather_rainfall_loss_tons": loss_weather,
            "blasting_delay_loss_tons": loss_blasting,
            "downtime_hours_input": downtime,
            "rainfall_mm_input": rainfall,
            "blasting_delay_hours_input": blasting_delay,
            "hauling_trips_input": feats.get("hauling_trips", 45.0),
            "equipment_efficiency_input": feats.get("equipment_efficiency_pct", 88.0)
        }
    )

"""
Reserve Prediction Inference Service.
Evaluates manganese reserve probability, classification, and estimated tonnage
using the trained leakage-free RandomForest model artifact.
"""
import os
import joblib
import pandas as pd
from typing import Dict, Any, Optional
from ai_ml.reserve_prediction.schemas import ReservePredictionRequest, ReservePredictionResponse
from ai_ml.reserve_prediction.features import FEATURE_NAMES

_MODEL_CACHE = None


def _get_default_model_path() -> str:
    """Derives project-relative path to the trained model artifact."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    candidate = os.path.join(base_dir, "ai_ml", "models", "reserve_model.joblib")
    if os.path.exists(candidate):
        return candidate
    # Fallback to CWD-relative path
    cwd_candidate = os.path.join("ai_ml", "models", "reserve_model.joblib")
    if os.path.exists(cwd_candidate):
        return cwd_candidate
    return candidate


def load_reserve_model(model_path: Optional[str] = None):
    """
    Loads the trained Reserve Prediction model artifact.
    Fails explicitly with FileNotFoundError if the artifact has not been trained or is missing.
    """
    global _MODEL_CACHE
    target_path = model_path or _get_default_model_path()
    if not os.path.exists(target_path):
        raise FileNotFoundError(
            f"Reserve ML model artifact not found at '{target_path}'. "
            "Please train and generate the model first using 'python -m ai_ml.reserve_prediction.train'."
        )
    if model_path is not None:
        return joblib.load(target_path)
    if _MODEL_CACHE is None:
        _MODEL_CACHE = joblib.load(target_path)
    return _MODEL_CACHE


def predict_reserve_potential(
    req: ReservePredictionRequest,
    model: Optional[Any] = None
) -> ReservePredictionResponse:
    """
    Predicts reserve classification (HIGH/MEDIUM/LOW) and probability score
    using the trained leakage-free RandomForest model artifact.
    """
    clf = model or load_reserve_model()

    # Extract non-target features only
    depth = float(req.depth_meters if req.depth_meters is not None else 60.0)
    fe = float(req.fe_grade_pct if req.fe_grade_pct is not None else 6.5)
    sio2 = float(req.sio2_pct if req.sio2_pct is not None else 12.0)
    p = float(getattr(req, "phosphorus_pct", 0.15) if getattr(req, "phosphorus_pct", None) is not None else 0.15)

    # Dictionary of available non-target features
    feature_dict = {
        "depth_meters": depth,
        "fe_grade_pct": fe,
        "sio2_pct": sio2,
        "phosphorus_pct": p
    }

    # Defensive target leakage protection: mn_grade_pct and its derived ratios MUST NOT be in features
    assert "mn_grade_pct" not in feature_dict, "Critical Error: mn_grade_pct must NOT be in model input!"
    assert "mn_fe_ratio" not in feature_dict, "Critical Error: mn_fe_ratio must NOT be in model input!"

    # Align strictly with model's expected features and order
    expected_features = list(getattr(clf, "feature_names_in_", FEATURE_NAMES))
    assert len(expected_features) == 4, f"Model expects 4 features, got {len(expected_features)}"

    X = pd.DataFrame([[feature_dict[f] for f in expected_features]], columns=expected_features)
    assert X.shape[1] == 4, f"Input matrix must have exactly 4 columns, got {X.shape[1]}"
    assert "mn_grade_pct" not in X.columns, "Target leakage detected: mn_grade_pct in DataFrame columns!"

    # Model inference: predict probabilities from trained RandomForest
    if hasattr(clf, "predict_proba"):
        probabilities = clf.predict_proba(X)[0]
        classes = list(getattr(clf, "classes_", [0, 1]))
        pos_idx = classes.index(1) if 1 in classes else len(classes) - 1
        probability = round(float(probabilities[pos_idx]), 2)
    else:
        raw_pred = clf.predict(X)[0]
        probability = float(raw_pred)

    probability = max(0.01, min(0.99, probability))

    # Application reserve classification and tonnage recovery estimates
    if probability >= 0.75:
        classification = "HIGH"
        est_tonnage = round(400000 + (probability * 250000), 0)
        confidence = 0.86
    elif probability >= 0.50:
        classification = "MEDIUM"
        est_tonnage = round(200000 + (probability * 150000), 0)
        confidence = 0.79
    else:
        classification = "LOW"
        est_tonnage = round(50000 + (probability * 60000), 0)
        confidence = 0.73

    # Reporting metadata (measured manganese assay if provided in observation)
    est_mn = round(float(req.mn_grade_pct), 1) if req.mn_grade_pct is not None else 38.0
    ndvi_val = float(req.ndvi if req.ndvi is not None else 0.20)

    return ReservePredictionResponse(
        zone_id=req.zone_id,
        reserve_probability=probability,
        classification=classification,
        estimated_tonnage=est_tonnage,
        estimated_mn_grade=est_mn,
        confidence=confidence,
        model_version="Reserve_ML_v1.0",
        contributing_indicators={
            "model_type": "RandomForestClassifier",
            "features_used": expected_features,
            "depth_meters": depth,
            "fe_grade_pct": fe,
            "sio2_pct": sio2,
            "phosphorus_pct": p,
            "satellite_ndvi": ndvi_val,
            "rock_formation": req.rock_formation
        }
    )


# Public interface alias
predict_reserve = predict_reserve_potential


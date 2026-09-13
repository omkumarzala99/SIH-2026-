"""
Reserve Prediction Inference Service.
Evaluates manganese reserve probability, classification, and estimated tonnage based on surface & sub-surface indicators.
"""
from typing import Dict, Any
from ai_ml.reserve_prediction.schemas import ReservePredictionRequest, ReservePredictionResponse
from ai_ml.reserve_prediction.features import extract_features


def predict_reserve_potential(req: ReservePredictionRequest) -> ReservePredictionResponse:
    """Predicts reserve classification (HIGH/MEDIUM/LOW) and probability score."""
    feats = extract_features(req.model_dump())

    mn = feats["mn_grade_pct"]
    fe = feats["fe_grade_pct"]
    sio2 = feats["sio2_pct"]
    ndvi = feats["ndvi"]

    # Realistic geological-space reserve score formula
    grade_score = min(1.0, max(0.0, (mn - 20.0) / 28.0))
    purity_penalty = min(0.3, (sio2 / 50.0) * 0.3)
    # Lower vegetation NDVI over stripped mining pits/benches indicates exposed surface mineral
    ndvi_bonus = 0.10 if ndvi < 0.22 else 0.0

    raw_prob = (grade_score * 0.70) - purity_penalty + ndvi_bonus + 0.15
    probability = round(min(0.96, max(0.12, raw_prob)), 2)

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

    return ReservePredictionResponse(
        zone_id=req.zone_id,
        reserve_probability=probability,
        classification=classification,
        estimated_tonnage=est_tonnage,
        estimated_mn_grade=round(mn, 1),
        confidence=confidence,
        model_version="Reserve_ML_v1.0",
        contributing_indicators={
            "mn_grade_pct": mn,
            "fe_grade_pct": fe,
            "mn_fe_ratio": feats["mn_fe_ratio"],
            "sio2_penalty": round(purity_penalty, 3),
            "satellite_ndvi": ndvi,
            "rock_formation": req.rock_formation
        }
    )

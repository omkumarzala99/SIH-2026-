"""
Production Prediction & Shortfall Forecaster.
Calculates anticipated daily extraction against operational constraints (downtime, rain, blasting).
"""
from typing import Dict, Any
from ai_ml.production_prediction.schemas import ProductionPredictionRequest, ProductionPredictionResponse
from ai_ml.production_prediction.features import extract_production_features


def predict_production_and_shortfall(req: ProductionPredictionRequest) -> ProductionPredictionResponse:
    feats = extract_production_features(req.model_dump())
    planned = feats["planned_production"]
    downtime = feats["downtime_hours"]
    rainfall = feats["rainfall_mm"]
    blasting_delay = feats["blasting_delay_hours"]

    # Physical production loss modeling:
    # 1 hr excavator downtime ~ 28 tons lost
    loss_downtime = downtime * 28.0
    # Rainfall > 25mm degrades haul road speed by 1.8 tons/mm
    loss_weather = max(0.0, (rainfall - 15.0) * 1.8)
    # 1 hr blasting delay ~ 35 tons lost due to pit evacuation
    loss_blasting = blasting_delay * 35.0

    total_loss = loss_downtime + loss_weather + loss_blasting
    predicted = max(0.0, round(planned - total_loss, 1))
    shortfall = max(0.0, round(planned - predicted, 1))
    shortfall_pct = round((shortfall / max(1.0, planned)) * 100.0, 1)

    # Risk tier determination
    if shortfall_pct >= 25.0:
        risk_level = "CRITICAL"
        conf = 0.88
    elif shortfall_pct >= 15.0:
        risk_level = "HIGH"
        conf = 0.85
    elif shortfall_pct >= 7.0:
        risk_level = "MEDIUM"
        conf = 0.82
    else:
        risk_level = "LOW"
        conf = 0.90

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
            "equipment_downtime_loss_tons": round(loss_downtime, 1),
            "weather_rainfall_loss_tons": round(loss_weather, 1),
            "blasting_delay_loss_tons": round(loss_blasting, 1),
            "downtime_hours_input": downtime,
            "rainfall_mm_input": rainfall,
            "blasting_delay_hours_input": blasting_delay
        }
    )

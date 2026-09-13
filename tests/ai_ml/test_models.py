"""
Unit tests for AI/ML modules: Reserve, Production, Risk, and Recommendations.
"""
import pytest
from ai_ml.reserve_prediction.schemas import ReservePredictionRequest
from ai_ml.reserve_prediction.predict import predict_reserve_potential
from ai_ml.production_prediction.schemas import ProductionPredictionRequest
from ai_ml.production_prediction.predict import predict_production_and_shortfall
from ai_ml.risk_prediction.schemas import RiskAssessmentRequest
from ai_ml.risk_prediction.engine import evaluate_mining_risk
from ai_ml.recommendation_engine.schemas import RecommendationGenerationRequest
from ai_ml.recommendation_engine.recommender import generate_recommendations


def test_reserve_prediction_logic():
    req_high = ReservePredictionRequest(
        zone_id="ZONE_NORTH_A",
        mn_grade_pct=45.0,
        fe_grade_pct=5.5,
        sio2_pct=10.0,
        ndvi=0.15
    )
    res_high = predict_reserve_potential(req_high)
    assert res_high.classification == "HIGH"
    assert res_high.reserve_probability >= 0.75
    assert res_high.estimated_tonnage > 300000

    req_low = ReservePredictionRequest(
        zone_id="ZONE_WEST_E",
        mn_grade_pct=18.0,
        fe_grade_pct=12.0,
        sio2_pct=32.0,
        ndvi=0.45
    )
    res_low = predict_reserve_potential(req_low)
    assert res_low.classification == "LOW"
    assert res_low.reserve_probability < 0.50


def test_production_forecasting_logic():
    req = ProductionPredictionRequest(
        planned_production=1000.0,
        equipment_downtime_hours=6.0,
        rainfall_mm=60.0,
        blasting_delay_hours=2.0
    )
    res = predict_production_and_shortfall(req)
    assert res.predicted_production < 1000.0
    assert res.shortfall > 0
    assert res.risk_level in ["HIGH", "CRITICAL"]
    assert "equipment_downtime_loss_tons" in res.contributing_factors


def test_risk_engine_explainability():
    req = RiskAssessmentRequest(
        equipment_downtime_hours=6.5,
        rainfall_mm=65.0,
        blasting_delay_hours=3.0,
        shortfall_percentage=22.0
    )
    res = evaluate_mining_risk(req)
    assert res.risk_tier in ["HIGH", "CRITICAL"]
    assert res.overall_risk_score > 60.0
    assert len(res.contributing_factors) == 4
    # Check that critical factors are flagged
    severities = [f.severity for f in res.contributing_factors]
    assert "CRITICAL" in severities or "HIGH" in severities


def test_recommendation_generation():
    req = RecommendationGenerationRequest(
        downtime_hours=5.0,
        rainfall_mm=55.0,
        blasting_delay_hours=2.5,
        shortfall_percentage=20.0
    )
    recs = generate_recommendations(req)
    assert len(recs) >= 3
    categories = [r.category for r in recs]
    assert "EQUIPMENT" in categories
    assert "BLASTING" in categories

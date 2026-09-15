"""
Unit tests for FastAPI REST endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data


def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["daily_planned_production_tonnes"] == 1000.0
    assert "environmental_status" in data


def test_reserves_endpoint():
    response = client.get("/api/reserves")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert data[0]["classification"] in ["HIGH", "MEDIUM", "LOW"]


def test_reserve_predict():
    payload = {
        "zone_id": "ZONE_NORTH_A",
        "mn_grade_pct": 42.5,
        "fe_grade_pct": 6.0,
        "sio2_pct": 11.0,
        "ndvi": 0.16
    }
    response = client.post("/api/reserves/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["classification"] == "HIGH"
    assert res["reserve_probability"] > 0.70


def test_production_forecast():
    payload = {
        "planned_production": 1000.0,
        "equipment_downtime_hours": 6.5,
        "rainfall_mm": 54.0,
        "blasting_delay_hours": 2.5
    }
    response = client.post("/api/production/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["shortfall"] > 0
    assert res["risk_level"] in ["HIGH", "CRITICAL"]


def test_risk_endpoint():
    response = client.get("/api/risk")
    assert response.status_code == 200
    res = response.json()
    assert "overall_risk_score" in res
    assert len(res["contributing_factors"]) > 0


def test_recommendations_and_action():
    # 1. Get recommendations
    response = client.get("/api/recommendations")
    assert response.status_code == 200
    recs = response.json()
    assert len(recs) > 0

    first_id = recs[0]["id"]
    # 2. Perform human-in-the-loop action
    action_payload = {
        "action": "APPROVE",
        "manager_notes": "Approved by Shift Superintendent for immediate deployment."
    }
    action_res = client.post(f"/api/recommendations/{first_id}/action", json=action_payload)
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "APPROVED"


def test_simulation_run():
    payload = {
        "equipment_downtime_hours": 1.5,
        "rainfall_mm": 5.0,
        "blasting_delay_hours": 0.0,
        "planned_production": 1000.0
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "baseline" in res
    assert "simulated" in res
    assert res["variance"]["improved"] is True


def test_data_quality():
    response = client.get("/api/data-quality")
    assert response.status_code == 200
    res = response.json()
    assert "fleet_health_score" in res
    assert "domains" in res


def test_reserves_endpoint_uses_database():
    """Test A & B: GET /api/reserves queries real database records, returns real zones and assays."""
    response = client.get("/api/reserves")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    zone_ids = [z["zone_id"] for z in data]
    assert "ZONE_NORTH_A" in zone_ids
    assert "ZONE_CENTRAL_B" in zone_ids
    assert "ZONE_SOUTH_C" in zone_ids
    assert "ZONE_EAST_D" in zone_ids
    assert "ZONE_WEST_E" in zone_ids

    # Check that estimated_mn_grade matches the actual database mean (41.2%), NOT old static 44.2%
    north_zone = next(z for z in data if z["zone_id"] == "ZONE_NORTH_A")
    assert north_zone["name"] == "North Bench Pit A"
    assert north_zone["classification"] == "HIGH"
    assert north_zone["estimated_mn_grade"] == 41.2
    assert north_zone["formation"] == "Sausar Group Gondite"
    assert "status" in north_zone


def test_reserve_predict_delegates_to_ml_without_leakage():
    """Test C & D: POST /api/reserves/predict delegates to Reserve ML inference and prevents target leakage."""
    from unittest.mock import patch
    import pandas as pd
    from ai_ml.reserve_prediction.predict import load_reserve_model

    real_model = load_reserve_model()
    with patch.object(real_model, "predict_proba", wraps=real_model.predict_proba) as spy_proba:
        payload = {
            "zone_id": "ZONE_NORTH_A",
            "depth_meters": 72.5,
            "mn_grade_pct": 43.0,  # historical assay - must NOT leak into model input X
            "fe_grade_pct": 5.8,
            "sio2_pct": 10.2,
            "phosphorus_pct": 0.12,
            "ndvi": 0.15
        }
        response = client.post("/api/reserves/predict", json=payload)
        assert response.status_code == 200
        res = response.json()
        assert res["classification"] == "HIGH"
        assert res["reserve_probability"] > 0.70

        # Verify model was called
        spy_proba.assert_called_once()
        call_df = spy_proba.call_args[0][0]
        assert isinstance(call_df, pd.DataFrame)
        # Test D: No target leakage in model input
        assert "mn_grade_pct" not in call_df.columns
        assert "mn_fe_ratio" not in call_df.columns
        assert list(call_df.columns) == ["depth_meters", "fe_grade_pct", "sio2_pct", "phosphorus_pct"]


def test_reserves_endpoint_passes_real_geological_values():
    """Test E: Real database geological values (depth, fe, sio2, p) are passed through rather than fake defaults."""
    from unittest.mock import patch
    import ai_ml.reserve_prediction.predict as pred_module

    observed_depths = []
    original_predict = pred_module.predict_reserve_potential

    def spy_predict(req, **kwargs):
        observed_depths.append(req.depth_meters)
        return original_predict(req, **kwargs)

    with patch("backend.app.api.routes.reserves.predict_reserve_potential", side_effect=spy_predict):
        response = client.get("/api/reserves")
        assert response.status_code == 200
        assert len(observed_depths) == 60
        # Check that real depths from geological_data.csv (e.g. 128.3, 68.4) were passed through
        assert 128.3 in observed_depths
        assert 68.4 in observed_depths
        # Verify it wasn't just default 60.0 passed for all records
        assert any(d != 60.0 for d in observed_depths)


def test_reserves_endpoint_empty_database():
    """Test F: When database has no geological records, returns safe empty response rather than fake data."""
    from backend.app.api.dependencies import get_db
    from sqlalchemy import create_engine
    from sqlalchemy.pool import StaticPool
    from sqlalchemy.orm import sessionmaker
    from database.models import Base

    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/api/reserves")
        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_reserves_endpoint_model_missing_error():
    """Test: When ML model artifact is missing, surfaces HTTP 503 instead of silent heuristic fallback."""
    from unittest.mock import patch
    with patch("backend.app.api.routes.reserves.predict_reserve_potential", side_effect=FileNotFoundError("Model missing")):
        response = client.get("/api/reserves")
        assert response.status_code == 503
        assert "Reserve ML model artifact unavailable" in response.json()["detail"]


def test_risk_predict_endpoint_with_production_targets():
    """Test: POST /api/risk/predict evaluates multi-factor risk with ML production forecasting."""
    payload = {
        "mine_id": "MINE_BALAGHAT_01",
        "planned_production": 1000.0,
        "equipment_downtime_hours": 6.5,
        "rainfall_mm": 54.2,
        "blasting_delay_hours": 2.2
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_risk_score"] > 60.0
    assert data["risk_tier"] in ["HIGH", "CRITICAL"]
    assert data["shortfall"] > 0.0
    assert data["shortfall_percentage"] > 15.0
    assert len(data["contributing_factors"]) == 4


def test_recommendations_generate_endpoint_dynamic():
    """Test: POST /api/recommendations/generate triggers prescriptive mitigation actions."""
    payload = {
        "mine_id": "MINE_BALAGHAT_01",
        "downtime_hours": 6.5,
        "rainfall_mm": 54.2,
        "blasting_delay_hours": 2.2,
        "shortfall_percentage": 23.2
    }
    response = client.post("/api/recommendations/generate", json=payload)
    assert response.status_code == 200
    recs = response.json()
    assert len(recs) >= 3
    assert all(r["status"] == "PENDING" for r in recs)
    categories = [r["category"] for r in recs]
    assert "EQUIPMENT" in categories
    assert "ENVIRONMENTAL" in categories



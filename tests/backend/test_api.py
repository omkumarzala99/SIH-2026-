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

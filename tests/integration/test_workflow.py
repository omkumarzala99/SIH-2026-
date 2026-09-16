"""
End-to-end integration test: Simulates full operational crisis workflow.
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_full_operational_crisis_story():
    # 1. Trigger Crisis Scenario
    crisis_res = client.post("/api/demo/crisis-scenario")
    assert crisis_res.status_code == 200
    crisis_data = crisis_res.json()
    assert crisis_data["prediction_impact"]["shortfall_tonnes"] == 180.0
    assert crisis_data["prediction_impact"]["risk_tier"] == "HIGH"

    # 2. Query Dashboard to observe elevated risk and shortfall
    dash_res = client.get("/api/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["kpis"]["daily_shortfall_tonnes"] == 180.0

    # 3. Request Reserve classification for high priority extraction zone
    reserve_res = client.post("/api/reserves/predict", json={
        "zone_id": "ZONE_CENTRAL_B",
        "mn_grade_pct": 43.5,
        "fe_grade_pct": 6.2,
        "sio2_pct": 11.5,
        "ndvi": 0.17
    })
    assert reserve_res.status_code == 200
    assert reserve_res.json()["classification"] == "HIGH"

    # 4. Run What-If simulation: Reduce downtime from 6.5h to 2.0h
    sim_res = client.post("/api/simulation/run", json={
        "equipment_downtime_hours": 2.0,
        "rainfall_mm": 54.2,
        "blasting_delay_hours": 1.0,
        "planned_production": 1000.0
    })
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["variance"]["production_delta_tonnes"] > 0
    assert sim_data["variance"]["improved"] is True

    # 5. Fetch recommendations and execute Human-in-the-Loop decision
    recs_res = client.get("/api/recommendations")
    assert recs_res.status_code == 200
    recs = recs_res.json()
    target_rec = recs[0]

    action_res = client.post(f"/api/recommendations/{target_rec['id']}/action", json={
        "action": "APPROVE",
        "manager_notes": "Emergency haulage re-route approved by Mine Manager for Shift-A."
    })
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "APPROVED"

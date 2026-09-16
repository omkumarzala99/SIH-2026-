"""
Integration tests for the unified end-to-end AI Mining Intelligence pipeline:
POST /api/pipeline/run
Verifies:
1. Default mine (Balaghat) execution returns HTTP 200 with complete 7-stage chain.
2. Multi-mine execution (Gumgaon) returns HTTP 200 with Gumgaon-specific data and isolation.
3. Invalid mine returns HTTP 404 without crashing.
4. Schema validation: analysis_id, 7 completed stages, reserve, production, shortfall, risk, recommendations.
5. Mathematical consistency of shortfall calculation.
6. Multi-factor risk calculation and XAI attribution integrity.
7. Prescriptive recommendations generation and persistence.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_pipeline_run_balaghat_default():
    """Verify POST /api/pipeline/run defaults to Balaghat and executes all 7 stages."""
    res = client.post("/api/pipeline/run")
    assert res.status_code == 200
    data = res.json()

    # Core response envelope
    assert "analysis_id" in data
    assert data["analysis_id"].startswith("ANALYSIS-MINE_BALAGHAT_01")
    assert "executed_at" in data
    assert "mine" in data
    assert data["mine"]["id"] == "MINE_BALAGHAT_01"
    assert "Balaghat" in data["mine"]["name"]

    # Verify 7 Stages
    stages = data["stages"]
    assert len(stages) == 7
    stage_ids = [s["id"] for s in stages]
    assert stage_ids == [0, 1, 2, 3, 4, 5, 6]
    for s in stages:
        assert s["status"] == "COMPLETED"
        assert s["duration_ms"] >= 0.0
        assert len(s["summary"]) > 10

    # Stage 0: Satellite & Environmental
    assert "Satellite" in stages[0]["name"] or "Environmental" in stages[0]["name"]
    # Stage 1: Geological Assays
    assert "Geological" in stages[1]["name"] or "Borehole" in stages[1]["name"]
    # Stage 2: Reserve ML
    assert "Reserve" in stages[2]["name"]
    # Stage 3: Production ML
    assert "Production" in stages[3]["name"]
    # Stage 4: Shortfall
    assert "Shortfall" in stages[4]["name"]
    # Stage 5: Risk Matrix
    assert "Risk" in stages[5]["name"]
    # Stage 6: Recommendations
    assert "Action Protocols" in stages[6]["name"] or "Prescriptive" in stages[6]["name"]

    # Verify Reserve Section
    reserves = data["reserve"]
    assert reserves["total_estimated_reserves"] > 0
    assert reserves["primary_classification"] in ["HIGH", "MEDIUM", "LOW"]
    assert 0.0 <= reserves["average_reserve_probability"] <= 1.0
    assert reserves["average_mn_grade"] > 0

    # Verify Production Section
    prod = data["production"]
    assert prod["planned_production"] > 0
    assert prod["predicted_production"] > 0
    assert prod["confidence"] > 0

    # Verify Shortfall Section & Math Consistency
    shortfall = data["shortfall"]
    expected_shortfall = max(0.0, round(prod["planned_production"] - prod["predicted_production"], 1))
    assert abs(shortfall["shortfall_tonnes"] - expected_shortfall) < 0.2
    expected_pct = round((expected_shortfall / max(1.0, prod["planned_production"])) * 100.0, 1)
    assert abs(shortfall["shortfall_percentage"] - expected_pct) < 0.2
    assert shortfall["is_deficit"] == (shortfall["shortfall_tonnes"] > 0.0)

    # Verify Risk Section
    risk = data["risk"]
    assert 0.0 <= risk["overall_risk_score"] <= 100.0
    assert risk["risk_tier"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert 0.0 <= risk["equipment_risk"] <= 100.0
    assert 0.0 <= risk["weather_risk"] <= 100.0
    assert 0.0 <= risk["blasting_risk"] <= 100.0
    assert 0.0 <= risk["production_risk"] <= 100.0
    assert len(risk["contributing_factors"]) == 4

    # Verify Recommendations Section
    recs = data["recommendations"]
    assert len(recs) >= 1
    for r in recs:
        assert r["mine_id"] == "MINE_BALAGHAT_01"
        assert r["urgency"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        assert r["status"] in ["PENDING", "APPROVED", "REJECTED", "MODIFIED"]
        assert len(r["title"]) > 0


def test_pipeline_run_gumgaon_multimine():
    """Verify POST /api/pipeline/run?mine_id=MINE_GUMGAON_02 executes for Gumgaon with strict isolation."""
    res = client.post("/api/pipeline/run?mine_id=MINE_GUMGAON_02")
    assert res.status_code == 200
    data = res.json()

    # Mine header verification
    assert data["mine"]["id"] == "MINE_GUMGAON_02"
    assert "Gumgaon" in data["mine"]["name"]
    assert data["analysis_id"].startswith("ANALYSIS-MINE_GUMGAON_02")

    # Verify all 7 stages completed
    assert len(data["stages"]) == 7
    assert all(s["status"] == "COMPLETED" for s in data["stages"])

    # Strict isolation check: recommendations belong to Gumgaon
    recs = data["recommendations"]
    assert len(recs) >= 1
    assert all(r["mine_id"] == "MINE_GUMGAON_02" for r in recs)

    # Verify Gumgaon metrics
    assert data["production"]["planned_production"] > 0
    assert data["risk"]["overall_risk_score"] >= 0.0


def test_pipeline_run_invalid_mine_404():
    """Verify POST /api/pipeline/run with invalid mine ID returns 404."""
    res = client.post("/api/pipeline/run?mine_id=MINE_NONEXISTENT_999")
    assert res.status_code == 404
    err = res.json()
    assert "detail" in err
    assert "not found" in err["detail"].lower()

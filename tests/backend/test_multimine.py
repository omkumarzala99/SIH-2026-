"""
Multi-mine API query and filtering tests.
Validates that endpoints accept optional mine_id query parameters,
return mine-specific data, and maintain full integrity across the expanded dataset.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_multimine_reserves_filtering():
    """Verify GET /api/reserves filters by specific mine_id and defaults to Balaghat."""
    # 1. Default (Balaghat)
    res_default = client.get("/api/reserves")
    assert res_default.status_code == 200
    balaghat_zones = res_default.json()
    assert len(balaghat_zones) == 5
    assert all(z["zone_id"].startswith("ZONE_") for z in balaghat_zones)

    # 2. Gumgaon Mine
    res_gmg = client.get("/api/reserves?mine_id=MINE_GUMGAON_02")
    assert res_gmg.status_code == 200
    gmg_zones = res_gmg.json()
    assert len(gmg_zones) == 4
    assert all("ZONE_GMG" in z["zone_id"] for z in gmg_zones)

    # 3. Tirodi Mine
    res_trd = client.get("/api/reserves?mine_id=MINE_TIRODI_03")
    assert res_trd.status_code == 200
    trd_zones = res_trd.json()
    assert len(trd_zones) == 5
    assert all("ZONE_TRD" in z["zone_id"] for z in trd_zones)

    # 4. Invalid mine returns 404
    res_invalid = client.get("/api/reserves?mine_id=MINE_NONEXISTENT_99")
    assert res_invalid.status_code == 404


def test_multimine_production_and_equipment():
    """Verify production trends and equipment telematics for different mines."""
    # 1. Balaghat Equipment (Baseline 7 items)
    eq_bgt = client.get("/api/production/equipment?mine_id=MINE_BALAGHAT_01")
    assert eq_bgt.status_code == 200
    bgt_items = eq_bgt.json()
    assert len(bgt_items) == 7
    assert bgt_items[0]["id"] == "EXC_CAT_349_01"

    # 2. Gumgaon Equipment (4 items from fleet)
    eq_gmg = client.get("/api/production/equipment?mine_id=MINE_GUMGAON_02")
    assert eq_gmg.status_code == 200
    gmg_items = eq_gmg.json()
    assert len(gmg_items) == 4
    gmg_ids = [e["id"] for e in gmg_items]
    assert "EXC_HIT_ZX470_01" in gmg_ids
    assert "DMP_CAT_773E_01" in gmg_ids

    # 3. Production trends for Gumgaon
    prod_gmg = client.get("/api/production?mine_id=MINE_GUMGAON_02")
    assert prod_gmg.status_code == 200
    gmg_data = prod_gmg.json()
    assert "current_target" in gmg_data
    assert "history" in gmg_data
    assert len(gmg_data["history"]) > 0


def test_multimine_dashboard_and_recommendations():
    """Verify dashboard KPIs and recommendations tailored per mine."""
    # 1. Balaghat Dashboard
    dash_bgt = client.get("/api/dashboard?mine_id=MINE_BALAGHAT_01")
    assert dash_bgt.status_code == 200
    assert dash_bgt.json()["kpis"]["daily_planned_production_tonnes"] == 1000.0

    # 2. Tirodi Dashboard
    dash_trd = client.get("/api/dashboard?mine_id=MINE_TIRODI_03")
    assert dash_trd.status_code == 200
    trd_data = dash_trd.json()
    assert trd_data["kpis"]["active_equipment_count"] == 5

    # 3. Recommendations for Balaghat
    recs_bgt = client.get("/api/recommendations?mine_id=MINE_BALAGHAT_01")
    assert recs_bgt.status_code == 200
    assert all(r["mine_id"] == "MINE_BALAGHAT_01" for r in recs_bgt.json())

    # 4. Recommendations for Gumgaon
    recs_gmg = client.get("/api/recommendations?mine_id=MINE_GUMGAON_02")
    assert recs_gmg.status_code == 200
    assert all(r["mine_id"] == "MINE_GUMGAON_02" for r in recs_gmg.json())


def test_multimine_risk_evaluation():
    """Verify multi-mine risk evaluation reads mine-specific conditions."""
    res_gmg = client.get("/api/risk?mine_id=MINE_GUMGAON_02")
    assert res_gmg.status_code == 200
    data = res_gmg.json()
    assert data["mine_id"] == "MINE_GUMGAON_02"
    assert "overall_risk_score" in data
    assert data["risk_tier"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

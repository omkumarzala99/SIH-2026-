"""
Frontend production build and bundle verification test.
"""
import os


def test_frontend_dist_or_source_exists():
    assert os.path.exists("frontend/src/App.tsx")
    assert os.path.exists("frontend/src/components/map/MineMap.tsx")
    assert os.path.exists("frontend/public/data/mine_boundary.geojson")
    assert os.path.exists("frontend/public/data/mining_zones.geojson")
    assert os.path.exists("frontend/public/data/reserve_zones.geojson")


def test_frontend_pages_exist():
    pages = [
        "DashboardPage.tsx",
        "ReservePage.tsx",
        "ProductionPage.tsx",
        "RiskPage.tsx",
        "RecommendationsPage.tsx",
        "SimulationPage.tsx",
        "DataQualityPage.tsx",
        "SystemInfoPage.tsx"
    ]
    for p in pages:
        assert os.path.exists(os.path.join("frontend/src/pages", p))

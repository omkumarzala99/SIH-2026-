import os
import sys

# Ensure root directory is on Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import init_db
from database.seed_data import seed_database
from data_pipeline.quality.quality_checker import get_all_data_quality_metrics
from ai_ml.production_prediction.schemas import ProductionPredictionRequest
from ai_ml.production_prediction.predict import predict_production_and_shortfall
from ai_ml.risk_prediction.schemas import RiskAssessmentRequest
from ai_ml.risk_prediction.engine import evaluate_mining_risk
from ai_ml.recommendation_engine.schemas import RecommendationGenerationRequest
from ai_ml.recommendation_engine.recommender import generate_recommendations


def run_demo():
    print("=" * 70)
    print("   PS-26009 MOIL AI/ML MINING INTELLIGENCE PLATFORM (SIH 2026)   ")
    print("=" * 70)

    print("\n1. Initializing & Verifying Database...")
    init_db()
    seed_database()
    print("   [OK] Database connected and seeded.")

    print("\n2. Executing Data Quality Audit across Ingested Datasets...")
    quality = get_all_data_quality_metrics("data/mock")
    print(f"   [OK] Composite Enterprise Data Completeness: {quality['fleet_health_score']}%")
    for dom, m in quality['domains'].items():
        print(f"     - {m['name']}: {m['overall_score']}% (Rows: {m['total_records']}, Missing: {m['missing_values']})")

    print("\n3. Simulating SIH 2026 Monsoon Crisis Scenario...")
    print("   Conditions: 54.2mm Rainfall | 6.5h CAT-349 Downtime | 2.2h Blasting Delay")
    prod = predict_production_and_shortfall(ProductionPredictionRequest(
        planned_production=1000.0,
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2
    ))
    print(f"   [OK] Planned Extraction: {prod.planned_production} tons")
    print(f"   [OK] Predicted Extraction: {prod.predicted_production} tons")
    print(f"   [OK] Projected Shortfall: -{prod.shortfall} tons ({prod.shortfall_percentage}% deficit)")
    print(f"   [OK] Operational Risk Tier: {prod.risk_level}")

    print("\n4. Multi-Factor Risk Attribution & Explainability...")
    risk = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2,
        shortfall_percentage=prod.shortfall_percentage
    ))
    print(f"   [OK] Composite Risk Score: {risk.overall_risk_score} / 100 ({risk.risk_tier})")
    for f in risk.contributing_factors:
        print(f"     - {f.name} [{f.severity}]: {f.description}")

    print("\n5. Prescriptive AI Recommendations Generated...")
    recs = generate_recommendations(RecommendationGenerationRequest(
        downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2,
        shortfall_percentage=prod.shortfall_percentage
    ))
    for r in recs:
        print(f"   [{r.urgency}] {r.title}")
        print(f"       Action: {r.recommended_action}")
        print(f"       Expected Recovery: +{r.expected_tonnage_recovery} tons")

    print("\n" + "=" * 70)
    print("   DEMO VERIFICATION COMPLETE: ALL PLATFORM ENGINES OPERATIONAL  ")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()

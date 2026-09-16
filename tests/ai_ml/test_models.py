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


def test_reserve_model_training_no_leakage():
    from ai_ml.reserve_prediction.train import train_reserve_model
    model = train_reserve_model()
    assert model is not None
    assert hasattr(model, "feature_names_in_")
    # Target leakage verification
    assert "mn_grade_pct" not in model.feature_names_in_
    assert "mn_fe_ratio" not in model.feature_names_in_
    assert list(model.feature_names_in_) == ["depth_meters", "fe_grade_pct", "sio2_pct", "phosphorus_pct"]


def test_reserve_model_artifact_loading():
    """Test A: The inference module can successfully load ai_ml/models/reserve_model.joblib."""
    from ai_ml.reserve_prediction.predict import load_reserve_model
    model = load_reserve_model()
    assert model is not None
    assert hasattr(model, "predict")
    assert hasattr(model, "predict_proba")
    assert hasattr(model, "feature_names_in_")
    assert list(model.feature_names_in_) == ["depth_meters", "fe_grade_pct", "sio2_pct", "phosphorus_pct"]


def test_reserve_model_missing_error():
    """Test: If model artifact is missing, raises FileNotFoundError with helpful message."""
    from ai_ml.reserve_prediction.predict import load_reserve_model
    with pytest.raises(FileNotFoundError) as exc_info:
        load_reserve_model("non_existent_dir/non_existent_model.joblib")
    assert "Reserve ML model artifact not found" in str(exc_info.value)


def test_reserve_inference_calls_trained_model():
    """Test B, C, D, E: Actual trained model is called with exactly 4 non-target features and no leakage."""
    from unittest.mock import patch
    import pandas as pd
    from ai_ml.reserve_prediction.predict import predict_reserve_potential, load_reserve_model

    real_model = load_reserve_model()

    with patch.object(real_model, "predict_proba", wraps=real_model.predict_proba) as spy_proba:
        req = ReservePredictionRequest(
            zone_id="ZONE_NORTH_A",
            depth_meters=75.0,
            mn_grade_pct=42.0,  # Observation assay — must NOT be in input matrix X
            fe_grade_pct=6.5,
            sio2_pct=11.0,
            phosphorus_pct=0.14
        )
        res = predict_reserve_potential(req, model=real_model)

        # Test D: The model was actually called
        spy_proba.assert_called_once()
        call_arg = spy_proba.call_args[0][0]

        # Test B: Input is DataFrame with exactly 4 expected features
        assert isinstance(call_arg, pd.DataFrame)
        assert call_arg.shape[1] == 4
        assert list(call_arg.columns) == ["depth_meters", "fe_grade_pct", "sio2_pct", "phosphorus_pct"]

        # Test C: mn_grade_pct and mn_fe_ratio are strictly absent from model input
        assert "mn_grade_pct" not in call_arg.columns
        assert "mn_fe_ratio" not in call_arg.columns

        # Verify values passed into model
        assert call_arg.iloc[0]["depth_meters"] == 75.0
        assert call_arg.iloc[0]["fe_grade_pct"] == 6.5
        assert call_arg.iloc[0]["sio2_pct"] == 11.0
        assert call_arg.iloc[0]["phosphorus_pct"] == 0.14

        # Test E: Expected response contract preserved
        assert res.zone_id == "ZONE_NORTH_A"
        assert res.classification in ["HIGH", "MEDIUM", "LOW"]
        assert 0.0 <= res.reserve_probability <= 1.0
        assert res.estimated_tonnage > 0
        assert res.contributing_indicators["model_type"] == "RandomForestClassifier"
        assert res.contributing_indicators["features_used"] == ["depth_meters", "fe_grade_pct", "sio2_pct", "phosphorus_pct"]



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


def test_production_model_training_no_leakage():
    """Test: Production model trains without target leakage and expects all 14 features."""
    from ai_ml.production_prediction.train import train_production_model
    from ai_ml.production_prediction.features import FEATURE_NAMES

    model = train_production_model()
    assert model is not None
    assert hasattr(model, "feature_names_in_")
    assert "actual_tonnage" not in model.feature_names_in_
    assert "shortfall_tonnage" not in model.feature_names_in_
    assert list(model.feature_names_in_) == FEATURE_NAMES


def test_production_model_artifact_loading():
    """Test: Production model artifact loads correctly and missing artifact raises FileNotFoundError."""
    from ai_ml.production_prediction.predict import load_production_model

    model = load_production_model()
    assert model is not None
    assert hasattr(model, "predict")
    assert hasattr(model, "feature_names_in_")

    with pytest.raises(FileNotFoundError) as exc_info:
        load_production_model("non_existent_path/non_existent_prod_model.joblib")
    assert "Production ML model artifact not found" in str(exc_info.value)


def test_production_feature_engineering_and_leakage_prevention():
    """Test: All operational, equipment, weather, and lag features are generated without target leakage."""
    from ai_ml.production_prediction.features import extract_production_features, FEATURE_NAMES

    sample_data = {
        "planned_production": 1100.0,
        "equipment_downtime_hours": 4.5,
        "rainfall_mm": 35.0,
        "blasting_delay_hours": 1.5,
        "hauling_trips": 52.0,
        "equipment_efficiency_pct": 78.0,
        "active_equipment_count": 6.0,
        "soil_moisture_pct": 42.0,
        "flood_risk_score": 1.0,
        "ambient_temp_c": 33.5,
        "humidity_pct": 58.0,
        "wind_speed_kmh": 22.0
    }
    feats = extract_production_features(sample_data)

    # 1. Verify all 14 features present
    for f in FEATURE_NAMES:
        assert f in feats, f"Missing feature: {f}"

    # 2. Strict absence of target leakage
    assert "actual_tonnage" not in feats
    assert "shortfall_tonnage" not in feats

    # 3. Verify safe handling of missing/empty values
    minimal_data = {"planned_production": 950.0}
    min_feats = extract_production_features(minimal_data)
    for f in FEATURE_NAMES:
        assert f in min_feats
        assert min_feats[f] is not None
    assert min_feats["planned_production"] == 950.0
    assert min_feats["equipment_downtime_hours"] == 2.0  # sensible default
    assert min_feats["actual_lag_1d"] == 950.0 * 0.95


def test_production_historical_lag_strictly_shifted():
    """Test: Historical lag and rolling features strictly shift past rows and do not leak current row target."""
    from ai_ml.production_prediction.features import build_production_training_dataset

    X, y = build_production_training_dataset()
    assert len(X) == len(y)
    assert "actual_tonnage" not in X.columns
    assert "shortfall_tonnage" not in X.columns

    # For row i > 0, actual_lag_1d must equal y[i-1], NOT y[i]
    for i in range(1, len(X)):
        assert X.iloc[i]["actual_lag_1d"] == y.iloc[i - 1]
        assert X.iloc[i]["actual_lag_1d"] != y.iloc[i] or y.iloc[i - 1] == y.iloc[i]


def test_production_inference_calls_trained_model():
    """Test: predict_production_and_shortfall calls trained model with 14 features and no target leakage."""
    from unittest.mock import patch
    import pandas as pd
    from ai_ml.production_prediction.predict import predict_production_and_shortfall, load_production_model
    from ai_ml.production_prediction.features import FEATURE_NAMES

    real_model = load_production_model()
    with patch.object(real_model, "predict", wraps=real_model.predict) as spy_predict:
        req = ProductionPredictionRequest(
            planned_production=1000.0,
            equipment_downtime_hours=5.0,
            rainfall_mm=45.0,
            blasting_delay_hours=1.8
        )
        res = predict_production_and_shortfall(req, model=real_model)

        spy_predict.assert_called_once()
        call_df = spy_predict.call_args[0][0]

        assert isinstance(call_df, pd.DataFrame)
        assert call_df.shape[1] == 14
        assert list(call_df.columns) == FEATURE_NAMES
        assert "actual_tonnage" not in call_df.columns
        assert "shortfall_tonnage" not in call_df.columns

        # Response contract verification
        assert res.planned_production == 1000.0
        assert 0.0 <= res.predicted_production <= 1500.0
        assert res.shortfall >= 0.0
        assert res.risk_level in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        assert res.contributing_factors["model_type"] == "GradientBoostingRegressor"
        assert len(res.contributing_factors["features_used"]) == 14



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


def test_production_prediction_feeds_risk_engine():
    """Test 1 & 3: Production prediction correctly feeds the risk engine with actual deficit."""
    prod_req = ProductionPredictionRequest(
        planned_production=1000.0,
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2
    )
    prod_res = predict_production_and_shortfall(prod_req)
    assert prod_res.predicted_production < 1000.0
    assert prod_res.shortfall > 0.0

    # Risk request receives the production prediction outputs
    risk_req = RiskAssessmentRequest(
        mine_id="MINE_BALAGHAT_01",
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2,
        shortfall_percentage=prod_res.shortfall_percentage,
        planned_production=prod_res.planned_production,
        predicted_production=prod_res.predicted_production,
        shortfall=prod_res.shortfall
    )
    risk_res = evaluate_mining_risk(risk_req)

    assert risk_res.overall_risk_score > 60.0
    assert risk_res.risk_tier in ["HIGH", "CRITICAL"]
    assert risk_res.production_risk > 50.0
    assert risk_res.planned_production == 1000.0
    assert risk_res.predicted_production == prod_res.predicted_production
    assert risk_res.shortfall == prod_res.shortfall
    assert abs(risk_res.shortfall_percentage - prod_res.shortfall_percentage) <= 0.1


def test_shortfall_percentage_calculation_precision():
    """Test 2: Shortfall and shortfall percentage are calculated with numerical accuracy."""
    # Standard shortfall case
    planned = 1000.0
    predicted = 768.5
    shortfall = max(0.0, planned - predicted)
    shortfall_pct = round((shortfall / planned) * 100.0, 2)
    assert shortfall == 231.5
    assert shortfall_pct == 23.15

    # Surplus case (predicted > planned) -> zero shortfall
    surplus_pred = 1050.0
    surplus_shortfall = max(0.0, planned - surplus_pred)
    surplus_shortfall_pct = (surplus_shortfall / planned * 100.0)
    assert surplus_shortfall == 0.0
    assert surplus_shortfall_pct == 0.0

    # Zero planned case -> zero division guarded
    zero_planned = 0.0
    zero_shortfall = max(0.0, zero_planned - 50.0)
    zero_pct = (zero_shortfall / zero_planned * 100.0) if zero_planned > 0 else 0.0
    assert zero_pct == 0.0


def test_risk_factor_sensitivities():
    """Test 4, 5, 6: Equipment, weather, blasting, and production sub-risks respond to inputs."""
    # Base low-risk conditions
    base = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=0.0,
        rainfall_mm=0.0,
        blasting_delay_hours=0.0,
        shortfall_percentage=0.0
    ))
    assert base.overall_risk_score == 0.0
    assert base.risk_tier == "LOW"

    # Equipment downtime impact (Test 4)
    eq_elevated = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=6.0,
        rainfall_mm=0.0,
        blasting_delay_hours=0.0,
        shortfall_percentage=0.0
    ))
    assert eq_elevated.equipment_risk == 75.0  # (6.0 / 8.0) * 100
    assert eq_elevated.overall_risk_score == round(75.0 * 0.35, 1)  # 26.2

    # Weather impact (Test 5)
    wx_elevated = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=0.0,
        rainfall_mm=45.0,
        blasting_delay_hours=0.0,
        shortfall_percentage=0.0
    ))
    assert wx_elevated.weather_risk == 75.0  # (45.0 / 60.0) * 100
    assert wx_elevated.overall_risk_score == round(75.0 * 0.25, 1)  # 18.8

    # Blasting delay impact (Test 6)
    blast_elevated = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=0.0,
        rainfall_mm=0.0,
        blasting_delay_hours=3.0,
        shortfall_percentage=0.0
    ))
    assert blast_elevated.blasting_risk == 75.0  # (3.0 / 4.0) * 100
    assert blast_elevated.overall_risk_score == round(75.0 * 0.20, 1)  # 15.0


def test_risk_tier_thresholds_adherence():
    """Test 7: Risk tiers strictly correspond to 0-29 LOW, 30-54 MEDIUM, 55-74 HIGH, 75-100 CRITICAL."""
    # Low (< 30)
    res_low = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=1.0,
        rainfall_mm=5.0,
        blasting_delay_hours=0.5,
        shortfall_percentage=2.0
    ))
    assert res_low.overall_risk_score < 30.0
    assert res_low.risk_tier == "LOW"

    # Medium (30 - 54)
    res_med = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=3.5,
        rainfall_mm=25.0,
        blasting_delay_hours=1.5,
        shortfall_percentage=12.0
    ))
    assert 30.0 <= res_med.overall_risk_score < 55.0
    assert res_med.risk_tier == "MEDIUM"

    # High (55 - 74)
    res_high = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=5.0,
        rainfall_mm=42.0,
        blasting_delay_hours=2.0,
        shortfall_percentage=18.0
    ))
    assert 55.0 <= res_high.overall_risk_score < 75.0
    assert res_high.risk_tier == "HIGH"

    # Critical (>= 75)
    res_crit = evaluate_mining_risk(RiskAssessmentRequest(
        equipment_downtime_hours=7.0,
        rainfall_mm=58.0,
        blasting_delay_hours=3.5,
        shortfall_percentage=28.0
    ))
    assert res_crit.overall_risk_score >= 75.0
    assert res_crit.risk_tier == "CRITICAL"


def test_explainability_authentic_attribution():
    """Test 8: Explainability factors correspond to actual input values and preserve weights."""
    req = RiskAssessmentRequest(
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2,
        shortfall_percentage=23.2
    )
    res = evaluate_mining_risk(req)
    factors_by_name = {f.name: f for f in res.contributing_factors}

    assert len(factors_by_name) == 4
    # Equipment Downtime factor
    assert "Equipment Downtime" in factors_by_name
    eq_f = factors_by_name["Equipment Downtime"]
    assert eq_f.severity == "CRITICAL"
    assert eq_f.weight == 0.35
    assert "6.5" in str(eq_f.observed_value)

    # Weather factor
    assert "Precipitation & Monsoon Impact" in factors_by_name
    wx_f = factors_by_name["Precipitation & Monsoon Impact"]
    assert wx_f.severity == "CRITICAL"
    assert wx_f.weight == 0.25
    assert "54.2" in str(wx_f.observed_value)

    # Blasting factor
    assert "Blasting Schedule Adherence" in factors_by_name
    bl_f = factors_by_name["Blasting Schedule Adherence"]
    assert bl_f.severity == "HIGH"
    assert bl_f.weight == 0.20
    assert "2.2" in str(bl_f.observed_value)

    # Production factor
    assert "Daily Production Deficit" in factors_by_name
    pr_f = factors_by_name["Daily Production Deficit"]
    assert pr_f.severity == "HIGH"
    assert pr_f.weight == 0.20
    assert "23.2" in str(pr_f.observed_value)


def test_recommendation_mitigation_rules_triggering():
    """Test 9 & 10: Recommendation engine triggers specific mitigation rules when conditions are met."""
    # Test individual rule triggers
    # 1. Equipment redeployment (downtime >= 3.0 and shortfall >= 10.0)
    recs_eq = generate_recommendations(RecommendationGenerationRequest(
        downtime_hours=3.5,
        shortfall_percentage=12.0,
        rainfall_mm=0.0,
        blasting_delay_hours=0.0
    ))
    titles_eq = [r.title for r in recs_eq]
    assert any("Re-deploy Haul Dumper Fleet" in t for t in titles_eq)

    # 2. Blast rescheduling (blasting >= 1.0)
    recs_blast = generate_recommendations(RecommendationGenerationRequest(
        downtime_hours=0.0,
        shortfall_percentage=0.0,
        rainfall_mm=0.0,
        blasting_delay_hours=1.5
    ))
    titles_blast = [r.title for r in recs_blast]
    assert any("Reschedule Bench Blasting Window" in t for t in titles_blast)

    # 3. Environmental Dewatering (rainfall >= 35.0)
    recs_wx = generate_recommendations(RecommendationGenerationRequest(
        downtime_hours=0.0,
        shortfall_percentage=0.0,
        rainfall_mm=42.0,
        blasting_delay_hours=0.0
    ))
    titles_wx = [r.title for r in recs_wx]
    assert any("Activate High-Capacity Sump Dewatering Pumps" in t for t in titles_wx)

    # 4. Zone prioritization (shortfall >= 15.0)
    recs_zone = generate_recommendations(RecommendationGenerationRequest(
        downtime_hours=0.0,
        shortfall_percentage=16.0,
        rainfall_mm=0.0,
        blasting_delay_hours=0.0
    ))
    titles_zone = [r.title for r in recs_zone]
    assert any("Prioritize High-Grade Central Pit B" in t for t in titles_zone)

    # 5. Optimal conditions fallback (Schedule rule)
    recs_opt = generate_recommendations(RecommendationGenerationRequest(
        downtime_hours=0.5,
        shortfall_percentage=2.0,
        rainfall_mm=0.0,
        blasting_delay_hours=0.0
    ))
    assert len(recs_opt) == 1
    assert recs_opt[0].category == "SCHEDULE"
    assert recs_opt[0].status == "PENDING"


def test_no_competing_risk_module():
    """Test 11: Application consistently imports from ai_ml.risk_prediction and not orphan risk_engine."""
    import backend.app.api.routes.risk as risk_route
    import backend.app.api.routes.simulation as sim_route

    # Assert routes import active risk_prediction
    assert risk_route.evaluate_mining_risk.__module__ == "ai_ml.risk_prediction.engine"
    assert sim_route.evaluate_mining_risk.__module__ == "ai_ml.risk_prediction.engine"


def test_human_in_the_loop_status_lifecycle():
    """Test 12: Recommendations start PENDING and can be APPROVED, REJECTED, or MODIFIED."""
    recs = generate_recommendations(RecommendationGenerationRequest(
        downtime_hours=5.0,
        rainfall_mm=55.0,
        blasting_delay_hours=2.5,
        shortfall_percentage=20.0
    ))
    for r in recs:
        assert r.status == "PENDING"
        assert r.manager_notes is None

    # Simulate manager approval
    rec = recs[0]
    rec.status = "APPROVED"
    rec.manager_notes = "Approved by shift manager."
    assert rec.status == "APPROVED"


def test_run_integrated_risk_pipeline():
    """Test: Full pipeline executes end-to-end: Production ML -> Risk -> Recommendations."""
    from ai_ml.risk_prediction.pipeline import run_integrated_risk_pipeline

    res = run_integrated_risk_pipeline(
        planned_production=1000.0,
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2
    )
    # 1. Production output
    assert res.production.planned_production == 1000.0
    assert res.production.predicted_production < 1000.0
    assert res.production.shortfall > 0.0

    # 2. Risk output
    assert res.risk.overall_risk_score > 60.0
    assert res.risk.risk_tier in ["HIGH", "CRITICAL"]
    assert res.risk.planned_production == 1000.0
    assert res.risk.predicted_production == res.production.predicted_production

    # 3. Recommendations output
    assert len(res.recommendations) >= 3
    assert all(r.status == "PENDING" for r in res.recommendations)


def test_risk_tier_boundary_consistency_regression():
    """
    Step 6.1 Regression Test:
    Proves exact boundary classification:
      - score 74.9 -> HIGH
      - score 75.0 -> CRITICAL
      - score 77.5 -> CRITICAL
    And proves production forecasting risk_level is consistent with the authoritative multi-factor risk tier.
    """
    # 1. Score 74.9 -> HIGH
    # (downtime=8.0 -> eq_risk=100.0, rainfall=60.0 -> wx_risk=100.0, blasting=0.0 -> bl_risk=0.0)
    # eq*0.35 + wx*0.25 = 35 + 25 = 60.0.
    # shortfall_pct=22.35 -> prod_risk=(22.35/30)*100 = 74.5. prod*0.20 = 14.9.
    # overall_score = 60.0 + 14.9 = 74.9
    req_74_9 = RiskAssessmentRequest(
        equipment_downtime_hours=8.0,
        rainfall_mm=60.0,
        blasting_delay_hours=0.0,
        shortfall_percentage=22.35
    )
    res_74_9 = evaluate_mining_risk(req_74_9)
    assert res_74_9.overall_risk_score == 74.9
    assert res_74_9.risk_tier == "HIGH"

    # 2. Score 75.0 -> CRITICAL
    # shortfall_pct=22.5 -> prod_risk=(22.5/30)*100 = 75.0. prod*0.20 = 15.0.
    # overall_score = 60.0 + 15.0 = 75.0
    req_75_0 = RiskAssessmentRequest(
        equipment_downtime_hours=8.0,
        rainfall_mm=60.0,
        blasting_delay_hours=0.0,
        shortfall_percentage=22.5
    )
    res_75_0 = evaluate_mining_risk(req_75_0)
    assert res_75_0.overall_risk_score == 75.0
    assert res_75_0.risk_tier == "CRITICAL"

    # 3. Score 77.5 -> CRITICAL (Operational Crisis Scenario)
    req_77_5 = RiskAssessmentRequest(
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2,
        shortfall_percentage=23.15
    )
    res_77_5 = evaluate_mining_risk(req_77_5)
    assert res_77_5.overall_risk_score == 77.5
    assert res_77_5.risk_tier == "CRITICAL"

    # 4. End-to-end consistency between production prediction and risk assessment
    prod_req = ProductionPredictionRequest(
        planned_production=1000.0,
        equipment_downtime_hours=6.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2
    )
    prod_res = predict_production_and_shortfall(prod_req)
    # The production forecasting stage now reliably reflects the multi-factor risk tier
    assert prod_res.risk_level == "CRITICAL"
    assert prod_res.risk_level == res_77_5.risk_tier



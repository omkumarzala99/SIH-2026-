# AI/ML Model Specifications: MOIL Mining Intelligence Platform

The platform implements modular, model-agnostic intelligence components.

---

## 1. Reserve Intelligence Engine (`ai_ml/reserve_prediction/`)
- **Objective**: Classifies operational blocks into `HIGH`, `MEDIUM`, or `LOW` reserve potential with calibrated probabilities (0.0 to 1.0).
- **Features Used**:
  - Borehole $Mn$ assay grade (%)
  - $Fe$ assay grade (%) & $Mn/Fe$ grade ratio
  - $SiO_2$ silica penalty index
  - Drilling intercept depth factor
  - Sentinel-2 surface NDVI (low NDVI on stripped mineral horizons)
  - Lithological host formation (`Mansar Schist`, `Sausar Group Gondite`)
- **Baseline Algorithm**: `RandomForestClassifier` + Spatial Kriging interpolation.
- **Metrics Tracked**: ROC-AUC (target > 0.85), F1-Score, Classification Accuracy.

---

## 2. Production Shortfall Forecaster (`ai_ml/production_prediction/`)
- **Objective**: Predicts daily extraction tonnage against target goals and calculates projected shortfall.
- **Physical Loss Formulation**:
  - Mechanical Fleet Downtime: $\approx 28\text{ tonnes/hour}$ per excavator breakdown.
  - Monsoon Precipitation: Rainfall $> 15\text{mm}$ reduces haul ramp traction by $\approx 1.8\text{ tonnes/mm}$.
  - Blasting Delay: Pit perimeter evacuation delays cost $\approx 35\text{ tonnes/hour}$.
- **Baseline Algorithm**: `GradientBoostingRegressor` with time-lagged extraction rolling windows.
- **Metrics Tracked**: Mean Absolute Error (MAE in tonnes), Root Mean Squared Error (RMSE), $R^2$ Score.

---

## 3. Multi-Factor Risk Engine (`ai_ml/risk_engine/`)
- **Objective**: Computes continuous operational risk score (0 to 100) and assigns discrete severity tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Composite Formula**:
  $$\text{Risk Score} = 0.35 \times \text{Fleet Downtime Risk} + 0.25 \times \text{Precipitation Risk} + 0.20 \times \text{Blasting Risk} + 0.20 \times \text{Shortfall Deficit}$$
- **Explainable AI (XAI)**: Attributes specific weights and human-readable descriptions to every elevated factor.

---

## 4. Prescriptive Recommendation Engine (`ai_ml/recommendation_engine/`)
- **Objective**: Maps operational risk bottlenecks into prioritized mitigation protocols.
- **Governance**: Human-in-the-Loop decision review (`APPROVE`, `REJECT`, `MODIFY`).

# API Reference: MOIL Mining Intelligence Platform

FastAPI REST endpoints providing multi-source mining telemetry, ML predictions, and GIS layers.

## Base URL
`http://localhost:8000/api`

## Interactive Documentation
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

---

## Endpoints Catalog

### 1. Health & Status
- **`GET /health`**: Returns system online status, database connectivity, and environment mode (`demo` or `live`).

### 2. Executive Dashboard
- **`GET /dashboard`**: Aggregates primary KPIs (Total reserves, planned extraction, predicted production, shortfall tonnages, composite risk score, environmental metrics, recent alerts, priority AI recommendation).

### 3. Reserve Intelligence
- **`GET /reserves`**: Returns evaluated reserve potentials across all operational mining zones.
- **`POST /reserves/predict`**: Executes reserve probability classification model given borehole assays, depth, lithology, and satellite NDVI.
- **`GET /reserves/boreholes`**: Returns sample exploratory borehole drilling records.

### 4. Production Forecasting
- **`GET /production`**: Returns 14-day historical production trend (planned, actual, shortfall, weather, blasting delays).
- **`POST /production/predict`**: Predicts daily extraction and shortfall based on fleet downtime, rainfall, and blasting constraints.
- **`GET /production/equipment`**: Returns heavy machinery status and downtime logs.

### 5. Multi-Factor Risk & Explainability
- **`GET /risk`**: Returns current operational risk score (0-100), severity tier, domain sub-scores, and XAI factor attribution.
- **`POST /risk/predict`**: Evaluates custom operational parameters and generates explainable risk factors.
- **`GET /risk/history`**: Returns 7-day risk index trajectory.

### 6. Decision Support & Recommendations
- **`GET /recommendations`**: Lists active prescriptive recommendations.
- **`POST /recommendations/generate`**: Dynamically generates targeted mitigation protocols.
- **`POST /recommendations/{id}/action`**: Human-in-the-loop endpoint to **Approve**, **Reject**, or **Modify** an action.

### 7. Geographic Information Systems (GIS)
- **`GET /gis/layers`**: Metadata on available GIS layers.
- **`GET /gis/zones`**: Properties of operational mining zones.
- **`GET /gis/geojson/{layer_name}`**: Serves GeoJSON feature collections (`mine_boundary`, `mining_zones`, `reserve_zones`).
- **`GET /gis/satellite-indices`**: Returns recent Sentinel-2 and Landsat observations.

### 8. What-If Scenario Simulation
- **`POST /simulation/run`**: Calculates Before vs. After extraction, shortfall, and risk variances given adjusted sliders.

### 9. Data Quality & Pipeline Health
- **`GET /data-quality`**: Computes empirical completeness %, duplicate checks, and freshness timestamps across all 5 datasets.

### 10. Operational Crisis Scenario
- **`POST /demo/crisis-scenario`**: Triggers the benchmark operational crisis scenario.

### 11. Model Registry & History
- **`GET /models`**: Lists registered models, versions, and accuracy metrics.
- **`GET /prediction-history`**: Returns historical predicted vs. actual comparisons for error tracking.

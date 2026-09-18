# MOIL AI/ML MINING INTELLIGENCE PLATFORM
## Rapid Jury Presentation & Database Handler Cheat Sheet — SIH 2026

> **HIGH-YIELD REFERENCE FOR PRESENTERS & TECHNICAL AUDITORS**

---

## 1. Fast Elevator Pitch Scripts

### ⚡ 30-Second Pitch
"The MOIL AI Mining Intelligence Platform is an enterprise-grade operational suite designed specifically for Manganese Ore India Limited. It unifies underground and opencast borehole core assays, daily HEMM fleet telemetry, IMD monsoon weather risks, and satellite thermal observations into a single AI-driven system. Powered by Random Forest grade prediction and Gradient Boosting production forecasting, it enables shift managers to optimize ore blending and mitigate pit inundation before costly disruptions occur."

### ⏱️ 1-Minute Pitch
"Manganese ore mining presents unique challenges in grade heterogeneity, pit slope stability, and strict steel plant dispatch specifications. Our platform addresses these challenges by transforming raw operational data into actionable shift intelligence. 

Using scikit-learn models trained on geological borehole core data, our system predicts manganese ore grades while strictly eliminating target leakage. Our Gradient Boosting regressor forecasts shift production based on fleet downtime and rainfall intensity. Simultaneously, our 4-pillar risk engine evaluates operational, geological, environmental, and safety risks in real time. Combined with NASA FIRMS thermal telemetry and an interactive GIS spatial workspace, the platform equips MOIL leadership with predictive decision support to maximize yield and ensure operational safety."

### 🎯 3-Minute Pitch
"Respected Members of the Jury, MOIL Limited produces over 1.3 million tons of manganese ore annually across 11 key mines like Balaghat and Dongri Buzurg. However, mining operations face daily operational friction: sub-optimal ore blending leads to dispatch penalty rejections, heavy monsoon rainfall causes open-pit flooding, and equipment breakdowns stall shift production targets.

We built the MOIL AI/ML Mining Intelligence Platform to solve these exact problems through a robust 4-layer architecture:
First, our **Data Quality & ETL Engine** continuously audits raw observations across 5 quality domains—completeness, timeliness, validity, consistency, and accuracy.
Second, our **Dual AI/ML Subsystem** delivers precise predictions: a Random Forest classifier categorizes borehole cores into High, Medium, Low, or Waste grade classes without target leakage, while a Gradient Boosting regressor models shift tonnage output under varying fleet breakdown and weather conditions.
Third, our **GIS & Remote Sensing Telemetry Layer** overlays GeoJSON mine boundaries with Sentinel-2 NDVI/NDWI moisture indices and NASA FIRMS thermal hotspot warnings within a 5-kilometer perimeter.
Finally, our **Prescriptive Decision Support & What-If Simulator** allows shift managers to simulate monsoon impact, adjust cutoff grades, and approve auto-generated blending recommendations via an audited workflow.

The entire prototype has been rigorously verified with 85 automated integration tests and built using a modern stack of FastAPI, React 18, Leaflet GIS, and SQLAlchemy. It bridges the gap between raw mine data and strategic enterprise intelligence."

---

## 2. Database Handler Cheat Sheet & ERD Quick-Reference

### Core Database Architecture
- **Database Path:** `database/sqlite_db.db`
- **ORM Implementation:** SQLAlchemy 2.0 (`backend/app/models/orm_models.py`)
- **Seeding Execution Command:** `python scripts/seed_all.py`

### Entity Relationship & Table Summary
```
+-----------------------------------------------------------------------------------+
|                            DATABASE HANDLER CHEAT SHEET                           |
+-------------------+--------------------+--------------------+---------------------+
| Table Name        | Primary Key        | Foreign Keys       | Record Count / Scope|
+-------------------+--------------------+--------------------+---------------------+
| mines             | id (String)        | None               | 8 MOIL Mines         |
| mine_zones        | id (String)        | mine_id -> mines   | 37 Zones            |
| geological_obs    | id (Integer)       | zone_id -> zones   | 1,204 Assay Core Recs|
| production_recs   | id (Integer)       | mine_id -> mines   | 2,290 Shift Records |
| equipment         | id (String)        | mine_id -> mines   | 48 HEMM Assets      |
| equipment_status  | id (Integer)       | equipment_id -> eq | 1,440 Telemetry Logs|
| weather_obs       | id (Integer)       | mine_id -> mines   | 730 Daily Weather   |
| satellite_obs     | id (Integer)       | mine_id -> mines   | 365 Remote Sensing  |
| recommendations   | id (String)        | mine_id -> mines   | 42 Active Rules     |
+-------------------+--------------------+--------------------+---------------------+
```

### Essential Database Operations
- **Reset DB & Seed Master Data:** `python scripts/seed_all.py`
- **Verify Integrity & Schema:** `python database/init_db.py`
- **Run Pipeline Ingestion:** `python -m data_pipeline.pipeline`

---

## 3. High-Yield 44 Jury Technical Q&As

### Category 1: Architecture & Tech Stack (Q1–Q10)
1. **Why FastAPI over Flask/Django?** Native `async/await`, high concurrency, Pydantic data validation, automatic OpenAPI docs.
2. **Database Engine?** SQLite (`database/sqlite_db.db`) via SQLAlchemy 2.0 ORM. Production ready for PostgreSQL/PostGIS.
3. **Frontend State?** React hooks (`useState`, `useEffect`) with Axios API services (`src/services/api.ts`).
4. **Why Leaflet GIS?** Lightweight open-source vector rendering, offline GeoJSON support, zero API key lock-in.
5. **Vite Proxy Config?** Routes `/api` calls from frontend (port 5173) to FastAPI backend (port 8000).
6. **CORS Configuration?** Handled via FastAPI `CORSMiddleware` in `main.py`.
7. **ORM Version?** SQLAlchemy 2.0+ with modern `Mapped` type annotations.
8. **UI Palette Rationale?** Custom Warm-Ivory Industrial Palette (`#F4F3EF` background, `#FAFAF7` cards) for low eye fatigue in control rooms.
9. **Environment Configuration?** Pydantic `BaseSettings` in `backend/app/config.py`.
10. **Responsive Layout?** Tailwind CSS responsive breakpoints (`md:grid-cols-2`, `lg:grid-cols-4`).

### Category 2: Data, ETL & Quality Engine (Q11–Q18)
11. **Data Origins?** Synthetically generated (`scripts/generate_mock_data.py`) using calibrated distributions matching MOIL manganese parameters.
12. **Data Quality Formula?** Score $= 0.25 C + 0.20 T + 0.20 V + 0.20 K + 0.15 A$.
13. **ETL Null Handling?** Imputed via 7-day rolling median and 3-sigma outlier clipping in `clean.py`.
14. **API Validation?** Enforced via Pydantic v2 data models.
15. **Table Count?** 9 relational tables.
16. **Foreign Key Integrity?** Enforced via SQLite pragmas and ORM relationships.
17. **Feature Transformation?** Calculates elemental ratios ($Fe\%, SiO_2\%, P\%$) in `transform.py`.
18. **Reseed Command?** `python scripts/seed_all.py`.

### Category 3: AI/ML Models & Math (Q19–Q27)
19. **Reserve Model Algorithm?** `RandomForestClassifier` (100 trees).
20. **Target Leakage Prevention?** Target variable $Mn\%$ and $Mn/Fe$ ratio strictly excluded from input matrix $X$.
21. **Production Forecasting Algorithm?** `GradientBoostingRegressor` (`n_estimators=150`, `learning_rate=0.05`).
22. **Production Predictor Inputs?** Target tonnage, breakdown hours, rainfall mm, blasting delay, fleet efficiency.
23. **Model Serialization?** Joblib (`.joblib` format) stored in `ai_ml/models/`.
24. **Reserve Classes?** High Grade ($\ge 44\%$), Medium Grade ($35-44\%$), Low Grade ($25-35\%$), Waste ($< 25\%$).
25. **Why Gradient Boosting?** Non-linear feature interactions between weather delays and breakdown hours.
26. **Model File Paths?** `ai_ml/models/reserve_model.joblib` & `production_model.joblib`.
27. **Outlier Mitigation?** Handled via robust scaling in ML service wrappers.

### Category 4: GIS, Remote Sensing & Risk Engine (Q28–Q35)
28. **Composite Risk Formula?** $\text{Risk} = 0.35 R_{\text{op}} + 0.25 R_{\text{geo}} + 0.25 R_{\text{env}} + 0.15 R_{\text{safe}}$.
29. **GIS Vector Format?** GeoJSON FeatureCollections (`mine_boundaries.json`, `mining_zones.json`).
30. **Satellite Indices?** NDVI (Vegetation), NDWI (Water Accumulation), LST (Surface Temperature).
31. **NASA FIRMS Usage?** Detects thermal anomaly hotspots within 5km perimeter.
32. **High Environmental Risk Trigger?** Daily rainfall $> 100\text{ mm}$ or high pit water accumulation.
33. **Kriging Interpolation Role?** Spatial grade estimation between discrete borehole locations.
34. **Safety Risk Inputs?** Equipment vibration levels ($\text{mm/s}$) and thermal hotspot proximity.
35. **What-If Simulator?** Interactive operational scenario engine (`POST /api/simulation/run`).

### Category 5: Security, Scalability & Production Readiness (Q36–Q44)
36. **Authentication Flow?** Verification gate on `/auth` validating engineer credentials (`MOIL-DEMO` / `MOIL@2026`).
37. **Test Suite?** 85 passing PyTest unit and integration test cases.
38. **Audit State Machine?** Prescriptive recommendations move from `AWAITING` $\to$ `APPROVED` / `REJECTED` / `MODIFIED`.
39. **Memory Footprint?** ~150 MB RAM backend + ~80 MB RAM frontend.
40. **Multi-Tenant Access?** Database queries filtered by `mine_id`.
41. **API Error Handling?** Axios interceptors with UI toast feedback.
42. **Verification Script?** `python scripts/verify_system.py`.
43. **Simulator Revenue Logic?** Tonnage output $\times$ Grade tier pricing.
44. **Next Steps to Production?** IoT SCADA hardware connection, live IMD/Sentinel API integration, PostgreSQL migration.

---

## 4. "Claims We Must Not Make" Defensive Compliance Checklist

> [!CAUTION]
> **STRICT COMPLIANCE FOR ALL TEAM MEMBERS:**
> - ❌ **NEVER SAY:** "We are connected live to MOIL's internal enterprise SCADA servers."  
>   ✔️ **ALWAYS SAY:** "We use calibrated synthetic data generators modeled on MOIL published parameters with production-ready REST API adapter contracts."
> - ❌ **NEVER SAY:** "Our ML model is 100% accurate without error."  
>   ✔️ **ALWAYS SAY:** "Our model achieves strong validated classification accuracy on core assay features while strictly avoiding target leakage."
> - ❌ **NEVER SAY:** "Satellite images stream live every second."  
>   ✔️ **ALWAYS SAY:** "Our satellite telemetry schema models Sentinel-2 5-day revisit passes and daily NASA FIRMS thermal hotspot sweeps."

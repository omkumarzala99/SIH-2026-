# System Architecture: MOIL Mining Intelligence Platform

## Overview
The MOIL Mining Intelligence Platform is a full-stack, AI-powered Decision Support System for manganese mining operations. It couples geological drilling assays, daily extraction records, heavy machinery telematics, and space-borne satellite indicators (Sentinel-2, Landsat-9) to identify manganese ore reserves, forecast production shortfalls, and prescribe operational mitigations.

---

## 1. High-Level System Architecture

```text
       +-------------------------------------------------------------+
       |                  MULTI-SOURCE DATA INGESTION                |
       |  Geological Assays | Production Logs | HEMM Fleet Telematics|
       |  Weather Sensors   | Sentinel-2 NDVI | Landsat-9 LST        |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |               DATA PIPELINE & QUALITY LAYER                 |
       |  - Automated Cleaning & Deduplication                       |
       |  - Non-fabricated Empirical Quality Audit (Completeness %)  |
       |  - Spatial-Temporal Resampling & Feature Engineering        |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                     AI / ML INTELLIGENCE                    |
       |  1. Reserve Classification Engine (RandomForest / Kriging)  |
       |  2. Daily Extraction Shortfall Forecaster (GradientBoost)   |
       |  3. Multi-Factor Transparent Risk Engine (Domain Scoring)   |
       |  4. Explainable AI (XAI) Contributing Factor Attribution    |
       |  5. Prescriptive Recommendation Engine                      |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                  FASTAPI BACKEND REST API                   |
       |  - Endpoints: Dashboard, Reserves, Production, Risk,        |
       |    Recommendations, GIS GeoJSON, Simulation, Data Quality   |
       |  - SQLAlchemy ORM (PostgreSQL Staging / SQLite Local Demo)   |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |               RESPONSIVE WEB DASHBOARD (REACT)              |
       |  - Executive Dashboard with KPI Cards & Alerts              |
       |  - Leaflet GIS Map with Layer Toggles (Benches, Reserves)   |
       |  - 14-Day Production Trend & Shortfall SVG Chart            |
       |  - Interactive What-If Operational Simulator                |
       |  - Human-in-the-Loop Workflow (Approve/Reject/Modify)       |
       |  - Instant Operational Crisis Scenario Trigger              |
       |  - Resilient Zero-Downtime Offline Fallback                 |
       +-------------------------------------------------------------+
```

---

## 2. Core Functional Pillars

### 1. Discover: Reserve Intelligence
Combines sub-surface borehole drilling records (depth, $Mn$ assay, $Fe$, $SiO_2$, lithology) with surface Earth Observation satellite features (Sentinel-2 vegetation index, surface reflectance, radiometric land surface temperature). Output delivers calibrated reserve probabilities and high/medium/low classifications.

### 2. Predict: Production Forecasting
Monitors shift-level and daily extraction quotas against real operational constraints: heavy equipment downtime, wet blast-hole ignition delays, and monsoon precipitation inflow. Calculates projected daily shortfall tonnages and deficit percentages.

### 3. Detect: Transparent Risk Engine
Evaluates composite operational risk on a 0 to 100 scale, categorizing risk into `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`. Utilizes Explainable AI (XAI) to attribute mathematical weights and human-readable root cause descriptions to every factor.

### 4. Recommend: Decision Support with Human-in-the-Loop
Translates shortfall predictions and risk bottlenecks into ranked operational interventions:
- Equipment re-deployment (rerouting dumpers from idle pits to high-grade faces)
- Blasting schedule optimization (avoiding wet-hole misfires during monsoon spikes)
- Mining zone prioritization (guiding extraction to high-grade reserves to maintain ore blending standards)
- Sump dewatering pump activation.

Managers can inspect root causes and record **Approve**, **Reject**, or **Modify** decisions with an audit trail.

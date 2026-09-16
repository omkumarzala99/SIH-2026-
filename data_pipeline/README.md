# Data Pipeline: MOIL Mining Intelligence Platform

The data pipeline provides a robust, multi-stage ETL and feature store framework designed to bridge raw mining telemetry, geological assays, and space-borne satellite observations with the downstream AI/ML inference and prediction layers.

---

## Architecture Flow

```
+-----------------------------------------------------------------------------+
| RAW INGESTION LAYER                                                         |
| - Geological Drilling CSVs                                                  |
| - Shift-wise Production Dispatch Logs                                       |
| - HEMM Equipment Telematics                                                 |
| - Meteorological Weather Sensors                                            |
| - Sentinel-2 & Landsat-9 Satellite Observations                             |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| VALIDATION & QUALITY ASSURANCE LAYER (Pydantic Contracts)                   |
| - Physical range checking (Mn grade 0-60%, non-negative tonnages)            |
| - Completeness %, duplicate identification, outlier bounds                  |
| - Automated quality report generation (`data_pipeline.quality`)             |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| CLEANING & NORMALIZATION                                                    |
| - Missing value median imputation                                           |
| - Deduplication on composite keys (`mine_id`, `zone_id`, `timestamp`)       |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| FEATURE ENGINEERING & FUSION                                                |
| - Mn/Fe assay ratios & silica penalty indexing                              |
| - Rolling 3-day shortfall & multi-factor operational stress score           |
| - Spatial-temporal feature matrices for Reserve & Production ML models      |
+-----------------------------------------------------------------------------+
```

---

## Primary Submodules

- `ingestion/loaders.py`: Fault-tolerant Pandas dataset loaders.
- `validation/schemas.py`: Pydantic data contract schemas.
- `cleaning/cleaners.py`: Domain-specific anomaly cleaners and deduplication.
- `transformation/transformers.py`: Shift to daily aggregations and sensor merges.
- `feature_engineering/features.py`: Feature matrix builders for ML training and real-time inference.
- `quality/quality_checker.py`: Real-time data health evaluator tracking completeness, uniqueness, and freshness.

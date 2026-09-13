# Reserve Intelligence ML Module (Member 2 Ownership)

Identifies and maps manganese ore reserves using surface indicators (satellite NDVI, surface reflectance, land surface temperature) and sub-surface indicators (borehole assays, depth, lithology, $Mn/Fe$ grade ratios).

## Inputs & Output

### Input Schema
- `zone_id`: Target mining zone (e.g. `ZONE_NORTH_A`)
- `depth_meters`: Intercept depth
- `mn_grade_pct`: Assay percentage of $Mn$
- `fe_grade_pct`: Assay percentage of $Fe$
- `sio2_pct`: Assay percentage of $SiO_2$
- `rock_formation`: Lithological group (`Mansar Schist`, `Sausar Group Gondite`)
- `ndvi`: Sentinel-2 vegetation index
- `land_surface_temp_c`: Thermal radiometric surface temperature

### Output
```json
{
  "zone_id": "ZONE_NORTH_A",
  "reserve_probability": 0.89,
  "classification": "HIGH",
  "estimated_tonnage": 485000,
  "estimated_mn_grade": 44.2,
  "confidence": 0.86,
  "model_version": "Reserve_ML_v1.0"
}
```

## Developer Guide for Member 2
- Modify feature engineering in `features.py`.
- Update scikit-learn or XGBoost training pipelines in `train.py`.
- Evaluate model metrics with `evaluate.py`.
- Model artifacts are saved in `ai_ml/models/`.

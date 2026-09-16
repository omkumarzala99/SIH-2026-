# Production Prediction Subsystem

Forecasts daily extraction tonnages, identifies production shortfalls against scheduled targets, and flags operational bottlenecks caused by equipment downtime, monsoon rainfall, and blasting delays.

## Input Parameters
- `planned_production`: Daily extraction goal (e.g. 1000 metric tons)
- `equipment_downtime_hours`: Fleet idle/breakdown hours
- `rainfall_mm`: Co-located precipitation
- `blasting_delay_hours`: Pit blast clearance delays

## Output Structure
```json
{
  "planned_production": 1000,
  "predicted_production": 820,
  "shortfall": 180,
  "shortfall_percentage": 18.0,
  "risk_level": "HIGH",
  "confidence": 0.85
}
```

## Subsystem Development Guide
- Update regression algorithms in `train.py`.
- Add additional operational features (e.g. operator fatigue, hauling distance, road gradient) in `features.py`.
- Ensure Pydantic contracts match `schemas.py`.

"""
Operational Crisis Scenario Simulation Endpoint.
Provides the Crisis Scenario: Heavy Rainfall + Equipment Downtime + Blasting Delay.
"""
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/demo", tags=["Demo Scenario"])


@router.post("/crisis-scenario")
def trigger_crisis_scenario() -> Dict[str, Any]:
    """Triggers the benchmark operational crisis scenario."""
    return {
        "scenario_id": "CRISIS_SCENARIO_01",
        "name": "Monsoon Inflow & Fleet Mechanical Breakdown",
        "description": "Heavy rainfall (64.2mm) in Balaghat concession, accompanied by hydraulic failure on CAT-349 excavator and 2.5h bench blasting delay.",
        "environmental_conditions": {
            "rainfall_mm": 64.2,
            "soil_moisture_pct": 62.0,
            "flood_risk": "SEVERE",
            "ambient_temp_c": 31.5
        },
        "fleet_status": {
            "excavator_downtime_hours": 6.5,
            "dumper_bottlenecks": 2,
            "fleet_health_score": 58.0
        },
        "blasting_status": {
            "delay_hours": 2.5,
            "reason": "Misfire prevention safety evacuation due to wet drill holes"
        },
        "prediction_impact": {
            "planned_production_tonnes": 1000.0,
            "predicted_production_tonnes": 820.0,
            "shortfall_tonnes": 180.0,
            "shortfall_percentage": 18.0,
            "overall_risk_score": 74.5,
            "risk_tier": "HIGH"
        },
        "mitigation_plan": [
            {
                "priority": 1,
                "action": "Re-deploy available dumper fleet to North Pit A bench -120m RL",
                "recovery_tonnes": 110.0,
                "urgency": "HIGH"
            },
            {
                "priority": 2,
                "action": "Reschedule secondary blasting window post-monsoon surge",
                "recovery_tonnes": 95.0,
                "urgency": "HIGH"
            },
            {
                "priority": 3,
                "action": "Prioritize Central Pit B high-grade extraction (44.2% Mn)",
                "recovery_tonnes": 140.0,
                "urgency": "HIGH"
            },
            {
                "priority": 4,
                "action": "Activate auxiliary 75kW pit sump dewatering pumps",
                "recovery_tonnes": 75.0,
                "urgency": "MEDIUM"
            }
        ]
    }

"""
Rule definitions and heuristic templates for operational mining mitigation actions.
"""
from typing import List, Dict, Any


def evaluate_mitigation_rules(downtime: float, rainfall: float, blasting: float, shortfall_pct: float) -> List[Dict[str, Any]]:
    """Evaluates transparent operational rules based on risk conditions."""
    triggered_rules = []

    # Rule 1: Equipment re-deployment rule
    if downtime >= 3.0 and shortfall_pct >= 10.0:
        triggered_rules.append({
            "code": "R_EQ_REDEPLOY",
            "title": "Re-deploy Haul Dumper Fleet to Pit A Upper Bench",
            "category": "EQUIPMENT",
            "problem_summary": f"Equipment downtime reached {downtime}h while production deficit stands at {shortfall_pct}%.",
            "recommended_action": "Temporarily re-route standby haul dumpers to North Pit A bench -120m RL to feed Primary Crusher at capacity.",
            "expected_impact": "Recovers approximately 110 tons/shift and reduces dumper idle queuing time by 18%.",
            "expected_tonnage_recovery": 110.0,
            "urgency": "HIGH" if shortfall_pct >= 18.0 else "MEDIUM"
        })

    # Rule 2: Blasting optimization rule
    if blasting >= 1.0 or (rainfall >= 30.0 and blasting > 0.0):
        triggered_rules.append({
            "code": "R_BLAST_RESCHEDULE",
            "title": "Reschedule Bench Blasting Window Post-Monsoon Surge",
            "category": "BLASTING",
            "problem_summary": f"Blasting delay is {blasting}h with rainfall at {rainfall}mm, threatening bench stability and misfires.",
            "recommended_action": "Shift blasting sequence to Shift-B; prioritize pre-fragmented muckpile loading in central dry zone.",
            "expected_impact": "Eliminates wet blast misfire safety hazards and recovers 95 tons of immediate run-of-mine feed.",
            "expected_tonnage_recovery": 95.0,
            "urgency": "HIGH"
        })

    # Rule 3: Environmental pit dewatering rule
    if rainfall >= 35.0:
        triggered_rules.append({
            "code": "R_ENV_DEWATER",
            "title": "Activate High-Capacity Sump Dewatering Pumps",
            "category": "ENVIRONMENTAL",
            "problem_summary": f"Severe rainfall ({rainfall}mm) causing water accumulation at -160m RL pit floor sump.",
            "recommended_action": "Deploy auxiliary 75kW slurry dewatering pumps to clear pit floor sump and grade haul road ramps.",
            "expected_impact": "Restores safe dumper cycle transit speed from 12 km/h to standard 22 km/h within 3 hours.",
            "expected_tonnage_recovery": 75.0,
            "urgency": "CRITICAL" if rainfall >= 60.0 else "HIGH"
        })

    # Rule 4: High-grade reserve zone prioritization
    if shortfall_pct >= 15.0:
        triggered_rules.append({
            "code": "R_ZONE_PRIORITIZE",
            "title": "Prioritize High-Grade Central Pit B Extraction",
            "category": "ZONE_PRIORITIZATION",
            "problem_summary": f"Overall shortfall is {shortfall_pct}%; low-grade benches are failing to fulfill contract manganese content.",
            "recommended_action": "Pivot primary excavator excavation to High Reserve Zone B (estimated 44.2% Mn) to maximize blended grade.",
            "expected_impact": "Increases average dispatched ore grade by +3.8% Mn and recovers 140 tons of equivalent value.",
            "expected_tonnage_recovery": 140.0,
            "urgency": "HIGH"
        })

    # Fallback standard operational review
    if not triggered_rules:
        triggered_rules.append({
            "code": "R_STD_SCHEDULE",
            "title": "Maintain Standard Scheduled Production Roster",
            "category": "SCHEDULE",
            "problem_summary": "All operational metrics within standard tolerances.",
            "recommended_action": "Continue current equipment allocation and execute scheduled preventive maintenance cycles.",
            "expected_impact": "Ensures steady ore supply and sustained 94% equipment availability.",
            "expected_tonnage_recovery": 0.0,
            "urgency": "LOW"
        })

    return triggered_rules

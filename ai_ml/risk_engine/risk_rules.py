"""
Rule-based evaluation heuristics for mining operational risks.
"""
from typing import List
from ai_ml.risk_engine.schemas import RiskFactorSchema


def evaluate_operational_rules(
    downtime: float,
    rainfall: float,
    blasting: float,
    shortfall_pct: float
) -> List[RiskFactorSchema]:
    """Calculates risk factor contributions and explanations."""
    factors: List[RiskFactorSchema] = []

    # 1. Equipment downtime
    if downtime >= 5.0:
        sev, desc = "CRITICAL", f"Heavy machinery breakdown ({downtime}h downtime) bottlenecks dispatch."
    elif downtime >= 2.5:
        sev, desc = "HIGH", f"High equipment idle time ({downtime}h downtime)."
    elif downtime >= 1.0:
        sev, desc = "MEDIUM", f"Moderate equipment downtime ({downtime}h)."
    else:
        sev, desc = "LOW", f"Normal equipment operational hours ({downtime}h downtime)."

    factors.append(RiskFactorSchema(
        name="Equipment Downtime",
        severity=sev,
        weight=0.35,
        description=desc,
        observed_value=f"{downtime} hrs"
    ))

    # 2. Weather & Rainfall
    if rainfall >= 50.0:
        sev, desc = "CRITICAL", f"Monsoon cloudburst ({rainfall}mm): Pit flooding and haul ramp traction loss."
    elif rainfall >= 25.0:
        sev, desc = "HIGH", f"Heavy rainfall ({rainfall}mm): Sump drainage alert."
    elif rainfall >= 10.0:
        sev, desc = "MEDIUM", f"Moderate rain ({rainfall}mm)."
    else:
        sev, desc = "LOW", f"Dry/clear weather ({rainfall}mm)."

    factors.append(RiskFactorSchema(
        name="Precipitation Impact",
        severity=sev,
        weight=0.25,
        description=desc,
        observed_value=f"{rainfall} mm"
    ))

    # 3. Blasting delay
    if blasting >= 3.0:
        sev, desc = "CRITICAL", f"Prolonged blasting delay ({blasting}h): Extraction freeze."
    elif blasting >= 1.5:
        sev, desc = "HIGH", f"Significant blast delay ({blasting}h): Evacuation delay."
    elif blasting >= 0.5:
        sev, desc = "MEDIUM", f"Minor blasting delay ({blasting}h)."
    else:
        sev, desc = "LOW", f"Blasting on shift schedule ({blasting}h)."

    factors.append(RiskFactorSchema(
        name="Blasting Schedule Delay",
        severity=sev,
        weight=0.20,
        description=desc,
        observed_value=f"{blasting} hrs"
    ))

    # 4. Production shortfall
    if shortfall_pct >= 25.0:
        sev, desc = "CRITICAL", f"Severe extraction deficit: {shortfall_pct}% below target."
    elif shortfall_pct >= 15.0:
        sev, desc = "HIGH", f"High extraction deficit: {shortfall_pct}% below target."
    elif shortfall_pct >= 5.0:
        sev, desc = "MEDIUM", f"Moderate extraction deficit: {shortfall_pct}% below target."
    else:
        sev, desc = "LOW", f"Production within target bounds: {shortfall_pct}% shortfall."

    factors.append(RiskFactorSchema(
        name="Production Deficit",
        severity=sev,
        weight=0.20,
        description=desc,
        observed_value=f"{shortfall_pct}%"
    ))

    return factors

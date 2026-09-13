"""
Explainable AI (XAI) helper for risk breakdown and factor attribution.
"""
from typing import List
from ai_ml.risk_prediction.schemas import RiskFactor


def build_risk_explanations(
    downtime: float,
    rainfall: float,
    blasting: float,
    shortfall_pct: float
) -> List[RiskFactor]:
    """Evaluates authentic contributing factors without fake metrics."""
    factors: List[RiskFactor] = []

    # 1. Equipment downtime evaluation
    if downtime >= 5.0:
        sev = "CRITICAL"
        desc = f"Heavy fleet breakdown: {downtime}h total downtime severely bottlenecks hauling throughput."
    elif downtime >= 2.5:
        sev = "HIGH"
        desc = f"Elevated machine idle time: {downtime}h downtime observed across key excavators."
    elif downtime >= 1.0:
        sev = "MEDIUM"
        desc = f"Minor operational maintenance: {downtime}h downtime within acceptable buffer."
    else:
        sev = "LOW"
        desc = f"Optimal equipment availability ({downtime}h downtime)."

    factors.append(RiskFactor(
        name="Equipment Downtime",
        severity=sev,
        weight=0.35,
        description=desc,
        observed_value=f"{downtime} hrs"
    ))

    # 2. Weather & rainfall evaluation
    if rainfall >= 50.0:
        sev = "CRITICAL"
        desc = f"Monsoon cloudburst ({rainfall}mm): Pit flooding hazard and slippery haul ramps."
    elif rainfall >= 25.0:
        sev = "HIGH"
        desc = f"Heavy rainfall ({rainfall}mm): Degrades haul road speed and increases bench water accumulation."
    elif rainfall >= 10.0:
        sev = "MEDIUM"
        desc = f"Moderate precipitation ({rainfall}mm): Requires sump drainage monitoring."
    else:
        sev = "LOW"
        desc = f"Favorable weather conditions ({rainfall}mm precipitation)."

    factors.append(RiskFactor(
        name="Precipitation & Monsoon Impact",
        severity=sev,
        weight=0.25,
        description=desc,
        observed_value=f"{rainfall} mm"
    ))

    # 3. Blasting delay evaluation
    if blasting >= 3.0:
        sev = "CRITICAL"
        desc = f"Extended shot-firing freeze ({blasting}h delay): Halts muckpile production cycle."
    elif blasting >= 1.5:
        sev = "HIGH"
        desc = f"Noticeable blasting clearance delay ({blasting}h): Pit perimeter evacuation holds up extraction."
    elif blasting >= 0.5:
        sev = "MEDIUM"
        desc = f"Slight delay in bench ignition sequence ({blasting}h)."
    else:
        sev = "LOW"
        desc = f"Blasting executed on scheduled shift window ({blasting}h delay)."

    factors.append(RiskFactor(
        name="Blasting Schedule Adherence",
        severity=sev,
        weight=0.20,
        description=desc,
        observed_value=f"{blasting} hrs"
    ))

    # 4. Production shortfall evaluation
    if shortfall_pct >= 25.0:
        sev = "CRITICAL"
        desc = f"Severe production deficit ({shortfall_pct}% shortfall vs planned schedule)."
    elif shortfall_pct >= 15.0:
        sev = "HIGH"
        desc = f"High production deficit ({shortfall_pct}% shortfall vs plan)."
    elif shortfall_pct >= 5.0:
        sev = "MEDIUM"
        desc = f"Moderate deficit ({shortfall_pct}% shortfall vs plan)."
    else:
        sev = "LOW"
        desc = f"Production tracking close to planned targets ({shortfall_pct}% shortfall)."

    factors.append(RiskFactor(
        name="Daily Production Deficit",
        severity=sev,
        weight=0.20,
        description=desc,
        observed_value=f"{shortfall_pct}%"
    ))

    return factors

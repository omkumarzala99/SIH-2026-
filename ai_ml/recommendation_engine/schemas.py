"""
Pydantic schemas for the Decision Support & Recommendation Engine.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class RecommendationItem(BaseModel):
    id: str
    mine_id: str
    title: str
    category: Literal["EQUIPMENT", "BLASTING", "SCHEDULE", "ENVIRONMENTAL", "ZONE_PRIORITIZATION"]
    problem_summary: str
    recommended_action: str
    expected_impact: str
    expected_tonnage_recovery: float
    urgency: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    status: Literal["PENDING", "APPROVED", "REJECTED", "MODIFIED"] = "PENDING"
    manager_notes: Optional[str] = None
    created_at: str


class RecommendationActionRequest(BaseModel):
    action: Literal["APPROVE", "REJECT", "MODIFY"]
    manager_notes: Optional[str] = None
    modified_action: Optional[str] = None


class RecommendationGenerationRequest(BaseModel):
    mine_id: Optional[str] = "MINE_BALAGHAT_01"
    downtime_hours: float = 3.5
    rainfall_mm: float = 28.0
    blasting_delay_hours: float = 1.5
    shortfall_percentage: float = 16.0

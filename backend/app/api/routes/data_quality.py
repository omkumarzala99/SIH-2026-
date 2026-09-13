"""
Data Quality & Pipeline Health Endpoints.
"""
from fastapi import APIRouter
from data_pipeline.quality.quality_checker import get_all_data_quality_metrics

router = APIRouter(prefix="/data-quality", tags=["Data Quality"])


@router.get("")
def get_data_quality_report():
    """Returns authentic empirical quality metrics across Geological, Production, Equipment, Weather, and Satellite datasets."""
    return get_all_data_quality_metrics()

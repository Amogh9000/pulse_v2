"""Forecast schemas for API requests/responses."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class ForecastRequest(BaseModel):
    """Request schema for running forecast."""
    city: str = "Mumbai"
    horizon: int = 7
    scenario: Optional[Dict[str, Any]] = None


class ForecastResponse(BaseModel):
    """Response schema for forecast results."""
    id: int
    run_timestamp: datetime
    horizon_days: int
    scenario: Optional[str]
    summary_json: Dict[str, Any]
    
    class Config:
        from_attributes = True

"""System status schemas for API responses."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SystemStatus(BaseModel):
    """System status response schema."""
    last_forecast_run: Optional[datetime]
    last_decision_run: Optional[datetime]
    global_risk_level: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

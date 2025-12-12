"""Alert schemas for API requests/responses."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List


class AlertBase(BaseModel):
    """Base alert schema."""
    level: str  # Critical, High, Medium, Advisory
    category: str # Staffing, Surge, Supply, Environment
    message: str
    trigger_cause: str
    
    # AI Reasoning
    reasoning_trace: List[str] = []
    recommended_actions: List[str] = []
    
    details_json: Optional[Dict[str, Any]] = None


class AlertCreate(AlertBase):
    """Schema for creating alert."""
    pass


class Alert(AlertBase):
    """Alert response schema."""
    id: int
    created_at: datetime
    resolved: bool
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class AlertSummary(BaseModel):
    total_active: int
    critical: int
    high: int
    medium: int
    advisory: int

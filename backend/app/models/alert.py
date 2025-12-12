"""Alert model for operational alerts."""
from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from datetime import datetime
from app.models.base import Base


class Alert(Base):
    """Operational alerts and notifications."""
    
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    level = Column(String, nullable=False)  # Low, Moderate, High, Critical
    category = Column(String, nullable=False)  # staffing, supplies, beds, aqi, etc.
    message = Column(String, nullable=False)
    details_json = Column(JSON, nullable=True)  # Additional structured data
    resolved = Column(Boolean, default=False, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)

    @property
    def trigger_cause(self):
        return self.details_json.get('trigger_cause') if self.details_json and self.details_json.get('trigger_cause') else "Unknown"

    @property
    def reasoning_trace(self):
        return self.details_json.get('reasoning_trace', []) if self.details_json else []

    @property
    def recommended_actions(self):
        return self.details_json.get('recommended_actions', []) if self.details_json else []

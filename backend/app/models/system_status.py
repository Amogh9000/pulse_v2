"""System status model for tracking pipeline runs."""
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.models.base import Base


class SystemStatus(Base):
    """System status tracking (singleton table)."""
    
    __tablename__ = "system_status"
    
    id = Column(Integer, primary_key=True)  # Always 1
    last_forecast_run = Column(DateTime, nullable=True)
    last_decision_run = Column(DateTime, nullable=True)
    global_risk_level = Column(String, default="Low")  # Low, Moderate, High, Critical
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

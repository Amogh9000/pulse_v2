"""Forecast model for storing forecast results."""
from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.models.base import Base


class Forecast(Base):
    """Forecast results storage."""
    
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    run_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    horizon_days = Column(Integer, nullable=False)
    scenario = Column(String, nullable=True)  # baseline, aqi_spike, festival, etc.
    summary_json = Column(JSON, nullable=False)  # Full forecast output

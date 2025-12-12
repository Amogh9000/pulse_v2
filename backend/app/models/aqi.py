"""AQI (Air Quality Index) model."""
from sqlalchemy import Column, Integer, String, Date, Float
from app.models.base import Base


class AQI(Base):
    """Air Quality Index records."""
    
    __tablename__ = "aqi"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    city = Column(String, nullable=False, index=True)
    aqi = Column(Float, nullable=False)

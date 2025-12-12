"""AQI schemas for API requests/responses."""
from pydantic import BaseModel
from datetime import date


class AQIBase(BaseModel):
    """Base AQI schema."""
    date: date
    city: str
    aqi: float


class AQICreate(AQIBase):
    """Schema for creating AQI record."""
    pass


class AQI(AQIBase):
    """AQI response schema."""
    id: int
    
    class Config:
        from_attributes = True

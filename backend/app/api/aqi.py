"""
AQI API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.aqi import AQI
from app.schemas.aqi import AQI as AQISchema, AQICreate

router = APIRouter(prefix="/aqi", tags=["aqi"])


@router.post("/", response_model=AQISchema, status_code=201)
def create_aqi_record(aqi_data: AQICreate, db: Session = Depends(get_db)):
    """
    Create a new AQI record.
    
    Args:
        aqi_data: AQI data
        db: Database session
    
    Returns:
        Created AQI record
    """
    aqi_record = AQI(**aqi_data.dict())
    db.add(aqi_record)
    db.commit()
    db.refresh(aqi_record)
    
    return aqi_record


@router.get("/{city}", response_model=List[AQISchema])
def get_aqi_by_city(city: str, limit: int = 30, db: Session = Depends(get_db)):
    """
    Get AQI history for a city.
    
    Args:
        city: City name
        limit: Maximum number of records
        db: Database session
    
    Returns:
        List of AQI records
    """
    records = db.query(AQI).filter(AQI.city == city).order_by(AQI.date.desc()).limit(limit).all()
    
    if not records:
        raise HTTPException(status_code=404, detail=f"No AQI data found for {city}")
    
    return records


@router.get("/{city}/latest", response_model=AQISchema)
def get_latest_aqi(city: str, db: Session = Depends(get_db)):
    """
    Get latest AQI for a city.
    
    Args:
        city: City name
        db: Database session
    
    Returns:
        Latest AQI record
    """
    record = db.query(AQI).filter(AQI.city == city).order_by(AQI.date.desc()).first()
    
    if not record:
        raise HTTPException(status_code=404, detail=f"No AQI data found for {city}")
    
    return record

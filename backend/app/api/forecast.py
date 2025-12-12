"""
Forecast API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.forecast import Forecast
from app.schemas.forecast import ForecastRequest, ForecastResponse
from app.agents.pipeline import run_pipeline

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.post("/run")
def run_forecast_pipeline(request: ForecastRequest, db: Session = Depends(get_db)):
    """
    Run the complete forecast pipeline.
    
    Executes: DataAgent → ForecastAgent → DecisionAgent → CommunicationAgent
    
    Args:
        request: Forecast request parameters
        db: Database session
    
    Returns:
        Complete pipeline output with decision, forecast, and alerts
    """
    try:
        result = run_pipeline(
            city=request.city,
            horizon=request.horizon,
            scenario=request.scenario,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")


@router.get("/latest", response_model=ForecastResponse)
def get_latest_forecast(db: Session = Depends(get_db)):
    """
    Get the most recent forecast from database.
    
    Args:
        db: Database session
    
    Returns:
        Latest forecast record
    """
    forecast = db.query(Forecast).order_by(Forecast.run_timestamp.desc()).first()
    
    if not forecast:
        raise HTTPException(status_code=404, detail="No forecasts found")
    
    return forecast


@router.get("/history", response_model=List[ForecastResponse])
def get_forecast_history(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get forecast history.
    
    Args:
        limit: Maximum number of records to return
        db: Database session
    
    Returns:
        List of recent forecasts
    """
    forecasts = db.query(Forecast).order_by(Forecast.run_timestamp.desc()).limit(limit).all()
    return forecasts

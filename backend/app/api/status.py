"""
System status API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.system_status import SystemStatus
from app.schemas.status import SystemStatus as StatusSchema

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/", response_model=StatusSchema)
def get_system_status(db: Session = Depends(get_db)):
    """
    Get current system status.
    
    Args:
        db: Database session
    
    Returns:
        System status including last run times and global risk level
    """
    status = db.query(SystemStatus).filter(SystemStatus.id == 1).first()
    
    if not status:
        # Create initial status if doesn't exist
        status = SystemStatus(id=1, global_risk_level="Low")
        db.add(status)
        db.commit()
        db.refresh(status)
    
    return status


@router.get("/health")
def health_check():
    """
    Simple health check endpoint.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "Pulse V2 API",
        "version": "2.0.0"
    }

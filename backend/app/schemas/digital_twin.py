from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class StaffingGap(BaseModel):
    nurses_needed: int
    doctors_needed: int

class SupplyRisk(BaseModel):
    oxygen: str  # Low, Medium, Critical
    medications: str # Low, Medium, Critical
    ppe: Optional[str] = "Low"

class DepartmentStatus(BaseModel):
    name: str
    current_occupancy: int
    capacity: int
    predicted_load: int
    expected_increase_pct: float
    risk_level: str  # Low, Medium, High
    supply_risk: SupplyRisk
    staffing_gap: StaffingGap
    ai_recommendations: List[Dict[str, Any]]
    reasoning_trace: List[str]

class DigitalTwinResponse(BaseModel):
    timestamp: str
    departments: List[DepartmentStatus]
    global_alert_level: str

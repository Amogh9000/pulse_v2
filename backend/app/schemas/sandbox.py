from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SandboxSimulationRequest(BaseModel):
    # Forecast Parameters
    horizon: int = Field(7, ge=3, le=14)
    aqi: float = Field(..., ge=0, le=500)
    festival_mode: bool = False
    rain_impact: bool = False
    accident_surge_prob: float = Field(0.0, ge=0.0, le=1.0) # 0 to 1 scaling factor
    
    # Capacity/Resource Parameters
    staff_shortage: str = Field("None", pattern="^(None|Mild|Severe)$")
    icu_stress: bool = False

class SandboxSimulationResponse(BaseModel):
    # Forecast Output
    forecast: Dict[str, Any] # Dates, predicted, lower, upper
    
    # Impact Analysis
    peak_date: str
    peak_value: float
    severity: str
    
    # Projections
    bed_occupancy_projected: List[float]
    icu_load_projected: List[float]
    
    # AI Actions
    actions: Dict[str, List[Dict[str, Any]]] # Categorized actions
    advisory: str

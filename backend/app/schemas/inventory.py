from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class InventoryItem(BaseModel):
    item_id: str
    item_name: str
    category: str
    current_stock: int
    minimum_stock: int
    daily_usage_estimate: float = 0.0 # Derived/Estimated
    unit: str
    unit_price_inr: float
    supplier: str
    last_restock_date: str
    
    # Computed Fields
    status: str = "OK"  # OK, Low, Critical
    days_remaining: float = 999.0
    predicted_depletion_date: Optional[str] = None
    recommended_reorder_qty: int = 0

class InventoryRiskAlert(BaseModel):
    item_id: str
    severity: str # Critical, High, Medium
    message: str
    action: str

class InventoryAnalysisResponse(BaseModel):
    total_items: int
    low_stock_count: int
    critical_stock_count: int
    items: List[InventoryItem]
    risk_alerts: List[InventoryRiskAlert]
    ai_summary: str

"""
Alerts API endpoints.
Aggregates risks from Forecast, Staffing, Supply, and Environment into a unified incident center.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import asyncio

from app.core.database import get_db
from app.models.alert import Alert
from app.schemas.alert import Alert as AlertSchema, AlertCreate, AlertSummary
from app.agents.data_agent import build_context, _load_inventory
from app.tools.forecast_tool import run_forecast

router = APIRouter()

# In-memory unified alert generator (simulated logic for aggregation)
# In production, this would be a background job responding to events
async def generate_system_alerts(db: Session):
    alerts = []
    
    # 1. Get Context (Real-time data)
    context = build_context("Mumbai")
    
    # 2. Staffing Alerts
    staff_count = context.get('total_staff_on_duty', 0)
    occupancy = context.get('occupancy_pct', 0)
    
    if staff_count < 80 and occupancy > 80:
        alerts.append({
            "level": "Critical",
            "category": "Staffing",
            "message": "Critical Nurse-to-Patient Ratio detected",
            "trigger_cause": "High occupancy (80%+) with low staffing (<80)",
            "reasoning_trace": [
                "Occupancy is at hazardous levels relative to staff.",
                "Current ratio 1:8, target is 1:5.",
                "Patient safety risk elevated."
            ],
            "recommended_actions": ["Authorize overtime immediately", "Call in agency staff"]
        })
    elif staff_count < 100:
        alerts.append({
            "level": "Medium",
            "category": "Staffing",
            "message": "Staffing below optimal levels",
            "trigger_cause": "Shift attendance 15% below roster",
            "reasoning_trace": ["Morning shift variance detected.", "Monitor acuity levels."],
            "recommended_actions": ["Alert shift supervisor"]
        })
        
    # 3. Environmental Alerts (AQI)
    aqi = context.get('current_aqi', 100)
    if aqi > 300:
        alerts.append({
            "level": "High",
            "category": "Environment",
            "message": "Hazardous Air Quality (AQI 300+)",
            "trigger_cause": "City-wide smog event",
            "reasoning_trace": [
                "AQI > 300 correlates with +18% respiratory admissions.",
                "Expect surge in asthma/COPD cases within 24h.",
                "Ventilator demand may spike."
            ],
            "recommended_actions": ["Activate Respiratory Protocol Level 3", "Check Oxygen reserves"]
        })
        
    # 4. Forecast Surge Alerts
    # Run a quick forecast check
    forecast = run_forecast(context, horizon_days=3)
    surge = forecast.get('delta_pct', 0)
    
    if surge > 15:
        alerts.append({
            "level": "High",
            "category": "Surge",
            "message": f"Predicted Admission Surge (+{surge:.1f}%)",
            "trigger_cause": "Forecast model trend analysis",
            "reasoning_trace": [
                f"3-day forecast indicates sharp rise.",
                f"Peak expected on {forecast.get('peak_day')}.",
                "Bed capacity likely to be breached."
            ],
            "recommended_actions": ["Open Overflow Ward B", "Discharge stable patients"]
        })
        
    # 5. Supply Alerts (Quick check from Inventory module logic)
    # We can reuse the logic or just check specific critical items for this aggregator
    inv_df = _load_inventory()
    if not inv_df.empty:
        critical_items = inv_df[inv_df['current_stock'] < inv_df['minimum_stock']]
        for _, item in critical_items.iterrows():
             alerts.append({
                "level": "Critical",
                "category": "Supply",
                "message": f"Stockout Risk: {item['item_name']}",
                "trigger_cause": "Inventory count below safety stock",
                "reasoning_trace": [
                    f"Current stock {item['current_stock']} < Min {item['minimum_stock']}.",
                    "Supply chain lead time is > 24h.",
                    "Critical care dependency."
                ],
                "recommended_actions": [f"Emergency order for {item['item_name']}"]
            })

    return alerts

@router.get("/summary", response_model=AlertSummary)
async def get_alert_summary(db: Session = Depends(get_db)):
    # Calculate summary from DB
    # Note: In a real app we'd query structured data. 
    # For now, we'll iterate active alerts.
    active_alerts = db.query(Alert).filter(Alert.resolved == False).all()
    
    summary = {
        "total_active": len(active_alerts),
        "critical": 0,
        "high": 0,
        "medium": 0,
        "advisory": 0
    }
    
    for alert in active_alerts:
        lvl = alert.level.lower()
        if lvl in summary:
            summary[lvl] += 1
            
    return summary

@router.get("/list", response_model=List[AlertSchema])
async def get_alerts_list(category: str = None, db: Session = Depends(get_db)):
    query = db.query(Alert).filter(Alert.resolved == False)
    if category and category != "All":
        query = query.filter(Alert.category == category)
    
    return query.order_by(Alert.level == 'Critical', Alert.created_at.desc()).all() # Sort Critical first

@router.post("/generate")
async def trigger_generation(db: Session = Depends(get_db)):
    """Manually trigger alert generation (for demo/simulation)."""
    generated = await generate_system_alerts(db)
    
    count = 0
    for data in generated:
        # Check if similar active alert exists to avoid dups
        exists = db.query(Alert).filter(
            Alert.message == data['message'], 
            Alert.resolved == False
        ).first()
        
        if not exists:
            # Pack extended fields into details_json
            alert_data = {
                "level": data["level"],
                "category": data["category"],
                "message": data["message"],
                "details_json": {
                    "trigger_cause": data.get("trigger_cause"),
                    "reasoning_trace": data.get("reasoning_trace", []),
                    "recommended_actions": data.get("recommended_actions", [])
                }
            }
            alert = Alert(**alert_data)
            db.add(alert)
            count += 1
    
    if count > 0:
        db.commit()
        
    return {"status": "success", "generated_count": count}

@router.post("/resolve/{alert_id}")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return alert

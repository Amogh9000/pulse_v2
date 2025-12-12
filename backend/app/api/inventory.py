from fastapi import APIRouter, HTTPException
from app.schemas.inventory import InventoryAnalysisResponse, InventoryItem, InventoryRiskAlert
from app.agents.data_agent import _load_inventory
from datetime import datetime, timedelta
import pandas as pd
import logging
import random

router = APIRouter()
logger = logging.getLogger(__name__)

def calculate_status(current, minimum):
    if current < minimum:
        return "Critical"
    elif current < 2 * minimum:
        return "Low"
    return "OK"

@router.get("/analyze", response_model=InventoryAnalysisResponse)
async def analyze_inventory():
    try:
        # Load data
        df = _load_inventory()
        if df.empty:
            raise HTTPException(status_code=500, detail="Inventory data not available")

        items = []
        alerts = []
        low_count = 0
        critical_count = 0

        # Simulate daily usage estimates (randomized or heuristic based on item type)
        # In a real app, this would come from historical consumption logs
        usage_heuristics = {
            "PPE": 0.05, # % of stock used daily
            "Respiratory": 0.08,
            "Medication": 0.03,
            "Consumables": 0.04,
            "Critical Care": 0.01,
            "Diagnostics": 0.005,
            "Equipment": 0.001
        }

        for _, row in df.iterrows():
            # Basic Mapping
            item = InventoryItem(
                item_id=row['item_id'],
                item_name=row['item_name'],
                category=row['category'],
                current_stock=int(row['current_stock']),
                minimum_stock=int(row['minimum_stock']),
                unit=row['unit'],
                unit_price_inr=float(row['unit_price_inr']),
                supplier=row['supplier'],
                last_restock_date=str(row['last_restock_date'])
            )
            
            # Status Logic
            item.status = calculate_status(item.current_stock, item.minimum_stock)
            if item.status == "Critical":
                critical_count += 1
            elif item.status == "Low":
                low_count += 1

            # Depletion Forecast Logic
            usage_rate = usage_heuristics.get(item.category, 0.02)
            # Add some variability
            daily_usage_abs = int(item.current_stock * usage_rate) + 1 
            item.daily_usage_estimate = daily_usage_abs
            
            if daily_usage_abs > 0:
                item.days_remaining = round(item.current_stock / daily_usage_abs, 1)
                depletion_date = datetime.now() + timedelta(days=item.days_remaining)
                item.predicted_depletion_date = depletion_date.strftime("%Y-%m-%d")
            
            # Reorder Recommendation
            if item.status != "OK" or item.days_remaining < 14:
                 target_stock = item.minimum_stock * 3
                 item.recommended_reorder_qty = max(0, target_stock - item.current_stock)

            # Generate Risks
            if item.status == "Critical":
                alerts.append(InventoryRiskAlert(
                    item_id=item.item_id,
                    severity="Critical",
                    message=f"Critical shortage of {item.item_name}. Stock below minimum threshold.",
                    action=f"Immediate order of {item.recommended_reorder_qty} {item.unit} needed."
                ))
            elif item.category == "Respiratory" and item.days_remaining < 7:
                 alerts.append(InventoryRiskAlert(
                    item_id=item.item_id,
                    severity="High",
                    message=f"High respiratory demand predicted. {item.item_name} buffer low.",
                    action="Expedite delivery from OxyGen Solutions."
                ))
            
            items.append(item)

        # AI Summary (Mocked for speed/reliablity in this endpoint, could call LLM)
        summary = f"Inventory health is generally stable, but {critical_count} items are at critical levels. " \
                  f"Supply chain for PPE and Respiratory categories requires attention due to projected forecast demands. " \
                  f"Recommended immediate restocking value: ₹{sum([i.recommended_reorder_qty * i.unit_price_inr for i in items if i.recommended_reorder_qty > 0]):,.0f}"

        return InventoryAnalysisResponse(
            total_items=len(items),
            low_stock_count=low_count,
            critical_stock_count=critical_count,
            items=items,
            risk_alerts=alerts,
            ai_summary=summary
        )

    except Exception as e:
        logger.error(f"Inventory analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

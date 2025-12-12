from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.schemas.sandbox import SandboxSimulationRequest, SandboxSimulationResponse
from app.agents.data_agent import build_context
from app.tools.forecast_tool import run_forecast
from app.agents.decision_agent import make_decision
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/simulate", response_model=SandboxSimulationResponse)
async def simulate_scenario(request: SandboxSimulationRequest):
    logger.info(f"Sandbox simulation requested: {request}")
    
    try:
        # 1. Get Base Context
        context = build_context("Mumbai")
        
        # 2. Apply Overrides to Context
        # AQI
        if request.aqi is not None:
            context['current_aqi'] = request.aqi
            # Update AQI trend for decision agent
            if request.aqi > 200:
                context['aqi_trend'] = "worsening"
        
        # Admissions Forecast Overrides
        multiplier = 1.0
        
        if request.festival_mode:
            multiplier += 0.20 # +20%
            context['upcoming_events'] = [{"name": "Simulated Festival", "type": "festival", "date": "Soon"}]
            
        if request.rain_impact:
            # Rain reduces elective but increases accident/viral
            multiplier += 0.05
            
        if request.accident_surge_prob > 0:
            multiplier += (request.accident_surge_prob * 0.4) # Max 40% surge
            
        context['avg_daily_admissions'] = context.get('avg_daily_admissions', 50.0) * multiplier
        
        # Capacity overrides for Decision Agent
        original_staff = context.get('total_staff_on_duty', 100)
        if request.staff_shortage == "Mild":
            context['total_staff_on_duty'] = int(original_staff * 0.85)
        elif request.staff_shortage == "Severe":
            context['total_staff_on_duty'] = int(original_staff * 0.60)
            
        original_beds = context.get('total_beds', 300)
        if request.icu_stress:
            # Simulate high bed utilization baseline
            context['occupied_beds'] = int(original_beds * 0.95)
            context['occupancy_pct'] = 95.0
        
        # 3. Run Forecast with overrides
        forecast = run_forecast(context, horizon_days=request.horizon)
        
        # 4. Calculate Projections (Occupancy & ICU)
        # Heuristic: Occupancy scales with forecast variation relative to baseline
        baseline = forecast.get('baseline', [50]*request.horizon)[0]
        predicted = forecast.get('predicted', [])
        
        current_occupancy = context.get('occupancy_pct', 75.0)
        bed_occupancy_projected = []
        icu_load_projected = []
        
        for pred in predicted:
            # Delta from baseline
            delta_ratio = pred / baseline if baseline > 0 else 1.0
            # Dampened elasticity for occupancy (0.7)
            proj_occ = min(100.0, current_occupancy * (1 + (delta_ratio - 1) * 0.7))
            bed_occupancy_projected.append(round(proj_occ, 1))
            
            # ICU is approx 15% of occupancy? Or 15% of capacity?
            # Let's say 12-15% of occupied beds are ICU
            icu_factor = 0.20 if request.icu_stress else 0.12
            icu_load = min(100.0, proj_occ * icu_factor * 3) # Scaled to ICU capacity (assuming ICU is 1/3 of total beds)
            icu_load_projected.append(round(icu_load, 1))

        # 5. Run Decision Agent
        decision = make_decision(context, forecast)
        
        # 6. Format Response
        return SandboxSimulationResponse(
            forecast=forecast,
            peak_date=forecast.get('peak_day', 'Unknown'),
            peak_value=max(forecast.get('predicted', [0])),
            severity=decision.get('risk_level', 'Moderate'),
            bed_occupancy_projected=bed_occupancy_projected,
            icu_load_projected=icu_load_projected,
            actions=decision.get('actions', {}),
            advisory=decision.get('advisory', "No active advisory.")
        )

    except Exception as e:
        logger.error(f"Simulation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scenarios", response_model=List[Dict[str, Any]])
async def get_scenarios():
    # Mock data for preset scenarios
    return [
        {"id": "s1", "name": "Diwali Surge", "parameters": {"festival_mode": True, "aqi": 300}},
        {"id": "s2", "name": "Monsoon Accidents", "parameters": {"rain_impact": True, "accident_surge_prob": 0.5}},
        {"id": "s3", "name": "Low Staffing Weekend", "parameters": {"staff_shortage": "Severe", "horizon": 3}}
    ]

@router.post("/scenarios")
async def save_scenario(scenario: Dict[str, Any]):
    # Mock save
    return {"status": "success", "id": "s_new", "message": "Scenario saved"}

from fastapi import APIRouter
from datetime import datetime
from app.agents.data_agent import build_context
from app.agents.forecast_agent import generate_forecast
from app.services.department_simulator import DepartmentSimulator
from app.agents.decision_agent import analyze_department_risks
from app.schemas.digital_twin import DigitalTwinResponse

router = APIRouter()
simulator = DepartmentSimulator()

@router.get("/status", response_model=DigitalTwinResponse)
async def get_digital_twin_status():
    """
    Get the real-time Digital Twin status.
    Orchestrates:
    1. Global Forecast (ForecastAgent)
    2. Department Simulation (DepartmentSimulator)
    3. AI Analysis (DecisionAgent)
    """
    
    # 1. Get Global Context & Forecast (Reusing existing agents)
    # We use a mock horizon of 7 days for the "current state" prediction
    context = build_context("Mumbai")
    forecast_result = generate_forecast(context, horizon_days=7)
    
    # 2. Simulate Department Loads
    departments_status = simulator.simulate_status(forecast_result)
    
    # 3. Enhance with AI (Decision Agent) 
    # We process this for each department that has Medium/High risk
    # For Low risk, we provide simulated generic advice to save LLM tokens/latency
    enriched_departments = []
    
    for dept in departments_status:
        # Check risk
        if dept['risk_level'] in ["Medium", "High"]:
            # Call AI
            ai_analysis = analyze_department_risks(dept)
            dept['ai_recommendations'] = ai_analysis.get('recommendations', [])
            dept['reasoning_trace'] = ai_analysis.get('reasoning', [])
        else:
            # Simple fallback
            dept['ai_recommendations'] = [{"text": "Maintain normal operations", "type": "General"}]
            dept['reasoning_trace'] = ["Risk level is Low.", "No specific interventions required."]
            
        enriched_departments.append(dept)
    
    return {
        "timestamp": datetime.now().isoformat(),
        "departments": enriched_departments,
        "global_alert_level": "Moderate" if any(d['risk_level'] == "High" for d in departments_status) else "Low"
    }

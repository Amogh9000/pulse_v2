"""
DecisionAgent - LLM-powered decision making using Groq API.
Analyzes context, forecast, and risk to generate actionable recommendations.
"""
import logging
import json
from typing import Dict, Any
from app.core.llm_client import run_llm
from app.tools.risk_tool import score_risk

logger = logging.getLogger(__name__)

# System prompt template for DecisionAgent
DECISION_AGENT_PROMPT_TEMPLATE = """You are Pulse Decision Agent, an expert hospital operations director for {city}.

Your job is to analyze the provided data and make operational decisions about staffing, supplies, and bed management.

CURRENT SITUATION:
- Date: {timestamp}
- Current AQI: {aqi} ({aqi_trend})
- Bed Occupancy: {occupancy_pct}% ({occupied}/{total} beds)
- Admission Trend: {admission_trend}
- Average Daily Admissions (14-day): {avg_admissions}

FORECAST SUMMARY:
- Horizon: {horizon} days
- Peak Day: {peak_day}
- Average Predicted: {avg_predicted} admissions/day
- Change vs Baseline: {delta_pct}%

RISK ASSESSMENT:
- AQI Risk: {aqi_risk}
- Occupancy Risk: {occupancy_risk}
- Surge Risk: {surge_risk}
- Overall Risk: {final_risk}

INVENTORY STATUS:
{inventory_status}

STAFFING STATUS:
- Total Staff on Duty: {staff_count}

CONSTRAINTS:
1. Use the risk thresholds:
   - AQI: <100 low, 100-200 moderate, 200-300 high, >300 severe
   - Occupancy: <70% low, 70-85% moderate, 85-95% high, >95% critical
   - Surge: <5% low, 5-15% moderate, 15-30% high, >30% critical

2. Scale actions based on forecast peak_day and delta_pct
3. Be conservative when confidence < 0.5 (propose monitoring vs aggressive changes)
4. If AQI < 100 AND delta_pct < 5 AND occupancy < 70 → risk_level=Low with minimal/no actions

YOUR TASK:
Generate operational recommendations as valid JSON with this EXACT structure:

{{
  "risk_level": "Low|Moderate|High|Critical",
  "actions": {{
    "staffing": [
      {{"role": "nurse", "change": "+3", "shift": "day", "reason": "explanation"}}
    ],
    "supplies": [
      {{"item": "oxygen_cylinder", "qty": 50, "reason": "explanation"}}
    ],
    "beds": [
      {{"action": "prepare_overflow", "expected_date": "2025-12-13", "reason": "explanation"}}
    ]
  }},
  "advisory": "Short patient advisory message (max 200 chars)",
  "reasoning_trace": [
    "Step 1: Analyzed AQI level...",
    "Step 2: Evaluated occupancy...",
    "Step 3: Assessed forecast surge...",
    "Step 4: Generated recommendations..."
  ],
  "confidence": 0.85
}}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON object.
"""


def make_decision(context: Dict[str, Any], forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    Make operational decisions using LLM.
    
    Args:
        context: Operational context from DataAgent
        forecast: Forecast results from ForecastAgent
    
    Returns:
        Dict containing risk_level, actions, advisory, reasoning_trace, confidence
    """
    logger.info("DecisionAgent making operational decisions")
    
    # Calculate risk score
    aqi = context.get('current_aqi', 100)
    occupancy_pct = context.get('occupancy_pct', 75)
    delta_pct = forecast.get('delta_pct', 0)
    
    risk_result = score_risk(aqi, occupancy_pct, delta_pct)
    
    # Build inventory status summary
    inventory_status = _format_inventory_status(context)
    
    # Build prompt
    prompt = DECISION_AGENT_PROMPT_TEMPLATE.format(
        city=context.get('city', 'Mumbai'),
        timestamp=context.get('timestamp', ''),
        aqi=aqi,
        aqi_trend=context.get('aqi_trend', 'unknown'),
        occupancy_pct=occupancy_pct,
        occupied=context.get('occupied_beds', 0),
        total=context.get('total_beds', 0),
        admission_trend=context.get('recent_trend', 'unknown'),
        avg_admissions=context.get('avg_daily_admissions', 50),
        horizon=len(forecast.get('dates', [])),
        peak_day=forecast.get('peak_day', 'unknown'),
        avg_predicted=forecast.get('avg_predicted', 0),
        delta_pct=delta_pct,
        aqi_risk=risk_result['aqi_level'],
        occupancy_risk=risk_result['occupancy_level'],
        surge_risk=risk_result['surge_level'],
        final_risk=risk_result['final_risk'],
        inventory_status=inventory_status,
        staff_count=context.get('total_staff_on_duty', 0)
    )
    
    logger.info("Calling Groq LLM for decision making...")
    
    try:
        # Call LLM
        response_text = run_llm(prompt, max_tokens=1500, temperature=0.2)
        
        # Parse JSON response
        decision = _parse_llm_response(response_text)
        
        # Validate and enrich
        decision = _validate_decision(decision, risk_result)
        
        logger.info(f"Decision made: {decision.get('risk_level')} risk, {len(decision.get('actions', {}).get('staffing', []))} staffing actions")
        
        return decision
        
    except Exception as e:
        logger.error(f"Decision making failed: {e}")
        # Return fallback decision based on risk score
        return _fallback_decision(risk_result, context, forecast)


def _format_inventory_status(context: Dict[str, Any]) -> str:
    """Format inventory status for prompt."""
    low_stock = context.get('low_stock_items', [])
    
    if not low_stock:
        return "All items adequately stocked"
    
    return f"LOW STOCK ALERT: {', '.join(low_stock[:5])}"


def _parse_llm_response(response_text: str) -> Dict[str, Any]:
    """Parse LLM response to JSON with error handling."""
    try:
        # Try direct JSON parse
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            json_text = response_text[start:end].strip()
            return json.loads(json_text)
        elif "```" in response_text:
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            json_text = response_text[start:end].strip()
            return json.loads(json_text)
        else:
            # Try to find JSON object
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            if start >= 0 and end > start:
                json_text = response_text[start:end]
                return json.loads(json_text)
            else:
                raise ValueError("No JSON found in response")


def _validate_decision(decision: Dict[str, Any], risk_result: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and enrich decision with defaults."""
    # Ensure required keys exist
    if 'risk_level' not in decision:
        decision['risk_level'] = risk_result['final_risk']
    
    if 'actions' not in decision:
        decision['actions'] = {"staffing": [], "supplies": [], "beds": []}
    
    if 'advisory' not in decision:
        decision['advisory'] = "Monitor situation closely."
    
    if 'reasoning_trace' not in decision:
        decision['reasoning_trace'] = ["Decision generated by LLM"]
    
    if 'confidence' not in decision:
        decision['confidence'] = 0.7
    
    return decision


def _fallback_decision(risk_result: Dict[str, Any], context: Dict[str, Any], forecast: Dict[str, Any]) -> Dict[str, Any]:
    """Generate fallback decision when LLM fails."""
    logger.warning("Using fallback decision logic")
    
    final_risk = risk_result['final_risk']
    aqi = context.get('current_aqi', 100)
    delta_pct = forecast.get('delta_pct', 0)
    
    actions = {"staffing": [], "supplies": [], "beds": []}
    
    if final_risk in ["High", "Critical"]:
        # Add staffing
        actions['staffing'].append({
            "role": "nurse",
            "change": "+3" if final_risk == "High" else "+5",
            "shift": "all",
            "reason": f"{final_risk} risk detected with {delta_pct:.1f}% surge predicted"
        })
        
        # Add supplies
        if aqi > 200:
            actions['supplies'].append({
                "item": "oxygen_cylinder",
                "qty": 50 if final_risk == "High" else 100,
                "reason": f"High AQI ({aqi}) increases respiratory cases"
            })
        
        # Bed management
        if delta_pct > 15:
            actions['beds'].append({
                "action": "prepare_overflow" if final_risk == "High" else "open_overflow",
                "expected_date": forecast.get('peak_day', 'soon'),
                "reason": f"Predicted {delta_pct:.1f}% surge in admissions"
            })
    
    return {
        "risk_level": final_risk,
        "actions": actions,
        "advisory": f"{final_risk} risk level. Follow hospital surge protocols.",
        "reasoning_trace": [
            f"Risk assessment: {final_risk}",
            f"AQI: {aqi}, Surge: {delta_pct:.1f}%",
            "Applied threshold-based decision rules",
            "Fallback logic used (LLM unavailable)"
        ],
        "confidence": 0.6
    }


def analyze_department_risks(department_status: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate department-specific AI recommendations.
    
    Args:
        department_status: Dict from DepartmentSimulator
        
    Returns:
        Dict with 'recommendations' and 'reasoning'
    """
    logger.info(f"Analyzing risks for department: {department_status.get('name')}")
    
    dept_name = department_status.get('name', 'Unknown')
    risk_level = department_status.get('risk_level', 'Low')
    occ = department_status.get('current_occupancy', 0)
    cap = department_status.get('capacity', 0)
    pred_load = department_status.get('predicted_load', 0)
    
    prompt = f"""You are a hospital operations expert for the {dept_name}.
    
    Current Status:
    - Occupancy: {occ}/{cap}
    - Risk Level: {risk_level}
    - Predicted Peak Load: {pred_load} patients
    
    Task:
    Recommend 2-3 specific operational actions for this department to handle the load/risk.
    Focus on staffing, specific supplies, and patient flow.
    
    Return JSON only:
    {{
        "recommendations": [
            {{"text": "Action description", "type": "Staffing|Supply|Ops"}}
        ],
        "reasoning": [
            "Reason point 1",
            "Reason point 2"
        ]
    }}
    """
    
    try:
        response_text = run_llm(prompt, max_tokens=600, temperature=0.3)
        return _parse_llm_response(response_text)
    except Exception as e:
        logger.error(f"Dept analysis failed: {e}")
        return {
            "recommendations": [{"text": "Review department protocols", "type": "General"}],
            "reasoning": ["LLM generation failed, using fallback."]
        }

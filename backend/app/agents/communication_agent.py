"""
CommunicationAgent - Formats decision output for different channels.
Converts LLM decisions into database records and user-friendly messages.
"""
import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)


def format_for_api(decision: Dict[str, Any], context: Dict[str, Any], forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format decision output for API response.
    
    Args:
        decision: Decision from DecisionAgent
        context: Operational context
        forecast: Forecast results
    
    Returns:
        API-ready formatted output
    """
    logger.info("CommunicationAgent formatting output for API")
    
    # Build structured output
    output = {
        "decision": decision,
        "context_summary": {
            "city": context.get('city'),
            "timestamp": context.get('timestamp'),
            "aqi": context.get('current_aqi'),
            "occupancy_pct": context.get('occupancy_pct'),
            "avg_daily_admissions": context.get('avg_daily_admissions')
        },
        "forecast_summary": {
            "horizon_days": len(forecast.get('dates', [])),
            "peak_day": forecast.get('peak_day'),
            "avg_predicted": forecast.get('avg_predicted'),
            "delta_pct": forecast.get('delta_pct')
        },
        "forecast": forecast,
        "human_summary": _generate_human_summary(decision, context, forecast),
        "alerts": _generate_alerts(decision),
        "formatted_at": datetime.now().isoformat()
    }
    
    return output


def _generate_human_summary(decision: Dict[str, Any], context: Dict[str, Any], forecast: Dict[str, Any]) -> str:
    """Generate human-readable summary."""
    risk_level = decision.get('risk_level', 'Unknown')
    aqi = context.get('current_aqi', 0)
    delta_pct = forecast.get('delta_pct', 0)
    peak_day = forecast.get('peak_day', 'unknown')
    
    # Count actions
    actions = decision.get('actions', {})
    staffing_count = len(actions.get('staffing', []))
    supplies_count = len(actions.get('supplies', []))
    beds_count = len(actions.get('beds', []))
    
    summary_parts = [
        f"**Risk Level: {risk_level}**",
        f"Current AQI is {aqi:.0f} with {delta_pct:+.1f}% predicted surge peaking on {peak_day}.",
    ]
    
    if staffing_count > 0:
        summary_parts.append(f"Recommended {staffing_count} staffing adjustment(s).")
    
    if supplies_count > 0:
        summary_parts.append(f"Requested {supplies_count} supply order(s).")
    
    if beds_count > 0:
        summary_parts.append(f"Initiated {beds_count} bed management action(s).")
    
    if staffing_count == 0 and supplies_count == 0 and beds_count == 0:
        summary_parts.append("No immediate actions required. Continue monitoring.")
    
    return " ".join(summary_parts)


def _generate_alerts(decision: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate alert records from decision."""
    alerts = []
    risk_level = decision.get('risk_level', 'Low')
    actions = decision.get('actions', {})
    
    # Staffing alerts
    for action in actions.get('staffing', []):
        alerts.append({
            "level": risk_level,
            "category": "staffing",
            "message": f"Staffing change required: {action.get('change')} {action.get('role')} for {action.get('shift')} shift",
            "details_json": action
        })
    
    # Supply alerts
    for action in actions.get('supplies', []):
        alerts.append({
            "level": risk_level,
            "category": "supplies",
            "message": f"Supply order: {action.get('qty')} units of {action.get('item')}",
            "details_json": action
        })
    
    # Bed management alerts
    for action in actions.get('beds', []):
        alerts.append({
            "level": risk_level,
            "category": "beds",
            "message": f"Bed action: {action.get('action')} by {action.get('expected_date')}",
            "details_json": action
        })
    
    # General advisory alert
    if decision.get('advisory'):
        alerts.append({
            "level": risk_level,
            "category": "advisory",
            "message": decision.get('advisory'),
            "details_json": {
                "confidence": decision.get('confidence'),
                "reasoning_trace": decision.get('reasoning_trace', [])
            }
        })
    
    logger.info(f"Generated {len(alerts)} alerts")
    return alerts


def format_for_sms(decision: Dict[str, Any]) -> str:
    """Format decision as SMS message."""
    advisory = decision.get('advisory', 'Monitor situation.')
    risk_level = decision.get('risk_level', 'Moderate')
    
    return f"[Pulse Alert - {risk_level}] {advisory}"


def format_for_email(decision: Dict[str, Any], context: Dict[str, Any], forecast: Dict[str, Any]) -> Dict[str, str]:
    """Format decision as email."""
    risk_level = decision.get('risk_level', 'Unknown')
    actions = decision.get('actions', {})
    
    subject = f"Pulse Alert: {risk_level} Risk Level - Action Required"
    
    body_parts = [
        f"Risk Level: {risk_level}",
        "",
        "SITUATION:",
        f"- AQI: {context.get('current_aqi', 0):.0f}",
        f"- Occupancy: {context.get('occupancy_pct', 0):.1f}%",
        f"- Predicted Surge: {forecast.get('delta_pct', 0):+.1f}%",
        f"- Peak Day: {forecast.get('peak_day', 'unknown')}",
        "",
        "RECOMMENDED ACTIONS:",
        ""
    ]
    
    # Staffing
    if actions.get('staffing'):
        body_parts.append("Staffing:")
        for action in actions['staffing']:
            body_parts.append(f"  - {action.get('change')} {action.get('role')} ({action.get('shift')} shift)")
            body_parts.append(f"    Reason: {action.get('reason')}")
    
    # Supplies
    if actions.get('supplies'):
        body_parts.append("")
        body_parts.append("Supplies:")
        for action in actions['supplies']:
            body_parts.append(f"  - Order {action.get('qty')} units of {action.get('item')}")
            body_parts.append(f"    Reason: {action.get('reason')}")
    
    # Beds
    if actions.get('beds'):
        body_parts.append("")
        body_parts.append("Bed Management:")
        for action in actions['beds']:
            body_parts.append(f"  - {action.get('action')} by {action.get('expected_date')}")
            body_parts.append(f"    Reason: {action.get('reason')}")
    
    body_parts.extend([
        "",
        "PATIENT ADVISORY:",
        decision.get('advisory', 'Monitor situation closely.'),
        "",
        f"Confidence: {decision.get('confidence', 0.7):.0%}",
        "",
        "---",
        "Pulse V2 - AI Hospital Operations System"
    ])
    
    return {
        "subject": subject,
        "body": "\n".join(body_parts)
    }


def format_for_dashboard(decision: Dict[str, Any], context: Dict[str, Any], forecast: Dict[str, Any]) -> Dict[str, Any]:
    """Format decision for dashboard display."""
    return {
        "risk_card": {
            "level": decision.get('risk_level'),
            "confidence": decision.get('confidence'),
            "color": _get_risk_color(decision.get('risk_level'))
        },
        "actions_panel": {
            "staffing": decision.get('actions', {}).get('staffing', []),
            "supplies": decision.get('actions', {}).get('supplies', []),
            "beds": decision.get('actions', {}).get('beds', [])
        },
        "advisory_banner": {
            "message": decision.get('advisory'),
            "severity": decision.get('risk_level')
        },
        "reasoning_panel": {
            "trace": decision.get('reasoning_trace', []),
            "expandable": True
        },
        "metrics": {
            "aqi": context.get('current_aqi'),
            "occupancy": context.get('occupancy_pct'),
            "surge": forecast.get('delta_pct'),
            "peak_day": forecast.get('peak_day')
        }
    }


def _get_risk_color(risk_level: str) -> str:
    """Get color code for risk level."""
    colors = {
        "Low": "#10b981",      # green
        "Moderate": "#f59e0b", # yellow
        "High": "#ef4444",     # red
        "Critical": "#991b1b"  # dark red
    }
    return colors.get(risk_level, "#6b7280")

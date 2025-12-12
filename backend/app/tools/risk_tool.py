"""
Risk scoring tool for operational risk assessment.
Uses threshold-based classification for AQI, occupancy, and surge.
"""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def score_risk(aqi: float, occupancy_pct: float, delta_pct: float) -> Dict[str, Any]:
    """
    Score operational risk based on key metrics.
    
    Args:
        aqi: Air Quality Index value
        occupancy_pct: Current bed occupancy percentage
        delta_pct: Predicted change in admissions vs baseline
    
    Returns:
        Dict containing risk levels and scores for each dimension plus final risk
    """
    logger.info(f"Scoring risk: AQI={aqi}, Occupancy={occupancy_pct}%, Delta={delta_pct}%")
    
    # AQI Risk Classification
    if aqi < 100:
        aqi_level = "Low"
        aqi_score = 1
    elif aqi < 200:
        aqi_level = "Moderate"
        aqi_score = 2
    elif aqi < 300:
        aqi_level = "High"
        aqi_score = 3
    else:
        aqi_level = "Severe"
        aqi_score = 4
    
    # Occupancy Risk Classification
    if occupancy_pct < 70:
        occupancy_level = "Low"
        occupancy_score = 1
    elif occupancy_pct < 85:
        occupancy_level = "Moderate"
        occupancy_score = 2
    elif occupancy_pct < 95:
        occupancy_level = "High"
        occupancy_score = 3
    else:
        occupancy_level = "Critical"
        occupancy_score = 4
    
    # Surge Risk Classification
    if delta_pct < 5:
        surge_level = "Low"
        surge_score = 1
    elif delta_pct < 15:
        surge_level = "Moderate"
        surge_score = 2
    elif delta_pct < 30:
        surge_level = "High"
        surge_score = 3
    else:
        surge_level = "Critical"
        surge_score = 4
    
    # Calculate composite risk score (weighted average)
    # AQI: 30%, Occupancy: 40%, Surge: 30%
    composite_score = (aqi_score * 0.3) + (occupancy_score * 0.4) + (surge_score * 0.3)
    
    # Determine final risk level
    if composite_score < 1.5:
        final_risk = "Low"
    elif composite_score < 2.5:
        final_risk = "Moderate"
    elif composite_score < 3.5:
        final_risk = "High"
    else:
        final_risk = "Critical"
    
    result = {
        "aqi_level": aqi_level,
        "occupancy_level": occupancy_level,
        "surge_level": surge_level,
        "final_risk": final_risk,
        "scores": {
            "aqi": aqi_score,
            "occupancy": occupancy_score,
            "surge": surge_score,
            "composite": round(composite_score, 2)
        },
        "thresholds": {
            "aqi": {"low": 100, "moderate": 200, "high": 300},
            "occupancy": {"low": 70, "moderate": 85, "high": 95},
            "surge": {"low": 5, "moderate": 15, "high": 30}
        }
    }
    
    logger.info(f"Risk assessment: {final_risk} (composite score: {composite_score:.2f})")
    return result


def get_risk_recommendations(risk_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get actionable recommendations based on risk assessment.
    
    Args:
        risk_result: Output from score_risk()
    
    Returns:
        Dict containing recommended actions
    """
    final_risk = risk_result['final_risk']
    
    recommendations = {
        "Low": {
            "staffing": "Maintain normal staffing levels",
            "supplies": "Standard inventory monitoring",
            "beds": "No special preparations needed",
            "monitoring": "Continue routine monitoring"
        },
        "Moderate": {
            "staffing": "Consider adding 1-2 staff per shift",
            "supplies": "Increase buffer stock by 20%",
            "beds": "Prepare contingency overflow plan",
            "monitoring": "Increase monitoring frequency to every 4 hours"
        },
        "High": {
            "staffing": "Add 3-5 staff per shift, prioritize critical roles",
            "supplies": "Increase buffer stock by 50%, expedite critical orders",
            "beds": "Activate overflow areas, defer non-urgent procedures",
            "monitoring": "Continuous monitoring, hourly updates"
        },
        "Critical": {
            "staffing": "Maximum staffing, call in reserves, extend shifts",
            "supplies": "Emergency procurement, activate backup suppliers",
            "beds": "Full surge protocol, maximum capacity utilization",
            "monitoring": "Real-time monitoring, immediate escalation protocols"
        }
    }
    
    return {
        "risk_level": final_risk,
        "recommendations": recommendations.get(final_risk, recommendations["Moderate"])
    }

"""
Scenario simulation tool for what-if analysis.
Modifies context and re-runs forecast with different parameters.
"""
import logging
from typing import Dict, Any, Optional
from app.tools.forecast_tool import run_forecast

logger = logging.getLogger(__name__)


def simulate_scenario(
    base_context: Dict[str, Any],
    aqi_override: Optional[float] = None,
    festival: bool = False,
    surge_pct: Optional[float] = None,
    horizon_days: int = 7
) -> Dict[str, Any]:
    """
    Simulate a scenario by modifying context parameters.
    
    Args:
        base_context: Base context from DataAgent
        aqi_override: Override AQI value for scenario
        festival: Whether to simulate festival period
        surge_pct: Manual surge percentage override
        horizon_days: Forecast horizon
    
    Returns:
        Dict containing scenario forecast and impact assessment
    """
    logger.info(f"Simulating scenario: AQI={aqi_override}, Festival={festival}, Surge={surge_pct}%")
    
    # Create modified context
    scenario_context = base_context.copy()
    
    # Apply AQI override
    if aqi_override is not None:
        scenario_context['current_aqi'] = aqi_override
        logger.info(f"AQI override: {aqi_override}")
    
    # Apply festival impact
    if festival:
        # Festivals typically increase admissions by 15-25%
        baseline = scenario_context.get('avg_daily_admissions', 50.0)
        scenario_context['avg_daily_admissions'] = baseline * 1.20
        logger.info(f"Festival mode: baseline increased by 20%")
    
    # Apply manual surge
    if surge_pct is not None:
        baseline = scenario_context.get('avg_daily_admissions', 50.0)
        scenario_context['avg_daily_admissions'] = baseline * (1 + surge_pct / 100)
        logger.info(f"Manual surge: {surge_pct}%")
    
    # Run forecast with modified context
    forecast_result = run_forecast(scenario_context, horizon_days)
    
    # Calculate impact vs baseline
    baseline_admissions = base_context.get('avg_daily_admissions', 50.0)
    scenario_avg = forecast_result['avg_predicted']
    impact_pct = ((scenario_avg - baseline_admissions) / baseline_admissions) * 100
    
    # Determine impact severity
    if abs(impact_pct) < 10:
        impact_severity = "Minimal"
    elif abs(impact_pct) < 25:
        impact_severity = "Moderate"
    elif abs(impact_pct) < 50:
        impact_severity = "Significant"
    else:
        impact_severity = "Severe"
    
    # Build scenario result
    result = {
        "scenario_name": _build_scenario_name(aqi_override, festival, surge_pct),
        "parameters": {
            "aqi_override": aqi_override,
            "festival": festival,
            "surge_pct": surge_pct,
            "horizon_days": horizon_days
        },
        "forecast": forecast_result,
        "impact_assessment": {
            "baseline_avg": round(baseline_admissions, 1),
            "scenario_avg": round(scenario_avg, 1),
            "impact_pct": round(impact_pct, 1),
            "impact_severity": impact_severity,
            "peak_day": forecast_result['peak_day'],
            "peak_value": max(forecast_result['predicted'])
        }
    }
    
    logger.info(f"Scenario complete: {impact_severity} impact ({impact_pct:.1f}%)")
    return result


def _build_scenario_name(aqi: Optional[float], festival: bool, surge: Optional[float]) -> str:
    """Build descriptive scenario name."""
    parts = []
    
    if aqi is not None:
        if aqi < 100:
            parts.append("Good AQI")
        elif aqi < 200:
            parts.append("Moderate AQI")
        elif aqi < 300:
            parts.append("Poor AQI")
        else:
            parts.append("Severe AQI")
    
    if festival:
        parts.append("Festival Period")
    
    if surge is not None:
        parts.append(f"{surge:+.0f}% Surge")
    
    if not parts:
        return "Baseline"
    
    return " + ".join(parts)


def run_multi_scenario_analysis(
    base_context: Dict[str, Any],
    horizon_days: int = 7
) -> Dict[str, Any]:
    """
    Run multiple predefined scenarios for comparison.
    
    Args:
        base_context: Base context from DataAgent
        horizon_days: Forecast horizon
    
    Returns:
        Dict containing results for all scenarios
    """
    logger.info("Running multi-scenario analysis")
    
    scenarios = {
        "baseline": simulate_scenario(base_context, horizon_days=horizon_days),
        "aqi_spike": simulate_scenario(base_context, aqi_override=250, horizon_days=horizon_days),
        "festival": simulate_scenario(base_context, festival=True, horizon_days=horizon_days),
        "combined_worst": simulate_scenario(
            base_context,
            aqi_override=300,
            festival=True,
            horizon_days=horizon_days
        ),
        "best_case": simulate_scenario(base_context, aqi_override=50, horizon_days=horizon_days)
    }
    
    # Calculate range
    all_avgs = [s['impact_assessment']['scenario_avg'] for s in scenarios.values()]
    
    result = {
        "scenarios": scenarios,
        "summary": {
            "min_avg": round(min(all_avgs), 1),
            "max_avg": round(max(all_avgs), 1),
            "range": round(max(all_avgs) - min(all_avgs), 1),
            "baseline_avg": scenarios['baseline']['impact_assessment']['baseline_avg']
        }
    }
    
    logger.info(f"Multi-scenario analysis complete: range {result['summary']['range']:.1f}")
    return result

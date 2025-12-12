"""
ForecastAgent - Wrapper for forecast tool with agent-level logic.
"""
import logging
from typing import Dict, Any
from app.tools.forecast_tool import run_forecast

logger = logging.getLogger(__name__)


def generate_forecast(context: Dict[str, Any], horizon_days: int = 7) -> Dict[str, Any]:
    """
    Generate forecast using forecast tool.
    
    Args:
        context: Operational context from DataAgent
        horizon_days: Number of days to forecast
    
    Returns:
        Forecast results dict
    """
    logger.info(f"ForecastAgent generating {horizon_days}-day forecast")
    
    try:
        forecast_result = run_forecast(context, horizon_days)
        logger.info(f"Forecast generated successfully: peak on {forecast_result.get('peak_day')}")
        return forecast_result
    except Exception as e:
        logger.error(f"Forecast generation failed: {e}")
        raise


def generate_multi_scenario_forecast(context: Dict[str, Any], horizon_days: int = 7) -> Dict[str, Any]:
    """
    Generate multiple scenario forecasts.
    
    Args:
        context: Operational context from DataAgent
        horizon_days: Number of days to forecast
    
    Returns:
        Dict containing baseline, AQI spike, festival, and combined scenarios
    """
    logger.info("ForecastAgent generating multi-scenario forecast")
    
    from app.tools.scenario_tool import simulate_scenario
    
    scenarios = {}
    
    # Baseline
    scenarios['baseline'] = run_forecast(context, horizon_days)
    
    # AQI spike scenario
    aqi_context = context.copy()
    aqi_context['current_aqi'] = 250
    scenarios['aqi_spike'] = run_forecast(aqi_context, horizon_days)
    
    # Festival scenario
    festival_context = context.copy()
    festival_context['avg_daily_admissions'] = context.get('avg_daily_admissions', 50) * 1.2
    scenarios['festival'] = run_forecast(festival_context, horizon_days)
    
    # Combined worst case
    combined_context = context.copy()
    combined_context['current_aqi'] = 300
    combined_context['avg_daily_admissions'] = context.get('avg_daily_admissions', 50) * 1.25
    scenarios['combined'] = run_forecast(combined_context, horizon_days)
    
    logger.info("Multi-scenario forecast complete")
    
    return {
        "scenarios": scenarios,
        "horizon_days": horizon_days,
        "generated_at": context.get('timestamp')
    }

"""
Forecast tool for predicting hospital admissions.
Uses Prophet for time series forecasting with deterministic fallback.
"""
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


def run_forecast(context: Dict[str, Any], horizon_days: int = 7) -> Dict[str, Any]:
    """
    Run forecast for hospital admissions.
    
    Args:
        context: Context dict from DataAgent containing historical data
        horizon_days: Number of days to forecast ahead
    
    Returns:
        Dict containing forecast results with dates, predicted values, baseline, etc.
    """
    try:
        # Try using Prophet if available
        from prophet import Prophet
        return _run_prophet_forecast(context, horizon_days)
    except ImportError:
        logger.warning("Prophet not available, using deterministic fallback")
        return _run_deterministic_forecast(context, horizon_days)
    except Exception as e:
        logger.error(f"Prophet forecast failed: {e}, using deterministic fallback")
        return _run_deterministic_forecast(context, horizon_days)


def _run_prophet_forecast(context: Dict[str, Any], horizon_days: int) -> Dict[str, Any]:
    """Run forecast using Prophet library."""
    from prophet import Prophet
    
    logger.info(f"Running Prophet forecast for {horizon_days} days")
    
    # Get historical admissions data from context
    admissions_df = context.get('admissions_history', pd.DataFrame())
    
    if admissions_df.empty:
        logger.warning("No historical data, using deterministic fallback")
        return _run_deterministic_forecast(context, horizon_days)
    
    # Prepare data for Prophet (requires 'ds' and 'y' columns)
    df = pd.DataFrame({
        'ds': pd.to_datetime(admissions_df['date']),
        'y': admissions_df['admissions']
    })
    
    # Add AQI as regressor if available
    if 'aqi' in admissions_df.columns:
        df['aqi'] = admissions_df['aqi']
    
    # Initialize and fit model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05
    )
    
    if 'aqi' in df.columns:
        model.add_regressor('aqi')
    
    model.fit(df)
    
    # Create future dataframe
    future = model.make_future_dataframe(periods=horizon_days)
    
    # Add AQI forecast (use recent average or context value)
    if 'aqi' in df.columns:
        current_aqi = context.get('current_aqi', df['aqi'].tail(7).mean())
        future['aqi'] = current_aqi
    
    # Make prediction
    forecast = model.predict(future)
    
    # Extract future predictions
    future_forecast = forecast.tail(horizon_days)
    
    # Calculate baseline (recent average)
    baseline_value = df['y'].tail(14).mean()
    
    # Prepare output
    dates = future_forecast['ds'].dt.strftime('%Y-%m-%d').tolist()
    predicted = future_forecast['yhat'].clip(lower=0).tolist()
    lower = future_forecast['yhat_lower'].clip(lower=0).tolist()
    upper = future_forecast['yhat_upper'].clip(lower=0).tolist()
    baseline = [baseline_value] * len(dates)
    
    # Find peak day
    peak_idx = np.argmax(predicted)
    peak_day = dates[peak_idx]
    avg_predicted = np.mean(predicted)
    delta_pct = ((avg_predicted - baseline_value) / baseline_value) * 100
    
    result = {
        "dates": dates,
        "predicted": [round(p, 1) for p in predicted],
        "baseline": [round(b, 1) for b in baseline],
        "lower": [round(l, 1) for l in lower],
        "upper": [round(u, 1) for u in upper],
        "peak_day": peak_day,
        "avg_predicted": round(avg_predicted, 1),
        "delta_pct": round(delta_pct, 1)
    }
    
    logger.info(f"Prophet forecast complete: peak on {peak_day}, delta {delta_pct:.1f}%")
    return result


def _run_deterministic_forecast(context: Dict[str, Any], horizon_days: int) -> Dict[str, Any]:
    """
    Deterministic fallback forecast using seasonal patterns.
    Provides reproducible results without Prophet.
    """
    logger.info(f"Running deterministic forecast for {horizon_days} days")
    
    # Get baseline from context or use default
    baseline_admissions = context.get('avg_daily_admissions', 50.0)
    current_aqi = context.get('current_aqi', 100.0)
    occupancy_pct = context.get('occupancy_pct', 70.0)
    
    # Generate forecast dates
    start_date = datetime.now().date()
    dates = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, horizon_days + 1)]
    
    # Deterministic forecast with patterns
    predicted = []
    for i in range(horizon_days):
        # Base value
        value = baseline_admissions
        
        # Weekly seasonality (weekends lower)
        day_of_week = (datetime.now().weekday() + i + 1) % 7
        if day_of_week in [5, 6]:  # Saturday, Sunday
            value *= 0.85
        
        # AQI impact
        if current_aqi > 200:
            value *= 1.3
        elif current_aqi > 100:
            value *= 1.15
        
        # Occupancy impact (if high, may indicate surge)
        if occupancy_pct > 85:
            value *= 1.2
        
        # Small deterministic variation
        variation = np.sin(i * 0.5) * 5
        value += variation
        
        predicted.append(max(0, value))
    
    # Calculate metrics
    baseline = [baseline_admissions] * horizon_days
    lower = [p * 0.9 for p in predicted]
    upper = [p * 1.1 for p in predicted]
    
    peak_idx = np.argmax(predicted)
    peak_day = dates[peak_idx]
    avg_predicted = np.mean(predicted)
    delta_pct = ((avg_predicted - baseline_admissions) / baseline_admissions) * 100
    
    result = {
        "dates": dates,
        "predicted": [round(p, 1) for p in predicted],
        "baseline": [round(b, 1) for b in baseline],
        "lower": [round(l, 1) for l in lower],
        "upper": [round(u, 1) for u in upper],
        "peak_day": peak_day,
        "avg_predicted": round(avg_predicted, 1),
        "delta_pct": round(delta_pct, 1)
    }
    
    logger.info(f"Deterministic forecast complete: peak on {peak_day}, delta {delta_pct:.1f}%")
    return result

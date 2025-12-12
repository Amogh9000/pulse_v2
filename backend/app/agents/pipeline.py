"""
Pipeline - Orchestrates the full agentic workflow.
DataAgent → ForecastAgent → DecisionAgent → CommunicationAgent
"""
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.agents.data_agent import build_context
from app.agents.forecast_agent import generate_forecast
from app.agents.decision_agent import make_decision
from app.agents.communication_agent import format_for_api, _generate_alerts

logger = logging.getLogger(__name__)


def run_pipeline(
    city: str = "Mumbai",
    horizon: int = 7,
    scenario: Optional[Dict[str, Any]] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Run the complete agentic pipeline.
    
    Workflow:
    1. DataAgent builds context from CSV data
    2. ForecastAgent generates predictions
    3. DecisionAgent (LLM) makes recommendations
    4. CommunicationAgent formats output
    5. Persist results to database
    
    Args:
        city: City name for context
        horizon: Forecast horizon in days
        scenario: Optional scenario parameters for what-if analysis
        db: Database session for persistence
    
    Returns:
        Complete pipeline output with decision, forecast, and alerts
    """
    logger.info(f"=" * 80)
    logger.info(f"PIPELINE START: {city}, horizon={horizon} days")
    logger.info(f"=" * 80)
    
    try:
        # STEP 1: DataAgent - Build Context
        logger.info("STEP 1/4: DataAgent building context...")
        context = build_context(city)
        
        # Apply scenario modifications if provided
        if scenario:
            logger.info(f"Applying scenario modifications: {scenario}")
            if 'aqi_override' in scenario:
                context['current_aqi'] = scenario['aqi_override']
            if 'festival' in scenario and scenario['festival']:
                context['avg_daily_admissions'] = context.get('avg_daily_admissions', 50) * 1.2
            if 'surge_pct' in scenario:
                baseline = context.get('avg_daily_admissions', 50)
                context['avg_daily_admissions'] = baseline * (1 + scenario['surge_pct'] / 100)
        
        logger.info(f"✓ Context built: AQI={context.get('current_aqi')}, Occupancy={context.get('occupancy_pct')}%")
        
        # STEP 2: ForecastAgent - Generate Forecast
        logger.info("STEP 2/4: ForecastAgent generating forecast...")
        forecast = generate_forecast(context, horizon)
        logger.info(f"✓ Forecast complete: peak={forecast.get('peak_day')}, delta={forecast.get('delta_pct')}%")
        
        # STEP 3: DecisionAgent - Make Decisions (LLM)
        logger.info("STEP 3/4: DecisionAgent making decisions (Groq LLM)...")
        decision = make_decision(context, forecast)
        logger.info(f"✓ Decision made: risk={decision.get('risk_level')}, confidence={decision.get('confidence')}")
        
        # STEP 4: CommunicationAgent - Format Output
        logger.info("STEP 4/4: CommunicationAgent formatting output...")
        output = format_for_api(decision, context, forecast)
        logger.info(f"✓ Output formatted: {len(output.get('alerts', []))} alerts generated")
        
        # STEP 5: Persist to Database (if db session provided)
        if db:
            logger.info("STEP 5/5: Persisting to database...")
            _persist_results(db, city, horizon, scenario, forecast, decision, output)
            logger.info("✓ Results persisted to database")
        
        logger.info("=" * 80)
        logger.info("PIPELINE COMPLETE ✓")
        logger.info("=" * 80)
        
        return output
        
    except Exception as e:
        logger.error(f"❌ Pipeline failed: {e}", exc_info=True)
        raise


def _persist_results(
    db: Session,
    city: str,
    horizon: int,
    scenario: Optional[Dict[str, Any]],
    forecast: Dict[str, Any],
    decision: Dict[str, Any],
    output: Dict[str, Any]
):
    """Persist pipeline results to database."""
    from app.models.forecast import Forecast
    from app.models.alert import Alert
    from app.models.system_status import SystemStatus
    
    try:
        # Save forecast
        scenario_name = "baseline"
        if scenario:
            if scenario.get('aqi_override'):
                scenario_name = f"aqi_{scenario['aqi_override']}"
            elif scenario.get('festival'):
                scenario_name = "festival"
        
        forecast_record = Forecast(
            horizon_days=horizon,
            scenario=scenario_name,
            summary_json={
                "forecast": forecast,
                "decision": decision,
                "context_summary": output.get('context_summary')
            }
        )
        db.add(forecast_record)
        
        # Save alerts
        for alert_data in output.get('alerts', []):
            alert = Alert(
                level=alert_data.get('level'),
                category=alert_data.get('category'),
                message=alert_data.get('message'),
                details_json=alert_data.get('details_json')
            )
            db.add(alert)
        
        # Update system status
        status = db.query(SystemStatus).filter(SystemStatus.id == 1).first()
        if not status:
            status = SystemStatus(id=1)
            db.add(status)
        
        status.last_forecast_run = datetime.utcnow()
        status.last_decision_run = datetime.utcnow()
        status.global_risk_level = decision.get('risk_level', 'Low')
        
        db.commit()
        logger.info("Database persistence successful")
        
    except Exception as e:
        logger.error(f"Database persistence failed: {e}")
        db.rollback()
        # Don't raise - persistence failure shouldn't break the pipeline


def run_decision_only(db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Run decision-only job (no new forecast, use latest context).
    Used by scheduler for frequent decision updates.
    
    Args:
        db: Database session
    
    Returns:
        Decision output
    """
    logger.info("Running decision-only job...")
    
    try:
        # Build current context
        context = build_context("Mumbai")
        
        # Use simple short-term forecast
        from app.tools.forecast_tool import run_forecast
        forecast = run_forecast(context, horizon_days=3)
        
        # Make decision
        decision = make_decision(context, forecast)
        
        # Format output
        output = format_for_api(decision, context, forecast)
        
        # Update system status only
        if db:
            from app.models.system_status import SystemStatus
            status = db.query(SystemStatus).filter(SystemStatus.id == 1).first()
            if status:
                status.last_decision_run = datetime.utcnow()
                status.global_risk_level = decision.get('risk_level', 'Low')
                db.commit()
        
        logger.info(f"Decision-only job complete: {decision.get('risk_level')} risk")
        return output
        
    except Exception as e:
        logger.error(f"Decision-only job failed: {e}")
        raise

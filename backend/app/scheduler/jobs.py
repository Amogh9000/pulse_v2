"""
Scheduled jobs for periodic pipeline execution.
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime

from app.core.config import settings
from app.core.database import SessionLocal
from app.agents.pipeline import run_pipeline, run_decision_only

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None


def forecast_job():
    """
    Scheduled job to run full forecast pipeline.
    Runs every FORECAST_INTERVAL_HOURS hours.
    """
    logger.info("=" * 80)
    logger.info(f"SCHEDULED FORECAST JOB STARTED: {datetime.now()}")
    logger.info("=" * 80)
    
    db = SessionLocal()
    try:
        result = run_pipeline(city="Mumbai", horizon=3, db=db)
        logger.info(f"✓ Forecast job completed: {result.get('decision', {}).get('risk_level')} risk")
    except Exception as e:
        logger.error(f"❌ Forecast job failed: {e}", exc_info=True)
    finally:
        db.close()


def decision_job():
    """
    Scheduled job to run decision-only updates.
    Runs every DECISION_INTERVAL_HOURS hours.
    """
    logger.info(f"Scheduled decision job started: {datetime.now()}")
    
    db = SessionLocal()
    try:
        result = run_decision_only(db=db)
        logger.info(f"✓ Decision job completed: {result.get('decision', {}).get('risk_level')} risk")
    except Exception as e:
        logger.error(f"❌ Decision job failed: {e}", exc_info=True)
    finally:
        db.close()


def start_scheduler():
    """Initialize and start the background scheduler."""
    global scheduler
    
    if scheduler is not None:
        logger.warning("Scheduler already running")
        return
    
    logger.info("Initializing scheduler...")
    
    scheduler = BackgroundScheduler()
    
    # Add forecast job
    scheduler.add_job(
        forecast_job,
        trigger=IntervalTrigger(hours=settings.FORECAST_INTERVAL_HOURS),
        id="forecast_job",
        name="Full Forecast Pipeline",
        replace_existing=True
    )
    logger.info(f"✓ Forecast job scheduled: every {settings.FORECAST_INTERVAL_HOURS} hours")
    
    # Add decision job
    scheduler.add_job(
        decision_job,
        trigger=IntervalTrigger(hours=settings.DECISION_INTERVAL_HOURS),
        id="decision_job",
        name="Decision Update",
        replace_existing=True
    )
    logger.info(f"✓ Decision job scheduled: every {settings.DECISION_INTERVAL_HOURS} hours")
    
    # Start scheduler
    scheduler.start()
    logger.info("✓ Scheduler started successfully")


def stop_scheduler():
    """Stop the background scheduler."""
    global scheduler
    
    if scheduler is not None:
        scheduler.shutdown()
        scheduler = None
        logger.info("Scheduler stopped")

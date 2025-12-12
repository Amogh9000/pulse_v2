"""
Pulse V2 - Main FastAPI Application
Agentic AI Hospital Operations Cockpit powered by Groq
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, forecast, alerts, sandbox, inventory, aqi, status, digital_twin
from app.scheduler.jobs import start_scheduler, stop_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("=" * 80)
    logger.info("PULSE V2 - STARTING UP")
    logger.info("=" * 80)
    
    # Initialize database
    logger.info("Initializing database...")
    init_db()
    logger.info("✓ Database initialized")
    
    # Start scheduler
    logger.info("Starting scheduler...")
    start_scheduler()
    logger.info("✓ Scheduler started")
    
    logger.info("=" * 80)
    logger.info("PULSE V2 - READY")
    logger.info("=" * 80)
    
    yield
    
    # Shutdown
    logger.info("Shutting down scheduler...")
    stop_scheduler()
    logger.info("✓ Pulse V2 shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Pulse V2 API",
    description="Agentic AI Hospital Operations Cockpit powered by Groq",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(forecast.router)
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(aqi.router)
app.include_router(status.router)
app.include_router(sandbox.router, prefix="/sandbox", tags=["Sandbox"])
app.include_router(digital_twin.router, prefix="/api/digital_twin", tags=["Digital Twin"])


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "service": "Pulse V2 API",
        "version": "2.0.0",
        "description": "Agentic AI Hospital Operations Cockpit",
        "powered_by": "Groq",
        "endpoints": {
            "docs": "/docs",
            "health": "/status/health",
            "forecast": "/forecast/run",
            "alerts": "/alerts/active",
            "status": "/status"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

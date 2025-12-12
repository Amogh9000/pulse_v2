"""
Core configuration for Pulse V2.
Loads settings from environment variables with sensible defaults.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./pulse.db"
    
    # Groq API
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"  # Options: llama3-70b-8192, mixtral-8x7b-32768, qwen2-72b-32768
    
    # JWT Authentication
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Scheduler
    FORECAST_INTERVAL_HOURS: int = 6
    DECISION_INTERVAL_HOURS: int = 1
    
    # Application
    APP_NAME: str = "Pulse V2"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

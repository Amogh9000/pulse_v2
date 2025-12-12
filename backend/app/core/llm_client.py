"""
Groq LLM client wrapper for Pulse V2.
Provides simple interface to Groq API with fallback simulation.
"""
import os
import json
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global client instance
_groq_client = None


def get_groq_client():
    """Get or create Groq client instance."""
    global _groq_client
    
    if _groq_client is None:
        try:
            from groq import Groq
            api_key = settings.GROQ_API_KEY
            
            if not api_key or api_key == "your_groq_api_key_here":
                logger.warning("⚠️  GROQ_API_KEY not set. Using deterministic fallback simulator.")
                return None
            
            _groq_client = Groq(api_key=api_key)
            logger.info(f"✅ Groq client initialized with model: {settings.GROQ_MODEL}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Groq client: {e}")
            logger.warning("Using deterministic fallback simulator.")
            return None
    
    return _groq_client


def run_llm(prompt: str, max_tokens: int = 1024, temperature: float = 0.2) -> str:
    """
    Run LLM inference using Groq API.
    
    Args:
        prompt: The prompt to send to the LLM
        max_tokens: Maximum tokens in response
        temperature: Sampling temperature (0.0-1.0)
    
    Returns:
        LLM response text
    """
    client = get_groq_client()
    
    if client is None:
        # Fallback to deterministic simulator
        return _deterministic_fallback(prompt)
    
    try:
        logger.info(f"🤖 Calling Groq API with model: {settings.GROQ_MODEL}")
        
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are Pulse Decision Agent, an expert hospital operations director. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        response = completion.choices[0].message.content
        logger.info(f"✅ Groq API response received ({len(response)} chars)")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Groq API error: {e}")
        logger.warning("Falling back to deterministic simulator")
        return _deterministic_fallback(prompt)


def _deterministic_fallback(prompt: str) -> str:
    """
    Deterministic fallback simulator for testing without API key.
    Returns a valid JSON response based on prompt analysis.
    """
    logger.info("🔄 Using deterministic fallback simulator")
    
    # Parse prompt to extract key metrics
    aqi = 150  # default moderate
    occupancy = 75.0
    delta = 10.0
    
    # Simple keyword extraction
    if "AQI" in prompt or "aqi" in prompt:
        try:
            # Try to extract AQI value
            for line in prompt.split('\n'):
                if 'aqi' in line.lower():
                    parts = line.split(':')
                    if len(parts) > 1:
                        aqi = int(''.join(filter(str.isdigit, parts[1][:10])) or 150)
        except:
            pass
    
    # Determine risk level based on AQI
    if aqi < 100:
        risk_level = "Low"
        actions = {
            "staffing": [],
            "supplies": [],
            "beds": []
        }
        advisory = "Air quality is good. Normal operations continue."
    elif aqi < 200:
        risk_level = "Moderate"
        actions = {
            "staffing": [
                {"role": "nurse", "change": "+2", "shift": "day", "reason": "Moderate AQI may increase respiratory cases"}
            ],
            "supplies": [
                {"item": "oxygen_cylinder", "qty": 20, "reason": "Buffer for potential respiratory admissions"}
            ],
            "beds": []
        }
        advisory = "Moderate air quality. Sensitive groups should limit outdoor exposure."
    elif aqi < 300:
        risk_level = "High"
        actions = {
            "staffing": [
                {"role": "nurse", "change": "+3", "shift": "day", "reason": "High AQI expected to increase respiratory admissions"},
                {"role": "doctor", "change": "+1", "shift": "day", "reason": "Additional coverage for respiratory cases"}
            ],
            "supplies": [
                {"item": "oxygen_cylinder", "qty": 50, "reason": "High demand expected for respiratory support"},
                {"item": "nebulizer", "qty": 10, "reason": "Increased asthma and COPD cases likely"}
            ],
            "beds": [
                {"action": "prepare_overflow", "expected_date": "today", "reason": "Anticipate 20-30% surge in admissions"}
            ]
        }
        advisory = "Poor air quality. Avoid outdoor activities. Seek medical help if experiencing breathing difficulties."
    else:
        risk_level = "Critical"
        actions = {
            "staffing": [
                {"role": "nurse", "change": "+5", "shift": "all", "reason": "Severe AQI will cause significant respiratory emergencies"},
                {"role": "doctor", "change": "+2", "shift": "all", "reason": "Critical surge expected"},
                {"role": "respiratory_therapist", "change": "+2", "shift": "all", "reason": "Specialized care needed"}
            ],
            "supplies": [
                {"item": "oxygen_cylinder", "qty": 100, "reason": "Critical shortage risk with severe AQI"},
                {"item": "nebulizer", "qty": 25, "reason": "High demand for respiratory treatments"},
                {"item": "ventilator_supplies", "qty": 15, "reason": "Prepare for severe cases"}
            ],
            "beds": [
                {"action": "open_overflow", "expected_date": "immediately", "reason": "40%+ surge expected"},
                {"action": "defer_elective", "expected_date": "immediately", "reason": "Preserve capacity for emergencies"}
            ]
        }
        advisory = "SEVERE air quality. Stay indoors. Emergency services may be overwhelmed. Seek immediate help for breathing issues."
    
    response = {
        "risk_level": risk_level,
        "actions": actions,
        "advisory": advisory,
        "reasoning_trace": [
            f"Analyzed AQI level: {aqi}",
            f"Classified risk as: {risk_level}",
            f"Applied threshold-based decision rules",
            "Generated staffing, supply, and bed management recommendations",
            "Formulated patient advisory message"
        ],
        "confidence": 0.75
    }
    
    return json.dumps(response, indent=2)

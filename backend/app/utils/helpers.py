"""
Helper utilities for common operations.
"""
import json
from datetime import datetime, date
from typing import Any


def json_serial(obj: Any) -> str:
    """JSON serializer for objects not serializable by default json code."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def safe_json_loads(text: str, default: Any = None) -> Any:
    """Safely load JSON with fallback."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return default


def truncate_string(text: str, max_length: int = 200) -> str:
    """Truncate string to max length."""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

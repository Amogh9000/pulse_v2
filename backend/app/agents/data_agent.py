"""
DataAgent - Loads and processes CSV data to build context.
Responsible for reading historical data and computing current metrics.
"""
import logging
import pandas as pd
import os
from datetime import datetime, timedelta
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Data directory path
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data")


def build_context(city: str = "Mumbai") -> Dict[str, Any]:
    """
    Build operational context from CSV data files.
    
    Args:
        city: City name for filtering data
    
    Returns:
        Dict containing all relevant context for decision making
    """
    logger.info(f"Building context for {city}")
    
    context = {
        "city": city,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Load admissions data
        admissions_df = _load_admissions()
        if not admissions_df.empty:
            context['admissions_history'] = admissions_df
            context['avg_daily_admissions'] = admissions_df.groupby('date')['admissions'].sum().tail(14).mean()
            context['recent_trend'] = _calculate_trend(admissions_df)
            logger.info(f"Loaded {len(admissions_df)} admission records")
        
        # Load AQI data
        aqi_df = _load_aqi(city)
        if not aqi_df.empty:
            context['current_aqi'] = float(aqi_df.iloc[-1]['aqi'])
            context['aqi_trend'] = _calculate_aqi_trend(aqi_df)
            logger.info(f"Current AQI: {context['current_aqi']}")
        else:
            context['current_aqi'] = 100.0  # default
        
        # Load bed occupancy
        occupancy_df = _load_bed_occupancy()
        if not occupancy_df.empty:
            latest = occupancy_df.iloc[-1]
            context['total_beds'] = int(latest['total_beds'])
            context['occupied_beds'] = int(latest['occupied'])
            context['occupancy_pct'] = float(latest['occupancy_pct'])
            logger.info(f"Occupancy: {context['occupancy_pct']:.1f}%")
        else:
            context['occupancy_pct'] = 75.0  # default
        
        # Load inventory
        inventory_df = _load_inventory()
        if not inventory_df.empty:
            context['inventory'] = inventory_df.to_dict('records')
            context['low_stock_items'] = inventory_df[inventory_df['current_stock'] < inventory_df['reorder_level']]['item'].tolist()
            logger.info(f"Inventory: {len(inventory_df)} items, {len(context['low_stock_items'])} low stock")
        
        # Load staffing
        staffing_df = _load_staffing()
        if not staffing_df.empty:
            context['staffing'] = staffing_df.to_dict('records')
            context['total_staff_on_duty'] = len(staffing_df[staffing_df['status'] == 'on_duty'])
            logger.info(f"Staff on duty: {context['total_staff_on_duty']}")
        
        # Load events calendar
        events_df = _load_events()
        if not events_df.empty:
            upcoming = events_df[pd.to_datetime(events_df['date']) >= datetime.now()]
            context['upcoming_events'] = upcoming.head(5).to_dict('records')
            context['has_upcoming_festival'] = any(upcoming['type'] == 'festival')
            logger.info(f"Upcoming events: {len(upcoming)}")
        
    except Exception as e:
        logger.error(f"Error building context: {e}")
    
    logger.info("Context building complete")
    return context


def _load_admissions() -> pd.DataFrame:
    """Load admissions data."""
    try:
        path = os.path.join(DATA_DIR, "admissions.csv")
        df = pd.read_csv(path)
        df['date'] = pd.to_datetime(df['date'])
        return df
    except Exception as e:
        logger.warning(f"Could not load admissions: {e}")
        return pd.DataFrame()


def _load_aqi(city: str) -> pd.DataFrame:
    """Load AQI history."""
    try:
        path = os.path.join(DATA_DIR, "aqi_history.csv")
        df = pd.read_csv(path)
        df['date'] = pd.to_datetime(df['date'])
        df = df[df['city'] == city].sort_values('date')
        return df
    except Exception as e:
        logger.warning(f"Could not load AQI: {e}")
        return pd.DataFrame()


def _load_bed_occupancy() -> pd.DataFrame:
    """Load bed occupancy data."""
    try:
        path = os.path.join(DATA_DIR, "bed_occupancy.csv")
        df = pd.read_csv(path)
        df['date'] = pd.to_datetime(df['date'])
        return df.sort_values('date')
    except Exception as e:
        logger.warning(f"Could not load bed occupancy: {e}")
        return pd.DataFrame()


def _load_inventory() -> pd.DataFrame:
    """Load inventory data."""
    try:
        path = os.path.join(DATA_DIR, "inventory.csv")
        return pd.read_csv(path)
    except Exception as e:
        logger.warning(f"Could not load inventory: {e}")
        return pd.DataFrame()


def _load_staffing() -> pd.DataFrame:
    """Load staffing data."""
    try:
        path = os.path.join(DATA_DIR, "staffing.csv")
        return pd.read_csv(path)
    except Exception as e:
        logger.warning(f"Could not load staffing: {e}")
        return pd.DataFrame()


def _load_events() -> pd.DataFrame:
    """Load events calendar."""
    try:
        path = os.path.join(DATA_DIR, "events_calendar.csv")
        df = pd.read_csv(path)
        df['date'] = pd.to_datetime(df['date'])
        return df
    except Exception as e:
        logger.warning(f"Could not load events: {e}")
        return pd.DataFrame()


def _calculate_trend(df: pd.DataFrame) -> str:
    """Calculate admission trend."""
    try:
        daily = df.groupby('date')['admissions'].sum()
        recent_7 = daily.tail(7).mean()
        previous_7 = daily.tail(14).head(7).mean()
        
        if recent_7 > previous_7 * 1.1:
            return "increasing"
        elif recent_7 < previous_7 * 0.9:
            return "decreasing"
        else:
            return "stable"
    except:
        return "unknown"


def _calculate_aqi_trend(df: pd.DataFrame) -> str:
    """Calculate AQI trend."""
    try:
        if len(df) < 3:
            return "unknown"
        
        recent_3 = df.tail(3)['aqi'].mean()
        previous_3 = df.tail(6).head(3)['aqi'].mean()
        
        if recent_3 > previous_3 * 1.15:
            return "worsening"
        elif recent_3 < previous_3 * 0.85:
            return "improving"
        else:
            return "stable"
    except:
        return "unknown"

import random
from typing import Dict, Any, List
from datetime import datetime

class DepartmentSimulator:
    """
    Simulates department-level metrics based on global hospital forecast.
    Distributes total surge into departments and applies risk logic.
    """
    
    DEPARTMENTS = [
        {"name": "Emergency (ER)", "capacity": 50, "baseline_load": 30, "surge_factor": 0.35},
        {"name": "ICU", "capacity": 30, "baseline_load": 20, "surge_factor": 0.20},
        {"name": "Respiratory", "capacity": 40, "baseline_load": 25, "surge_factor": 0.15},
        {"name": "General Ward", "capacity": 100, "baseline_load": 70, "surge_factor": 0.20},
        {"name": "Pediatrics", "capacity": 30, "baseline_load": 15, "surge_factor": 0.05},
        {"name": "Operating Theatre", "capacity": 10, "baseline_load": 5, "surge_factor": 0.05}
    ]

    def simulate_status(self, forecast_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate status for all departments based on forecast.
        
        Args:
            forecast_summary: Dict with keys like 'avg_predicted', 'delta_pct', 'peak_day'
        
        Returns:
            List of department status dicts
        """
        results = []
        
        # Extract gloabl forecast signals
        global_delta_pct = forecast_summary.get('delta_pct', 0)
        avg_predicted = forecast_summary.get('avg_predicted', 100)
        
        # Calculate base risk factor (0.0 to 1.0+)
        # If delta is > 10%, risk increases
        risk_modifier = max(0, (global_delta_pct / 20)) 
        
        for dept in self.DEPARTMENTS:
            # 1. Calculate Occupancy & Load
            # Base variance + global surge * dept factor
            
            # Simulated current occupancy (mock real-time data)
            # Add some randomness so it's not static
            base_occ = dept['baseline_load']
            random_noise = random.randint(-2, 5)
            
            # If there is a global surge, it affects current occupancy partially immediately
            surge_impact = (global_delta_pct / 100) * dept['capacity'] * 0.5 
            
            current_occupancy = int(min(dept['capacity'], max(0, base_occ + random_noise + surge_impact)))
            
            # Predicted load (for the peak day)
            # Global predicted admissions * dept surge factor
            predicted_surge_share = avg_predicted * dept['surge_factor']
            predicted_load = int(current_occupancy + predicted_surge_share)
            
            # Calculate % increase
            if current_occupancy > 0:
                expected_increase_pct = round(((predicted_load - current_occupancy) / current_occupancy) * 100, 1)
            else:
                expected_increase_pct = 0.0

            # 2. Determine Risk Level
            occupancy_rate = current_occupancy / dept['capacity']
            risk_level = "Low"
            if occupancy_rate > 0.85 or expected_increase_pct > 25:
                risk_level = "High"
            elif occupancy_rate > 0.70 or expected_increase_pct > 15:
                risk_level = "Medium"
                
            # 3. Simulate Supply & Staffing Risks based on Load Risk
            supply_risk = self._simulate_supply_risk(risk_level, dept['name'])
            staffing_gap = self._simulate_staffing_gap(risk_level, dept['name'])
            
            results.append({
                "name": dept['name'],
                "current_occupancy": current_occupancy,
                "capacity": dept['capacity'],
                "predicted_load": predicted_load,
                "expected_increase_pct": expected_increase_pct,
                "risk_level": risk_level,
                "supply_risk": supply_risk,
                "staffing_gap": staffing_gap
            })
            
        return results

    def _simulate_supply_risk(self, risk_level: str, dept_name: str) -> Dict[str, str]:
        """Generate mock supply risks based on department load."""
        risk = {
            "oxygen": "Low",
            "medications": "Low",
            "ppe": "Low"
        }
        
        if risk_level == "High":
            if dept_name in ["ICU", "Respiratory"]:
                risk["oxygen"] = "Critical"
            elif dept_name == "Emergency (ER)":
                risk["medications"] = "Medium"
                
        elif risk_level == "Medium":
            if dept_name in ["Respiratory"]:
                risk["oxygen"] = "Medium"
                
        return risk

    def _simulate_staffing_gap(self, risk_level: str, dept_name: str) -> Dict[str, int]:
        """Generate mock staffing gaps."""
        gap = {"nurses_needed": 0, "doctors_needed": 0}
        
        if risk_level == "High":
            gap["nurses_needed"] = random.randint(2, 5)
            gap["doctors_needed"] = random.randint(1, 2)
        elif risk_level == "Medium":
            gap["nurses_needed"] = random.randint(1, 2)
            
        return gap

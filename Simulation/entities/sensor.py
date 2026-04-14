from datetime import datetime
from typing import Any, Dict
from entities.models import SensorType
import random
import psutil

class Sensor:
    def __init__(self, name: str, sensor_type: SensorType, unit: str, min_value: float = 0.0, max_value: float = 100.0, external_api_params: Dict[str, Any] = None):
        self.name = name
        self.sensor_type = sensor_type
        self.value = 0.0
        self.unit = unit
        self.min_value = min_value
        self.max_value = max_value
        self.last_updated = datetime.utcnow()
        
        # API config
        self.external_api_params = external_api_params
        self.last_api_call = 0
        self.api_cache_value = None

    def update(self) -> bool:
        """Simulates reading data from a sensor."""
        previous_value = self.value
        
        # 1. External API (OpenMeteo) priority
        if self.external_api_params and self.sensor_type == SensorType.TEMPERATURE:
            self._update_from_api()
            return self.value != previous_value

        if self.sensor_type == SensorType.CPU_USAGE:
            self.value = psutil.cpu_percent(interval=None)
        
        elif self.sensor_type == SensorType.RAM_USAGE:
            self.value = psutil.virtual_memory().percent

        elif self.sensor_type == SensorType.DISK_USAGE:
            self.value = psutil.disk_usage('/').percent
            
        else:
            # Random Simulation logic
            change = random.uniform(-5.0, 5.0)
            new_value = self.value + change
            new_value = max(self.min_value, min(new_value, self.max_value))
            self.value = round(new_value, 2)

        self.last_updated = datetime.utcnow()
        return self.value != previous_value

    def _update_from_api(self):
        import time
        import urllib.request
        import json
        
        now = time.time()
        # Refresh every 15 minutes (900 seconds)
        if self.api_cache_value is not None and (now - self.last_api_call) < 900:
            self.value = self.api_cache_value
            return

        try:
            lat = self.external_api_params.get("lat")
            lon = self.external_api_params.get("lon")
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m"
            
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                temp = data.get("current", {}).get("temperature_2m")
                if temp is not None:
                    self.value = float(temp)
                    self.api_cache_value = self.value
                    self.last_api_call = now
        except Exception as e:
            print(f"API Error ({self.name}): {e}")
            # Fallback to random if API fails
            pass

    def get_value(self) -> Any:
        return self.value

    def get_formatted_value(self) -> str:
        return f"{self.value} {self.unit}"

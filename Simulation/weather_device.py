import requests
import time
import logging
from datetime import datetime
from http_device import HttpDevice

# Configure logging
logger = logging.getLogger("Weather_Device")

# API Config
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m"
DEVICE_API_URL = "http://localhost:8001/devices"

class WeatherDevice(HttpDevice):
    def __init__(self, device_id="Paris_Weather_Station"):
        super().__init__(device_id, "WeatherStation")
        
    def fetch_weather_data(self):
        """Fetch real temperature from Open-Meteo"""
        try:
            response = requests.get(OPEN_METEO_URL)
            if response.status_code == 200:
                data = response.json()
                return data['current']['temperature_2m']
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
        return None

    def send_telemetry(self, value):
        """Send telemetry data to the management service"""
        if not self.db_id:
            logger.warning(f"Device {self.device_id} not registered. Skipping telemetry.")
            self.register()
            return

        payload = {
            "value": value,
            "timestamp": datetime.now().isoformat()
        }
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            url = f"{DEVICE_API_URL}/{self.db_id}/telemetry"
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                logger.info(f"Published Weather Data: {value}°C")
            else:
                logger.error(f"Failed to send telemetry: {response.text}")
        except Exception as e:
            logger.error(f"Connection error sending telemetry: {e}")

    def run(self):
        logger.info(f"Starting Weather Device: {self.device_id}")
        if self.authenticate():
            self.register()
            while True:
                temp = self.fetch_weather_data()
                if temp is not None:
                    self.send_telemetry(temp)
                else:
                    logger.warning("No weather data fetched.")
                
                # Update every 30 seconds
                time.sleep(30)
        else:
            logger.error(f"Could not start {self.device_id} due to auth failure.")

if __name__ == "__main__":
    device = WeatherDevice()
    device.run()

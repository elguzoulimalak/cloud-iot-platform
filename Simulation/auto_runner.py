import threading
import time
import requests
import os
import logging
import random
from dotenv import load_dotenv

from entities.iot_device import IoTDevice
from entities.models import Location, Coordinates, SensorType
from entities.sensor import Sensor

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AutoRunner")

# Load environment variables
load_dotenv()

# Configuration
DEVICE_MGMT_URL = os.getenv("DEVICE_MGMT_URL", "http://localhost:8001/devices")
BROKER_HOST = os.getenv("BROKER_HOST", "localhost")
BROKER_PORT = int(os.getenv("BROKER_PORT", 1883))

# Global Dictionary to track running threads
# Format: { device_id_str: { 'stop_event': threading.Event(), 'thread': threading.Thread } }
active_simulations = {}

def create_simulated_device(device_data):
    """
    Creates an instance of IoTDevice based on API data.
    """
    device_id = str(device_data['id'])
    
    # Random Location offset for realism
    lat = 34.0331 + random.uniform(-0.01, 0.01)
    lon = -5.0003 + random.uniform(-0.01, 0.01)

    loc = Location(
        city="Fes",
        country="Morocco",
        coordinates=Coordinates(latitude=lat, longitude=lon, altitude=400.0)
    )

    iot_device = IoTDevice(
        device_id=device_id, # Use Unique ID for MQTT
        name=device_data['name'],
        device_type=device_data['type'],
        location=loc,
        broker_url=BROKER_HOST,
        broker_port=BROKER_PORT
    )
    
    # Normalize type for check
    d_type = device_data['type'].lower()
    
    # Strict check based on User Requirement
    # Types: "iot device" or "end device"
    is_end_device = (d_type == "end device")
    
    if is_end_device:
        # Add System Sensors
        iot_device.add_sensor(Sensor("cpu_usage", SensorType.CPU_USAGE, "%", 0, 100))
        iot_device.add_sensor(Sensor("ram_usage", SensorType.RAM_USAGE, "%", 0, 100))
        iot_device.add_sensor(Sensor("disk_usage", SensorType.DISK_USAGE, "%", 0, 100))
    else:
        # Assume "IoT Device" (Sensor, Environmental)
        # Use Real Temperature from OpenMeteo
        iot_device.add_sensor(Sensor(
            name="temperature", 
            sensor_type=SensorType.TEMPERATURE, 
            unit="C", 
            min_value=-10, 
            max_value=60,
            external_api_params={"lat": lat, "lon": lon}
        ))
        
        # Add Humidity (Random simulation)
        iot_device.add_sensor(Sensor(
            name="humidity",
            sensor_type=SensorType.HUMIDITY,
            unit="%",
            min_value=30,
            max_value=90
        ))

    return iot_device

def device_simulation_task(device_data, stop_event):
    """
    The function running inside the thread for each device.
    """
    device_name = device_data['name']
    logger.info(f"Starting simulation for: {device_name}")
    
    device = create_simulated_device(device_data)
    
    # Retry connection loop
    while not stop_event.is_set():
        if device.connect():
            break
        logger.warning(f"Failed to connect {device_name} to MQTT. Retrying in 5s...")
        time.sleep(5)
    
    if stop_event.is_set():
        return

    try:
        while not stop_event.is_set():
            device.update_sensors()
            device.publish_telemetry()
            time.sleep(5) # Update every 2 seconds
    except Exception as e:
        logger.error(f"Error in simulation for {device_name}: {e}")
    finally:
        device.disconnect()
        logger.info(f"Stopped simulation for: {device_name}")

def sync_devices():
    """
    Fetches devices from API and manages threads.
    """
    try:
        # Use System Endpoint to get ALL devices regardless of user
        response = requests.get(f"{DEVICE_MGMT_URL}/system/all")
        if response.status_code == 200:
            devices = response.json() # List of dicts
            
            current_ids = set()
            
            for d in devices:
                device_id = str(d['id'])
                name = d['name']
                status = d.get('status', 'active').lower()
                
                # Determine if it SHOULD be running
                should_run = (status == 'active' or status == 'online')

                current_ids.add(device_id)
                
                if should_run:
                    # Start if not running
                    if device_id not in active_simulations:
                        stop_event = threading.Event()
                        t = threading.Thread(target=device_simulation_task, args=(d, stop_event))
                        t.daemon = True
                        t.start()
                        active_simulations[device_id] = {'stop_event': stop_event, 'thread': t}
                else:
                    # If it's in the list but shouldn't run (e.g. changed to inactive), stop it
                    if device_id in active_simulations:
                        logger.info(f"Device {name} ({device_id}) status is {status}. Stopping simulation...")
                        active_simulations[device_id]['stop_event'].set()
                        active_simulations[device_id]['thread'].join()
                        del active_simulations[device_id]

            # Stop completely removed devices (deleted from DB)
            active_ids = list(active_simulations.keys())
            for device_id in active_ids:
                if device_id not in current_ids:
                    logger.info(f"Device {device_id} removed from API. Stopping simulation...")
                    active_simulations[device_id]['stop_event'].set()
                    active_simulations[device_id]['thread'].join()
                    del active_simulations[device_id]

        else:
            logger.warning(f"Failed to fetch devices: {response.status_code}")
            
    except Exception as e:
        logger.error(f"Error syncing devices: {e}")

def main():
    logger.info("AutoRunner started. Monitoring devices...")
    try:
        while True:
            sync_devices()
            time.sleep(5) # Check for new devices every 5 seconds
    except KeyboardInterrupt:
        logger.info("Stopping AutoRunner...")
        for name, data in active_simulations.items():
            data['stop_event'].set()
            data['thread'].join()

if __name__ == "__main__":
    main()

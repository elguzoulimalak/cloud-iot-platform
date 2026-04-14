from typing import Dict, List, Any
import logging
import json
from datetime import datetime

from entities.base_device import BaseDevice
from entities.models import DeviceStatus, Location, TelemetryData
from entities.sensor import Sensor
from clients.mqtt_client import MQTTClientWrapper

logger = logging.getLogger(__name__)

class IoTDevice(BaseDevice):
    def __init__(self, device_id: str, name: str, device_type: str, 
                 location: Location, broker_url: str = "localhost", broker_port: int = 1883):
        super().__init__(device_id, name, device_type)
        self.location = location
        self.sensors: Dict[str, Sensor] = {}
        # Use localhost or specific RabbitMQ host
        self.mqtt_client = MQTTClientWrapper(client_id=device_id, broker=broker_url, port=broker_port)
        self.ip_address = "127.0.0.1" # Dynamic IP could be added

    def add_sensor(self, sensor: Sensor):
        self.sensors[sensor.name] = sensor

    def connect(self) -> bool:
        logger.info(f"Connecting device {self._name}...")
        if self.mqtt_client.connect():
            self.update_status(DeviceStatus.ONLINE)
            return True
        else:
            self.update_status(DeviceStatus.ERROR)
            return False

    def disconnect(self) -> bool:
        self.mqtt_client.disconnect()
        self.update_status(DeviceStatus.OFFLINE)
        return True

    def update_sensors(self):
        for sensor in self.sensors.values():
            sensor.update()

    def get_telemetry_data(self) -> TelemetryData:
        readings = {name: sensor.get_value() for name, sensor in self.sensors.items()}
        return TelemetryData(
            device_id=self._id,
            sensor_readings=readings,
            location=self.location,
            status=self._status,
            timestamp=datetime.utcnow()
        )

    def publish_telemetry(self) -> bool:
        if not self.is_online():
            logger.warning("Device offline, cannot publish telemetry.")
            return False

        telemetry = self.get_telemetry_data()
        payload = telemetry.to_json()
        
        # Topic convention: devices/{device_id}/telemetry
        topic = f"devices/{self._id}/telemetry"
        
        logger.info(f"Publishing to {topic}: {payload}")
        return self.mqtt_client.publish(topic, payload)

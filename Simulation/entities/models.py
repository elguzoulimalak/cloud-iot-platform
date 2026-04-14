from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional

class DeviceStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    ERROR = "ERROR"
    MAINTENANCE = "MAINTENANCE"
    CALIBRATING = "CALIBRATING"
    LOW_BATTERY = "LOW_BATTERY"

class SensorType(str, Enum):
    TEMPERATURE = "TEMPERATURE"
    HUMIDITY = "HUMIDITY"
    PRESSURE = "PRESSURE"
    AIR_QUALITY = "AIR_QUALITY"
    MOTION = "MOTION"
    LIGHT = "LIGHT"
    POWER = "POWER"
    VOLTAGE = "VOLTAGE"
    CURRENT = "CURRENT"
    # System Metrics
    CPU_USAGE = "CPU_USAGE"
    RAM_USAGE = "RAM_USAGE"
    DISK_USAGE = "DISK_USAGE"
    CUSTOM = "CUSTOM"

class QoSLevel(int, Enum):
    AT_MOST_ONCE = 0
    AT_LEAST_ONCE = 1
    EXACTLY_ONCE = 2

@dataclass
class Coordinates:
    latitude: float
    longitude: float
    altitude: float = 0.0

    def to_tuple(self):
        return (self.latitude, self.longitude, self.altitude)

    def to_geojson(self):
        return {
            "type": "Point",
            "coordinates": [self.longitude, self.latitude, self.altitude]
        }

@dataclass
class Location:
    city: str
    country: str
    coordinates: Coordinates
    address: str = ""
    timezone: str = "UTC"

@dataclass
class TelemetryData:
    device_id: str
    sensor_readings: Dict[str, Any]
    metadata: Dict = field(default_factory=dict)
    location: Optional[Location] = None
    status: DeviceStatus = DeviceStatus.ONLINE
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_json(self):
        return {
            "device_id": self.device_id,
            "timestamp": self.timestamp.isoformat(),
            "sensor_readings": self.sensor_readings,
            "status": self.status.value,
            "metadata": self.metadata,
            "location": {
                "city": self.location.city,
                "coordinates": self.location.coordinates.to_geojson()
            } if self.location else None
        }

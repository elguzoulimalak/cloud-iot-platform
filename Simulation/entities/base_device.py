from abc import ABC, abstractmethod
from datetime import datetime
from entities.models import DeviceStatus

class BaseDevice(ABC):
    def __init__(self, device_id: str, name: str, device_type: str):
        self._id = device_id
        self._name = name
        self._device_type = device_type
        self._status = DeviceStatus.OFFLINE
        self._created_at = datetime.utcnow()
        self._last_seen = None

    @abstractmethod
    def connect(self) -> bool:
        pass

    @abstractmethod
    def disconnect(self) -> bool:
        pass

    def update_status(self, status: DeviceStatus):
        self._status = status
        if status == DeviceStatus.ONLINE:
            self._last_seen = datetime.utcnow()

    def get_info(self) -> dict:
        return {
            "id": self._id,
            "name": self._name,
            "type": self._device_type,
            "status": self._status.value,
            "created_at": self._created_at.isoformat(),
            "last_seen": self._last_seen.isoformat() if self._last_seen else None
        }

    def is_online(self) -> bool:
        return self._status == DeviceStatus.ONLINE

import paho.mqtt.client as mqtt
import json
import time
from typing import Callable, List, Any
import logging

logger = logging.getLogger(__name__)

class MQTTClientWrapper:
    def __init__(self, client_id: str, broker: str, port: int = 1883, keepalive: int = 60):
        self.client_id = client_id
        self.broker = broker
        self.port = port
        self.keepalive = keepalive
        
        self.client = mqtt.Client(client_id=self.client_id, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_publish = self._on_publish
        
        self.connected = False

    def _on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            self.connected = True
            logger.info(f"Connected to MQTT Broker: {self.broker}:{self.port}")
        else:
            logger.error(f"Failed to connect, return code {rc}")

    def _on_disconnect(self, client, userdata, flags, rc=None, properties=None): # Added extra args for v2
        self.connected = False
        logger.info("Disconnected from MQTT Broker")

    def _on_publish(self, client, userdata, mid, reason_code=None, properties=None):
         logger.debug(f"Message {mid} published.")

    def connect(self) -> bool:
        try:
            self.client.connect(self.broker, self.port, self.keepalive)
            self.client.loop_start()  # Start background thread
            
            # Wait for connection
            timeout = 5
            start = time.time()
            while not self.connected and (time.time() - start) < timeout:
                time.sleep(0.1)
                
            return self.connected
        except Exception as e:
            logger.error(f"Connection Exception: {e}")
            return False

    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()

    def publish(self, topic: str, message: Any, qos: int = 0) -> bool:
        if not self.connected:
            logger.warning("Cannot publish - Client not connected")
            return False
        
        if not isinstance(message, str):
            payload = json.dumps(message)
        else:
            payload = message
            
        try:
            info = self.client.publish(topic, payload, qos=qos)
            info.wait_for_publish(timeout=2.0)
            return info.is_published()
        except Exception as e:
            logger.error(f"Publish Error: {e}")
            return False

    def subscribe(self, topic: str, callback: Callable):
        self.client.subscribe(topic)
        self.client.message_callback_add(topic, callback)

import pika
import json
import time
import random
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MQTT_Device")

# RabbitMQ Config (Localhost access)
RABBITMQ_HOST = "localhost"
RABBITMQ_PORT = 5672
RABBITMQ_USER = "guest"
RABBITMQ_PASS = "guest"

class MqttDevice:
    def __init__(self, device_id, device_type="sensor"):
        self.device_id = device_id
        self.device_type = device_type
        self.connection = None
        self.channel = None

    def connect(self):
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            parameters = pika.ConnectionParameters(RABBITMQ_HOST, RABBITMQ_PORT, '/', credentials)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            self.channel.exchange_declare(exchange='device_events', exchange_type='topic', durable=True)
            logger.info(f"Device {self.device_id} connected to Broker.")
        except Exception as e:
            logger.error(f"Connection failed: {e}")

    def publish_data(self):
        if not self.connection or self.connection.is_closed:
            self.connect()
        
        if self.connection and self.connection.is_open:
            data = {
                "id": random.randint(1000, 9999), # Fake DB ID
                "name": self.device_id,
                "type": self.device_type,
                "status": "active",
                "value": random.uniform(20.0, 30.0), # Sensor value
                "timestamp": datetime.now().isoformat()
            }
            
            # Using routing key that matches Monitoring consumer pattern
            routing_key = "device.telemetry"
            
            try:
                self.channel.basic_publish(
                    exchange='device_events',
                    routing_key=routing_key,
                    body=json.dumps(data)
                )
                logger.info(f"Published: {data}")
            except Exception as e:
                logger.error(f"Publish error: {e}")

    def run(self):
        logger.info(f"Starting MQTT Device: {self.device_id}")
        self.connect()
        while True:
            time.sleep(random.randint(2, 5))
            self.publish_data()

if __name__ == "__main__":
    device = MqttDevice("TempSensor_01", "Sensor")
    device.run()


import pika
import json
import logging
from helpers.config import RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASS

logger = logging.getLogger(__name__)

class RabbitMQPublisher:
    def __init__(self):
        self.credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        self.parameters = pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            port=RABBITMQ_PORT,
            credentials=self.credentials,
            heartbeat=600,
            blocked_connection_timeout=300
        )
        self.connection = None
        self.channel = None

    def connect(self):
        if not self.connection or self.connection.is_closed:
            try:
                self.connection = pika.BlockingConnection(self.parameters)
                self.channel = self.connection.channel()
                # Declare the exchange (ensure it exists)
                self.channel.exchange_declare(exchange='device_events', exchange_type='topic', durable=True)
                logger.info("Connected to RabbitMQ")
            except Exception as e:
                logger.error(f"Failed to connect to RabbitMQ: {e}")
                raise

    def publish(self, routing_key: str, message: dict):
        try:
            self.connect()
            self.channel.basic_publish(
                exchange='device_events',
                routing_key=routing_key,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # make message persistent
                    content_type='application/json'
                )
            )
            logger.info(f"Published message to {routing_key}")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            # Try to reconnect and publish once more?
            # For simplicity, just log error for now or raise
            raise

publisher = RabbitMQPublisher()

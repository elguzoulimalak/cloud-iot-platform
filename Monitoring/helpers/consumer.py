
import asyncio
import json
import aio_pika
import logging
from helpers.config import RABBITMQ_URL
from helpers.database import db_instance

logger = logging.getLogger("uvicorn")

async def process_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            body = message.body.decode()
            data = json.loads(body)
            # data has: id, name, type, status, ip_address...
            
            # Store in MongoDB
            if db_instance.db is not None:
                await db_instance.db.device_events.insert_one(data)
                
            # Connect _id to string for serialization
            if '_id' in data:
                data['_id'] = str(data['_id'])
                
            logger.info(f"Consumed message: {data}")
            
            # Broadcast via Socket.IO (will be passed or imported)
            # For now, we just log. We need to access the sio instance.
            from main import sio
            await sio.emit('device_event', data)
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")

async def consume():
    try:
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        channel = await connection.channel()
        
        # Ensure exchange exists
        exchange = await channel.declare_exchange('device_events', aio_pika.ExchangeType.TOPIC, durable=True)
        
        # Create queue
        queue = await channel.declare_queue('monitoring_queue', durable=True)
        
        # Bind queue to exchange (listen to all keys)
        await queue.bind(exchange, routing_key="#")
        
        logger.info("Started RabbitMQ Consumer")
        
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                await process_message(message)
                
    except Exception as e:
        logger.error(f"RabbitMQ connection failed: {e}")
        # Retry logic could be added here
        pass

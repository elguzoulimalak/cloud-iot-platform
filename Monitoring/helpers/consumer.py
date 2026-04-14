
import asyncio
import json
import logging
import paho.mqtt.client as mqtt
from helpers.config import RABBITMQ_HOST, MQTT_BROKER_PORT
from helpers.database import db_instance
from helpers.socket_manager import sio
from helpers import debug_store

logger = logging.getLogger("uvicorn")

# Global Queue
message_queue = None

async def process_queue_worker():
    """Reads messages from queue and processes them in the Main Loop"""
    global message_queue
    logger.info("Worker: Queue processing started")
    while True:
        try:
            data = await message_queue.get()
            
            # 1. Update Debug Store (Safe here)
            debug_store.last_message = data
            debug_store.message_count += 1
            
            # 2. Store in DB
            if db_instance.db is not None:
                 await db_instance.db.device_events.insert_one(data)

            # 3. Fix ID
            if '_id' in data:
                data['_id'] = str(data['_id'])

            # 4. Broadcast SocketIO
            await sio.emit('device_event', data)
            
            message_queue.task_done()
            
        except Exception as e:
            logger.error(f"Worker Error: {e}")
            debug_store.last_message = {"error": f"Worker: {str(e)}"}

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        debug_store.connection_status = "Connected (MQTT)"
        logger.info(f"Connected to MQTT Broker at {RABBITMQ_HOST}:{MQTT_BROKER_PORT}")
        client.subscribe("#")
    else:
        debug_store.connection_status = f"Failed (rc={rc})"
        logger.error(f"Failed to connect to MQTT, rc={rc}")

def on_message(client, userdata, msg):
    """Runs in MQTT Thread. Pushes to Queue via ThreadSafe call."""
    try:
        payload = msg.payload.decode()
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            data = {"topic": msg.topic, "raw_payload": payload, "scraped": True}

        # Retrieve loop and queue from userdata
        loop = userdata['loop']
        queue = userdata['queue']
        
        # Schedule the put_nowait on the main loop
        loop.call_soon_threadsafe(queue.put_nowait, data)

    except Exception as e:
        logger.error(f"MQTT Thread Error: {e}")

async def consume():
    """
    Called by FastAPI startup. Initializes Queue, Worker, and MQTT Client.
    """
    global message_queue
    
    # 1. Init Queue
    message_queue = asyncio.Queue()
    
    # 2. Start Worker Task
    asyncio.create_task(process_queue_worker())
    
    # 3. Capture Loop
    loop = asyncio.get_running_loop()
    
    # 4. Start MQTT Client
    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, userdata={'loop': loop, 'queue': message_queue})
    client.on_connect = on_connect
    client.on_message = on_message
    
    debug_store.connection_status = "Connecting (MQTT)..."
    debug_store.host_used = f"{RABBITMQ_HOST}:{MQTT_BROKER_PORT}"
    
    try:
        client.connect(RABBITMQ_HOST, MQTT_BROKER_PORT, 60)
        client.loop_start() 
    except Exception as e:
        debug_store.connection_status = f"Connection Exception: {e}"
        logger.error(f"MQTT Start Error: {e}")

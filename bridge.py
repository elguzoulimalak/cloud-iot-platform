import os
import paho.mqtt.client as mqtt
import requests
import json
import time

# Configuration
BROKER = os.getenv("BROKER_HOST", "rabbitmq")
PORT = 1883
API_URL = os.getenv("API_URL", "http://monitoring:8002/ingest")

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected to MQTT (rc={rc})")
    client.subscribe("devices/#") # Listen to all device topics

def on_message(client, userdata, msg):
    try:
        print(f"-> Received: {msg.topic}")
        payload = json.loads(msg.payload.decode())
        
        # Forward to API
        try:
            requests.post(API_URL, json=payload)
            print(f"<- Forwarded to API: Success")
        except Exception as e:
            print(f"XX API Error: {e}")
            
    except Exception as e:
        print(f"Message Error: {e}")

client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

print("Starting HTTP Bridge...")
print(f"Connecting to MQTT Broker at: {BROKER}:{PORT}")
print(f"Forwarding to API at: {API_URL}")
print("This script forwards MQTT messages to the Monitoring API (Bypassing Docker Networking issues).")

while True:
    try:
        client.connect(BROKER, PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"Connection Failed: {e}. Retrying in 5s...")
        time.sleep(5)

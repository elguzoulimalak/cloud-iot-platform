import socketio
import asyncio
import sys

# Standard Python Socket.IO Client
sio = socketio.Client()

SERVER_URL = "http://localhost:8002"

@sio.event
def connect():
    print(f"✅ Connected to Monitoring Service at {SERVER_URL}")

@sio.event
def connect_error(data):
    print(f"❌ Connection failed: {data}")

@sio.event
def disconnect():
    print("⚠️ Disconnected from server")

@sio.on('device_event')
def on_device_event(data):
    print("\n🔔 [EVENT RECEIVED] Device Event!")
    print(f"   Data: {data}")
    print("   -----------------------------")

def main():
    print(f"Attempting to connect to {SERVER_URL}...")
    try:
        sio.connect(SERVER_URL, transports=['websocket', 'polling'])
        print("Listening for events... (Press CTRL+C to stop)")
        print("Run 'python test_api.py' in another terminal to trigger events.")
        sio.wait()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the Monitoring service is running (docker-compose up -d monitoring)")

if __name__ == '__main__':
    main()

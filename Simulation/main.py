import threading
from http_device import HttpDevice
from mqtt_device import MqttDevice
import time

def run_http_device(device_id, device_type):
    device = HttpDevice(device_id, device_type)
    device.run()

def run_mqtt_device(device_id, device_type):
    device = MqttDevice(device_id, device_type)
    device.run()

if __name__ == "__main__":
    print("Starting IoT System Simulation...")
    print("Press Ctrl+C to stop.")

    devices = []

    # Create HTTP Devices
    devices.append(threading.Thread(target=run_http_device, args=("Laptop_User1", "Laptop")))
    devices.append(threading.Thread(target=run_http_device, args=("SmartScreen_01", "Screen")))

    # Create MQTT Devices
    devices.append(threading.Thread(target=run_mqtt_device, args=("LivingRoom_Temp", "Sensor")))
    devices.append(threading.Thread(target=run_mqtt_device, args=("Kitchen_Alarm", "Alarm")))

    # Start all threads
    for d in devices:
        d.daemon = True
        d.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping simulation...")

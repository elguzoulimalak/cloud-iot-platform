import httpx
import time
import sys

BASE_URL = "http://localhost:8001/devices"

def test_device_lifecycle():
    print(f"Testing API at {BASE_URL}...")
    
    # 1. Create a Device
    print("\n[1] Creating a new device...")
    new_device = {
        "name": "TestSensor_01",
        "type": "Sensor",
        "status": "active",
        "ip_address": "192.168.1.100"
    }
    
    try:
        response = httpx.post(BASE_URL + "/", json=new_device)
        
        if response.status_code == 201:
            created_device = response.json()
            print("✅ Device created successfully!")
            print(f"   ID: {created_device['id']}")
            print(f"   Name: {created_device['name']}")
            device_id = created_device['id']
        elif response.status_code == 400:
             print("⚠️  Device already exists (Clean up DB or change name in script)")
             # Try to find it to continue test or abort
             # For simplicity, let's just abort or we'd need to fetch by name which isn't ID based easily without filtering
             print("   Aborting test.")
             return
        else:
            print(f"❌ Failed to create device: {response.status_code} - {response.text}")
            return
    except httpx.ConnectError:
        print("❌ Could not connect to the server. Is it running?")
        print("   Make sure to run: python main.py")
        return

    # 2. Get the Device
    print(f"\n[2] Fetching device with ID {device_id}...")
    response = httpx.get(f"{BASE_URL}/{device_id}")
    if response.status_code == 200:
        print("✅ Device fetched successfully!")
        print(f"   Data: {response.json()}")
    else:
        print(f"❌ Failed to fetch device: {response.status_code}")

    # 3. Update the Device
    print(f"\n[3] Updating device status to 'inactive'...")
    update_data = {
        "name": "TestSensor_01",
        "type": "Sensor",
        "status": "inactive",
        "ip_address": "192.168.1.100"
    }
    response = httpx.put(f"{BASE_URL}/{device_id}", json=update_data)
    if response.status_code == 200:
        updated = response.json()
        if updated['status'] == 'inactive':
            print("✅ Device updated successfully!")
        else:
            print("❌ Device updated but status mismatch.")
    else:
        print(f"❌ Failed to update device: {response.status_code}")

    # 4. List All Devices
    print("\n[4] Listing all devices...")
    response = httpx.get(BASE_URL + "/")
    if response.status_code == 200:
        devices = response.json()
        print(f"✅ Retrieved {len(devices)} devices.")
        found = any(d['id'] == device_id for d in devices)
        if found:
            print("   Target device found in list.")
        else:
             print("❌ Target device NOT found in list.")
    else:
        print(f"❌ Failed to list devices: {response.status_code}")

    # 5. Delete the Device
    print(f"\n[5] Deleting device {device_id}...")
    response = httpx.delete(f"{BASE_URL}/{device_id}")
    if response.status_code == 204:
        print("✅ Device deleted successfully!")
    else:
        print(f"❌ Failed to delete device: {response.status_code}")

    # Verify deletion
    response = httpx.get(f"{BASE_URL}/{device_id}")
    if response.status_code == 404:
        print("✅ Verification: Device is indeed gone (404 Not Found).")
    else:
        print(f"❌ Verification failed: Device still exists or other error ({response.status_code}).")

if __name__ == "__main__":
    test_device_lifecycle()

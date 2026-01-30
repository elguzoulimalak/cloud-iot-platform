import requests
import time
import random
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("HTTP_Device")

# Service URLs
DEVICE_API_URL = "http://localhost:8001/devices"
AUTH_API_URL = "http://localhost:8003/users"

class HttpDevice:
    def __init__(self, device_id, device_type="end_device"):
        self.device_id = device_id
        self.device_type = device_type
        self.status = "active"
        self.ip_address = f"192.168.1.{random.randint(10, 250)}"
        self.token = None
        self.email = f"{device_id.lower()}@simulation.com"
        self.password = "sim_password_123"
        self.db_id = None

    def authenticate(self):
        """Register and/or Login to get a token"""
        # Try to register first (ignore error if exists)
        try:
            requests.post(f"{AUTH_API_URL}/add", json={"email": self.email, "password": self.password})
        except:
            pass
        
        # Login
        try:
            response = requests.post(f"{AUTH_API_URL}/auth", json={"email": self.email, "password": self.password})
            if response.status_code == 200:
                self.token = response.json().get("token")
                logger.info(f"Device {self.device_id} authenticated.")
                return True
            else:
                logger.error(f"Auth failed for {self.device_id}: {response.text}")
        except Exception as e:
            logger.error(f"Connection error authenticating {self.device_id}: {e}")
        return False

    def fetch_id_by_name(self):
        """Fetch the database ID if the device already exists"""
        if not self.token:
            return False
            
        headers = {"Authorization": f"Bearer {self.token}"}
        try:
            response = requests.get(DEVICE_API_URL, headers=headers)
            if response.status_code == 200:
                devices = response.json()
                for d in devices:
                    if d.get('name') == self.device_id:
                        self.db_id = d.get('id')
                        logger.info(f"Retrieved ID {self.db_id} for {self.device_id}")
                        return True
        except Exception as e:
            logger.error(f"Error fetching ID: {e}")
        return False

    def register(self):
        """Register the device. If exists, fetch ID."""
        if not self.token:
            if not self.authenticate():
                return False

        payload = {
            "name": self.device_id,
            "type": self.device_type,
            "status": self.status,
            "ip_address": self.ip_address
        }
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.post(DEVICE_API_URL, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                data = response.json()
                self.db_id = data.get('id')
                logger.info(f"Device {self.device_id} registered with ID {self.db_id}.")
                return True
            elif response.status_code == 400 and "already exists" in response.text:
                logger.info(f"Device {self.device_id} already exists. Fetching ID...")
                return self.fetch_id_by_name()
            else:
                logger.error(f"Failed to register {self.device_id}: {response.text}")
                if response.status_code == 401:
                    self.token = None
        except Exception as e:
            logger.error(f"Connection error registering {self.device_id}: {e}")
        return False

    def update_status(self):
        """Send a status update via PUT"""
        if not self.db_id:
            return self.register()
            
        payload = {
            "name": self.device_id,
            "type": self.device_type,
            "status": self.status,
            "ip_address": self.ip_address
        }
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.put(f"{DEVICE_API_URL}/{self.db_id}", json=payload, headers=headers)
            if response.status_code == 200:
                logger.info(f"Device {self.device_id} status updated to {self.status}.")
            else:
                logger.error(f"Failed to update {self.device_id}: {response.text}")
                if response.status_code == 404:
                    # Maybe deleted? Try register
                    self.db_id = None
        except Exception as e:
            logger.error(f"Error updating status: {e}")

    def send_heartbeat(self):
        self.status = random.choice(["active", "maintenance", "active"])
        self.update_status()

    def run(self):
        logger.info(f"Starting HTTP Device: {self.device_id}")
        if self.authenticate():
            self.register()
            while True:
                time.sleep(random.randint(5, 10))
                self.send_heartbeat()
        else:
            logger.error(f"Could not start {self.device_id} due to auth failure.")

if __name__ == "__main__":
    device = HttpDevice("Laptop_01", "Laptop")
    device.run()

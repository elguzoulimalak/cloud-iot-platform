
from motor.motor_asyncio import AsyncIOMotorClient
from helpers.config import MONGO_URI, MONGO_DB_NAME

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        self.client = AsyncIOMotorClient(MONGO_URI)
        self.db = self.client[MONGO_DB_NAME]
        print("Connected to MongoDB")

    def close(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

db_instance = Database()

async def get_database():
    return db_instance.db

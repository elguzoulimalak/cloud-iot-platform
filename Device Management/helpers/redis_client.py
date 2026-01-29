
import redis
import os
import json
import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

class RedisClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance.client = None
        return cls._instance

    def connect(self):
        if self.client is None:
            try:
                self.client = redis.Redis(
                    host=REDIS_HOST,
                    port=REDIS_PORT,
                    db=REDIS_DB,
                    decode_responses=True
                )
                self.client.ping()
                logger.info(f"Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
            except redis.ConnectionError as e:
                logger.error(f"Failed to connect to Redis: {e}")
                self.client = None

    def get_cache(self, key: str) -> Optional[Any]:
        self.connect()
        if self.client:
            try:
                data = self.client.get(key)
                if data:
                    logger.info(f"Cache HIT for {key}")
                    return json.loads(data)
                else:
                    logger.info(f"Cache MISS for {key}")
                    return None
            except Exception as e:
                logger.error(f"Error reading cache for {key}: {e}")
                return None
        return None

    def set_cache(self, key: str, value: Any, ttl: int = 60):
        self.connect()
        if self.client:
            try:
                json_data = json.dumps(value, default=str)
                self.client.setex(key, ttl, json_data)
                logger.info(f"Cache SET for {key} (TTL: {ttl}s)")
            except Exception as e:
                logger.error(f"Error setting cache for {key}: {e}")

    def delete_cache(self, pattern: str):
        self.connect()
        if self.client:
            try:
                keys = self.client.keys(pattern)
                if keys:
                    self.client.delete(*keys)
                    logger.info(f"Cache DELETED for pattern {pattern} ({len(keys)} keys)")
            except Exception as e:
                logger.error(f"Error deleting cache for {pattern}: {e}")

redis_client = RedisClient()

import uvicorn
from fastapi import FastAPI
from controllers.device_controller import router
from helpers.config import Base, engine

app = FastAPI(
    title="Device Management API",
    description="Microservice for managing IoT devices"
)

# CORS Configuration
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection Retry Logic
import time
from sqlalchemy.exc import OperationalError

MAX_RETRIES = 10
RETRY_DELAY = 3

for attempt in range(MAX_RETRIES):
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("Database connected and tables created successfully.")
        break
    except OperationalError as e:
        print(f"Database connection failed (Attempt {attempt + 1}/{MAX_RETRIES}): {e}")
        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_DELAY)
        else:
            print("Max retries reached. Exiting.")
            raise e

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "device-management"}

app.include_router(router)

if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

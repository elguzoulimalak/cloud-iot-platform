import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.auth_controller import router
from helpers.config import Base,engine

app=FastAPI(
    title="Authentication app",
    description="Micro service signing app "
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#create one time
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
@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "signing"}

app.include_router(router)


if __name__ == '__main__':
    uvicorn.run("main:app",host="0.0.0.0",reload=True)
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

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(router)

if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

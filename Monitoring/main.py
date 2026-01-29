import socketio
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from helpers.database import db_instance
from routers.monitoring import router

# 1. Create Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio)

# 2. Create FastAPI app
fastapi_app = FastAPI(title="Monitoring Service")

# CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
fastapi_app.include_router(router)

@fastapi_app.on_event("startup")
async def startup_event():
    # Connect DB
    db_instance.connect()
    
    # Start Consumer in background
    from helpers.consumer import consume
    asyncio.create_task(consume())

@fastapi_app.on_event("shutdown")
def shutdown_event():
    db_instance.close()

# Socket IO events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# 3. Wrap FastAPI app with Socket.IO
# 'app' is the variable uvicorn looks for by default in "main:app"
app = socketio.ASGIApp(sio, fastapi_app)

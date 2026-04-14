import socketio
import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from helpers.database import db_instance
from routers.monitoring import router
from helpers.auth_middleware import verify_token
from fastapi import APIRouter, Depends, HTTPException, status

# 1. Create Socket.IO server
from helpers.socket_manager import sio
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

from helpers import debug_store

@fastapi_app.get("/debug")
async def get_debug_info():
    return {
        "rabbitmq_status": debug_store.connection_status,
        "host_used": debug_store.host_used,
        "message_count": debug_store.message_count,
        "last_message": debug_store.last_message,
        "sio_connected": True
    }

@fastapi_app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "monitoring"}

from helpers.database import db_instance
from helpers.socket_manager import sio
import json

@fastapi_app.post("/ingest")
async def ingest_event(request: Request):
    try:
        data = await request.json()
        
        # DEBUG
        debug_store.message_count += 1
        debug_store.last_message = data
        debug_store.last_message["source"] = "HTTP_INGEST"
        
        # 1. DB
        if db_instance.db is not None:
             await db_instance.db.device_events.insert_one(data)
             
        # 2. Fix ID
        if '_id' in data:
            data['_id'] = str(data['_id'])
            
        # 3. Socket
        await sio.emit('device_event', data)
        
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

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

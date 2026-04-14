from helpers.auth_middleware import verify_token
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/events")
async def get_events(limit: int = 50, user_payload = Depends(verify_token)):
    events = []
    if db_instance.db is not None:
        cursor = db_instance.db.device_events.find().sort("_id", -1).limit(limit)
        async for document in cursor:
             # Convert ObjectId to string
            document["_id"] = str(document["_id"])
            events.append(document)
    return events

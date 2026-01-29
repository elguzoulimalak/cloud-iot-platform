
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeviceRequest(BaseModel):
    name: str
    type: str
    ip_address: Optional[str] = None
    status: Optional[str] = "offline"

class DeviceResponse(BaseModel):
    id: int
    name: str
    type: str
    status: str
    ip_address: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

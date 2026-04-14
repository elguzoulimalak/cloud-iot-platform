
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from helpers.config import session_factory, logger
from dal import device_dao
from dto.device_dto import DeviceRequest, DeviceResponse
from entities.device import Device
from helpers.publisher import publisher
from helpers.redis_client import redis_client
from helpers.auth_middleware import verify_token


router = APIRouter(prefix="/devices", tags=["devices"])

@router.get("/", response_model=list[DeviceResponse])
def get_all(session: Session = Depends(session_factory), user_payload = Depends(verify_token)):
    # Extract User Email
    user_email = user_payload.get('sub')
    
    # Try cache first (User specific cache key)
    cached_devices = redis_client.get_cache(f"devices:{user_email}")
    if cached_devices:
        return cached_devices

    # Filter by Owner Email
    devices = session.query(Device).filter(Device.owner_email == user_email).all()
    
    # Cache
    devices_json = [DeviceResponse.model_validate(d).model_dump() for d in devices]
    redis_client.set_cache(f"devices:{user_email}", devices_json, ttl=60)
    
    return devices

@router.get("/system/all", response_model=list[DeviceResponse])
def get_all_system(session: Session = Depends(session_factory)):
    """
    Internal Endpoint for Simulation Runner (No Auth or API Key for simplicity in MVP)
    """
    devices = device_dao.get_all_devices(session)
    return devices

@router.get("/{device_id}", response_model=DeviceResponse)
def get_one(device_id: int, session: Session = Depends(session_factory), user_payload = Depends(verify_token)):
    # ... existing logic but maybe check ownership? For MVP, just get logic is fine if they know ID.
    # ...
    # Try cache
    cached_device = redis_client.get_cache(f"device:{device_id}")
    if cached_device:
        return cached_device

    device = device_dao.get_device_by_id(session, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    # Check Ownership
    user_email = user_payload.get('sub')
    if device.owner_email and device.owner_email != user_email:
         raise HTTPException(status_code=403, detail="Not authorized to access this device")

    # Set Cache
    device_json = DeviceResponse.model_validate(device).model_dump()
    redis_client.set_cache(f"device:{device_id}", device_json, ttl=300)

    return device

@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def create(device_request: DeviceRequest, session: Session = Depends(session_factory), user_payload = Depends(verify_token)):
    user_email = user_payload.get('sub')
    
    # Check if exists (Scoped to User)
    existing = device_dao.get_device_by_name_and_owner(session, device_request.name, user_email)
    if existing:
        raise HTTPException(status_code=400, detail="Device with this name already exists")
    
    new_device = Device(
        name=device_request.name,
        type=device_request.type,
        status=device_request.status,
        ip_address=device_request.ip_address,
        owner_email=user_email
    )
    
    try:
        created_device = device_dao.create_device(session, new_device)
        logger.info(f"Device created: {created_device.name}")
        
        # Publish event
        event_data = {
            "id": created_device.id,
            "name": created_device.name,
            "type": created_device.type,
            "status": created_device.status,
            "ip_address": created_device.ip_address
        }
        publisher.publish(routing_key="device.created", message=event_data)
    
        # Invalidate Cache
        redis_client.delete_cache(f"devices:{user_email}")
        
        return created_device
    except Exception as e:
        logger.error(f"Error creating device: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/{device_id}", response_model=DeviceResponse)
def update(device_id: int, device_request: DeviceRequest, session: Session = Depends(session_factory), user_payload = Depends(verify_token)):
    try:
        updated_device = device_dao.update_device(session, device_id, device_request)
        if not updated_device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        logger.info(f"Device updated: {updated_device.name}")
        
        # Publish event
        event_data = {
            "id": updated_device.id,
            "name": updated_device.name,
            "type": updated_device.type,
            "status": updated_device.status,
            "ip_address": updated_device.ip_address
        }
        publisher.publish(routing_key="device.updated", message=event_data)
        
        # Invalidate Cache
        # Invalidate Cache (Need user email)
        user_email = user_payload.get('sub')
        redis_client.delete_cache(f"devices:{user_email}")
        redis_client.delete_cache(f"device:{device_id}")
        
        return updated_device
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating device: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(device_id: int, session: Session = Depends(session_factory), user_payload = Depends(verify_token)):
    try:
        # Get details before delete for event
        device = device_dao.get_device_by_id(session, device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        success = device_dao.delete_device(session, device_id)
        if not success:
             raise HTTPException(status_code=404, detail="Device not found") # Should be caught above
             
        logger.info(f"Device deleted: {device_id}")
        
        # Publish event
        event_data = {
            "id": device_id,
        }
        publisher.publish(routing_key="device.deleted", message=event_data)
        
        # Invalidate Cache
        # Invalidate Cache (Need user email)
        user_email = user_payload.get('sub')
        redis_client.delete_cache(f"devices:{user_email}")
        redis_client.delete_cache(f"device:{device_id}")
        
        return
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting device: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



from sqlalchemy.orm import Session
from entities.device import Device
from dto.device_dto import DeviceRequest

def get_all_devices(session: Session):
    return session.query(Device).all()

def get_device_by_id(session: Session, device_id: int):
    return session.query(Device).filter(Device.id == device_id).one_or_none()

def get_device_by_name_and_owner(session: Session, name: str, owner_email: str):
    return session.query(Device).filter(Device.name == name, Device.owner_email == owner_email).one_or_none()

def create_device(session: Session, device: Device):
    session.add(device)
    try:
        session.commit()
        session.refresh(device)
        return device
    except Exception:
        session.rollback()
        raise

def update_device(session: Session, device_id: int, device_data: DeviceRequest):
    device = session.query(Device).filter(Device.id == device_id).one_or_none()
    if not device:
        return None
    
    device.name = device_data.name
    device.type = device_data.type
    device.status = device_data.status
    device.ip_address = device_data.ip_address
    
    try:
        session.commit()
        session.refresh(device)
        return device
    except Exception:
        session.rollback()
        raise

def delete_device(session: Session, device_id: int):
    device = session.query(Device).filter(Device.id == device_id).one_or_none()
    if not device:
        return False
    
    try:
        session.delete(device)
        session.commit()
        return True
    except Exception:
        session.rollback()
        raise

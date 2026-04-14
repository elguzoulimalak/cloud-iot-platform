
from helpers.config import Base
from sqlalchemy import Column, String, Integer, DateTime, func, Boolean

class Device(Base):
    __tablename__ = 't_devices'
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String, index=True, nullable=False) # Not unique globally anymore
    type = Column(String, nullable=False) # e.g., 'temperature', 'humidity'
    status = Column(String, default="offline") # 'online', 'offline'
    ip_address = Column(String, nullable=True)
    owner_email = Column(String, nullable=True, index=True) # User ownership
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), server_onupdate=func.now())

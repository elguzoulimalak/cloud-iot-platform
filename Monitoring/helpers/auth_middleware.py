from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import logging
import os

security = HTTPBearer()
logger = logging.getLogger(__name__)

# Fallback to signing-ms if inside docker, localhost if outside
SIGNING_SERVICE_URL = os.getenv("SIGNING_SERVICE_URL", "http://signing-ms:8003")

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SIGNING_SERVICE_URL}/users/verify-token",
                json={"token": token}
            )
            
            if response.status_code == 200:
                return response.json().get("payload")
            elif response.status_code == 404:
                raise HTTPException(status_code=401, detail="Invalid token")
            else:
                logger.error(f"Signing service error: {response.text}")
                raise HTTPException(status_code=401, detail="Authentication failed")
                
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Signing service: {e}")
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    except Exception as e:
        logger.error(f"Error verifying token: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import decode_token
from app.database import users_collection

security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(user_id: int = Depends(get_current_user_id)):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def admin_required(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return user

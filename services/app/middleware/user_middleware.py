from fastapi import Request, HTTPException
from functools import wraps
from app.utils.jwt_handler import decode_token

def auth_required(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Find the Request object in args or kwargs
        request: Request = kwargs.get("request") or next((a for a in args if isinstance(a, Request)), None)
        if not request:
            raise Exception("Request object not found")

        token = request.headers.get("Authorization")
        if not token:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        try:
            token = token.replace("Bearer ", "")
            payload = decode_token(token)
            request.state.user_id = payload.get("user_id")
        except Exception as e:
            raise HTTPException(status_code=401, detail=str(e))

        return await func(*args, **kwargs)

    return wrapper

def admin_required(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get("request") or next((a for a in args if isinstance(a, Request)), None)
        if not request:
            raise Exception("Request object not found")

        user = getattr(request.state, "user", None)
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin role required")

        return await func(*args, **kwargs)
    
    return wrapper

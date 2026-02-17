from fastapi import APIRouter, Depends
from app.schemas.user_schema import RegisterSchema, LoginSchema
from app.controllers.user_controller import UserController
from app.middleware.user_middleware import get_current_user, admin_required

router = APIRouter( prefix="/api/users", tags=["Users"])

controller = UserController()

@router.post("/register")
async def register(payload: RegisterSchema):
    return await controller.register(payload)

@router.post("/login")
async def login(payload: LoginSchema):
    return await controller.login(payload)

@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"success": True, "data": {"user": {k: v for k, v in user.items() if k != "password"}}}

@router.get("/")
async def list_users(user: dict = Depends(admin_required), skip: int = 0, limit: int = 100):
    return await controller.get_users(skip, limit)

@router.get("/{user_id}")
async def get_user(user_id: str, user: dict = Depends(admin_required)):
    return await controller.get_user(user_id)

@router.put("/{user_id}")
async def update_user(user_id: str, payload: dict, user: dict = Depends(admin_required)):
    return await controller.update_user(user_id, payload)

@router.delete("/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(admin_required)):
    return await controller.delete_user(user_id)

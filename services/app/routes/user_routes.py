from fastapi import APIRouter, Depends, Request, Response
from app.schemas.user_schema import RegisterSchema, LoginSchema, UpdateUserSchema
from app.controllers.user_controller import UserController
from app.middleware.user_middleware import auth_required

router = APIRouter(prefix="/api/users")
controller = UserController()

@router.post("/register")
async def register(payload: RegisterSchema):
    return await controller.register(payload)

@router.post("/login")
async def login(payload: LoginSchema):
    return await controller.login(payload)

@router.get("/me")
@auth_required
async def get_current_user(request: Request):
    user_id = request.state.user_id
    return await controller.get_current_user(user_id)

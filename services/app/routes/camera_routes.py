from fastapi import APIRouter, Depends
from app.schemas.camera_schema import CameraCreateSchema, CameraUpdateSchema, CameraStatusUpdateSchema
from app.controllers.camera_controller import CameraController
from app.middleware.user_middleware import get_current_user, admin_required

router = APIRouter(prefix="/api/cameras", tags=["Cameras"])
controller = CameraController()

@router.post("/")
async def create_camera(payload: CameraCreateSchema):
    return await controller.create_camera(payload)

@router.get("/")
async def list_cameras(user: dict = Depends(get_current_user)):
    return await controller.get_cameras()

@router.get("/stats")
async def camera_stats(user: dict = Depends(get_current_user)):
    return await controller.get_stats()

@router.get("/{camera_id}")
async def get_camera(camera_id: str, user: dict = Depends(get_current_user)):
    return await controller.get_camera(camera_id)

@router.put("/{camera_id}")
async def update_camera(camera_id: str, payload: CameraUpdateSchema, user: dict = Depends(admin_required)):
    return await controller.update_camera(camera_id, payload.dict(exclude_unset=True))

@router.patch("/{camera_id}/status")
async def update_camera_status(camera_id: str, payload: CameraStatusUpdateSchema, user: dict = Depends(admin_required)):
    return await controller.update_status(camera_id, payload.status)

@router.delete("/{camera_id}")
async def delete_camera(camera_id: str, user: dict = Depends(admin_required)):
    return await controller.delete_camera(camera_id)

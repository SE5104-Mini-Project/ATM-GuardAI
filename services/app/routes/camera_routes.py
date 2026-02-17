from fastapi import APIRouter, Depends, Query
from app.schemas.camera_schema import CameraCreateSchema, CameraUpdateSchema, CameraStatusUpdateSchema
from app.controllers.camera_controller import CameraController
from app.middleware.user_middleware import admin_required 

router = APIRouter(prefix="/api/cameras", tags=["Cameras"])
controller = CameraController()

@router.post("/")
async def create_camera(payload: CameraCreateSchema):
    return await controller.create_camera(payload)

@router.get("/")
async def list_cameras(
    skip: int = 0,
    limit: int = 20,
    status: str = None,
    branch: str = None,
    district: str = None,
    province: str = None,
    search: str = None,
):
    filters = {}

    if status:
        filters["status"] = status
    if branch:
        filters["branch"] = {"$regex": branch, "$options": "i"}
    if district:
        filters["district"] = {"$regex": district, "$options": "i"}
    if province:
        filters["province"] = {"$regex": province, "$options": "i"}
    if search:
        filters["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"bankName": {"$regex": search, "$options": "i"}},
            {"branch": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}},
            {"streamUrl": {"$regex": search, "$options": "i"}},
        ]

    return await controller.get_cameras(skip, limit, filters)

@router.get("/stats")
async def camera_stats():
    return await controller.get_stats()

@router.get("/{camera_id}")
async def get_camera(camera_id: str):
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

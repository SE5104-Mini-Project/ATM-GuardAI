from datetime import datetime
import validators
from app.database import cameras_collection
from app.models.counter_model import get_next_id


class CameraController:

    async def create_camera(self, payload):
        if payload.streamUrl:
            if not validators.url(payload.streamUrl):
                return {"success": False, "message": "Invalid stream URL format"}

        camera_id = await get_next_id("camera")
        auto_increment = int(camera_id.split("_")[1])

        now = datetime.utcnow()

        camera = {
            "_id": camera_id,
            "autoIncrementId": auto_increment,
            "name": payload.name,
            "bankName": payload.bankName,
            "district": payload.district,
            "province": payload.province,
            "branch": payload.branch,
            "location": {
                "latitude": payload.latitude,
                "longitude": payload.longitude,
            },
            "address": payload.address,
            "streamUrl": payload.streamUrl,
            "status": payload.status,
            "lastAvailableTime": now,
            "createdAt": now,
            "updatedAt": now,
        }

        await cameras_collection.insert_one(camera)
        return {"success": True, "message": "Camera created successfully", "data": camera}

    async def get_cameras(self):
        cameras = []
        async for camera in cameras_collection.find({}):
            camera["_id"] = str(camera["_id"])
            cameras.append(camera)
        return {"cameras": cameras}

    async def get_camera(self, camera_id: str):
        camera = await cameras_collection.find_one({"_id": camera_id})
        if not camera:
            return {"success": False, "message": "Camera not found"}
        return {"success": True, "data": camera}

    async def update_camera(self, camera_id: str, payload: dict):
        payload["updatedAt"] = datetime.utcnow()

        if "streamUrl" in payload:
            if not validators.url(payload["streamUrl"]):
                return {"success": False, "message": "Invalid stream URL"}

        if "latitude" in payload or "longitude" in payload:
            payload["location"] = {
                "latitude": payload.get("latitude"),
                "longitude": payload.get("longitude")
            }
            payload.pop("latitude", None)
            payload.pop("longitude", None)

        result = await cameras_collection.update_one({"_id": camera_id}, {"$set": payload})

        if result.matched_count == 0:
            return {"success": False, "message": "Camera not found"}

        updated = await cameras_collection.find_one({"_id": camera_id})
        return {"success": True, "message": "Camera updated", "data": updated}

    async def update_status(self, camera_id: str, status: str):
        update = {
            "status": status,
            "updatedAt": datetime.utcnow()
        }

        if status == "online":
            update["lastAvailableTime"] = datetime.utcnow()

        result = await cameras_collection.update_one({"_id": camera_id}, {"$set": update})

        if result.matched_count == 0:
            return {"success": False, "message": "Camera not found"}

        updated = await cameras_collection.find_one({"_id": camera_id})
        return {"success": True, "message": "Status updated", "data": updated}

    async def delete_camera(self, camera_id: str):
        result = await cameras_collection.delete_one({"_id": camera_id})
        if result.deleted_count == 0:
            return {"success": False, "message": "Camera not found"}
        return {"success": True, "message": "Camera deleted"}

    async def get_stats(self):
        total = await cameras_collection.count_documents({})
        online = await cameras_collection.count_documents({"status": "online"})
        offline = await cameras_collection.count_documents({"status": "offline"})

        by_province = await cameras_collection.aggregate([
            {"$group": {"_id": "$province", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(None)

        by_bank = await cameras_collection.aggregate([
            {"$group": {"_id": "$bankName", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(None)

        return {
            "success": True,
            "data": {
                "total": total,
                "online": online,
                "offline": offline,
                "byProvince": by_province,
                "byBank": by_bank
            }
        }
    
from app.database import db
from app.models.counter_model import get_next_id
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_token
from datetime import datetime
import re


class UserController:

    async def register(self, payload):
        name, email, password, role = payload.name, payload.email, payload.password, getattr(payload, "role", "user")

        if not name or not email or not password:
            return {"success": False, "message": "Name, email and password are required"}

        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
            return {"success": False, "message": "Please provide a valid email address"}

        if len(password) < 6:
            return {"success": False, "message": "Password must be at least 6 characters long"}

        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            return {"success": False, "message": "User already exists with this email"}

        user_id = await get_next_id("user")
        now = datetime.utcnow()

        user = {
            "_id": user_id,
            "name": name,
            "email": email,
            "password": hash_password(password),
            "role": role,
            "status": "Active",
            "lastLogin": None,
            "createdAt": now,
            "updatedAt": now
        }

        await db.users.insert_one(user)
        token = create_token(user_id)

        return {
            "success": True,
            "message": "User registered successfully. Please login to continue.",
            "data": {
                "user": {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "role": role,
                    "status": "Active",
                    "createdAt": now
                },
                "token": token
            }
        }

    async def login(self, payload):
        email, password = payload.email, payload.password

        if not email or not password:
            return {"success": False, "message": "Email and password are required"}

        user = await db.users.find_one({"email": email})

        if not user or not verify_password(password, user["password"]):
            return {"success": False, "message": "Invalid email or password"}

        if user.get("status") != "Active":
            return {"success": False, "message": "Your account is not active. Please contact administrator."}

        token = create_token(user["_id"])
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"lastLogin": datetime.utcnow()}})

        user_data = {k: v for k, v in user.items() if k != "password"}

        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "user": user_data,
                "token": token
            }
        }

    async def get_current_user(self, user_id: int):
        user = await db.users.find_one({"_id": user_id})
        if not user:
            return {"success": False, "message": "User not found"}
        user_data = {k: v for k, v in user.items() if k != "password"}
        return {"success": True, "data": {"user": user_data}}

    async def get_users(self, skip: int = 0, limit: int = 100):
        cursor = db.users.find().skip(skip).limit(limit)
        users = []
        async for user in cursor:
            user_data = {k: v for k, v in user.items() if k != "password"}
            users.append(user_data)
        return {"success": True, "data": {"users": users}}

    async def get_user(self, user_id: str):
        user = await db.users.find_one({"_id": user_id})
        if not user:
            return {"success": False, "message": "User not found"}
        user_data = {k: v for k, v in user.items() if k != "password"}
        return {"success": True, "data": {"user": user_data}}

    async def update_user(self, user_id: str, payload: dict):
        if "password" in payload:
            payload["password"] = hash_password(payload["password"])

        payload["updatedAt"] = datetime.utcnow()

        result = await db.users.update_one({"_id": user_id}, {"$set": payload})
        if result.matched_count == 0:
            return {"success": False, "message": "User not found"}

        updated_user = await db.users.find_one({"_id": user_id})
        user_data = {k: v for k, v in updated_user.items() if k != "password"}
        return {"success": True, "message": "User updated successfully", "data": {"user": user_data}}

    async def delete_user(self, user_id: str):
        result = await db.users.delete_one({"_id": user_id})
        if result.deleted_count == 0:
            return {"success": False, "message": "User not found"}
        return {"success": True, "message": "User deleted successfully"}

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    password: str
    role: str = "user"
    status: str = "Active"
    lastLogin: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: str = Field(..., alias="_id")  
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="moderator", pattern="^(admin|moderator)$")
    status: str = Field(default="Active", pattern="^(Active|Inactive|Suspended)$")
    lastLogin: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        allow_population_by_field_name = True  
        orm_mode = True  

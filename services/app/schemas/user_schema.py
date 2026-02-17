from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterSchema(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = Field(default="moderator", pattern="^(admin|moderator)$")
    status: Optional[str] = Field(default="Active", pattern="^(Active|Inactive|Suspended)$")


class LoginSchema(BaseModel):
    email: EmailStr
    password: str

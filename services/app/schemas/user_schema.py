from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class UpdateUserSchema(BaseModel):
    name: str | None = None
    role: str | None = None
    status: str | None = None

from pydantic import BaseModel, Field
from typing import Optional

class CameraCreateSchema(BaseModel):
    name: str
    bankName: str
    district: str
    province: str
    branch: str
    latitude: float
    longitude: float
    address: str
    streamUrl: Optional[str] = None
    status: Optional[str] = Field(default="online", pattern="^(online|offline)$")

class CameraUpdateSchema(BaseModel):
    name: Optional[str]
    bankName: Optional[str]
    district: Optional[str]
    province: Optional[str]
    branch: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]
    streamUrl: Optional[str]
    status: Optional[str]

class CameraStatusUpdateSchema(BaseModel):
    status: str = Field(..., pattern="^(online|offline)$")

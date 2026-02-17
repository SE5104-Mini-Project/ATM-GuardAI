from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class Camera(BaseModel):
    id: str = Field(..., alias="_id")
    autoIncrementId: int
    name: str
    bankName: str
    district: str
    province: str
    branch: str
    location: Dict[str, float]
    address: str
    streamUrl: Optional[str] = None
    status: str = Field(default="online", pattern="^(online|offline)$")
    lastAvailableTime: datetime
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

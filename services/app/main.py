from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.user_routes import router as user_routes
from app.routes.camera_routes import router as camera_routes
from app.config import settings

app = FastAPI(
    title="ATM Surveillance System API",
    description="API for managing and monitoring ATM surveillance system operations.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes)
app.include_router(camera_routes)

@app.get("/")
async def home():
    return {"message": "ATM Surveillance System API (FastAPI)"}
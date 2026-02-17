import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key")
    JWT_EXPIRES_IN: int = int(os.getenv("JWT_EXPIRES_IN", 3600))  
    FRONTEND_URL: str = os.getenv("FRONTEND_URL")

settings = Settings()

import os
from typing import List
from pydantic import BaseModel


def _parse_cors_origins() -> List[str]:
    app_env = os.getenv("APP_ENV", "production").strip().lower()
    raw = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    if app_env == "local":
        return ["*"]
    return ["https://myfittrack.io.vn"]


class WorkerConfig(BaseModel):
    app_name: str = "FitnessLeveling AI Pose Worker"
    version: str = "2.0.0"
    app_env: str = os.getenv("APP_ENV", "production").strip().lower()
    cors_allowed_origins: List[str] = _parse_cors_origins()


config = WorkerConfig()

import os
from pydantic import BaseModel

class WorkerConfig(BaseModel):
    app_name: str = "FitTrack AI Pose Worker"
    version: str = "2.0.0"
    port: int = int(os.getenv("PORT", "8001"))
    max_video_size_mb: int = int(os.getenv("POSE_VIDEO_MAX_SIZE_MB", "100"))
    max_video_duration_sec: int = int(os.getenv("POSE_VIDEO_MAX_DURATION_SEC", "60"))

config = WorkerConfig()

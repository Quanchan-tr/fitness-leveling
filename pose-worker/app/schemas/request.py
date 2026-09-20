from typing import Optional
from pydantic import BaseModel, HttpUrl

class ProcessVideoRequest(BaseModel):
    session_id: str
    video_url: str
    exercise_type: str  # e.g., 'squat_v1', 'pushup_v1', 'plank_v1'

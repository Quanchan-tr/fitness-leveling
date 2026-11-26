from pydantic import BaseModel


class ProcessVideoRequest(BaseModel):
    """
    Request payload for POST /v1/process-video.

    v2 MVP: `video_path` is the absolute path to the video file on the shared
    Docker named volume (private_storage). The Python Worker reads the file
    directly from the filesystem — no S3 URL, no boto3 download required.

    Example:
        {
            "session_id": "550e8400-e29b-41d4-a716-446655440000",
            "video_path": "/app/private_storage/pose-videos/{user_id}/{session_id}.mp4",
            "exercise_type": "squat_v1"
        }
    """

    session_id: str
    # Absolute path on the shared Docker volume (e.g. /app/private_storage/...)
    video_path: str
    # Rule key: 'squat_v1', 'pushup_v1', 'plank_v1', etc.
    exercise_type: str

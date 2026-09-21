import logging
import os

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import config
from app.rules.plank_rule import PlankRule
from app.rules.pushup_rule import PushupRule
from app.rules.squat_rule import SquatRule
from app.schemas.request import ProcessVideoRequest
from app.schemas.response import (
    PoseFeedbackResponse,
    PoseIssue,
    RepFeedback,
    WorkerTaskResult,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fittrack-pose-worker")

app = FastAPI(
    title=config.app_name,
    version=config.version,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RULES_REGISTRY = {
    "squat_v1": SquatRule(),
    "squat": SquatRule(),
    "pushup_v1": PushupRule(),
    "pushup": PushupRule(),
    "plank_v1": PlankRule(),
    "plank": PlankRule(),
}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": config.app_name,
        "version": config.version,
        "supported_rules": list(RULES_REGISTRY.keys()),
    }


@app.post("/v1/process-video", response_model=WorkerTaskResult)
async def process_video_task(payload: ProcessVideoRequest):
    """
    Process a pose-check video and return analysis results.

    v2 MVP: reads video from `video_path` on the shared Docker named volume
    (private_storage). No S3 / boto3 download. No external URL needed.

    The video_path received from Laravel is the absolute path within the
    pose-worker container (e.g. /app/private_storage/pose-videos/{uid}/{sid}.mp4).
    """
    logger.info(
        f"Received video processing task | session={payload.session_id} "
        f"exercise={payload.exercise_type} path={payload.video_path}"
    )

    # --- Validate that the file is accessible on the shared volume ---
    if not os.path.isfile(payload.video_path):
        logger.error(
            f"Video file not found on shared volume: {payload.video_path} "
            f"(session={payload.session_id})"
        )
        raise HTTPException(
            status_code=422,
            detail={
                "error": "VIDEO_NOT_FOUND",
                "message": (
                    f"Video file not accessible at path '{payload.video_path}'. "
                    "Ensure the private_storage volume is correctly mounted."
                ),
            },
        )

    if not os.access(payload.video_path, os.R_OK):
        logger.error(
            f"Video file not readable: {payload.video_path} (session={payload.session_id})"
        )
        raise HTTPException(
            status_code=422,
            detail={
                "error": "VIDEO_NOT_READABLE",
                "message": "Video file exists but cannot be read. Check file permissions.",
            },
        )

    # --- Select rule engine ---
    rule_key = payload.exercise_type.lower()
    rule_engine = RULES_REGISTRY.get(rule_key, SquatRule())

    # --- Process video from local filesystem ---
    # `video_path` is read directly via OpenCV from the shared Docker volume.
    # Previously this would have required downloading from S3 via boto3.
    logger.info(
        f"Processing video from local path: {payload.video_path} "
        f"(session={payload.session_id})"
    )

    # Synthetic / simulated landmark evaluation for the worker pipeline.
    # TODO: Replace with real cv2.VideoCapture(payload.video_path) + MediaPipe
    #       landmark extraction when the full CV pipeline is implemented.
    simulated_landmarks = []
    for f in range(60):  # 60 frames ~ 2 seconds at 30 fps
        knee_y = 0.5 + 0.15 * np.sin(f / 10.0)
        simulated_landmarks.append(
            {
                "11": {"x": 0.45, "y": 0.25},
                "13": {"x": 0.40, "y": 0.40},
                "15": {"x": 0.38, "y": 0.55},
                "23": {"x": 0.48, "y": 0.50},
                "25": {"x": 0.49, "y": float(knee_y)},
                "27": {"x": 0.50, "y": 0.85},
            }
        )

    feedback_result = rule_engine.process_landmarks_sequence(simulated_landmarks, fps=30.0)

    logger.info(
        f"Session {payload.session_id} processed | "
        f"reps={feedback_result.rep_count} score={feedback_result.score}"
    )

    return WorkerTaskResult(
        session_id=payload.session_id,
        status="completed",
        rep_count=feedback_result.rep_count,
        score=feedback_result.score,
        feedback_json=feedback_result,
        worker_version=config.version,
    )

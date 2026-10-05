import base64
import logging
import os

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import config
from app.cv.mediapipe_extractor import get_extractor
from app.rules.plank_rule import PlankRule
from app.rules.pushup_rule import PushupRule
from app.rules.squat_rule import SquatRule
from app.schemas.request import AnalyzeFrameRequest, ProcessVideoRequest
from app.schemas.response import (
    AnalyzeFrameResponse,
    PoseFeedbackResponse,
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

_squat, _pushup, _plank = SquatRule(), PushupRule(), PlankRule()
RULES_REGISTRY = {
    "squat_v1": _squat,
    "squat": _squat,
    "pushup_v1": _pushup,
    "pushup": _pushup,
    "plank_v1": _plank,
    "plank": _plank,
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
    rule_engine = RULES_REGISTRY.get(rule_key, _squat)

    # --- Process video from local filesystem via MediaPipe ---
    logger.info(
        f"Extracting pose landmarks from: {payload.video_path} "
        f"(session={payload.session_id})"
    )

    try:
        extractor = get_extractor(model_complexity=1, frame_skip=1)
        frames_landmarks, video_meta = extractor.extract(payload.video_path)
    except RuntimeError as exc:
        logger.error(
            f"MediaPipe extraction failed for session={payload.session_id}: {exc}"
        )
        raise HTTPException(
            status_code=422,
            detail={
                "error": "VIDEO_EXTRACTION_FAILED",
                "message": str(exc),
            },
        )
    except Exception as exc:
        logger.exception(
            f"Unexpected error during landmark extraction (session={payload.session_id})"
        )
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_EXTRACTION_ERROR",
                "message": f"Landmark extraction raised an unexpected error: {exc}",
            },
        )

    # Use real fps from the video metadata
    effective_fps = video_meta.fps

    # Feed extracted landmarks into the rule engine
    feedback_result = rule_engine.process_landmarks_sequence(
        frames_landmarks, fps=effective_fps
    )

    logger.info(
        f"Session {payload.session_id} processed | "
        f"reps={feedback_result.rep_count} score={feedback_result.score} "
        f"frames={len(frames_landmarks)} fps={effective_fps:.1f}"
    )

    return WorkerTaskResult(
        session_id=payload.session_id,
        status="completed",
        rep_count=feedback_result.rep_count,
        score=feedback_result.score,
        feedback_json=feedback_result,
        worker_version=config.version,
    )


@app.post("/v1/analyze-frame", response_model=AnalyzeFrameResponse)
async def analyze_frame(payload: AnalyzeFrameRequest):
    """
    Analyze a single webcam frame for pose landmarks.

    The frontend sends a base64-encoded JPEG/PNG image captured from the
    user's webcam. This endpoint runs MediaPipe Pose on the frame and
    returns the extracted landmark coordinates.

    The client is responsible for:
    - Counting reps using the returned landmarks
    - Displaying skeleton overlay on the canvas
    - Accumulating landmarks for a full-session summary to send to /pose-check/realtime/result

    This design keeps the heavy model computation server-side while
    allowing low-latency streaming from the browser.
    """
    try:
        # Decode base64 image
        img_bytes = base64.b64decode(payload.frame_b64)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        bgr_frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if bgr_frame is None:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "INVALID_FRAME",
                    "message": "Could not decode the provided base64 image. Ensure it is a valid JPEG or PNG.",
                },
            )
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "FRAME_DECODE_ERROR",
                "message": f"Failed to decode frame: {exc}",
            },
        )

    extractor = get_extractor(model_complexity=0, frame_skip=1)
    lm_dict = extractor.extract_frame(bgr_frame)

    return AnalyzeFrameResponse(
        landmarks=lm_dict,
        pose_detected=bool(lm_dict),
        exercise_type=payload.exercise_type,
    )

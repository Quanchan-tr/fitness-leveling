import base64
import logging
import os

import json

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import config
from app.cv.mediapipe_extractor import get_extractor
from app.rules import EXERCISE_RULES
from app.schemas.request import AnalyzeFrameRequest, ProcessVideoRequest
from app.schemas.response import (
    AnalyzeFrameResponse,
    PoseFeedbackResponse,
    WorkerTaskResult,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fitnessleveling-pose-worker")

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

_default_rule = EXERCISE_RULES["squat"]
RULES_REGISTRY = {}
for _name, _rule in EXERCISE_RULES.items():
    RULES_REGISTRY[_name] = _rule
    RULES_REGISTRY[f"{_name}_v1"] = _rule



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
    rule_engine = RULES_REGISTRY.get(rule_key, _default_rule)

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


from app.rules.realtime_evaluator import RealtimePoseEvaluator


@app.websocket("/ws/pose-stream/{exercise_type}")
async def pose_stream_endpoint(websocket: WebSocket, exercise_type: str):
    """
    Real-time bidirectional WebSocket stream for mobile camera frames.
    Accepts raw binary JPEG/PNG or JSON with base64 frame,
    returns real-time rep count, current angle, state, and visual skeleton keypoints.
    """
    await websocket.accept()
    evaluator = RealtimePoseEvaluator(exercise_type=exercise_type)
    extractor = get_extractor(model_complexity=0, frame_skip=1)
    logger.info(f"WebSocket client connected for live stream: {exercise_type}")

    try:
        while True:
            message = await websocket.receive()
            frame_bytes = None

            if "bytes" in message and message["bytes"]:
                frame_bytes = message["bytes"]
            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    b64_str = payload.get("frame", "")
                    if b64_str:
                        frame_bytes = base64.b64decode(b64_str)
                except Exception:
                    pass

            if not frame_bytes:
                continue

            img_array = np.frombuffer(frame_bytes, dtype=np.uint8)
            bgr_frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if bgr_frame is None:
                continue

            lm_dict = extractor.extract_frame(bgr_frame)
            result = evaluator.evaluate_frame(lm_dict)
            await websocket.send_json(result)

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected | reps={evaluator.rep_count}")
    except Exception as exc:
        logger.warning(f"WebSocket session closed unexpectedly: {exc}")


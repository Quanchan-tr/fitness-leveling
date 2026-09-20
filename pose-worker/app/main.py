from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.config import config
from app.schemas.request import ProcessVideoRequest
from app.schemas.response import WorkerTaskResult, PoseFeedbackResponse, RepFeedback, PoseIssue
from app.rules.squat_rule import SquatRule
from app.rules.pushup_rule import PushupRule
from app.rules.plank_rule import PlankRule
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fittrack-pose-worker")

app = FastAPI(
    title=config.app_name,
    version=config.version,
    docs_url="/docs",
    redoc_url="/redoc"
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
        "supported_rules": list(RULES_REGISTRY.keys())
    }

@app.post("/v1/process-video", response_model=WorkerTaskResult)
async def process_video_task(payload: ProcessVideoRequest):
    logger.info(f"Received video processing task for session: {payload.session_id}, exercise: {payload.exercise_type}")
    
    rule_key = payload.exercise_type.lower()
    rule_engine = RULES_REGISTRY.get(rule_key)
    if not rule_engine:
        # Fallback to squat if unknown
        rule_engine = SquatRule()

    # Synthetic / Simulated Landmark evaluation for worker pipeline
    simulated_landmarks = []
    # 60 frames representing 2 seconds at 30 fps
    for f in range(60):
        # Sine wave knee angle simulation
        knee_y = 0.5 + 0.15 * np.sin(f / 10.0) if 'np' in globals() else 0.5
        simulated_landmarks.append({
            "11": {"x": 0.45, "y": 0.25},
            "13": {"x": 0.40, "y": 0.40},
            "15": {"x": 0.38, "y": 0.55},
            "23": {"x": 0.48, "y": 0.50},
            "25": {"x": 0.49, "y": float(knee_y)},
            "27": {"x": 0.50, "y": 0.85},
        })

    feedback_result = rule_engine.process_landmarks_sequence(simulated_landmarks, fps=30.0)

    return WorkerTaskResult(
        session_id=payload.session_id,
        status="completed",
        rep_count=feedback_result.rep_count,
        score=feedback_result.score,
        feedback_json=feedback_result,
        worker_version=config.version
    )

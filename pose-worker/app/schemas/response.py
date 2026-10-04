from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PoseIssue(BaseModel):
    """A single form issue detected during a rep or hold."""
    issue_code: str
    severity: str = Field(..., pattern="^(low|medium|high)$")
    message: str  # Realtime short message (shown during exercise)
    detail: Optional[str] = None  # Post-session detailed explanation (injury risk, correction tip)


class BreathingCue(BaseModel):
    """Breathing guidance for a specific phase of the movement."""
    phase: str  # e.g. "DESCENDING", "ASCENDING", "HOLD", "TOP", "BOTTOM"
    instruction: str  # e.g. "Hít vào" / "Thở ra"


class VisibilityWarning(BaseModel):
    """Warning when required landmarks are not visible / occluded."""
    warning_code: str  # e.g. "LANDMARKS_OCCLUDED", "POSE_NOT_DETECTED"
    message: str
    affected_landmarks: List[str] = []  # landmark indices that are missing
    frame_index: Optional[int] = None
    timestamp_sec: Optional[float] = None


class RepFeedback(BaseModel):
    rep_number: int = Field(..., ge=1)
    score: float = Field(..., ge=0, le=100)
    is_rep_valid: bool = True  # False if rep didn't meet minimum criteria
    timestamp_sec: Optional[float] = None
    issues: List[PoseIssue] = []
    breathing_cue: Optional[BreathingCue] = None  # Breathing guidance for this rep's phase
    visibility_warnings: List[VisibilityWarning] = []


class SessionSummary(BaseModel):
    """
    Post-session summary with detailed feedback.
    Only shown AFTER the user stops or completes all reps.
    """
    total_reps: int = 0
    valid_reps: int = 0
    average_score: float = 0.0
    overall_grade: str = "B"  # A / B / C / D / F
    strengths: List[str] = []  # Things done well
    improvement_areas: List[str] = []  # Detailed correction tips with injury risk info
    common_issues: List[PoseIssue] = []  # Most frequent issues across all reps
    visibility_note: Optional[str] = None  # Overall note about camera quality


class PoseFeedbackResponse(BaseModel):
    rep_count: int = Field(..., ge=0, le=500)
    score: float = Field(..., ge=0, le=100)
    rep_feedback: List[RepFeedback] = []
    session_summary: Optional[SessionSummary] = None
    visibility_warnings: List[VisibilityWarning] = []  # Frame-level visibility issues


class WorkerTaskResult(BaseModel):
    session_id: str
    status: str = "completed"  # 'completed' or 'failed'
    rep_count: int = 0
    score: float = 0.0
    feedback_json: PoseFeedbackResponse
    worker_version: str = "2.0.0"
    error_code: Optional[str] = None
    error_message: Optional[str] = None


class AnalyzeFrameResponse(BaseModel):
    """
    Response for POST /v1/analyze-frame.
    Returns raw landmark coordinates for realtime frontend use.
    """
    landmarks: Dict[str, Any]  # landmark_index -> {x, y, z, visibility}
    pose_detected: bool
    exercise_type: str

from typing import List, Optional
from pydantic import BaseModel, Field

class PoseIssue(BaseModel):
    issue_code: str  # e.g., KNEE_VALGUS, INSUFFICIENT_DEPTH, EXCESSIVE_FORWARD_LEAN, ROUNDED_BACK, FLARING_ELBOWS, HIPS_SAGGING, HIPS_PIKING
    severity: str = Field(..., pattern="^(low|medium|high)$")
    message: str

class RepFeedback(BaseModel):
    rep_number: int = Field(..., ge=1)
    score: float = Field(..., ge=0, le=100)
    timestamp_sec: Optional[float] = None
    issues: List[PoseIssue] = []

class PoseFeedbackResponse(BaseModel):
    rep_count: int = Field(..., ge=0, le=500)
    score: float = Field(..., ge=0, le=100)
    rep_feedback: List[RepFeedback] = []

class WorkerTaskResult(BaseModel):
    session_id: str
    status: str = "completed"  # 'completed' or 'failed'
    rep_count: int = 0
    score: float = 0.0
    feedback_json: PoseFeedbackResponse
    worker_version: str = "2.0.0"
    error_code: Optional[str] = None
    error_message: Optional[str] = None

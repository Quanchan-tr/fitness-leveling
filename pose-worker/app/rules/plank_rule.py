import numpy as np
from typing import List, Dict, Any
from app.rules.base_rule import BasePoseRule
from app.cv.angle_math import calculate_angle_2d
from app.schemas.response import PoseFeedbackResponse, RepFeedback, PoseIssue

class PlankRule(BasePoseRule):
    def process_landmarks_sequence(self, frames_landmarks: List[Dict[str, Any]], fps: float) -> PoseFeedbackResponse:
        total_valid_frames = 0
        sagging_frames = 0
        piking_frames = 0
        
        for frame_idx, lm in enumerate(frames_landmarks):
            if not lm or "11" not in lm or "23" not in lm or "27" not in lm:
                continue
                
            shoulder = np.array([lm["11"]["x"], lm["11"]["y"]])
            hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            ankle = np.array([lm["27"]["x"], lm["27"]["y"]])
            
            body_alignment = calculate_angle_2d(shoulder, hip, ankle)
            total_valid_frames += 1
            
            if body_alignment < 165.0:
                sagging_frames += 1
            elif body_alignment > 195.0:
                piking_frames += 1
                
        hold_duration_sec = round(total_valid_frames / max(fps, 1.0), 1)
        issues = []
        score = 100.0
        
        if total_valid_frames > 0:
            if (sagging_frames / total_valid_frames) > 0.15:
                score -= 25.0
                issues.append(PoseIssue(
                    issue_code="HIPS_SAGGING",
                    severity="high",
                    message="Lower back hyperextended during hold. Squeeze core and maintain straight spine line."
                ))
            if (piking_frames / total_valid_frames) > 0.15:
                score -= 20.0
                issues.append(PoseIssue(
                    issue_code="HIPS_PIKING",
                    severity="medium",
                    message="Hips elevated above neutral plane. Lower pelvis slightly to engage abdominal wall."
                ))
                
        reps = [
            RepFeedback(
                rep_number=1,
                score=max(0.0, score),
                timestamp_sec=hold_duration_sec,
                issues=issues
            )
        ]
        
        return PoseFeedbackResponse(
            rep_count=1 if hold_duration_sec >= 5.0 else 0,
            score=max(0.0, score),
            rep_feedback=reps
        )

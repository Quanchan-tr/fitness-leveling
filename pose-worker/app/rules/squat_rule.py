import numpy as np
from typing import List, Dict, Any
from app.rules.base_rule import BasePoseRule
from app.cv.angle_math import calculate_angle_2d, calculate_vertical_angle
from app.schemas.response import PoseFeedbackResponse, RepFeedback, PoseIssue

class SquatRule(BasePoseRule):
    def process_landmarks_sequence(self, frames_landmarks: List[Dict[str, Any]], fps: float) -> PoseFeedbackResponse:
        reps = []
        state = "START"  # START -> DESCENDING -> BOTTOM -> ASCENDING -> COMPLETED
        current_rep_min_knee_angle = 180.0
        current_rep_max_lean_angle = 0.0
        rep_start_frame = 0
        
        for frame_idx, lm in enumerate(frames_landmarks):
            if not lm or "23" not in lm or "25" not in lm or "27" not in lm:
                continue
                
            hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            knee = np.array([lm["25"]["x"], lm["25"]["y"]])
            ankle = np.array([lm["27"]["x"], lm["27"]["y"]])
            shoulder = np.array([lm["11"]["x"], lm["11"]["y"]]) if "11" in lm else None
            
            knee_angle = calculate_angle_2d(hip, knee, ankle)
            lean_angle = calculate_vertical_angle(shoulder, hip) if shoulder is not None else 0.0
            
            if state == "START":
                if knee_angle < 140.0:
                    state = "DESCENDING"
                    rep_start_frame = frame_idx
                    current_rep_min_knee_angle = knee_angle
                    current_rep_max_lean_angle = lean_angle
            elif state == "DESCENDING":
                current_rep_min_knee_angle = min(current_rep_min_knee_angle, knee_angle)
                current_rep_max_lean_angle = max(current_rep_max_lean_angle, lean_angle)
                if knee_angle <= 95.0:
                    state = "BOTTOM"
                elif knee_angle > current_rep_min_knee_angle + 10.0 and current_rep_min_knee_angle > 95.0:
                    # Ascending prematurely without reaching full depth
                    state = "ASCENDING"
            elif state == "BOTTOM":
                current_rep_min_knee_angle = min(current_rep_min_knee_angle, knee_angle)
                current_rep_max_lean_angle = max(current_rep_max_lean_angle, lean_angle)
                if knee_angle > 110.0:
                    state = "ASCENDING"
            elif state == "ASCENDING":
                current_rep_max_lean_angle = max(current_rep_max_lean_angle, lean_angle)
                if knee_angle >= 160.0:
                    # Rep completed
                    rep_num = len(reps) + 1
                    issues = []
                    score = 100.0
                    
                    if current_rep_min_knee_angle > 100.0:
                        score -= 25.0
                        issues.append(PoseIssue(
                            issue_code="INSUFFICIENT_DEPTH",
                            severity="medium",
                            message=f"Squat depth was shallow (knee angle {int(current_rep_min_knee_angle)}°). Aim for hip crease below knee (<= 90°)."
                        ))
                    if current_rep_max_lean_angle > 45.0:
                        score -= 20.0
                        issues.append(PoseIssue(
                            issue_code="EXCESSIVE_FORWARD_LEAN",
                            severity="medium",
                            message="Excessive forward torso lean detected. Keep chest proud and spine neutral."
                        ))
                        
                    reps.append(RepFeedback(
                        rep_number=rep_num,
                        score=max(0.0, score),
                        timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
                        issues=issues
                    ))
                    state = "START"
                    current_rep_min_knee_angle = 180.0
                    current_rep_max_lean_angle = 0.0

        total_score = float(np.mean([r.score for r in reps])) if reps else 85.0
        return PoseFeedbackResponse(
            rep_count=len(reps),
            score=round(total_score, 2),
            rep_feedback=reps
        )

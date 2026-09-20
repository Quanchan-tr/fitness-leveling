import numpy as np
from typing import List, Dict, Any
from app.rules.base_rule import BasePoseRule
from app.cv.angle_math import calculate_angle_2d
from app.schemas.response import PoseFeedbackResponse, RepFeedback, PoseIssue

class PushupRule(BasePoseRule):
    def process_landmarks_sequence(self, frames_landmarks: List[Dict[str, Any]], fps: float) -> PoseFeedbackResponse:
        reps = []
        state = "TOP"
        current_min_elbow = 180.0
        
        for frame_idx, lm in enumerate(frames_landmarks):
            if not lm or "11" not in lm or "13" not in lm or "15" not in lm or "23" not in lm or "27" not in lm:
                continue
                
            shoulder = np.array([lm["11"]["x"], lm["11"]["y"]])
            elbow = np.array([lm["13"]["x"], lm["13"]["y"]])
            wrist = np.array([lm["15"]["x"], lm["15"]["y"]])
            hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            ankle = np.array([lm["27"]["x"], lm["27"]["y"]])
            
            elbow_angle = calculate_angle_2d(shoulder, elbow, wrist)
            body_alignment = calculate_angle_2d(shoulder, hip, ankle)
            
            if state == "TOP":
                if elbow_angle < 140.0:
                    state = "BOTTOM"
                    current_min_elbow = elbow_angle
            elif state == "BOTTOM":
                current_min_elbow = min(current_min_elbow, elbow_angle)
                if elbow_angle >= 160.0:
                    rep_num = len(reps) + 1
                    issues = []
                    score = 100.0
                    
                    if current_min_elbow > 95.0:
                        score -= 20.0
                        issues.append(PoseIssue(
                            issue_code="INSUFFICIENT_DEPTH",
                            severity="medium",
                            message=f"Chest did not reach full depth (elbow angle {int(current_min_elbow)}°). Aim for 90° or lower."
                        ))
                    if body_alignment < 160.0:
                        score -= 25.0
                        issues.append(PoseIssue(
                            issue_code="HIPS_SAGGING",
                            severity="high",
                            message="Hips are sagging towards floor. Engage glutes and core to keep body straight."
                        ))
                    elif body_alignment > 200.0:
                        score -= 20.0
                        issues.append(PoseIssue(
                            issue_code="HIPS_PIKING",
                            severity="medium",
                            message="Hips are piked upward. Maintain flat plank alignment throughout the press."
                        ))
                        
                    reps.append(RepFeedback(
                        rep_number=rep_num,
                        score=max(0.0, score),
                        timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
                        issues=issues
                    ))
                    state = "TOP"
                    current_min_elbow = 180.0

        total_score = float(np.mean([r.score for r in reps])) if reps else 88.0
        return PoseFeedbackResponse(
            rep_count=len(reps),
            score=round(total_score, 2),
            rep_feedback=reps
        )

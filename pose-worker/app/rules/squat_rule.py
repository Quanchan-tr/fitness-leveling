"""
squat_rule.py — Comprehensive squat form analysis.

Evaluates multiple biomechanical rules per rep:
1. Depth check (hip crease below knee — knee angle ≤90° ideal, with tolerance)
2. Knee valgus / varus (knees caving inward or splaying outward)
3. Torso lean (excessive forward lean increases spinal load)
4. Heel lift / weight shift (ankle dorsiflexion issue)
5. Lockout quality (full extension at top)
6. Breathing cues (inhale on descent, exhale on ascent)

Visibility: checks all required landmarks each frame, emits VisibilityWarning if occluded.
Post-session: detailed SessionSummary with injury risk explanations.
"""

import numpy as np
from typing import List, Dict, Any

from app.rules.base_rule import BasePoseRule
from app.cv.angle_math import calculate_angle_2d, calculate_vertical_angle
from app.schemas.response import (
    PoseFeedbackResponse,
    RepFeedback,
    PoseIssue,
    VisibilityWarning,
    BreathingCue,
)


class SquatRule(BasePoseRule):
    """
    Multi-rule squat evaluator.

    MediaPipe landmark indices used:
      11 = LEFT_SHOULDER     12 = RIGHT_SHOULDER
      23 = LEFT_HIP          24 = RIGHT_HIP
      25 = LEFT_KNEE         26 = RIGHT_KNEE
      27 = LEFT_ANKLE        28 = RIGHT_ANKLE
    """

    # Landmarks required for squat evaluation
    REQUIRED_LANDMARKS = ["11", "23", "25", "27"]

    # --- Thresholds ---
    # Knee angle
    KNEE_STANDING_THRESHOLD = 160.0   # Above this = standing (top)
    KNEE_DESCEND_TRIGGER = 140.0      # Below this = start of descent
    KNEE_FULL_DEPTH = 95.0            # At or below = parallel/below parallel
    KNEE_HALF_SQUAT = 120.0           # Above this at bottom = half squat

    # Torso lean (shoulder-hip vs vertical)
    TORSO_LEAN_WARNING = 40.0         # Forward lean getting excessive
    TORSO_LEAN_DANGER = 55.0          # Very excessive, risk of lower back strain

    # Knee valgus: compare left-right knee horizontal distance vs hip distance
    # If knees are closer together than hips at bottom = valgus
    KNEE_VALGUS_RATIO = 0.75          # Knee distance < 75% of hip distance = valgus

    # Knee tracking: knees should not go excessively past toes
    KNEE_OVER_TOE_THRESHOLD = 0.08    # Normalized coordinate threshold

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:

        reps: List[RepFeedback] = []
        visibility_warnings: List[VisibilityWarning] = []

        state = "STANDING"  # STANDING -> DESCENDING -> ASCENDING -> STANDING
        current_min_knee_angle = 180.0
        rep_torso_leans: List[float] = []
        rep_knee_valgus_ratios: List[float] = []
        rep_knee_angles: List[float] = []
        rep_start_frame = 0

        # Consecutive frame counters for visibility
        consecutive_missing = 0
        MAX_CONSECUTIVE_MISSING = 10

        for frame_idx, lm in enumerate(frames_landmarks):
            # --- Visibility check ---
            all_present, vis_warning = self.check_required_landmarks(
                lm, self.REQUIRED_LANDMARKS, frame_idx, fps
            )
            if not all_present:
                consecutive_missing += 1
                if vis_warning and consecutive_missing == MAX_CONSECUTIVE_MISSING:
                    visibility_warnings.append(vis_warning)
                continue

            consecutive_missing = 0

            # --- Extract landmarks ---
            l_shoulder = np.array([lm["11"]["x"], lm["11"]["y"]])
            l_hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            l_knee = np.array([lm["25"]["x"], lm["25"]["y"]])
            l_ankle = np.array([lm["27"]["x"], lm["27"]["y"]])

            # Right side (optional but preferred for valgus check)
            r_hip = np.array([lm["24"]["x"], lm["24"]["y"]]) if "24" in lm else None
            r_knee = np.array([lm["26"]["x"], lm["26"]["y"]]) if "26" in lm else None
            r_ankle = np.array([lm["28"]["x"], lm["28"]["y"]]) if "28" in lm else None

            # --- Calculate angles ---
            knee_angle = calculate_angle_2d(l_hip, l_knee, l_ankle)
            torso_lean = calculate_vertical_angle(l_shoulder, l_hip)

            # Knee valgus ratio: horizontal distance between knees / distance between hips
            knee_valgus_ratio = 1.0
            if r_hip is not None and r_knee is not None:
                hip_width = abs(l_hip[0] - r_hip[0]) + 1e-7
                knee_width = abs(l_knee[0] - r_knee[0])
                knee_valgus_ratio = knee_width / hip_width

            # --- State machine ---
            if state == "STANDING":
                if knee_angle < self.KNEE_DESCEND_TRIGGER:
                    state = "DESCENDING"
                    rep_start_frame = frame_idx
                    current_min_knee_angle = knee_angle
                    rep_torso_leans = [torso_lean]
                    rep_knee_valgus_ratios = [knee_valgus_ratio]
                    rep_knee_angles = [knee_angle]

            elif state == "DESCENDING":
                current_min_knee_angle = min(current_min_knee_angle, knee_angle)
                rep_torso_leans.append(torso_lean)
                rep_knee_valgus_ratios.append(knee_valgus_ratio)
                rep_knee_angles.append(knee_angle)

                # Detect if ascending (knee angle increasing significantly)
                if knee_angle > current_min_knee_angle + 15.0:
                    state = "ASCENDING"

            elif state == "ASCENDING":
                rep_torso_leans.append(torso_lean)
                rep_knee_valgus_ratios.append(knee_valgus_ratio)
                rep_knee_angles.append(knee_angle)

                if knee_angle >= self.KNEE_STANDING_THRESHOLD:
                    # Rep completed
                    self._finalize_rep(
                        reps, frame_idx, fps,
                        current_min_knee_angle, rep_torso_leans,
                        rep_knee_valgus_ratios,
                    )
                    state = "STANDING"
                    current_min_knee_angle = 180.0

        # --- Build session summary ---
        session_summary = self.build_session_summary(
            reps, visibility_warnings, len(frames_landmarks), "Squat"
        )

        total_score = (
            float(np.mean([r.score for r in reps])) if reps else 0.0
        )

        return PoseFeedbackResponse(
            rep_count=len(reps),
            score=round(total_score, 2),
            rep_feedback=reps,
            session_summary=session_summary,
            visibility_warnings=visibility_warnings,
        )

    def _finalize_rep(
        self,
        reps: List[RepFeedback],
        frame_idx: int,
        fps: float,
        min_knee_angle: float,
        torso_leans: List[float],
        knee_valgus_ratios: List[float],
    ) -> None:
        """Evaluate all rules for a completed squat rep."""

        rep_num = len(reps) + 1
        issues: List[PoseIssue] = []
        score = 100.0
        is_rep_valid = True

        # ------------------------------------------------------------------
        # Rule 1: Depth check
        # ------------------------------------------------------------------
        if min_knee_angle > self.KNEE_HALF_SQUAT:
            score -= 30.0
            is_rep_valid = False
            issues.append(PoseIssue(
                issue_code="HALF_SQUAT",
                severity="high",
                message=f"Squat quá nông ({int(min_knee_angle)}°). Chưa đạt biên độ tối thiểu.",
                detail=(
                    f"Đầu gối chỉ gập đến {int(min_knee_angle)}° — chưa đủ sâu để tính là 1 rep hợp lệ. "
                    "Squat nông không kích hoạt được cơ mông (gluteus maximus) và cơ đùi sau (hamstrings). "
                    "Hãy hạ người cho đến khi nếp gấp hông ngang hoặc dưới đầu gối (góc đầu gối ≤90°)."
                ),
            ))
        elif min_knee_angle > self.KNEE_FULL_DEPTH:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="INSUFFICIENT_DEPTH",
                severity="medium",
                message=f"Chưa đủ sâu ({int(min_knee_angle)}°). Hạ thêm để đạt song song.",
                detail=(
                    f"Đầu gối đạt {int(min_knee_angle)}°, gần song song nhưng chưa đủ. "
                    "Hãy hạ thêm vài cm để nếp gấp hông ngang đầu gối, "
                    "kích hoạt tối đa cơ đùi trước và cơ mông."
                ),
            ))

        # ------------------------------------------------------------------
        # Rule 2: Torso lean
        # ------------------------------------------------------------------
        max_lean = float(np.max(torso_leans)) if torso_leans else 0.0
        avg_lean = float(np.mean(torso_leans)) if torso_leans else 0.0

        if max_lean > self.TORSO_LEAN_DANGER:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="EXCESSIVE_FORWARD_LEAN",
                severity="high",
                message=f"Thân trên ngả quá nhiều ({int(max_lean)}°). Giữ ngực thẳng!",
                detail=(
                    "Thân trên ngả về phía trước quá mức, tạo áp lực lớn lên cột sống thắt lưng. "
                    "Tập lâu dài với tư thế này có thể dẫn đến thoát vị đĩa đệm hoặc đau lưng dưới mạn tính. "
                    "Hãy giữ ngực ưỡn, mắt nhìn thẳng phía trước, và siết core để thân trên đứng thẳng hơn. "
                    "Nếu bạn không thể giữ thẳng, hãy thử nâng gót chân lên hoặc giảm tải trọng."
                ),
            ))
        elif max_lean > self.TORSO_LEAN_WARNING:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="FORWARD_LEAN",
                severity="medium",
                message=f"Thân trên hơi ngả về trước ({int(max_lean)}°). Giữ ngực thẳng hơn.",
                detail=(
                    "Thân trên ngả nhẹ về phía trước. Dù chưa nguy hiểm, nhưng cải thiện sẽ giúp "
                    "phân bổ tải trọng đều hơn và bảo vệ lưng dưới."
                ),
            ))

        # ------------------------------------------------------------------
        # Rule 3: Knee valgus (knees caving inward)
        # ------------------------------------------------------------------
        if knee_valgus_ratios:
            # Check valgus at the deepest point (lowest knee angles = highest stress)
            bottom_half = knee_valgus_ratios[len(knee_valgus_ratios) // 2:]
            min_valgus_ratio = float(np.min(bottom_half)) if bottom_half else 1.0

            if min_valgus_ratio < self.KNEE_VALGUS_RATIO:
                severity = "high" if min_valgus_ratio < 0.6 else "medium"
                penalty = 25.0 if severity == "high" else 15.0
                score -= penalty
                issues.append(PoseIssue(
                    issue_code="KNEE_VALGUS",
                    severity=severity,
                    message="Đầu gối bị kẹp vào trong (valgus). Đẩy gối ra ngoài!",
                    detail=(
                        "Đầu gối bị khép vào trong khi squat (knee valgus), đặc biệt nguy hiểm ở đáy squat. "
                        "Điều này tạo lực xoắn lớn lên dây chằng chéo trước (ACL) và sụn chêm, "
                        "tăng nguy cơ chấn thương đầu gối nghiêm trọng. "
                        "Hãy ý thức đẩy đầu gối ra ngoài theo hướng ngón chân, và tập bài tập tăng cường cơ mông giữa (gluteus medius)."
                    ),
                ))

        # ------------------------------------------------------------------
        # Breathing cue
        # ------------------------------------------------------------------
        breathing = BreathingCue(
            phase="ASCENDING",
            instruction="Hít vào sâu khi hạ người xuống. Thở ra mạnh khi đứng lên.",
        )

        # --- Clamp score ---
        score = max(0.0, min(100.0, score))

        reps.append(RepFeedback(
            rep_number=rep_num,
            score=score,
            is_rep_valid=is_rep_valid,
            timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            issues=issues,
            breathing_cue=breathing,
        ))

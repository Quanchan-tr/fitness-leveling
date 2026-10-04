from abc import ABC, abstractmethod
from collections import Counter
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set, Tuple

import numpy as np

from app.cv.angle_math import calculate_angle_2d
from app.schemas.response import (
    PoseFeedbackResponse,
    PoseIssue,
    RepFeedback,
    VisibilityWarning,
    SessionSummary,
    BreathingCue,
)

# ---------------------------------------------------------------------------
# EMA state — passed in and out each frame so rule classes stay stateless
# ---------------------------------------------------------------------------

@dataclass
class EmaState:
    """Per-exercise exponential moving average angle state."""
    knee_angle: float = 170.0
    elbow_angle: float = 170.0
    body_alignment: float = 180.0
    lean_angle: float = 0.0

    # EMA smoothing factor: higher = more responsive, lower = smoother
    alpha: float = 0.40

    def update_knee(self, raw: float) -> float:
        self.knee_angle = self.alpha * raw + (1 - self.alpha) * self.knee_angle
        return self.knee_angle

    def update_elbow(self, raw: float) -> float:
        self.elbow_angle = self.alpha * raw + (1 - self.alpha) * self.elbow_angle
        return self.elbow_angle

    def update_body(self, raw: float) -> float:
        self.body_alignment = self.alpha * raw + (1 - self.alpha) * self.body_alignment
        return self.body_alignment

    def update_lean(self, raw: float) -> float:
        self.lean_angle = self.alpha * raw + (1 - self.alpha) * self.lean_angle
        return self.lean_angle


# ---------------------------------------------------------------------------
# Temporal constraint helpers
# ---------------------------------------------------------------------------

# Minimum frames a rep must span (at 30fps: 0.8s = 24 frames)
DEFAULT_MIN_REP_FRAMES = 24
# Minimum frames cooldown between counted reps (at 30fps: 0.5s = 15 frames)
DEFAULT_REP_COOLDOWN_FRAMES = 15


class BasePoseRule(ABC):
    """
    Base class for all exercise-specific pose rules.

    Subclasses implement `process_landmarks_sequence` which evaluates
    a sequence of per-frame landmarks and returns detailed feedback.

    Provides helper methods for:
    - Landmark visibility checking
    - Angle tolerance comparison
    - Session summary generation
    """

    # ---------------------------------------------------------------
    # Visibility helpers
    # ---------------------------------------------------------------

    @staticmethod
    def check_required_landmarks(
        lm: Dict[str, Any],
        required_indices: List[str],
        frame_idx: int,
        fps: float,
    ) -> Tuple[bool, Optional[VisibilityWarning]]:
        """
        Verify that all required landmark indices are present in the frame data.

        Returns:
            (all_present, warning_or_none)
        """
        if not lm:
            return False, VisibilityWarning(
                warning_code="POSE_NOT_DETECTED",
                message="Không phát hiện được tư thế. Hãy đảm bảo toàn bộ cơ thể nằm trong khung hình camera.",
                affected_landmarks=required_indices,
                frame_index=frame_idx,
                timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            )

        missing = [idx for idx in required_indices if idx not in lm]
        if missing:
            # Map landmark indices to human-readable names
            landmark_names = {
                "0": "mũi", "11": "vai trái", "12": "vai phải",
                "13": "khuỷu tay trái", "14": "khuỷu tay phải",
                "15": "cổ tay trái", "16": "cổ tay phải",
                "23": "hông trái", "24": "hông phải",
                "25": "đầu gối trái", "26": "đầu gối phải",
                "27": "mắt cá trái", "28": "mắt cá phải",
            }
            names = [landmark_names.get(idx, f"điểm {idx}") for idx in missing]
            return False, VisibilityWarning(
                warning_code="LANDMARKS_OCCLUDED",
                message=f"Không thấy rõ: {', '.join(names)}. Hãy điều chỉnh góc camera.",
                affected_landmarks=missing,
                frame_index=frame_idx,
                timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            )

        return True, None

    # ---------------------------------------------------------------
    # Angle tolerance helpers
    # ---------------------------------------------------------------

    @staticmethod
    def angle_in_range(angle: float, target: float, tolerance: float) -> bool:
        """Check if an angle is within ±tolerance of a target value."""
        return abs(angle - target) <= tolerance

    @staticmethod
    def angle_exceeds(angle: float, threshold: float) -> bool:
        """Check if an angle exceeds a threshold."""
        return angle > threshold

    @staticmethod
    def angle_below(angle: float, threshold: float) -> bool:
        """Check if an angle is below a threshold."""
        return angle < threshold

    # ---------------------------------------------------------------
    # Session summary builder
    # ---------------------------------------------------------------

    @staticmethod
    def build_session_summary(
        reps: List[RepFeedback],
        visibility_warnings: List[VisibilityWarning],
        total_frames: int,
        exercise_name: str,
    ) -> SessionSummary:
        """
        Build a comprehensive post-session summary from collected rep feedback.
        This is shown AFTER the user finishes exercising.
        """
        valid_reps = [r for r in reps if r.is_rep_valid]
        scores = [r.score for r in reps] if reps else [0.0]
        avg_score = float(np.mean(scores))

        # Grade calculation
        if avg_score >= 90:
            grade = "A"
        elif avg_score >= 75:
            grade = "B"
        elif avg_score >= 60:
            grade = "C"
        elif avg_score >= 40:
            grade = "D"
        else:
            grade = "F"

        # Collect all issues across reps
        all_issues: List[PoseIssue] = []
        for r in reps:
            all_issues.extend(r.issues)

        # Find most common issues
        issue_counter = Counter(i.issue_code for i in all_issues)
        common_issue_codes = [code for code, _ in issue_counter.most_common(5)]

        # Deduplicate — keep the richest PoseIssue for each common code
        seen_codes: Set[str] = set()
        common_issues: List[PoseIssue] = []
        for issue in all_issues:
            if issue.issue_code in common_issue_codes and issue.issue_code not in seen_codes:
                seen_codes.add(issue.issue_code)
                common_issues.append(issue)

        # Strengths — identify what went well
        strengths: List[str] = []
        if len(valid_reps) == len(reps) and reps:
            strengths.append(f"Tất cả {len(reps)} rep đều đạt tiêu chuẩn biên độ.")
        elif valid_reps:
            strengths.append(f"{len(valid_reps)}/{len(reps)} rep đạt tiêu chuẩn biên độ.")

        perfect_reps = [r for r in reps if r.score >= 95]
        if len(perfect_reps) >= len(reps) * 0.5 and reps:
            strengths.append("Form tập tốt, giữ vững kỹ thuật ổn định.")

        if not common_issues:
            strengths.append("Không phát hiện lỗi kỹ thuật nào. Tuyệt vời!")

        # Improvement areas — detailed post-session tips with injury context
        improvement_areas: List[str] = []
        for issue in common_issues:
            if issue.detail:
                improvement_areas.append(issue.detail)
            else:
                improvement_areas.append(issue.message)

        # Visibility note
        visibility_note = None
        if visibility_warnings:
            occluded_count = sum(1 for w in visibility_warnings if w.warning_code == "LANDMARKS_OCCLUDED")
            not_detected_count = sum(1 for w in visibility_warnings if w.warning_code == "POSE_NOT_DETECTED")
            parts = []
            if not_detected_count:
                parts.append(f"{not_detected_count} frame không phát hiện được tư thế")
            if occluded_count:
                parts.append(f"{occluded_count} frame bị che khuất một phần")
            visibility_note = (
                f"Cảnh báo camera: {', '.join(parts)}. "
                "Hãy đặt camera xa hơn và đảm bảo ánh sáng đủ để có kết quả chính xác hơn."
            )

        return SessionSummary(
            total_reps=len(reps),
            valid_reps=len(valid_reps),
            average_score=round(avg_score, 2),
            overall_grade=grade,
            strengths=strengths,
            improvement_areas=improvement_areas,
            common_issues=common_issues,
            visibility_note=visibility_note,
        )

    # ---------------------------------------------------------------
    # Abstract interface
    # ---------------------------------------------------------------

    @abstractmethod
    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:
        """
        Process a sequence of extracted 33 MediaPipe landmarks per frame
        and return evaluated reps & issues.
        """
        pass

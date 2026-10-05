from abc import ABC, abstractmethod
from collections import Counter
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Set, Tuple

import numpy as np

from app.schemas.response import (
    PoseFeedbackResponse,
    PoseIssue,
    RepFeedback,
    RepStatus,
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
    alpha: float = 0.40

    def _smooth(self, current: float, raw: float) -> float:
        return self.alpha * raw + (1.0 - self.alpha) * current

    def update_knee(self, raw: float) -> float:
        self.knee_angle = self._smooth(self.knee_angle, raw)
        return self.knee_angle

    def update_elbow(self, raw: float) -> float:
        self.elbow_angle = self._smooth(self.elbow_angle, raw)
        return self.elbow_angle

    def update_body(self, raw: float) -> float:
        self.body_alignment = self._smooth(self.body_alignment, raw)
        return self.body_alignment

    def update_lean(self, raw: float) -> float:
        self.lean_angle = self._smooth(self.lean_angle, raw)
        return self.lean_angle


# ---------------------------------------------------------------------------
# Temporal constraint helpers
# ---------------------------------------------------------------------------

DEFAULT_MIN_REP_FRAMES = 24       # at 30fps: 0.8s
DEFAULT_REP_COOLDOWN_FRAMES = 15  # at 30fps: 0.5s


class BasePoseRule(ABC):
    """Base class for all exercise-specific pose rules."""

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
        """Verify that all required landmark indices are present in the frame data."""
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
    # Rep evaluation helpers
    # ---------------------------------------------------------------

    @staticmethod
    def classify_rep(
        is_rom_sufficient: bool,
        score: float,
        issues: List[PoseIssue],
        rom_issue_codes: Set[str] = ("HALF_SQUAT", "HALF_REP"),
    ) -> Tuple[RepStatus, bool]:
        """Classify rep into GOOD_REP, BAD_FORM, or NO_REP."""
        if not is_rom_sufficient:
            return RepStatus.NO_REP, False
        has_high_severity = any(
            i.severity == "high" for i in issues if i.issue_code not in rom_issue_codes
        )
        if has_high_severity or score < 75.0:
            return RepStatus.BAD_FORM, True
        return RepStatus.GOOD_REP, True

    def build_rep_response(
        self,
        reps: List[RepFeedback],
        visibility_warnings: List[VisibilityWarning],
        total_frames: int,
        exercise_name: str = "",
    ) -> PoseFeedbackResponse:
        """Build PoseFeedbackResponse for rep-based exercises."""
        session_summary = self.build_session_summary(
            reps, visibility_warnings, total_frames, exercise_name
        )
        avg_score = float(np.mean([r.score for r in reps])) if reps else 0.0
        return PoseFeedbackResponse(
            rep_count=len(reps),
            valid_rep_count=sum(1 for r in reps if r.is_rep_valid),
            good_rep_count=sum(1 for r in reps if r.status == RepStatus.GOOD_REP),
            score=round(avg_score, 2),
            rep_feedback=reps,
            session_summary=session_summary,
            visibility_warnings=visibility_warnings,
        )


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
        good_reps = [r for r in reps if r.status == RepStatus.GOOD_REP]
        bad_form_reps = [r for r in reps if r.status == RepStatus.BAD_FORM]
        no_reps = [r for r in reps if r.status == RepStatus.NO_REP]
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
        all_issues = [i for r in reps for i in r.issues]

        # Find most common issues (keep richest PoseIssue for each code)
        top_codes = {code for code, _ in Counter(i.issue_code for i in all_issues).most_common(5)}
        seen_codes: Set[str] = set()
        common_issues: List[PoseIssue] = []
        for issue in all_issues:
            if issue.issue_code in top_codes and issue.issue_code not in seen_codes:
                seen_codes.add(issue.issue_code)
                common_issues.append(issue)


        # Strengths — identify what went well
        strengths: List[str] = []
        if len(good_reps) == len(reps) and reps:
            strengths.append(f"Xuất sắc! Tất cả {len(reps)} rep đều chuẩn form và đạt biên độ.")
        elif len(valid_reps) == len(reps) and reps:
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
        if bad_form_reps:
            improvement_areas.append(f"{len(bad_form_reps)} rep hoàn thành nhưng sai kỹ thuật form. Cần chỉnh lại tư thế.")
        if no_reps:
            improvement_areas.append(f"{len(no_reps)} rep bị tính NO REP do chưa đạt biên độ (cần hạ sâu hơn).")

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
            good_reps=len(good_reps),
            bad_form_reps=len(bad_form_reps),
            no_reps=len(no_reps),
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

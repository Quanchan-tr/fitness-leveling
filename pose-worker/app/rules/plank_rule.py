"""
plank_rule.py — Comprehensive plank form analysis.

Evaluates multiple biomechanical rules across the entire hold:
1. Body alignment (shoulder-hip-ankle should form ~180° straight line)
2. Hip sag (lower back hyperextension — injury risk)
3. Hip pike (butt too high — reduces effectiveness)
4. Head/neck alignment (avoid excessive head drop or craning up)
5. Arm position (elbow-shoulder alignment for forearm plank)
6. Breathing guidance (steady breathing throughout hold)

Visibility: checks all required landmarks each frame, emits VisibilityWarning if occluded.
Post-session: detailed SessionSummary with form statistics over the hold duration.
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


class PlankRule(BasePoseRule):
    """
    Multi-rule plank evaluator.

    MediaPipe landmark indices used:
      0  = NOSE
      11 = LEFT_SHOULDER     12 = RIGHT_SHOULDER
      13 = LEFT_ELBOW        14 = RIGHT_ELBOW
      23 = LEFT_HIP          24 = RIGHT_HIP
      27 = LEFT_ANKLE        28 = RIGHT_ANKLE
    """

    # Landmarks required for plank evaluation
    REQUIRED_LANDMARKS = ["11", "23", "27"]

    # --- Thresholds ---
    # Body alignment: shoulder-hip-ankle angle
    BODY_ALIGNMENT_IDEAL = 180.0
    BODY_ALIGNMENT_TOLERANCE = 15.0   # ±15° is acceptable
    BODY_SAG_THRESHOLD = 165.0        # Below this = hips sagging
    BODY_SAG_SEVERE = 150.0           # Below this = severe sag
    BODY_PIKE_THRESHOLD = 195.0       # Above this = hips piking
    BODY_PIKE_SEVERE = 210.0          # Above this = severe pike

    # Head alignment
    HEAD_DROP_THRESHOLD = 40.0         # Excessive head drop

    # Minimum hold time to count as a valid plank (seconds)
    MIN_HOLD_SEC = 5.0

    # Frame ratio thresholds — what % of frames must be "bad" to trigger warning
    SAG_RATIO_WARNING = 0.10          # 10% of frames sagging = warning
    SAG_RATIO_SEVERE = 0.30           # 30% of frames sagging = severe
    PIKE_RATIO_WARNING = 0.10
    PIKE_RATIO_SEVERE = 0.30

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:

        visibility_warnings: List[VisibilityWarning] = []

        # Per-frame tracking
        total_valid_frames = 0
        body_alignments: List[float] = []
        head_drops: List[float] = []

        # Issue frame counters
        sagging_frames = 0
        severe_sagging_frames = 0
        piking_frames = 0
        severe_piking_frames = 0
        head_drop_frames = 0

        # Track when form breaks down over time
        sag_streak = 0
        max_sag_streak = 0
        alignment_over_time: List[float] = []  # For detecting fatigue pattern

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
            shoulder = np.array([lm["11"]["x"], lm["11"]["y"]])
            hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            ankle = np.array([lm["27"]["x"], lm["27"]["y"]])

            # Optional
            nose = np.array([lm["0"]["x"], lm["0"]["y"]]) if "0" in lm else None
            elbow = np.array([lm["13"]["x"], lm["13"]["y"]]) if "13" in lm else None

            # --- Calculate angles ---
            body_alignment = calculate_angle_2d(shoulder, hip, ankle)
            body_alignments.append(body_alignment)
            total_valid_frames += 1

            # Head drop
            head_drop = 0.0
            if nose is not None:
                head_drop = calculate_vertical_angle(nose, shoulder)
            head_drops.append(head_drop)

            # --- Classify this frame ---
            if body_alignment < self.BODY_SAG_SEVERE:
                severe_sagging_frames += 1
                sagging_frames += 1
                sag_streak += 1
            elif body_alignment < self.BODY_SAG_THRESHOLD:
                sagging_frames += 1
                sag_streak += 1
            elif body_alignment > self.BODY_PIKE_SEVERE:
                severe_piking_frames += 1
                piking_frames += 1
                sag_streak = 0
            elif body_alignment > self.BODY_PIKE_THRESHOLD:
                piking_frames += 1
                sag_streak = 0
            else:
                sag_streak = 0

            max_sag_streak = max(max_sag_streak, sag_streak)

            if head_drop > self.HEAD_DROP_THRESHOLD:
                head_drop_frames += 1

            alignment_over_time.append(body_alignment)

        # --- Compute hold duration ---
        hold_duration_sec = round(total_valid_frames / max(fps, 1.0), 1)
        is_valid_hold = hold_duration_sec >= self.MIN_HOLD_SEC

        # --- Evaluate rules ---
        issues: List[PoseIssue] = []
        score = 100.0

        if total_valid_frames == 0:
            # No valid frames at all
            visibility_warnings.append(VisibilityWarning(
                warning_code="NO_VALID_FRAMES",
                message="Không có frame nào phát hiện được tư thế plank. Hãy kiểm tra lại camera.",
                affected_landmarks=self.REQUIRED_LANDMARKS,
            ))
            return PoseFeedbackResponse(
                rep_count=0,
                score=0.0,
                rep_feedback=[],
                session_summary=self.build_session_summary(
                    [], visibility_warnings, len(frames_landmarks), "Plank"
                ),
                visibility_warnings=visibility_warnings,
            )

        # ------------------------------------------------------------------
        # Rule 1: Hip sagging
        # ------------------------------------------------------------------
        sag_ratio = sagging_frames / total_valid_frames
        severe_sag_ratio = severe_sagging_frames / total_valid_frames

        if severe_sag_ratio > self.SAG_RATIO_SEVERE:
            score -= 30.0
            issues.append(PoseIssue(
                issue_code="HIPS_SAGGING_SEVERE",
                severity="high",
                message=f"Hông bị võng nghiêm trọng ({int(severe_sag_ratio * 100)}% thời gian). Siết cơ bụng!",
                detail=(
                    "Lưng dưới bị ưỡn quá mức (hyperextension) trong phần lớn thời gian giữ plank. "
                    "Điều này đặt áp lực rất lớn lên cột sống thắt lưng và đĩa đệm, "
                    "có thể dẫn đến đau lưng dưới mạn tính hoặc thoát vị đĩa đệm. "
                    "Hãy tưởng tượng kéo rốn vào phía cột sống, siết chặt cơ mông, "
                    "và giữ cơ thể thẳng như một tấm ván."
                ),
            ))
        elif sag_ratio > self.SAG_RATIO_WARNING:
            score -= 20.0
            issues.append(PoseIssue(
                issue_code="HIPS_SAGGING",
                severity="medium",
                message=f"Hông bị võng ({int(sag_ratio * 100)}% thời gian). Kéo rốn vào trong.",
                detail=(
                    "Hông bắt đầu xệ xuống, đặc biệt khi mệt. "
                    "Hãy siết cơ core và tưởng tượng giữ cơ thể thẳng từ đầu đến gót chân."
                ),
            ))

        # ------------------------------------------------------------------
        # Rule 2: Hip piking
        # ------------------------------------------------------------------
        pike_ratio = piking_frames / total_valid_frames

        if pike_ratio > self.PIKE_RATIO_SEVERE:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="HIPS_PIKING_SEVERE",
                severity="high",
                message=f"Hông nhô lên quá cao ({int(pike_ratio * 100)}% thời gian). Hạ hông xuống.",
                detail=(
                    "Mông nhô lên cao tạo thành hình chữ V thay vì đường thẳng. "
                    "Tuy giảm áp lực lên lưng nhưng cũng giảm đáng kể hiệu quả tập cơ core. "
                    "Hãy hạ hông xuống ngang thân, giữ cơ thể thẳng."
                ),
            ))
        elif pike_ratio > self.PIKE_RATIO_WARNING:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="HIPS_PIKING",
                severity="medium",
                message=f"Hông hơi nhô lên ({int(pike_ratio * 100)}% thời gian). Hạ hông xuống ngang thân.",
                detail=(
                    "Hông nhô lên nhẹ, giảm hiệu quả tập luyện cho cơ bụng. "
                    "Hạ hông xuống để cơ thể tạo thành đường thẳng."
                ),
            ))

        # ------------------------------------------------------------------
        # Rule 3: Head/neck alignment
        # ------------------------------------------------------------------
        if head_drops:
            head_drop_ratio = head_drop_frames / total_valid_frames
            if head_drop_ratio > 0.15:
                score -= 10.0
                issues.append(PoseIssue(
                    issue_code="HEAD_DROPPING",
                    severity="low",
                    message="Đầu cúi xuống quá nhiều. Giữ cổ thẳng hàng với cột sống.",
                    detail=(
                        "Đầu cúi xuống quá mức gây căng cơ cổ và phá vỡ đường thẳng của cơ thể. "
                        "Hãy nhìn xuống sàn ngay phía trước tay, giữ cổ ở vị trí trung tính (neutral)."
                    ),
                ))

        # ------------------------------------------------------------------
        # Rule 4: Fatigue detection — form deteriorating over time
        # ------------------------------------------------------------------
        if len(alignment_over_time) > 20:
            first_quarter = alignment_over_time[:len(alignment_over_time) // 4]
            last_quarter = alignment_over_time[-len(alignment_over_time) // 4:]

            avg_first = float(np.mean(first_quarter))
            avg_last = float(np.mean(last_quarter))

            # If form degraded significantly (alignment dropped by >10°)
            if avg_first - avg_last > 10.0:
                score -= 10.0
                issues.append(PoseIssue(
                    issue_code="FATIGUE_FORM_BREAKDOWN",
                    severity="medium",
                    message="Form suy giảm rõ rệt ở cuối bài. Cơ core đang mệt.",
                    detail=(
                        "Tư thế tốt ở đầu nhưng xấu dần khi mệt — điều này rất phổ biến. "
                        "Hãy kết thúc plank TRƯỚC khi form bị phá vỡ thay vì cố gắng giữ bằng mọi giá. "
                        "Giữ 30 giây với form tốt tốt hơn giữ 60 giây với form xấu."
                    ),
                ))

        # --- Breathing cue ---
        breathing = BreathingCue(
            phase="HOLD",
            instruction="Thở đều và liên tục. Hít vào bằng mũi, thở ra bằng miệng. KHÔNG nín thở.",
        )

        # --- Clamp score ---
        score = max(0.0, min(100.0, score))

        rep = RepFeedback(
            rep_number=1,
            score=score,
            is_rep_valid=is_valid_hold,
            timestamp_sec=hold_duration_sec,
            issues=issues,
            breathing_cue=breathing,
        )

        reps = [rep]

        # --- Build session summary ---
        session_summary = self.build_session_summary(
            reps, visibility_warnings, len(frames_landmarks), "Plank"
        )

        # Add plank-specific stats to summary
        if is_valid_hold:
            session_summary.strengths.insert(
                0, f"Giữ plank được {hold_duration_sec}s."
            )
        else:
            session_summary.improvement_areas.insert(
                0, f"Thời gian giữ chỉ {hold_duration_sec}s — cần tối thiểu {self.MIN_HOLD_SEC}s."
            )

        return PoseFeedbackResponse(
            rep_count=1 if is_valid_hold else 0,
            score=score,
            rep_feedback=reps,
            session_summary=session_summary,
            visibility_warnings=visibility_warnings,
        )

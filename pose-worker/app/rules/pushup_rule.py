"""
pushup_rule.py — Comprehensive push-up form analysis.

Evaluates multiple biomechanical rules per rep:
1. Body alignment (shoulder-hip-ankle should form ~180° straight line, ±15° tolerance)
2. Elbow flare angle (upper arm vs. torso — ideal ~45°, warning at ~80-90° = T-shape)
3. Depth (elbow angle at bottom — must reach ≤90° for full ROM)
4. Head/neck alignment (ear-shoulder angle, avoid excessive head drop)
5. Breathing cues (inhale on descent, exhale on push-up)

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


class PushupRule(BasePoseRule):
    """
    Multi-rule push-up evaluator.

    MediaPipe landmark indices used:
      0  = NOSE
      11 = LEFT_SHOULDER     12 = RIGHT_SHOULDER
      13 = LEFT_ELBOW        14 = RIGHT_ELBOW
      15 = LEFT_WRIST        16 = RIGHT_WRIST
      23 = LEFT_HIP          24 = RIGHT_HIP
      27 = LEFT_ANKLE        28 = RIGHT_ANKLE
    """

    # Landmarks required for full push-up evaluation
    REQUIRED_LANDMARKS = ["11", "13", "15", "23", "27"]

    # --- Thresholds with tolerances ---
    # Body alignment: shoulder-hip-ankle angle
    BODY_ALIGNMENT_IDEAL = 180.0
    BODY_ALIGNMENT_TOLERANCE = 15.0  # ±15° is acceptable
    BODY_SAG_THRESHOLD = 160.0       # Below this = hips sagging
    BODY_PIKE_THRESHOLD = 200.0      # Above this = hips piking

    # Elbow angle thresholds for state transitions
    ELBOW_TOP_THRESHOLD = 155.0      # Above this = arms extended (top position)
    ELBOW_DESCEND_THRESHOLD = 140.0  # Below this = entering descent
    ELBOW_FULL_DEPTH = 90.0          # At or below this = full depth achieved
    ELBOW_HALF_REP_MIN = 120.0       # Above this at bottom = half rep / head bobbing

    # Elbow flare: angle between upper-arm vector and torso vector
    ELBOW_FLARE_IDEAL = 45.0
    ELBOW_FLARE_WARNING = 70.0       # Getting wide
    ELBOW_FLARE_DANGER = 80.0        # T-shape, injury risk

    # Head alignment: nose-shoulder vs vertical
    HEAD_DROP_THRESHOLD = 35.0       # Excessive head drop angle

    def _calculate_elbow_flare(
        self,
        shoulder: np.ndarray,
        elbow: np.ndarray,
        hip: np.ndarray,
    ) -> float:
        """
        Calculate the angle between the upper arm and the torso.
        This represents how much the elbow flares out from the body.

        Ideal push-up: ~45° (diamond to shoulder-width)
        Dangerous: ~90° (T-shape, stresses rotator cuff)
        """
        return calculate_angle_2d(elbow, shoulder, hip)

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:

        reps: List[RepFeedback] = []
        visibility_warnings: List[VisibilityWarning] = []

        state = "TOP"  # TOP -> DESCENDING -> BOTTOM -> TOP
        current_min_elbow = 180.0
        rep_body_alignments: List[float] = []
        rep_elbow_flares: List[float] = []
        rep_head_drops: List[float] = []
        rep_start_frame = 0

        # Consecutive frame counters for visibility
        consecutive_missing = 0
        MAX_CONSECUTIVE_MISSING = 10  # ~0.33s at 30fps

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
            elbow = np.array([lm["13"]["x"], lm["13"]["y"]])
            wrist = np.array([lm["15"]["x"], lm["15"]["y"]])
            hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            ankle = np.array([lm["27"]["x"], lm["27"]["y"]])

            # Optional landmarks
            nose = np.array([lm["0"]["x"], lm["0"]["y"]]) if "0" in lm else None

            # --- Calculate angles ---
            elbow_angle = calculate_angle_2d(shoulder, elbow, wrist)
            body_alignment = calculate_angle_2d(shoulder, hip, ankle)
            elbow_flare = self._calculate_elbow_flare(shoulder, elbow, hip)

            # Head drop: angle between nose-shoulder line and vertical
            head_drop = 0.0
            if nose is not None:
                head_drop = calculate_vertical_angle(nose, shoulder)

            # --- State machine ---
            if state == "TOP":
                if elbow_angle < self.ELBOW_DESCEND_THRESHOLD:
                    state = "DESCENDING"
                    rep_start_frame = frame_idx
                    current_min_elbow = elbow_angle
                    rep_body_alignments = [body_alignment]
                    rep_elbow_flares = [elbow_flare]
                    rep_head_drops = [head_drop]

            elif state == "DESCENDING":
                current_min_elbow = min(current_min_elbow, elbow_angle)
                rep_body_alignments.append(body_alignment)
                rep_elbow_flares.append(elbow_flare)
                rep_head_drops.append(head_drop)

                if elbow_angle >= self.ELBOW_TOP_THRESHOLD:
                    # Completed a rep (went down and came back up)
                    self._finalize_rep(
                        reps, frame_idx, fps,
                        current_min_elbow, rep_body_alignments,
                        rep_elbow_flares, rep_head_drops, state="ASCENDING"
                    )
                    state = "TOP"
                    current_min_elbow = 180.0

            # Note: we don't need an explicit BOTTOM state — we just track
            # the minimum elbow angle throughout the descent+ascent.

        # --- Build session summary ---
        session_summary = self.build_session_summary(
            reps, visibility_warnings, len(frames_landmarks), "Push-up"
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
        min_elbow_angle: float,
        body_alignments: List[float],
        elbow_flares: List[float],
        head_drops: List[float],
        state: str,
    ) -> None:
        """Evaluate all rules for a completed rep and append to reps list."""

        rep_num = len(reps) + 1
        issues: List[PoseIssue] = []
        score = 100.0
        is_rep_valid = True

        # ------------------------------------------------------------------
        # Rule 1: Depth check — did the elbow reach ≤90°?
        # ------------------------------------------------------------------
        if min_elbow_angle > self.ELBOW_HALF_REP_MIN:
            # Barely moved — head bobbing or minimal descent
            score -= 35.0
            is_rep_valid = False
            issues.append(PoseIssue(
                issue_code="HALF_REP",
                severity="high",
                message=f"Biên độ quá nhỏ (khuỷu tay {int(min_elbow_angle)}°). Rep không hợp lệ.",
                detail=(
                    "Bạn chỉ nhấp nhô nửa đường hoặc gật đầu xuống sàn thay vì hạ toàn bộ thân trên. "
                    "Biên độ không đủ khiến bài tập kém hiệu quả và không kích hoạt được cơ ngực, cơ tay sau đúng mức. "
                    "Hãy hạ người xuống cho đến khi khuỷu tay tạo góc khoảng 90° hoặc ngực gần chạm sàn."
                ),
            ))
        elif min_elbow_angle > self.ELBOW_FULL_DEPTH:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="INSUFFICIENT_DEPTH",
                severity="medium",
                message=f"Chưa đủ sâu (khuỷu tay {int(min_elbow_angle)}°). Cố gắng hạ xuống ~90°.",
                detail=(
                    f"Khuỷu tay chỉ đạt {int(min_elbow_angle)}° thay vì 90° trở xuống. "
                    "Hạ người sâu hơn để kích hoạt tối đa cơ ngực và cơ tay sau (triceps)."
                ),
            ))

        # ------------------------------------------------------------------
        # Rule 2: Body alignment — is the body a straight line?
        # ------------------------------------------------------------------
        avg_alignment = float(np.mean(body_alignments)) if body_alignments else 180.0
        min_alignment = float(np.min(body_alignments)) if body_alignments else 180.0
        max_alignment = float(np.max(body_alignments)) if body_alignments else 180.0

        if min_alignment < self.BODY_SAG_THRESHOLD:
            sag_severity = "high" if min_alignment < 150.0 else "medium"
            penalty = 25.0 if sag_severity == "high" else 15.0
            score -= penalty
            issues.append(PoseIssue(
                issue_code="HIPS_SAGGING",
                severity=sag_severity,
                message=f"Hông bị võng ({int(min_alignment)}°). Siết cơ bụng và mông.",
                detail=(
                    "Hông bị xệ xuống khiến cột sống thắt lưng bị ưỡn quá mức (hyperextension). "
                    "Điều này tạo áp lực lớn lên đĩa đệm cột sống, có thể dẫn đến đau lưng dưới mạn tính. "
                    "Hãy siết chặt cơ core (bụng + mông) để giữ cơ thể thẳng như một tấm ván từ đầu đến gót chân."
                ),
            ))
        elif max_alignment > self.BODY_PIKE_THRESHOLD:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="HIPS_PIKING",
                severity="medium",
                message=f"Hông nhô lên quá cao ({int(max_alignment)}°). Hạ hông xuống ngang thân.",
                detail=(
                    "Hông nhô lên cao khiến tải trọng dồn về vai thay vì phân bổ đều, "
                    "giảm hiệu quả tập luyện cho cơ ngực. Hạ hông xuống sao cho cơ thể "
                    "tạo thành đường thẳng từ đầu đến gót chân."
                ),
            ))

        # ------------------------------------------------------------------
        # Rule 3: Elbow flare — T-shape detection
        # ------------------------------------------------------------------
        avg_flare = float(np.mean(elbow_flares)) if elbow_flares else 45.0
        max_flare = float(np.max(elbow_flares)) if elbow_flares else 45.0

        if max_flare > self.ELBOW_FLARE_DANGER:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="ELBOW_FLARE_T_SHAPE",
                severity="high",
                message=f"Khuỷu tay xòe ngang {int(max_flare)}° — tư thế chữ T nguy hiểm!",
                detail=(
                    "Cánh tay xòe ngang tạo thành hình chữ T so với thân người (góc ~90°). "
                    "Tư thế này gây áp lực cực lớn lên khớp vai và chóp xoay (rotator cuff), "
                    "dễ dẫn đến viêm gân, rách chóp xoay hoặc trật khớp vai. "
                    "Hãy khép khuỷu tay vào khoảng 45° so với thân — tạo hình mũi tên (↑) thay vì chữ T."
                ),
            ))
        elif max_flare > self.ELBOW_FLARE_WARNING:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="ELBOW_FLARE_WIDE",
                severity="medium",
                message=f"Khuỷu tay hơi xòe rộng ({int(max_flare)}°). Khép vào khoảng 45°.",
                detail=(
                    f"Khuỷu tay đang ở góc {int(max_flare)}° so với thân, hơi rộng. "
                    "Tuy chưa nguy hiểm nhưng nếu duy trì lâu dài có thể gây mỏi khớp vai. "
                    "Mục tiêu lý tưởng: khoảng 45° — tạo hình mũi tên."
                ),
            ))

        # ------------------------------------------------------------------
        # Rule 4: Head/neck alignment
        # ------------------------------------------------------------------
        avg_head_drop = float(np.mean(head_drops)) if head_drops else 0.0
        if avg_head_drop > self.HEAD_DROP_THRESHOLD and head_drops:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="HEAD_DROPPING",
                severity="low",
                message="Đầu cúi xuống quá nhiều. Giữ đầu thẳng hàng với cột sống.",
                detail=(
                    "Khi hít đất, đầu nên giữ thẳng hàng với cột sống — nhìn xuống sàn "
                    "cách tay khoảng 15-20cm phía trước. Cúi đầu quá mức gây căng cơ cổ "
                    "và phá vỡ sự thẳng hàng của cơ thể."
                ),
            ))

        # ------------------------------------------------------------------
        # Breathing cue
        # ------------------------------------------------------------------
        breathing = BreathingCue(
            phase="ASCENDING",
            instruction="Thở ra khi đẩy lên. Hít vào khi hạ người xuống.",
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

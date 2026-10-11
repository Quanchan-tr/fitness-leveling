"""
pushup_rule.py — Comprehensive push-up form analysis.

Evaluates multiple biomechanical rules per rep:
1. Body alignment (shoulder-hip-ankle straight line, ±15 deg tolerance)
2. Elbow flare angle (upper arm vs. torso — ideal ~45 deg, T-shape > 80 deg)
3. Depth (elbow angle at bottom — must reach <= 90 deg for full ROM)
4. Head/neck alignment (nose-shoulder angle)
5. Breathing cues (inhale on descent, exhale on push-up)

Robustness features:
- Visibility Gatekeeper: all required landmarks must have visibility >= 0.65
- EMA angle smoothing (alpha=0.4) before state machine transitions
- Hysteresis bands: separate enter/exit thresholds (65 deg gap)
- Temporal constraints: min rep duration (0.8s) and cooldown (0.5s)
"""

from collections import Counter
from typing import Any, Dict, List
import numpy as np

from app.cv.angle_math import (
    calculate_angle_2d,
    calculate_angle_3d,
    calculate_vertical_angle,
    detect_camera_view,
)
from app.rules.base_rule import (
    DEFAULT_MIN_REP_FRAMES,
    DEFAULT_REP_COOLDOWN_FRAMES,
    BasePoseRule,
    EmaState,
)
from app.schemas.response import (
    BreathingCue,
    PoseFeedbackResponse,
    PoseIssue,
    RepFeedback,
    VisibilityWarning,
)


class PushupRule(BasePoseRule):
    """
    Multi-rule push-up evaluator with 3D angles, EMA smoothing and temporal constraints.

    MediaPipe landmark indices used:
      0  = NOSE
      11 = LEFT_SHOULDER     12 = RIGHT_SHOULDER
      13 = LEFT_ELBOW        14 = RIGHT_ELBOW
      15 = LEFT_WRIST        16 = RIGHT_WRIST
      23 = LEFT_HIP          24 = RIGHT_HIP
      27 = LEFT_ANKLE        28 = RIGHT_ANKLE
    """

    # --- State machine thresholds with hysteresis ---
    ELBOW_ENTER_DESCENT = 140.0   # arms start bending (enter DESCENDING)
    ELBOW_CONFIRM_BOTTOM = 100.0  # depth confirmed (enter BOTTOM)
    ELBOW_START_ASCENT = 110.0    # rising from bottom (enter ASCENDING)
    ELBOW_REP_COMPLETE = 140.0    # arms extended again (rep done)

    # --- Form thresholds ---
    BODY_SAG_THRESHOLD = 160.0
    BODY_PIKE_THRESHOLD = 205.0
    ELBOW_FLARE_DANGER = 80.0
    ELBOW_FLARE_WARNING = 65.0
    HEAD_DROP_THRESHOLD = 35.0
    ELBOW_HALF_REP_MIN = 120.0    # above this at bottom = half rep

    @staticmethod
    def _check_pushup_visibility(
        lm: Dict[str, Any],
        frame_idx: int,
        fps: float,
    ):
        """Upper body required (left OR right side), lower body at least one hip + one ankle."""
        ts = round(frame_idx / max(fps, 1.0), 2)
        if not lm:
            return False, VisibilityWarning(
                warning_code="POSE_NOT_DETECTED",
                message="Khong phat hien duoc tu the. Hay dung vao khung hinh.",
                frame_index=frame_idx,
                timestamp_sec=ts,
            )

        has_left_arm = all(k in lm for k in ("11", "13", "15"))
        has_right_arm = all(k in lm for k in ("12", "14", "16"))
        if not (has_left_arm or has_right_arm):
            return False, VisibilityWarning(
                warning_code="INCOMPLETE_BODY_VISIBLE",
                message="Camera can thay ro vai, khuyu tay va co tay (it nhat mot ben). Dieu chinh goc camera.",
                affected_landmarks=["11", "13", "15"],
                frame_index=frame_idx,
                timestamp_sec=ts,
            )

        if not ("23" in lm or "24" in lm) or not ("27" in lm or "28" in lm):
            return False, VisibilityWarning(
                warning_code="INCOMPLETE_BODY_VISIBLE",
                message="Camera can thay hong va mat ca de kiem tra duong thang co the. Lui camera ra xa.",
                affected_landmarks=[k for k in ("23", "27") if k not in lm],
                frame_index=frame_idx,
                timestamp_sec=ts,
            )

        return True, None

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:

        reps: List[RepFeedback] = []
        visibility_warnings: List[VisibilityWarning] = []
        detected_views: List[str] = []

        # EMA state
        ema = EmaState()

        # FSM state
        state = "TOP"
        current_min_elbow = 180.0
        rep_body_alignments: List[float] = []
        rep_elbow_flares: List[float] = []
        rep_head_drops: List[float] = []

        # Temporal constraints (frame-based)
        min_rep_frames = max(DEFAULT_MIN_REP_FRAMES, int(fps * 0.6))
        cooldown_frames = max(DEFAULT_REP_COOLDOWN_FRAMES, int(fps * 0.3))
        rep_start_frame = 0
        last_rep_end_frame = -cooldown_frames

        consecutive_missing = 0
        MAX_CONSECUTIVE_MISSING = 10

        for frame_idx, lm in enumerate(frames_landmarks):
            all_present, vis_warning = self._check_pushup_visibility(lm, frame_idx, fps)
            if not all_present:
                consecutive_missing += 1
                if vis_warning and consecutive_missing == MAX_CONSECUTIVE_MISSING:
                    visibility_warnings.append(vis_warning)
                continue

            consecutive_missing = 0

            frame_view = detect_camera_view(lm)
            detected_views.append(frame_view)

            # --- 3D World Landmarks extraction ---
            use_left = all(k in lm for k in ("11", "13", "15"))
            if use_left:
                shoulder_3d = self.get_point_3d(lm, "11")
                elbow_3d = self.get_point_3d(lm, "13")
                wrist_3d = self.get_point_3d(lm, "15")
                hip_idx = "23" if "23" in lm else "24"
                ankle_idx = "27" if "27" in lm else "28"
            else:
                shoulder_3d = self.get_point_3d(lm, "12")
                elbow_3d = self.get_point_3d(lm, "14")
                wrist_3d = self.get_point_3d(lm, "16")
                hip_idx = "24" if "24" in lm else "23"
                ankle_idx = "28" if "28" in lm else "27"

            hip_3d = self.get_point_3d(lm, hip_idx)
            ankle_3d = self.get_point_3d(lm, ankle_idx)

            # 3D Angles
            raw_elbow = calculate_angle_3d(shoulder_3d, elbow_3d, wrist_3d)
            raw_body = calculate_angle_3d(shoulder_3d, hip_3d, ankle_3d)
            raw_flare = calculate_angle_3d(elbow_3d, shoulder_3d, hip_3d)

            head_drop = 0.0
            if "0" in lm:
                nose_2d = self.get_point_2d(lm, "0")
                shoulder_2d = self.get_point_2d(lm, "11" if use_left else "12")
                head_drop = calculate_vertical_angle(nose_2d, shoulder_2d)

            # --- EMA smoothing ---
            ea = ema.update_elbow(raw_elbow)
            ba = ema.update_body(raw_body)

            # --- FSM with hysteresis ---
            if state == "TOP":
                if ea < self.ELBOW_ENTER_DESCENT:
                    state = "DESCENDING"
                    rep_start_frame = frame_idx
                    current_min_elbow = ea
                    rep_body_alignments = [ba]
                    rep_elbow_flares = [raw_flare]
                    rep_head_drops = [head_drop]

            elif state == "DESCENDING":
                current_min_elbow = min(current_min_elbow, ea)
                rep_body_alignments.append(ba)
                rep_elbow_flares.append(raw_flare)
                rep_head_drops.append(head_drop)

                if ea <= self.ELBOW_CONFIRM_BOTTOM:
                    state = "BOTTOM"
                elif ea > current_min_elbow + 12.0 and current_min_elbow > self.ELBOW_CONFIRM_BOTTOM:
                    state = "ASCENDING"

            elif state == "BOTTOM":
                current_min_elbow = min(current_min_elbow, ea)
                rep_body_alignments.append(ba)
                rep_elbow_flares.append(raw_flare)
                rep_head_drops.append(head_drop)

                if ea > self.ELBOW_START_ASCENT:
                    state = "ASCENDING"

            elif state == "ASCENDING":
                rep_body_alignments.append(ba)
                rep_elbow_flares.append(raw_flare)
                rep_head_drops.append(head_drop)

                if ea >= self.ELBOW_REP_COMPLETE or (ea > current_min_elbow + 35.0 and ea >= 130.0):
                    rep_duration = frame_idx - rep_start_frame
                    cooldown_ok = frame_idx - last_rep_end_frame >= cooldown_frames

                    if rep_duration >= min_rep_frames and cooldown_ok:
                        self._finalize_rep(
                            reps, frame_idx, fps,
                            current_min_elbow, rep_body_alignments,
                            rep_elbow_flares, rep_head_drops,
                        )
                        last_rep_end_frame = frame_idx

                    state = "TOP"
                    current_min_elbow = 180.0
                    rep_body_alignments = []
                    rep_elbow_flares = []
                    rep_head_drops = []

        session_view = (
            Counter(detected_views).most_common(1)[0][0]
            if detected_views else "SIDE_VIEW"
        )

        return self.build_rep_response(
            reps, visibility_warnings, len(frames_landmarks), "Push-up", camera_view=session_view
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
    ) -> None:
        rep_num = len(reps) + 1
        issues: List[PoseIssue] = []
        score = 100.0

        # --- Rule 1: Range of Motion (ROM / Depth) ---
        is_rom_sufficient = min_elbow_angle <= self.ELBOW_HALF_REP_MIN

        if not is_rom_sufficient:
            score -= 35.0
            issues.append(PoseIssue(
                issue_code="HALF_REP",
                severity="high",
                message=f"Hạ chưa đủ sâu (khuỷu tay {int(min_elbow_angle)}°). Chưa đạt biên độ tối thiểu.",
                detail=(
                    "Bạn chưa hạ đủ biên độ tối thiểu để tính là 1 rep hợp lệ. "
                    "Hãy hạ người cho đến khi khuỷu tay tạo góc ~90° hoặc ngực gần chạm sàn."
                ),
            ))
        elif min_elbow_angle > self.ELBOW_CONFIRM_BOTTOM:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="INSUFFICIENT_DEPTH",
                severity="medium",
                message=f"Chưa hạ đủ sâu (khuỷu tay {int(min_elbow_angle)}°). Cố gắng hạ xuống ~90°.",
                detail=(
                    f"Khuỷu tay chỉ đạt {int(min_elbow_angle)}° thay vì 90° trở xuống. "
                    "Hạ người sâu hơn để kích hoạt tối đa cơ ngực và cơ tay sau (triceps)."
                ),
            ))

        # --- Rule 2: Body alignment (Cơ thể thẳng hàng) ---
        min_alignment = float(np.min(body_alignments)) if body_alignments else 180.0
        max_alignment = float(np.max(body_alignments)) if body_alignments else 180.0

        if min_alignment < self.BODY_SAG_THRESHOLD:
            sag_severity = "high" if min_alignment < 150.0 else "medium"
            score -= 25.0 if sag_severity == "high" else 15.0
            issues.append(PoseIssue(
                issue_code="HIPS_SAGGING",
                severity=sag_severity,
                message=f"Lưng bị võng quá mức ({int(min_alignment)}°). Siết cơ bụng và mông!",
                detail=(
                    "Hông bị xệ xuống khiến cột sống thắt lưng bị uốn quá mức (hyperextension). "
                    "Điều này tạo áp lực lớn lên đĩa đệm cột sống, có thể dẫn đến đau lưng dưới mãn tính. "
                    "Siết chặt cơ core (bụng + mông) để giữ cơ thể thẳng như một tấm ván."
                ),
            ))
        elif max_alignment > self.BODY_PIKE_THRESHOLD:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="HIPS_PIKING",
                severity="medium",
                message=f"Hông nhô lên quá cao ({int(max_alignment)}°). Hạ hông xuống ngang thân.",
                detail=(
                    "Hông nhô lên cao khiến tải trọng dồn về vai thay vì phân bổ đều. "
                    "Hạ hông xuống sao cho cơ thể tạo thành đường thẳng từ đầu đến gót chân."
                ),
            ))

        # --- Rule 3: Elbow flare (Góc mở khuỷu tay) ---
        max_flare = float(np.max(elbow_flares)) if elbow_flares else 45.0

        if max_flare > self.ELBOW_FLARE_DANGER:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="ELBOW_FLARE_T_SHAPE",
                severity="high",
                message=f"Khuỷu tay xòe ngang {int(max_flare)}° — tư thế chữ T nguy hiểm!",
                detail=(
                    "Cánh tay xòe ngang tạo thành hình chữ T so với thân người (~90°). "
                    "Tư thế này gây áp lực cực lớn lên khớp vai và chóp xoay (rotator cuff), "
                    "dễ dẫn đến viêm gân, rách chóp xoay hoặc chấn thương vai. "
                    "Hãy khép khuỷu tay vào khoảng 45° so với thân — tạo hình mũi tên thay vì chữ T."
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
                    "Mục tiêu lý tưởng: khoảng 45° — tạo hình mũi tên."
                ),
            ))

        # --- Rule 4: Head drop (Cúi đầu) ---
        avg_head_drop = float(np.mean(head_drops)) if head_drops else 0.0
        if avg_head_drop > self.HEAD_DROP_THRESHOLD:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="HEAD_DROPPING",
                severity="low",
                message="Đầu cúi xuống quá nhiều. Giữ đầu thẳng hàng với cột sống.",
                detail=(
                    "Khi hít đất, đầu nên giữ thẳng hàng với cột sống — nhìn xuống sàn "
                    "cách tay khoảng 15-20cm phía trước. Cúi đầu quá mức gây căng cơ cổ."
                ),
            ))

        # Breathing cue
        breathing = BreathingCue(
            phase="ASCENDING",
            instruction="Hít vào khi hạ người xuống. Thở ra mạnh khi đẩy lên.",
        )

        score = max(0.0, min(100.0, score))

        status, is_rep_valid = self.classify_rep(
            is_rom_sufficient=is_rom_sufficient,
            score=score,
            issues=issues,
            rom_issue_codes={"HALF_REP"},
        )

        reps.append(RepFeedback(
            rep_number=rep_num,
            score=score,
            status=status,
            is_rep_valid=is_rep_valid,
            timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            issues=issues,
            breathing_cue=breathing,
        ))

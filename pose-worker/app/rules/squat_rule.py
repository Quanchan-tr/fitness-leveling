"""
squat_rule.py — Comprehensive squat form analysis.

Evaluates multiple biomechanical rules per rep:
1. Depth (hip crease below knee — knee angle <= 90 deg)
2. Knee valgus (knees caving inward)
3. Torso lean (excessive forward lean)
4. Breathing cues

Robustness features:
- Visibility Gatekeeper: both hips, knees, ankles (ALL 6 lower-body joints)
  must have visibility >= 0.65. No lower-body = frozen state, no rep counted.
- EMA angle smoothing (alpha=0.4)
- Hysteresis: enter DESCENDING at < 148 deg, complete rep at >= 158 deg (68 deg gap)
- Temporal constraints: min 0.8s rep duration, 0.5s cooldown
"""

import numpy as np
from typing import List, Dict, Any

from app.rules.base_rule import BasePoseRule, EmaState, DEFAULT_MIN_REP_FRAMES, DEFAULT_REP_COOLDOWN_FRAMES
from app.cv.angle_math import calculate_angle_2d, calculate_vertical_angle
from app.schemas.response import (
    PoseFeedbackResponse,
    RepFeedback,
    RepStatus,
    PoseIssue,
    VisibilityWarning,
    BreathingCue,
)


class SquatRule(BasePoseRule):
    """
    Multi-rule squat evaluator with EMA smoothing and temporal constraints.

    MediaPipe landmark indices used:
      11 = LEFT_SHOULDER     12 = RIGHT_SHOULDER
      23 = LEFT_HIP          24 = RIGHT_HIP
      25 = LEFT_KNEE         26 = RIGHT_KNEE
      27 = LEFT_ANKLE        28 = RIGHT_ANKLE
    """

    # Required landmarks (ALL must be present for a valid frame)
    REQUIRED_LANDMARKS = ["23", "24", "25", "26", "27", "28"]

    # --- Hysteresis thresholds (68 deg gap) ---
    KNEE_ENTER_DESCENT = 148.0   # start of descent
    KNEE_CONFIRM_BOTTOM = 90.0   # below parallel
    KNEE_START_ASCENT = 105.0    # rising from bottom
    KNEE_REP_COMPLETE = 158.0    # standing again

    # --- Form thresholds ---
    TORSO_LEAN_WARNING = 45.0
    TORSO_LEAN_DANGER = 55.0
    KNEE_VALGUS_RATIO = 0.75     # knee width < 75% hip width = valgus
    KNEE_HALF_SQUAT = 120.0      # min depth for valid rep

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:

        reps: List[RepFeedback] = []
        visibility_warnings: List[VisibilityWarning] = []

        # EMA state
        ema = EmaState()

        # FSM state
        state = "STANDING"
        current_min_knee = 180.0
        rep_torso_leans: List[float] = []
        rep_valgus_ratios: List[float] = []

        # Temporal constraints
        min_rep_frames = max(DEFAULT_MIN_REP_FRAMES, int(fps * 0.8))
        cooldown_frames = max(DEFAULT_REP_COOLDOWN_FRAMES, int(fps * 0.5))
        rep_start_frame = 0
        last_rep_end_frame = -cooldown_frames

        consecutive_missing = 0
        MAX_CONSECUTIVE_MISSING = 10

        for frame_idx, lm in enumerate(frames_landmarks):
            # --- Visibility gating: ALL 6 lower-body joints required ---
            all_present, vis_warning = self.check_required_landmarks(
                lm, self.REQUIRED_LANDMARKS, frame_idx, fps
            )
            if not all_present:
                consecutive_missing += 1
                if vis_warning and consecutive_missing == MAX_CONSECUTIVE_MISSING:
                    # Override message for squat context
                    vis_warning.message = (
                        "Camera can thay toan bo phan duoi co the "
                        "(hong, goi, mat ca hai ben). Lui xa hon."
                    )
                    visibility_warnings.append(vis_warning)
                continue  # Freeze state

            consecutive_missing = 0

            # --- Extract landmarks ---
            l_shoulder = np.array([lm["11"]["x"], lm["11"]["y"]]) if "11" in lm else None
            l_hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            r_hip = np.array([lm["24"]["x"], lm["24"]["y"]])
            l_knee = np.array([lm["25"]["x"], lm["25"]["y"]])
            r_knee = np.array([lm["26"]["x"], lm["26"]["y"]])
            l_ankle = np.array([lm["27"]["x"], lm["27"]["y"]])

            # Midpoints for left-side analysis
            hip_mid = (l_hip + r_hip) / 2
            knee_mid = (l_knee + r_knee) / 2

            # --- Raw angles ---
            raw_knee = calculate_angle_2d(l_hip, l_knee, l_ankle)

            raw_lean = 0.0
            if l_shoulder is not None:
                raw_lean = calculate_vertical_angle(l_hip, l_shoulder)

            # Knee valgus ratio (raw — no EMA)
            hip_width = abs(l_hip[0] - r_hip[0]) + 1e-7
            knee_width = abs(l_knee[0] - r_knee[0])
            valgus_ratio = knee_width / hip_width

            # --- EMA smoothing ---
            ka = ema.update_knee(raw_knee)
            la = ema.update_lean(raw_lean)

            # --- FSM with hysteresis ---
            if state == "STANDING":
                if ka < self.KNEE_ENTER_DESCENT:
                    state = "DESCENDING"
                    rep_start_frame = frame_idx
                    current_min_knee = ka
                    rep_torso_leans = [la]
                    rep_valgus_ratios = [valgus_ratio]

            elif state == "DESCENDING":
                current_min_knee = min(current_min_knee, ka)
                rep_torso_leans.append(la)
                rep_valgus_ratios.append(valgus_ratio)

                if ka <= self.KNEE_CONFIRM_BOTTOM:
                    state = "BOTTOM"
                elif ka > current_min_knee + 15 and current_min_knee > self.KNEE_CONFIRM_BOTTOM:
                    # Rose without reaching bottom — movement cycle continues to ASCENDING to evaluate ROM/form
                    state = "ASCENDING"

            elif state == "BOTTOM":
                current_min_knee = min(current_min_knee, ka)
                rep_torso_leans.append(la)
                rep_valgus_ratios.append(valgus_ratio)

                if ka > self.KNEE_START_ASCENT:
                    state = "ASCENDING"

            elif state == "ASCENDING":
                rep_torso_leans.append(la)
                rep_valgus_ratios.append(valgus_ratio)

                if ka >= self.KNEE_REP_COMPLETE:
                    # Temporal check
                    rep_duration = frame_idx - rep_start_frame
                    cooldown_ok = frame_idx - last_rep_end_frame >= cooldown_frames

                    if rep_duration >= min_rep_frames and cooldown_ok:
                        self._finalize_rep(
                            reps, frame_idx, fps,
                            current_min_knee, rep_torso_leans, rep_valgus_ratios,
                        )
                        last_rep_end_frame = frame_idx

                    # Reset regardless
                    state = "STANDING"
                    current_min_knee = 180.0
                    rep_torso_leans = []
                    rep_valgus_ratios = []

        session_summary = self.build_session_summary(
            reps, visibility_warnings, len(frames_landmarks), "Squat"
        )
        total_score = float(np.mean([r.score for r in reps])) if reps else 0.0
        valid_count = sum(1 for r in reps if r.is_rep_valid)
        good_count = sum(1 for r in reps if r.status == RepStatus.GOOD_REP)

        return PoseFeedbackResponse(
            rep_count=len(reps),
            valid_rep_count=valid_count,
            good_rep_count=good_count,
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
        rep_num = len(reps) + 1
        issues: List[PoseIssue] = []
        score = 100.0

        # --- Rule 1: Range of Motion (ROM / Depth) ---
        is_rom_sufficient = min_knee_angle <= self.KNEE_HALF_SQUAT

        if not is_rom_sufficient:
            score -= 30.0
            issues.append(PoseIssue(
                issue_code="HALF_SQUAT",
                severity="high",
                message=f"Hạ chưa đủ sâu (góc gối {int(min_knee_angle)}°). Chưa đạt biên độ tối thiểu.",
                detail=(
                    f"Đầu gối chỉ gập đến {int(min_knee_angle)}° — chưa đủ sâu để tính là 1 rep hợp lệ. "
                    "Hạ người cho đến khi nếp gấp hông ngang hoặc dưới đầu gối (góc đầu gối <= 90°)."
                ),
            ))
        elif min_knee_angle > self.KNEE_CONFIRM_BOTTOM:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="INSUFFICIENT_DEPTH",
                severity="medium",
                message=f"Chưa hạ đủ sâu ({int(min_knee_angle)}°). Hạ thêm để đạt song song.",
                detail=(
                    f"Đầu gối đạt {int(min_knee_angle)}°, gần song song nhưng chưa đủ. "
                    "Hạ thêm vài cm để nếp gấp hông ngang đầu gối."
                ),
            ))

        # --- Rule 2: Torso lean (Độ nghiêng thân trên) ---
        max_lean = float(np.max(torso_leans)) if torso_leans else 0.0
        if max_lean > self.TORSO_LEAN_DANGER:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="EXCESSIVE_FORWARD_LEAN",
                severity="high",
                message=f"Lưng bị gập quá mức (thân nghiêng {int(max_lean)}°). Giữ ngực thẳng!",
                detail=(
                    "Thân trên ngả về phía trước quá mức, tạo áp lực lớn lên cột sống thắt lưng. "
                    "Tập lâu dài với tư thế này có thể dẫn đến thoái hóa hoặc đau lưng dưới. "
                    "Giữ ngực ưỡn, mắt nhìn thẳng, siết core để thân trên đứng thẳng hơn."
                ),
            ))
        elif max_lean > self.TORSO_LEAN_WARNING:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="FORWARD_LEAN",
                severity="medium",
                message=f"Thân trên hơi ngả về trước ({int(max_lean)}°). Giữ ngực thẳng hơn.",
                detail=(
                    "Thân trên ngả nhẹ về phía trước. Cải thiện sẽ giúp phân bổ tải trọng đều hơn."
                ),
            ))

        # --- Rule 3: Knee valgus (Khớp gối chụm vào trong) ---
        if knee_valgus_ratios:
            bottom_half = knee_valgus_ratios[len(knee_valgus_ratios) // 2:]
            min_ratio = float(np.min(bottom_half)) if bottom_half else 1.0
            if min_ratio < self.KNEE_VALGUS_RATIO:
                severity = "high" if min_ratio < 0.6 else "medium"
                score -= 25.0 if severity == "high" else 15.0
                issues.append(PoseIssue(
                    issue_code="KNEE_VALGUS",
                    severity=severity,
                    message="Đầu gối chụm vào trong (valgus). Đẩy gối ra ngoài!",
                    detail=(
                        "Đầu gối bị khép vào trong khi squat (knee valgus), đặc biệt nguy hiểm ở đáy squat. "
                        "Điều này tạo lực xoắn lớn lên dây chằng chéo trước (ACL) và sụn chêm, "
                        "tăng nguy cơ chấn thương đầu gối nghiêm trọng. "
                        "Hãy ý thức đẩy đầu gối ra ngoài theo hướng ngón chân."
                    ),
                ))

        breathing = BreathingCue(
            phase="ASCENDING",
            instruction="Hít vào sâu khi hạ người xuống. Thở ra mạnh khi đứng lên.",
        )

        score = max(0.0, min(100.0, score))

        # --- Form Quality Analyzer: Phân biệt "Form đúng" và "Rep hợp lệ" ---
        has_high_severity = any(i.severity == "high" for i in issues if i.issue_code != "HALF_SQUAT")

        if not is_rom_sufficient:
            # Chưa đủ biên độ: Ghi nhận chu kỳ vận động nhưng đánh dấu NO_REP
            status = RepStatus.NO_REP
            is_rep_valid = False
        elif has_high_severity or score < 75.0:
            # Đủ biên độ nhưng sai form kỹ thuật (gập lưng, gối chụm, v.v.)
            status = RepStatus.BAD_FORM
            is_rep_valid = True
        else:
            # Đủ biên độ và form chuẩn
            status = RepStatus.GOOD_REP
            is_rep_valid = True

        reps.append(RepFeedback(
            rep_number=rep_num,
            score=score,
            status=status,
            is_rep_valid=is_rep_valid,
            timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            issues=issues,
            breathing_cue=breathing,
        ))

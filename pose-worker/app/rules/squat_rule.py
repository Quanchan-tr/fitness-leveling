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
                raw_lean = calculate_vertical_angle(l_shoulder, l_hip)

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
                elif ka > current_min_knee + 20 and current_min_knee > self.KNEE_HALF_SQUAT:
                    # Rose without reaching bottom — still try to finalize
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
        rep_num = len(reps) + 1
        issues: List[PoseIssue] = []
        score = 100.0
        is_rep_valid = True

        # Rule 1: Depth
        if min_knee_angle > self.KNEE_HALF_SQUAT:
            score -= 30.0
            is_rep_valid = False
            issues.append(PoseIssue(
                issue_code="HALF_SQUAT",
                severity="high",
                message=f"Squat qua nong ({int(min_knee_angle)} deg). Chua dat bien do toi thieu.",
                detail=(
                    f"Dau goi chi gap den {int(min_knee_angle)} deg — chua du sau de tinh la 1 rep hop le. "
                    "Ha nguoi cho den khi nep gap hong ngang hoac duoi dau goi (goc dau goi <= 90 deg)."
                ),
            ))
        elif min_knee_angle > self.KNEE_CONFIRM_BOTTOM:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="INSUFFICIENT_DEPTH",
                severity="medium",
                message=f"Chua du sau ({int(min_knee_angle)} deg). Ha them de dat song song.",
                detail=(
                    f"Dau goi dat {int(min_knee_angle)} deg, gan song song nhung chua du. "
                    "Ha them vai cm de nep gap hong ngang dau goi."
                ),
            ))

        # Rule 2: Torso lean
        max_lean = float(np.max(torso_leans)) if torso_leans else 0.0
        if max_lean > self.TORSO_LEAN_DANGER:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="EXCESSIVE_FORWARD_LEAN",
                severity="high",
                message=f"Than tren nga qua nhieu ({int(max_lean)} deg). Giu nguc thang!",
                detail=(
                    "Than tren nga ve phia truoc qua muc, tao ap luc lon len cot song that lung. "
                    "Tap lau dai voi tu the nay co the dan den thoat vi dia dem hoac dau lung duoi. "
                    "Giu nguc uon, mat nhin thang, siet core de than tren dung thang hon."
                ),
            ))
        elif max_lean > self.TORSO_LEAN_WARNING:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="FORWARD_LEAN",
                severity="medium",
                message=f"Than tren hoi nga ve truoc ({int(max_lean)} deg). Giu nguc thang hon.",
                detail=(
                    "Than tren nga nhe ve phia truoc. Cai thien se giup phan bo tai trong deu hon."
                ),
            ))

        # Rule 3: Knee valgus
        if knee_valgus_ratios:
            bottom_half = knee_valgus_ratios[len(knee_valgus_ratios) // 2:]
            min_ratio = float(np.min(bottom_half)) if bottom_half else 1.0
            if min_ratio < self.KNEE_VALGUS_RATIO:
                severity = "high" if min_ratio < 0.6 else "medium"
                score -= 25.0 if severity == "high" else 15.0
                issues.append(PoseIssue(
                    issue_code="KNEE_VALGUS",
                    severity=severity,
                    message="Dau goi bi kep vao trong (valgus). Day goi ra ngoai!",
                    detail=(
                        "Dau goi bi khep vao trong khi squat (knee valgus), dac biet nguy hiem o day squat. "
                        "Dieu nay tao luc xoan lon len day chang cheo truoc (ACL) va sun chem, "
                        "tang nguy co chan thuong dau goi nghiem trong. "
                        "Hay y thuc day dau goi ra ngoai theo huong ngon chan."
                    ),
                ))

        breathing = BreathingCue(
            phase="ASCENDING",
            instruction="Hit vao sau khi ha nguoi xuong. Tho ra manh khi dung len.",
        )

        score = max(0.0, min(100.0, score))
        reps.append(RepFeedback(
            rep_number=rep_num,
            score=score,
            is_rep_valid=is_rep_valid,
            timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            issues=issues,
            breathing_cue=breathing,
        ))

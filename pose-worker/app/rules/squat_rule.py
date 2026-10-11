"""
squat_rule.py — 3D Vector Squat Form Analysis with Camera View Awareness.

Evaluates biomechanical rules per rep in metric 3D space:
1. Core Rule (Universal across all camera angles: Front, Side, 45° Diagonal):
   - 3D Knee Angle calculated from world_landmarks vector dot product (BA . BC).
   - Dynamic Hip Drop Ratio verification for Front View (when Z-axis has jitter).
2. Form Check Modifiers (Targeted by camera orientation):
   - SIDE_VIEW: Torso forward lean / spine angle check (no Knee Valgus penalty).
   - FRONT_VIEW: Knee Valgus check (knees caving inward) (no side torso lean penalty).
   - DIAGONAL_VIEW: Balanced check for both Valgus and Lean.
"""

from collections import Counter
from typing import Any, Dict, List, Optional
import numpy as np

from app.cv.angle_math import (
    calculate_angle_2d,
    calculate_angle_3d,
    calculate_vertical_angle_3d,
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


class SquatRule(BasePoseRule):
    """
    3D Squat evaluator supporting Front View, Side View, and Diagonal View.
    """

    # --- 3D Angle Hysteresis Thresholds ---
    KNEE_ENTER_DESCENT = 148.0   # Start of descent in 3D
    KNEE_CONFIRM_BOTTOM = 95.0   # Deep squat bottom in 3D
    KNEE_START_ASCENT = 105.0    # Rising from bottom
    KNEE_REP_COMPLETE = 148.0    # Standing extension

    # --- Form thresholds ---
    TORSO_LEAN_WARNING = 45.0
    TORSO_LEAN_DANGER = 55.0
    KNEE_VALGUS_RATIO = 0.75     # Knee width < 75% ankle/hip width = valgus
    KNEE_HALF_SQUAT = 120.0      # Min depth for valid rep (ROM threshold)

    @staticmethod
    def _check_squat_visibility(
        lm: Dict[str, Any],
        frame_idx: int,
        fps: float,
    ) -> tuple[bool, Optional[VisibilityWarning]]:
        """Require lower-body joints on at least one side (left OR right)."""
        ts = round(frame_idx / max(fps, 1.0), 2)
        if not lm:
            return False, VisibilityWarning(
                warning_code="POSE_NOT_DETECTED",
                message="Không phát hiện được tư thế. Hãy đứng vào khung hình.",
                frame_index=frame_idx,
                timestamp_sec=ts,
            )

        has_left = all(k in lm for k in ("23", "25", "27"))
        has_right = all(k in lm for k in ("24", "26", "28"))
        if not (has_left or has_right):
            return False, VisibilityWarning(
                warning_code="INCOMPLETE_BODY_VISIBLE",
                message="Camera cần thấy rõ hông, đầu gối và cổ chân (ít nhất một bên).",
                affected_landmarks=["23", "25", "27"],
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

        # EMA state for angle smoothing
        ema = EmaState()

        # FSM state
        state = "STANDING"
        current_min_knee = 180.0
        standing_hip_y: Optional[float] = None
        thigh_ref_y: float = 0.3
        rep_torso_leans: List[float] = []
        rep_valgus_ratios: List[float] = []
        rep_camera_views: List[str] = []

        # Temporal constraints
        min_rep_frames = max(DEFAULT_MIN_REP_FRAMES, int(fps * 0.6))
        cooldown_frames = max(DEFAULT_REP_COOLDOWN_FRAMES, int(fps * 0.3))
        rep_start_frame = 0
        last_rep_end_frame = -cooldown_frames

        consecutive_missing = 0
        MAX_CONSECUTIVE_MISSING = 10

        for frame_idx, lm in enumerate(frames_landmarks):
            all_present, vis_warning = self._check_squat_visibility(lm, frame_idx, fps)
            if not all_present:
                consecutive_missing += 1
                if vis_warning and consecutive_missing == MAX_CONSECUTIVE_MISSING:
                    visibility_warnings.append(vis_warning)
                continue

            consecutive_missing = 0

            # ── 1. Camera View Detection ──────────────────────────────
            frame_view = detect_camera_view(lm)
            detected_views.append(frame_view)

            # ── 2. 3D World Landmarks Extraction ──────────────────────
            has_left = all(k in lm for k in ("23", "25", "27"))
            has_right = all(k in lm for k in ("24", "26", "28"))

            if has_left and has_right:
                l_hip_3d = self.get_point_3d(lm, "23")
                l_knee_3d = self.get_point_3d(lm, "25")
                l_ankle_3d = self.get_point_3d(lm, "27")

                r_hip_3d = self.get_point_3d(lm, "24")
                r_knee_3d = self.get_point_3d(lm, "26")
                r_ankle_3d = self.get_point_3d(lm, "28")

                l_angle_3d = calculate_angle_3d(l_hip_3d, l_knee_3d, l_ankle_3d)
                r_angle_3d = calculate_angle_3d(r_hip_3d, r_knee_3d, r_ankle_3d)
                raw_knee = (l_angle_3d + r_angle_3d) / 2.0

                # 2D Screen coords for valgus and hip drop
                l_knee_2d = self.get_point_2d(lm, "25")
                r_knee_2d = self.get_point_2d(lm, "26")
                l_ankle_2d = self.get_point_2d(lm, "27")
                r_ankle_2d = self.get_point_2d(lm, "28")
                l_hip_2d = self.get_point_2d(lm, "23")
                r_hip_2d = self.get_point_2d(lm, "24")

                knee_dist_x = abs(l_knee_2d[0] - r_knee_2d[0])
                ankle_dist_x = abs(l_ankle_2d[0] - r_ankle_2d[0])
                hip_dist_x = abs(l_hip_2d[0] - r_hip_2d[0])
                ref_width = max(ankle_dist_x, hip_dist_x, 1e-5)
                valgus_ratio = knee_dist_x / ref_width

                current_hip_y = (l_hip_2d[1] + r_hip_2d[1]) / 2.0
                knee_ref_y = (l_knee_2d[1] + r_knee_2d[1]) / 2.0
                curr_thigh_len = abs(knee_ref_y - current_hip_y)
                if curr_thigh_len > 0.05:
                    thigh_ref_y = curr_thigh_len

                # 3D Torso Lean
                hip_center_3d = (l_hip_3d + r_hip_3d) / 2.0
                if "11" in lm and "12" in lm:
                    sh_center_3d = (self.get_point_3d(lm, "11") + self.get_point_3d(lm, "12")) / 2.0
                    raw_lean = calculate_vertical_angle_3d(hip_center_3d, sh_center_3d)
                else:
                    raw_lean = 0.0

            elif has_left:
                l_hip_3d = self.get_point_3d(lm, "23")
                l_knee_3d = self.get_point_3d(lm, "25")
                l_ankle_3d = self.get_point_3d(lm, "27")
                raw_knee = calculate_angle_3d(l_hip_3d, l_knee_3d, l_ankle_3d)
                valgus_ratio = 1.0  # Cannot measure valgus from single side

                l_hip_2d = self.get_point_2d(lm, "23")
                l_knee_2d = self.get_point_2d(lm, "25")
                current_hip_y = l_hip_2d[1]
                curr_thigh_len = abs(l_knee_2d[1] - l_hip_2d[1])
                if curr_thigh_len > 0.05:
                    thigh_ref_y = curr_thigh_len

                if "11" in lm:
                    sh_3d = self.get_point_3d(lm, "11")
                    raw_lean = calculate_vertical_angle_3d(l_hip_3d, sh_3d)
                else:
                    raw_lean = 0.0

            else:
                r_hip_3d = self.get_point_3d(lm, "24")
                r_knee_3d = self.get_point_3d(lm, "26")
                r_ankle_3d = self.get_point_3d(lm, "28")
                raw_knee = calculate_angle_3d(r_hip_3d, r_knee_3d, r_ankle_3d)
                valgus_ratio = 1.0

                r_hip_2d = self.get_point_2d(lm, "24")
                r_knee_2d = self.get_point_2d(lm, "26")
                current_hip_y = r_hip_2d[1]
                curr_thigh_len = abs(r_knee_2d[1] - r_hip_2d[1])
                if curr_thigh_len > 0.05:
                    thigh_ref_y = curr_thigh_len

                if "12" in lm:
                    sh_3d = self.get_point_3d(lm, "12")
                    raw_lean = calculate_vertical_angle_3d(r_hip_3d, sh_3d)
                else:
                    raw_lean = 0.0

            # ── 3. EMA Angle Smoothing ────────────────────────────────
            ka = ema.update_knee(raw_knee)
            la = ema.update_lean(raw_lean)

            # Hip drop calculation (relative descent along Y axis)
            if standing_hip_y is None or state == "STANDING":
                standing_hip_y = current_hip_y
                hip_drop_ratio = 0.0
            else:
                hip_drop_ratio = max(0.0, (current_hip_y - standing_hip_y) / max(thigh_ref_y, 0.05))

            # ── 4. Core Rule: State Machine (3D Angle + Hip Drop) ─────
            if state == "STANDING":
                if ka < self.KNEE_ENTER_DESCENT or (frame_view == "FRONT_VIEW" and hip_drop_ratio > 0.15):
                    state = "DESCENDING"
                    rep_start_frame = frame_idx
                    current_min_knee = ka
                    rep_torso_leans = [la]
                    rep_valgus_ratios = [valgus_ratio]
                    rep_camera_views = [frame_view]

            elif state == "DESCENDING":
                current_min_knee = min(current_min_knee, ka)
                rep_torso_leans.append(la)
                rep_valgus_ratios.append(valgus_ratio)
                rep_camera_views.append(frame_view)

                # Bottom condition: 3D knee angle confirmed, or Front-view hip drop verification
                is_bottom_depth = (ka <= self.KNEE_CONFIRM_BOTTOM) or (
                    frame_view == "FRONT_VIEW" and ka <= 105.0 and hip_drop_ratio >= 0.35
                )

                if is_bottom_depth:
                    state = "BOTTOM"
                elif ka > current_min_knee + 12.0 and current_min_knee <= self.KNEE_HALF_SQUAT:
                    # Incomplete depth ascent (e.g. half squat)
                    state = "ASCENDING"

            elif state == "BOTTOM":
                current_min_knee = min(current_min_knee, ka)
                rep_torso_leans.append(la)
                rep_valgus_ratios.append(valgus_ratio)
                rep_camera_views.append(frame_view)

                if ka > self.KNEE_START_ASCENT or (frame_view == "FRONT_VIEW" and hip_drop_ratio < 0.25):
                    state = "ASCENDING"

            elif state == "ASCENDING":
                rep_torso_leans.append(la)
                rep_valgus_ratios.append(valgus_ratio)
                rep_camera_views.append(frame_view)

                is_standing_up = (ka >= self.KNEE_REP_COMPLETE) or (
                    ka > current_min_knee + 35.0 and ka >= 135.0
                ) or (frame_view == "FRONT_VIEW" and hip_drop_ratio <= 0.08)

                if is_standing_up:
                    rep_duration = frame_idx - rep_start_frame
                    cooldown_ok = frame_idx - last_rep_end_frame >= cooldown_frames

                    if rep_duration >= min_rep_frames and cooldown_ok:
                        dominant_rep_view = (
                            Counter(rep_camera_views).most_common(1)[0][0]
                            if rep_camera_views else frame_view
                        )
                        self._finalize_rep(
                            reps,
                            frame_idx,
                            fps,
                            current_min_knee,
                            rep_torso_leans,
                            rep_valgus_ratios,
                            dominant_rep_view,
                        )
                        last_rep_end_frame = frame_idx

                    # Reset cycle
                    state = "STANDING"
                    current_min_knee = 180.0
                    rep_torso_leans = []
                    rep_valgus_ratios = []
                    rep_camera_views = []
                    standing_hip_y = current_hip_y

        session_view = (
            Counter(detected_views).most_common(1)[0][0]
            if detected_views else "FRONT_VIEW"
        )

        return self.build_rep_response(
            reps, visibility_warnings, len(frames_landmarks), "Squat", camera_view=session_view
        )

    def _finalize_rep(
        self,
        reps: List[RepFeedback],
        frame_idx: int,
        fps: float,
        min_knee_angle: float,
        torso_leans: List[float],
        knee_valgus_ratios: List[float],
        camera_view: str,
    ) -> None:
        rep_num = len(reps) + 1
        issues: List[PoseIssue] = []
        score = 100.0

        # ── Core Rule: Range of Motion (ROM / Depth) ──────────────────
        is_rom_sufficient = min_knee_angle <= self.KNEE_HALF_SQUAT

        if not is_rom_sufficient:
            score -= 30.0
            issues.append(
                PoseIssue(
                    issue_code="HALF_SQUAT",
                    severity="high",
                    message=f"Hạ chưa đủ sâu (góc gối 3D: {int(min_knee_angle)}°). Chưa đạt ROM tối thiểu.",
                    detail=(
                        f"Đầu gối chỉ gập đến {int(min_knee_angle)}° — chưa đủ biên độ chuẩn. "
                        "Hạ người cho đến khi nếp gấp hông ngang hoặc dưới đầu gối (<= 95°)."
                    ),
                )
            )
        elif min_knee_angle > self.KNEE_CONFIRM_BOTTOM:
            score -= 15.0
            issues.append(
                PoseIssue(
                    issue_code="INSUFFICIENT_DEPTH",
                    severity="medium",
                    message=f"Chưa hạ đủ sâu ({int(min_knee_angle)}°). Cần hạ đùi song song sàn.",
                    detail=(
                        f"Đầu gối đạt {int(min_knee_angle)}°. Hạ thêm một chút để đạt độ sâu tối ưu."
                    ),
                )
            )

        # ── Form Check Modifiers (Targeted by Camera View) ────────────
        # Modifiers for SIDE_VIEW and DIAGONAL_VIEW: Check Torso Spine Lean
        if camera_view in ("SIDE_VIEW", "DIAGONAL_VIEW"):
            max_lean = float(np.max(torso_leans)) if torso_leans else 0.0
            if max_lean > self.TORSO_LEAN_DANGER:
                score -= 25.0
                issues.append(
                    PoseIssue(
                        issue_code="EXCESSIVE_FORWARD_LEAN",
                        severity="high",
                        message=f"Lưng bị gập quá mức (thân nghiêng {int(max_lean)}°). Mở ngực và thẳng lưng!",
                        detail=(
                            "Thân trên ngả về trước quá nhiều tạo áp lực nguy hiểm lên cột sống thắt lưng. "
                            "Hãy mở ngực, siết cơ core và giữ thân trên thẳng hơn."
                        ),
                    )
                )
            elif max_lean > self.TORSO_LEAN_WARNING:
                score -= 10.0
                issues.append(
                    PoseIssue(
                        issue_code="FORWARD_LEAN",
                        severity="medium",
                        message=f"Thân trên hơi ngả về trước ({int(max_lean)}°). Giữ ngực thẳng hơn.",
                        detail="Thân trên hơi đổ về trước. Siết cơ bụng để nâng ngực lên.",
                    )
                )

        # Modifiers for FRONT_VIEW and DIAGONAL_VIEW: Check Knee Valgus
        if camera_view in ("FRONT_VIEW", "DIAGONAL_VIEW"):
            if knee_valgus_ratios:
                # Bottom half of movement cycle
                bottom_half = knee_valgus_ratios[len(knee_valgus_ratios) // 2:]
                min_ratio = float(np.min(bottom_half)) if bottom_half else 1.0
                if min_ratio < self.KNEE_VALGUS_RATIO:
                    severity = "high" if min_ratio < 0.60 else "medium"
                    score -= 25.0 if severity == "high" else 15.0
                    issues.append(
                        PoseIssue(
                            issue_code="KNEE_VALGUS",
                            severity=severity,
                            message="Đầu gối chụm vào trong (Knee Valgus). Đẩy gối ra ngoài!",
                            detail=(
                                "Đầu gối bị khép vào trong khi squat, tạo lực xoắn nguy hiểm lên dây chằng ACL. "
                                "Hãy chủ động đẩy đầu gối hướng ra theo hướng các ngón chân."
                            ),
                        )
                    )

        breathing = BreathingCue(
            phase="ASCENDING",
            instruction="Hít vào sâu khi hạ người xuống. Thở ra mạnh khi đứng lên.",
        )

        score = max(0.0, min(100.0, score))

        status, is_rep_valid = self.classify_rep(
            is_rom_sufficient=is_rom_sufficient,
            score=score,
            issues=issues,
            rom_issue_codes={"HALF_SQUAT"},
        )

        reps.append(
            RepFeedback(
                rep_number=rep_num,
                score=score,
                status=status,
                is_rep_valid=is_rep_valid,
                timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
                issues=issues,
                breathing_cue=breathing,
            )
        )

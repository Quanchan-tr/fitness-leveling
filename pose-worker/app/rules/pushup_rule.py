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


class PushupRule(BasePoseRule):
    """
    Multi-rule push-up evaluator with EMA smoothing and temporal constraints.

    MediaPipe landmark indices used:
      0  = NOSE
      11 = LEFT_SHOULDER     12 = RIGHT_SHOULDER
      13 = LEFT_ELBOW        14 = RIGHT_ELBOW
      15 = LEFT_WRIST        16 = RIGHT_WRIST
      23 = LEFT_HIP          24 = RIGHT_HIP
      27 = LEFT_ANKLE        28 = RIGHT_ANKLE
    """

    # --- Required landmarks (all must be visible >= 0.65) ---
    REQUIRED_LANDMARKS = ["11", "13", "15", "23", "27"]
    # At least one hip and one ankle side
    HIP_ALTERNATIVES = [["23"], ["24"]]
    ANKLE_ALTERNATIVES = [["27"], ["28"]]

    # --- State machine thresholds with hysteresis (65 deg gap) ---
    ELBOW_ENTER_DESCENT = 145.0   # arms start bending (enter DESCENDING)
    ELBOW_CONFIRM_BOTTOM = 90.0   # full depth confirmed (enter BOTTOM)
    ELBOW_START_ASCENT = 105.0    # rising from bottom (enter ASCENDING)
    ELBOW_REP_COMPLETE = 155.0    # arms extended again (rep done)

    # --- Form thresholds ---
    BODY_SAG_THRESHOLD = 160.0
    BODY_PIKE_THRESHOLD = 205.0
    ELBOW_FLARE_DANGER = 80.0
    ELBOW_FLARE_WARNING = 65.0
    HEAD_DROP_THRESHOLD = 35.0
    ELBOW_HALF_REP_MIN = 120.0    # above this at bottom = half rep

    def _calculate_elbow_flare(
        self,
        shoulder: np.ndarray,
        elbow: np.ndarray,
        hip: np.ndarray,
    ) -> float:
        return calculate_angle_2d(elbow, shoulder, hip)

    def _check_pushup_visibility(
        self,
        lm: Dict[str, Any],
        frame_idx: int,
        fps: float,
    ):
        """
        Push-up specific gating: upper body all required, lower body at least
        one hip + one ankle side.
        """
        if not lm:
            return False, VisibilityWarning(
                warning_code="POSE_NOT_DETECTED",
                message="Khong phat hien duoc tu the. Hay dung vao khung hinh.",
                frame_index=frame_idx,
                timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            )

        upper_required = ["11", "13", "15"]
        missing_upper = [k for k in upper_required if k not in lm]
        if missing_upper:
            return False, VisibilityWarning(
                warning_code="INCOMPLETE_BODY_VISIBLE",
                message="Camera can thay ro vai, khuyu tay va co tay. Dieu chinh goc camera.",
                affected_landmarks=missing_upper,
                frame_index=frame_idx,
                timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            )

        has_hip = "23" in lm or "24" in lm
        has_ankle = "27" in lm or "28" in lm
        if not has_hip or not has_ankle:
            return False, VisibilityWarning(
                warning_code="INCOMPLETE_BODY_VISIBLE",
                message="Camera can thay hong va mat ca de kiem tra duong thang co the. Lui camera ra xa.",
                affected_landmarks=[k for k in ["23", "27"] if k not in lm],
                frame_index=frame_idx,
                timestamp_sec=round(frame_idx / max(fps, 1.0), 2),
            )

        return True, None

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:

        reps: List[RepFeedback] = []
        visibility_warnings: List[VisibilityWarning] = []

        # EMA state
        ema = EmaState()

        # FSM state
        state = "TOP"
        current_min_elbow = 180.0
        rep_body_alignments: List[float] = []
        rep_elbow_flares: List[float] = []
        rep_head_drops: List[float] = []

        # Temporal constraints (frame-based)
        min_rep_frames = max(DEFAULT_MIN_REP_FRAMES, int(fps * 0.8))
        cooldown_frames = max(DEFAULT_REP_COOLDOWN_FRAMES, int(fps * 0.5))
        rep_start_frame = 0
        last_rep_end_frame = -cooldown_frames  # allow first rep immediately

        consecutive_missing = 0
        MAX_CONSECUTIVE_MISSING = 10

        for frame_idx, lm in enumerate(frames_landmarks):
            # --- Visibility gating (push-up specific) ---
            all_present, vis_warning = self._check_pushup_visibility(lm, frame_idx, fps)
            if not all_present:
                consecutive_missing += 1
                if vis_warning and consecutive_missing == MAX_CONSECUTIVE_MISSING:
                    visibility_warnings.append(vis_warning)
                # Freeze state — do NOT advance FSM
                continue

            consecutive_missing = 0

            # --- Extract landmarks ---
            shoulder = np.array([lm["11"]["x"], lm["11"]["y"]])
            elbow = np.array([lm["13"]["x"], lm["13"]["y"]])
            wrist = np.array([lm["15"]["x"], lm["15"]["y"]])

            # Use left hip/ankle, fall back to right
            hip_lm = lm.get("23") or lm.get("24")
            ankle_lm = lm.get("27") or lm.get("28")
            hip = np.array([hip_lm["x"], hip_lm["y"]])
            ankle = np.array([ankle_lm["x"], ankle_lm["y"]])

            nose = np.array([lm["0"]["x"], lm["0"]["y"]]) if "0" in lm else None

            # --- Raw angles ---
            raw_elbow = calculate_angle_2d(shoulder, elbow, wrist)
            raw_body = calculate_angle_2d(shoulder, hip, ankle)
            raw_flare = self._calculate_elbow_flare(shoulder, elbow, hip)

            head_drop = 0.0
            if nose is not None:
                head_drop = calculate_vertical_angle(nose, shoulder)

            # --- EMA smoothing ---
            ea = ema.update_elbow(raw_elbow)
            ba = ema.update_body(raw_body)
            # Note: flare and head drop use raw (no EMA) — they're accumulators

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

                if ea >= self.ELBOW_REP_COMPLETE:
                    # Temporal constraint check
                    rep_duration = frame_idx - rep_start_frame
                    cooldown_ok = frame_idx - last_rep_end_frame >= cooldown_frames

                    if rep_duration >= min_rep_frames and cooldown_ok:
                        self._finalize_rep(
                            reps, frame_idx, fps,
                            current_min_elbow, rep_body_alignments,
                            rep_elbow_flares, rep_head_drops,
                        )
                        last_rep_end_frame = frame_idx
                    # else: timing-rejected — silently discard this cycle

                    # Reset state regardless
                    state = "TOP"
                    current_min_elbow = 180.0
                    rep_body_alignments = []
                    rep_elbow_flares = []
                    rep_head_drops = []

        # --- Build session summary ---
        session_summary = self.build_session_summary(
            reps, visibility_warnings, len(frames_landmarks), "Push-up"
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
        min_elbow_angle: float,
        body_alignments: List[float],
        elbow_flares: List[float],
        head_drops: List[float],
    ) -> None:
        rep_num = len(reps) + 1
        issues: List[PoseIssue] = []
        score = 100.0
        is_rep_valid = True

        # Rule 1: Depth
        if min_elbow_angle > self.ELBOW_HALF_REP_MIN:
            score -= 35.0
            is_rep_valid = False
            issues.append(PoseIssue(
                issue_code="HALF_REP",
                severity="high",
                message=f"Bien do qua nho (khuyu tay {int(min_elbow_angle)} deg). Rep chua hop le.",
                detail=(
                    "Ban chi nhap nho nua duong hoac gat dau xuong san thay vi ha toan bo than tren. "
                    "Ha nguoi cho den khi khuyu tay tao goc ~90 deg hoac nguc gan cham san."
                ),
            ))
        elif min_elbow_angle > self.ELBOW_CONFIRM_BOTTOM:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="INSUFFICIENT_DEPTH",
                severity="medium",
                message=f"Chua du sau (khuyu tay {int(min_elbow_angle)} deg). Co gang ha xuong ~90 deg.",
                detail=(
                    f"Khuyu tay chi dat {int(min_elbow_angle)} deg thay vi 90 deg tro xuong. "
                    "Ha nguoi sau hon de kich hoat toi da co nguc va co tay sau (triceps)."
                ),
            ))

        # Rule 2: Body alignment
        avg_alignment = float(np.mean(body_alignments)) if body_alignments else 180.0
        min_alignment = float(np.min(body_alignments)) if body_alignments else 180.0
        max_alignment = float(np.max(body_alignments)) if body_alignments else 180.0

        if min_alignment < self.BODY_SAG_THRESHOLD:
            sag_severity = "high" if min_alignment < 150.0 else "medium"
            score -= 25.0 if sag_severity == "high" else 15.0
            issues.append(PoseIssue(
                issue_code="HIPS_SAGGING",
                severity=sag_severity,
                message=f"Hong bi vong ({int(min_alignment)} deg). Siet co bung va mong.",
                detail=(
                    "Hong bi xe xuong khien cot song that lung bi uon qua muc (hyperextension). "
                    "Dieu nay tao ap luc lon len dia dem cot song, co the dan den dau lung duoi man tinh. "
                    "Siet chat co core (bung + mong) de giu co the thang nhu mot tam van."
                ),
            ))
        elif max_alignment > self.BODY_PIKE_THRESHOLD:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="HIPS_PIKING",
                severity="medium",
                message=f"Hong nho len qua cao ({int(max_alignment)} deg). Ha hong xuong ngang than.",
                detail=(
                    "Hong nho len cao khien tai trong don ve vai thay vi phan bo deu. "
                    "Ha hong xuong sao cho co the tao thanh duong thang tu dau den got chan."
                ),
            ))

        # Rule 3: Elbow flare
        max_flare = float(np.max(elbow_flares)) if elbow_flares else 45.0

        if max_flare > self.ELBOW_FLARE_DANGER:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="ELBOW_FLARE_T_SHAPE",
                severity="high",
                message=f"Khuyu tay xoe ngang {int(max_flare)} deg — tu the chu T nguy hiem!",
                detail=(
                    "Canh tay xoe ngang tao thanh hinh chu T so voi than nguoi (~90 deg). "
                    "Tu the nay gay ap luc cuc lon len khop vai va chop xoay (rotator cuff), "
                    "de dan den viem gan, rach chop xoay hoac trat khop vai. "
                    "Hay khep khuyu tay vao khoang 45 deg so voi than — tao hinh mui ten (up) thay vi chu T."
                ),
            ))
        elif max_flare > self.ELBOW_FLARE_WARNING:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="ELBOW_FLARE_WIDE",
                severity="medium",
                message=f"Khuyu tay hoi xoe rong ({int(max_flare)} deg). Khep vao khoang 45 deg.",
                detail=(
                    f"Khuyu tay dang o goc {int(max_flare)} deg so voi than, hoi rong. "
                    "Muc tieu ly tuong: khoang 45 deg — tao hinh mui ten."
                ),
            ))

        # Rule 4: Head drop
        avg_head_drop = float(np.mean(head_drops)) if head_drops else 0.0
        if avg_head_drop > self.HEAD_DROP_THRESHOLD:
            score -= 10.0
            issues.append(PoseIssue(
                issue_code="HEAD_DROPPING",
                severity="low",
                message="Dau cui xuong qua nhieu. Giu dau thang hang voi cot song.",
                detail=(
                    "Khi hit dat, dau nen giu thang hang voi cot song — nhin xuong san "
                    "cach tay khoang 15-20cm phia truoc. Cui dau qua muc gay cang co co."
                ),
            ))

        # Breathing cue
        breathing = BreathingCue(
            phase="ASCENDING",
            instruction="Hít vào khi hạ người xuống. Thở ra mạnh khi đẩy lên.",
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

"""
plank_rule.py — Comprehensive plank form analysis.

Evaluates multiple biomechanical rules across the entire hold:
1. Body alignment (shoulder-hip-ankle, 165-195 deg acceptable)
2. Hip sag (hyperextension risk)
3. Hip pike (reduced effectiveness)
4. Head/neck alignment
5. Fatigue detection (form decline over time)

Robustness features:
- Visibility Gatekeeper: both shoulders, both hips, both ankles must be visible >= 0.65
- EMA body alignment smoothing (alpha=0.4)
- Frame-ratio thresholds (10%/30%) to avoid triggering on single bad frames
"""

import numpy as np
from typing import List, Dict, Any

from app.rules.base_rule import BasePoseRule, EmaState
from app.cv.angle_math import calculate_angle_2d, calculate_vertical_angle
from app.schemas.response import (
    PoseFeedbackResponse,
    RepFeedback,
    RepStatus,
    PoseIssue,
    VisibilityWarning,
    BreathingCue,
)


class PlankRule(BasePoseRule):
    """
    Multi-rule plank evaluator with EMA smoothing.

    MediaPipe landmark indices used:
      0  = NOSE
      11 = LEFT_SHOULDER     12 = RIGHT_SHOULDER
      23 = LEFT_HIP          24 = RIGHT_HIP
      27 = LEFT_ANKLE        28 = RIGHT_ANKLE
    """

    REQUIRED_LANDMARKS = ["11", "12", "23", "24", "27", "28"]

    BODY_SAG_THRESHOLD = 165.0
    BODY_SAG_SEVERE = 150.0
    BODY_PIKE_THRESHOLD = 195.0
    BODY_PIKE_SEVERE = 210.0
    HEAD_DROP_THRESHOLD = 40.0

    MIN_HOLD_SEC = 5.0

    # Frame ratio thresholds
    SAG_RATIO_WARNING = 0.10
    SAG_RATIO_SEVERE = 0.30
    PIKE_RATIO_WARNING = 0.10
    PIKE_RATIO_SEVERE = 0.30

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:

        visibility_warnings: List[VisibilityWarning] = []

        # EMA state
        ema = EmaState()

        # Per-frame tracking
        total_valid_frames = 0
        sagging_frames = 0
        severe_sagging_frames = 0
        piking_frames = 0
        severe_piking_frames = 0
        head_drop_frames = 0
        alignment_over_time: List[float] = []

        consecutive_missing = 0
        MAX_CONSECUTIVE_MISSING = 10

        for frame_idx, lm in enumerate(frames_landmarks):
            # --- Visibility gating: ALL 6 body-line joints required ---
            all_present, vis_warning = self.check_required_landmarks(
                lm, self.REQUIRED_LANDMARKS, frame_idx, fps
            )
            if not all_present:
                consecutive_missing += 1
                if vis_warning and consecutive_missing == MAX_CONSECUTIVE_MISSING:
                    vis_warning.message = (
                        "Camera can thay toan bo co the (vai, hong, mat ca). "
                        "Dat camera tu xa va tu ben hong."
                    )
                    visibility_warnings.append(vis_warning)
                continue

            consecutive_missing = 0

            # --- Extract landmarks ---
            l_shoulder = np.array([lm["11"]["x"], lm["11"]["y"]])
            r_shoulder = np.array([lm["12"]["x"], lm["12"]["y"]])
            l_hip = np.array([lm["23"]["x"], lm["23"]["y"]])
            r_hip = np.array([lm["24"]["x"], lm["24"]["y"]])
            l_ankle = np.array([lm["27"]["x"], lm["27"]["y"]])
            r_ankle = np.array([lm["28"]["x"], lm["28"]["y"]])

            shoulder = (l_shoulder + r_shoulder) / 2
            hip = (l_hip + r_hip) / 2
            ankle = (l_ankle + r_ankle) / 2

            nose = np.array([lm["0"]["x"], lm["0"]["y"]]) if "0" in lm else None

            # --- Raw angles ---
            raw_body = calculate_angle_2d(shoulder, hip, ankle)

            # --- EMA smoothing ---
            ba = ema.update_body(raw_body)

            head_drop = 0.0
            if nose is not None:
                head_drop = calculate_vertical_angle(nose, shoulder)

            total_valid_frames += 1
            alignment_over_time.append(ba)

            # --- Classify this frame ---
            if ba < self.BODY_SAG_SEVERE:
                severe_sagging_frames += 1
                sagging_frames += 1
            elif ba < self.BODY_SAG_THRESHOLD:
                sagging_frames += 1
            elif ba > self.BODY_PIKE_SEVERE:
                severe_piking_frames += 1
                piking_frames += 1
            elif ba > self.BODY_PIKE_THRESHOLD:
                piking_frames += 1

            if head_drop > self.HEAD_DROP_THRESHOLD:
                head_drop_frames += 1

        # --- Hold duration ---
        hold_duration_sec = round(total_valid_frames / max(fps, 1.0), 1)
        is_valid_hold = hold_duration_sec >= self.MIN_HOLD_SEC

        if total_valid_frames == 0:
            visibility_warnings.append(VisibilityWarning(
                warning_code="NO_VALID_FRAMES",
                message="Khong co frame nao phat hien duoc tu the plank. Kiem tra lai camera.",
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

        # --- Evaluate rules ---
        issues: List[PoseIssue] = []
        score = 100.0

        # Rule 1: Hip sag
        sag_ratio = sagging_frames / total_valid_frames
        severe_sag_ratio = severe_sagging_frames / total_valid_frames

        if severe_sag_ratio > self.SAG_RATIO_SEVERE:
            score -= 30.0
            issues.append(PoseIssue(
                issue_code="HIPS_SAGGING_SEVERE",
                severity="high",
                message=f"Hong bi vong nghiem trong ({int(severe_sag_ratio * 100)}% thoi gian). Siet co bung!",
                detail=(
                    "Lung duoi bi uon qua muc (hyperextension) trong phan lon thoi gian giu plank. "
                    "Dieu nay dat ap luc rat lon len cot song that lung va dia dem, "
                    "co the dan den dau lung duoi man tinh hoac thoat vi dia dem. "
                    "Hay tuong tuong keo ron vao phia cot song, siet chat co mong, "
                    "va giu co the thang nhu mot tam van."
                ),
            ))
        elif sag_ratio > self.SAG_RATIO_WARNING:
            score -= 20.0
            issues.append(PoseIssue(
                issue_code="HIPS_SAGGING",
                severity="medium",
                message=f"Hong bi vong ({int(sag_ratio * 100)}% thoi gian). Keo ron vao trong.",
                detail=(
                    "Hong bat dau xe xuong, dac biet khi met. "
                    "Siet co core va tuong tuong giu co the thang tu dau den got chan."
                ),
            ))

        # Rule 2: Hip pike
        pike_ratio = piking_frames / total_valid_frames
        severe_pike_ratio = severe_piking_frames / total_valid_frames

        if severe_pike_ratio > self.PIKE_RATIO_SEVERE:
            score -= 25.0
            issues.append(PoseIssue(
                issue_code="HIPS_PIKING_SEVERE",
                severity="high",
                message=f"Hong nho len qua cao ({int(pike_ratio * 100)}% thoi gian). Ha hong xuong.",
                detail=(
                    "Mong nho len cao tao thanh hinh chu V thay vi duong thang. "
                    "Ha hong xuong ngang than, giu co the thang."
                ),
            ))
        elif pike_ratio > self.PIKE_RATIO_WARNING:
            score -= 15.0
            issues.append(PoseIssue(
                issue_code="HIPS_PIKING",
                severity="medium",
                message=f"Hong hoi nho len ({int(pike_ratio * 100)}% thoi gian). Ha hong xuong ngang than.",
                detail=(
                    "Hong nho len nhe, giam hieu qua tap luyen cho co bung. "
                    "Ha hong xuong de co the tao thanh duong thang."
                ),
            ))

        # Rule 3: Head/neck alignment
        if total_valid_frames > 0:
            head_drop_ratio = head_drop_frames / total_valid_frames
            if head_drop_ratio > 0.15:
                score -= 10.0
                issues.append(PoseIssue(
                    issue_code="HEAD_DROPPING",
                    severity="low",
                    message="Dau cui xuong qua nhieu. Giu co thang hang voi cot song.",
                    detail=(
                        "Dau cui xuong qua muc gay cang co co va pha vo duong thang cua co the. "
                        "Hay nhin xuong san ngay phia truoc tay, giu co o vi tri trung tinh."
                    ),
                ))

        # Rule 4: Fatigue detection — form deteriorating over time
        if len(alignment_over_time) > 20:
            quarter = len(alignment_over_time) // 4
            first = float(np.mean(alignment_over_time[:quarter]))
            last = float(np.mean(alignment_over_time[-quarter:]))
            if first - last > 10.0:
                score -= 10.0
                issues.append(PoseIssue(
                    issue_code="FATIGUE_FORM_BREAKDOWN",
                    severity="medium",
                    message="Form suy giam ro ret o cuoi bai. Co core dang met.",
                    detail=(
                        "Tu the tot o dau nhung xau dan khi met — dieu nay rat pho bien. "
                        "Hay ket thuc plank TRUOC khi form bi pha vo thay vi co gang giu bang moi gia. "
                        "Giu 30 giay voi form tot tot hon giu 60 giay voi form xau."
                    ),
                ))

        # Breathing cue
        breathing = BreathingCue(
            phase="HOLD",
            instruction="Tho deu va lien tuc. Hit vao bang mui, tho ra bang mieng. KHONG nin tho.",
        )

        score = max(0.0, min(100.0, score))

        if not is_valid_hold:
            status = RepStatus.NO_REP
        elif score < 75.0 or any(i.severity == "high" for i in issues):
            status = RepStatus.BAD_FORM
        else:
            status = RepStatus.GOOD_REP

        rep = RepFeedback(
            rep_number=1,
            score=score,
            status=status,
            is_rep_valid=is_valid_hold,
            timestamp_sec=hold_duration_sec,
            issues=issues,
            breathing_cue=breathing,
        )
        reps = [rep]

        session_summary = self.build_session_summary(
            reps, visibility_warnings, len(frames_landmarks), "Plank"
        )
        if is_valid_hold:
            session_summary.strengths.insert(0, f"Giữ plank được {hold_duration_sec}s.")
        else:
            session_summary.improvement_areas.insert(
                0, f"Thời gian giữ chỉ {hold_duration_sec}s — cần tối thiểu {self.MIN_HOLD_SEC}s."
            )

        return PoseFeedbackResponse(
            rep_count=1 if is_valid_hold else 0,
            valid_rep_count=1 if is_valid_hold else 0,
            good_rep_count=1 if (is_valid_hold and status == RepStatus.GOOD_REP) else 0,
            score=score,
            rep_feedback=reps,
            session_summary=session_summary,
            visibility_warnings=visibility_warnings,
        )

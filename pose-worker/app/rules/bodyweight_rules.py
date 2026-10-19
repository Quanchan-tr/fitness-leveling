"""
bodyweight_rules.py — Lunge, Glute Bridge, Jumping Jack, Mountain Climber (rep-based)
and Wall Sit (hold-based). No equipment needed.

Rep-based rules share one state machine (_RepRule). A subclass only provides:
  measure(lm) -> dict | None   per-frame metrics; MUST contain "effort" (0 = rest, ~1 = full ROM)
                               and "angle" (value shown in the live UI)
  judge(peak, series, fps, ctx) -> List[PoseIssue]   rule-based form checks for one rep

All geometry is 2D normalized screen space (like plank_rule), so each exercise
documents the camera view it expects.
ponytail: thresholds are heuristics tuned on synthetic geometry; calibrate on real videos.
"""

from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.cv.angle_math import calculate_angle_2d, calculate_vertical_angle, detect_camera_view
from app.rules.base_rule import BasePoseRule
from app.schemas.response import (
    BreathingCue,
    PoseFeedbackResponse,
    PoseIssue,
    RepFeedback,
    RepStatus,
    VisibilityWarning,
)

SEV_PENALTY = {"high": 25.0, "medium": 15.0, "low": 8.0}
MAX_CONSECUTIVE_MISSING = 10


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _p(lm: Dict[str, Any], k: str) -> np.ndarray:
    return np.array([lm[k]["x"], lm[k]["y"]], dtype=float)


def _has(lm: Dict[str, Any], *ks: str) -> bool:
    return all(k in lm for k in ks)


def _side(lm: Dict[str, Any], *left_ids: int) -> Optional[List[np.ndarray]]:
    """Points for the left side (ids) if all visible, else right side (ids+1), else None."""
    for off in (0, 1):
        ks = [str(i + off) for i in left_ids]
        if _has(lm, *ks):
            return [_p(lm, k) for k in ks]
    return None


def _mid(lm: Dict[str, Any], *ks: str) -> Optional[np.ndarray]:
    pts = [_p(lm, k) for k in ks if k in lm]
    return np.mean(pts, axis=0) if pts else None


def _issue(code: str, sev: str, msg: str, detail: Optional[str] = None) -> PoseIssue:
    return PoseIssue(issue_code=code, severity=sev, message=msg, detail=detail or msg)


# ---------------------------------------------------------------------------
# Generic rep-based rule
# ---------------------------------------------------------------------------

class _RepRule(BasePoseRule):
    NAME = ""
    VIS_MSG = "Camera cần thấy rõ toàn bộ cơ thể."
    HALF_MSG = "Chưa đủ biên độ vận động."
    BREATH = ("REP", "Thở đều, thở ra khi dùng sức.")
    KEYPOINTS = ("11", "12", "23", "24", "25", "26", "27", "28")

    START = 0.3        # effort needed to open a rep
    END = 0.15         # effort below which the rep is closed (hysteresis vs START)
    PEAK_OK = 0.9      # min peak effort for a valid rep (ROM)
    ALPHA = 0.4        # EMA smoothing of effort
    MIN_REP_SEC = 0.6  # reps shorter than this are noise
    COOLDOWN_SEC = 0.2
    RHYTHM = False     # flag reps much slower than the session median

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        raise NotImplementedError

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        raise NotImplementedError

    def grade_rep(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> Tuple[List[PoseIssue], float, RepStatus, bool]:
        """Shared by batch (video) and realtime (websocket) evaluation."""
        rom_ok = peak >= self.PEAK_OK
        issues = [] if rom_ok else [_issue("HALF_REP", "high", self.HALF_MSG)]
        if rom_ok:
            issues += self.judge(peak, s, fps, ctx)

        durs = ctx.setdefault("durs", [])
        dur = len(s["effort"]) / max(fps, 1.0)
        if self.RHYTHM and rom_ok and len(durs) >= 3 and dur > 1.6 * float(np.median(durs)):
            issues.append(_issue(
                "RHYTHM_SLOWING", "low",
                "Nhịp tập đang chậm lại rõ rệt.",
                "Nhịp rep chậm dần so với đầu bài — dấu hiệu mệt. Nghỉ ngắn rồi tiếp tục để giữ form.",
            ))
        durs.append(dur)

        penalty = 0.0 if rom_ok else 30.0
        penalty += sum(SEV_PENALTY[i.severity] for i in issues if i.issue_code != "HALF_REP")
        score = max(0.0, 100.0 - penalty)
        status, valid = self.classify_rep(rom_ok, score, issues, rom_issue_codes={"HALF_REP"})
        return issues, score, status, valid

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:
        fps = max(fps, 1.0)
        min_frames = max(3, int(fps * self.MIN_REP_SEC))
        cooldown = int(fps * self.COOLDOWN_SEC)

        reps: List[RepFeedback] = []
        warnings: List[VisibilityWarning] = []
        ctx: Dict[str, Any] = {}
        series: Dict[str, List[float]] = {}
        active, e, peak, start, last_end, missing = False, 0.0, 0.0, 0, -cooldown, 0

        for i, lm in enumerate(frames_landmarks):
            m = self.measure(lm) if lm else None
            if m is None:
                missing += 1
                if missing == MAX_CONSECUTIVE_MISSING:
                    warnings.append(VisibilityWarning(
                        warning_code="INCOMPLETE_BODY_VISIBLE",
                        message=self.VIS_MSG,
                        frame_index=i,
                        timestamp_sec=round(i / fps, 2),
                    ))
                continue
            missing = 0

            e = self.ALPHA * m["effort"] + (1.0 - self.ALPHA) * e
            m["effort"] = e

            if not active and e >= self.START and i - last_end >= cooldown:
                active, start, peak, series = True, i, e, {}
            if active:
                peak = max(peak, e)
                for k, v in m.items():
                    series.setdefault(k, []).append(v)
                if e <= self.END:
                    active = False
                    if i - start >= min_frames:
                        issues, score, status, valid = self.grade_rep(peak, series, fps, ctx)
                        reps.append(RepFeedback(
                            rep_number=len(reps) + 1,
                            score=score,
                            status=status,
                            is_rep_valid=valid,
                            timestamp_sec=round(i / fps, 2),
                            issues=issues,
                            breathing_cue=BreathingCue(phase=self.BREATH[0], instruction=self.BREATH[1]),
                        ))
                        last_end = i

        return self.build_rep_response(reps, warnings, len(frames_landmarks), self.NAME)


# ---------------------------------------------------------------------------
# 1. Lunge — side view (front view adds knee-valgus check)
# ---------------------------------------------------------------------------

class LungeRule(_RepRule):
    NAME = "Lunge"
    VIS_MSG = "Camera cần thấy rõ hông, đầu gối và cổ chân cả hai chân (nên đặt camera từ bên hông)."
    HALF_MSG = "Hạ chưa đủ sâu. Gập gối trước tới ~90°."
    BREATH = ("DESCENDING", "Hít vào khi hạ xuống, thở ra khi đẩy người lên.")
    MIN_REP_SEC = 0.8
    START, END = 0.25, 0.12   # effort = (170 - front knee angle) / 80

    BACK_KNEE_MAX = 120.0
    LEAN_WARN, LEAN_HIGH = 20.0, 35.0
    KNEE_OVER_TOE = 0.35      # knee ahead of ankle, as fraction of shin length
    VALGUS = 0.25             # knee inside ankle, as fraction of thigh length
    TOO_FAST_SEC = 1.0

    def measure(self, lm):
        if not _has(lm, "23", "24", "25", "26", "27", "28"):
            return None
        h = (_p(lm, "23"), _p(lm, "24"))
        k = (_p(lm, "25"), _p(lm, "26"))
        a = (_p(lm, "27"), _p(lm, "28"))
        ang = [calculate_angle_2d(h[i], k[i], a[i]) for i in (0, 1)]
        f = 0 if ang[0] <= ang[1] else 1  # front leg = more bent knee
        b = 1 - f

        m = {"effort": max(0.0, (170.0 - ang[f]) / 80.0), "angle": ang[f], "back_knee": ang[b]}

        sh, mid_hip = _mid(lm, "11", "12"), (h[0] + h[1]) / 2.0
        if sh is not None:
            m["lean"] = calculate_vertical_angle(mid_hip, sh)

        view = detect_camera_view(lm)
        shin = np.linalg.norm(k[f] - a[f]) + 1e-6
        thigh = np.linalg.norm(h[f] - k[f]) + 1e-6
        dx = a[f][0] - a[b][0]
        if view == "SIDE_VIEW" and abs(dx) > 1e-3:
            m["knee_over"] = (k[f][0] - a[f][0]) * np.sign(dx) / shin
        if view == "FRONT_VIEW":
            inward = np.sign(mid_hip[0] - a[f][0])
            m["valgus"] = (k[f][0] - a[f][0]) * inward / thigh
        return m

    def judge(self, peak, s, fps, ctx):
        out: List[PoseIssue] = []
        if min(s["back_knee"]) > self.BACK_KNEE_MAX:
            out.append(_issue(
                "BACK_KNEE_HIGH", "medium", "Hạ gối sau thấp hơn, gần chạm sàn.",
                "Gối chân sau nên gập khoảng 90° và gần chạm sàn để hai chân chia đều tải.",
            ))
        if "lean" in s:
            lean = max(s["lean"])
            if lean > self.LEAN_HIGH:
                out.append(_issue(
                    "EXCESSIVE_FORWARD_LEAN", "high", f"Thân nghiêng quá nhiều ({int(lean)}°). Giữ lưng thẳng!",
                    "Thân gập về trước tạo áp lực lên cột sống thắt lưng. Siết cơ bụng, giữ ngực mở.",
                ))
            elif lean > self.LEAN_WARN:
                out.append(_issue(
                    "FORWARD_LEAN", "medium", f"Thân hơi nghiêng ({int(lean)}°). Giữ thân thẳng đứng.",
                    "Thân trên nên thẳng đứng suốt động tác.",
                ))
        if "knee_over" in s and max(s["knee_over"]) > self.KNEE_OVER_TOE:
            out.append(_issue(
                "KNEE_OVER_TOES", "medium", "Gối trước vượt quá mũi chân. Bước dài hơn.",
                "Gối vượt mũi chân quá nhiều làm tăng lực cắt lên khớp gối. Bước chân dài hơn, dồn trọng tâm vào gót.",
            ))
        if "valgus" in s and max(s["valgus"]) > self.VALGUS:
            out.append(_issue(
                "KNEE_VALGUS", "high", "Gối trước chụm vào trong. Đẩy gối ra ngoài!",
                "Gối khép vào trong gây xoắn dây chằng ACL. Hướng gối theo hướng các ngón chân.",
            ))
        if len(s["effort"]) / max(fps, 1.0) < self.TOO_FAST_SEC:
            out.append(_issue(
                "TOO_FAST", "low", "Động tác quá nhanh. Hạ xuống có kiểm soát.",
                "Hạ người chậm (~2 giây) để cơ chân làm việc thay vì dùng quán tính.",
            ))
        return out


# ---------------------------------------------------------------------------
# 2. Glute Bridge — side view, lying on back
# ---------------------------------------------------------------------------

class GluteBridgeRule(_RepRule):
    NAME = "Glute Bridge"
    VIS_MSG = "Camera cần thấy rõ vai, hông, gối (đặt camera từ bên hông, thấy toàn thân)."
    HALF_MSG = "Nâng hông chưa đủ cao. Duỗi thẳng hông tới khi vai-hông-gối thành một đường."
    BREATH = ("ASCENDING", "Thở ra khi nâng hông, hít vào khi hạ xuống.")
    MIN_REP_SEC = 1.0
    START, END = 0.25, 0.15   # effort = (shoulder-hip-knee angle - 135) / 40

    KNEE_MIN, KNEE_MAX = 70.0, 110.0
    ARCH_WARN, ARCH_HIGH = 0.10, 0.18   # hip above shoulder-knee line, fraction of its length
    HIP_TILT = 0.15                     # |hipL_y - hipR_y| / thigh length
    TOP_HOLD_SEC = 1.0
    TOP_EFFORT = 0.85
    DROP_SEC = 0.6

    def measure(self, lm):
        pts = _side(lm, 11, 23, 25, 27)
        if pts is None:
            return None
        sh, hip, knee, ankle = pts
        hip_ang = calculate_angle_2d(sh, hip, knee)
        m = {
            "effort": max(0.0, (hip_ang - 135.0) / 40.0),
            "angle": hip_ang,
            "knee": calculate_angle_2d(hip, knee, ankle),
        }
        if abs(knee[0] - sh[0]) > 1e-3:
            t = (hip[0] - sh[0]) / (knee[0] - sh[0])
            line_y = sh[1] + t * (knee[1] - sh[1])
            m["arch"] = (line_y - hip[1]) / (np.linalg.norm(knee - sh) + 1e-6)
        if _has(lm, "23", "24", "25"):
            thigh = np.linalg.norm(_p(lm, "23") - _p(lm, "25")) + 1e-6
            m["tilt"] = abs(lm["23"]["y"] - lm["24"]["y"]) / thigh
        return m

    def judge(self, peak, s, fps, ctx):
        out: List[PoseIssue] = []
        if "arch" in s:
            arch = max(s["arch"])
            if arch > self.ARCH_HIGH:
                out.append(_issue(
                    "HIPS_OVER_EXTENDED", "high", "Ưỡn lưng quá mức. Siết bụng, dừng khi hông thẳng hàng.",
                    "Đẩy hông quá cao làm ưỡn thắt lưng, gây áp lực lên cột sống. Dừng khi vai-hông-gối thẳng hàng.",
                ))
            elif arch > self.ARCH_WARN:
                out.append(_issue(
                    "HIPS_OVER_EXTENDED", "medium", "Hông hơi ưỡn. Siết cơ bụng khi ở đỉnh.",
                    "Siết cơ bụng và mông, tránh ưỡn thắt lưng ở đỉnh.",
                ))
        med_knee = float(np.median(s["knee"]))
        if not self.KNEE_MIN <= med_knee <= self.KNEE_MAX:
            out.append(_issue(
                "KNEE_ANGLE_OFF", "low", f"Góc gối {int(med_knee)}°. Giữ gối gập khoảng 90°.",
                "Đặt bàn chân sao cho gối gập khoảng 80–100° để mông (không phải đùi sau) phát lực chính.",
            ))
        if "tilt" in s and max(s["tilt"]) > self.HIP_TILT:
            out.append(_issue(
                "HIP_TILT", "medium", "Hông lệch hai bên. Nâng đều hai bên hông.",
                "Hông lệch cho thấy một bên mông yếu hơn. Dồn lực đều qua hai bàn chân.",
            ))
        eff = s["effort"]
        top_frames = sum(1 for v in eff if v >= self.TOP_EFFORT)
        if top_frames < fps * self.TOP_HOLD_SEC:
            out.append(_issue(
                "NO_TOP_HOLD", "low", "Giữ ở đỉnh khoảng 1 giây rồi mới hạ.",
                "Dừng ~1 giây ở đỉnh và siết mông để tăng hiệu quả kích hoạt cơ.",
            ))
        last_top = max((i for i, v in enumerate(eff) if v >= self.TOP_EFFORT), default=0)
        if (len(eff) - last_top) < fps * self.DROP_SEC:
            out.append(_issue(
                "DROPPED_TOO_FAST", "low", "Hạ hông quá nhanh. Hạ có kiểm soát.",
                "Hạ hông chậm (~1–2 giây) thay vì buông rơi để giữ cơ làm việc.",
            ))
        return out


# ---------------------------------------------------------------------------
# 3. Jumping Jack — front view
# ---------------------------------------------------------------------------

class JumpingJackRule(_RepRule):
    NAME = "Jumping Jack"
    VIS_MSG = "Camera cần thấy rõ tay, vai, hông và cổ chân (đứng đối diện camera, thấy toàn thân)."
    HALF_MSG = "Mở tay/chân chưa đủ rộng."
    BREATH = ("REP", "Thở đều theo nhịp nhảy: hít vào khi mở, thở ra khi khép.")
    KEYPOINTS = ("11", "12", "15", "16", "23", "24", "27", "28")
    MIN_REP_SEC = 0.35
    ALPHA = 0.6
    RHYTHM = True
    START, END, PEAK_OK = 0.3, 0.15, 0.85  # effort = mean(arm_norm, leg_norm)

    ARMS_OVERHEAD = 0.85
    LEGS_WIDE = 0.85
    SYNC_MAX = 0.35
    ARM_ASYM, LEG_ASYM = 0.25, 0.35
    CLOSE_MAX = 0.4

    def measure(self, lm):
        if not _has(lm, "11", "12", "15", "16", "23", "24", "27", "28"):
            return None
        sh, hip = _mid(lm, "11", "12"), _mid(lm, "23", "24")
        torso = np.linalg.norm(sh - hip) + 1e-6
        sw = abs(lm["11"]["x"] - lm["12"]["x"])
        if sw < 0.02:  # not facing the camera
            return None

        arm_h = (sh[1] - (lm["15"]["y"] + lm["16"]["y"]) / 2.0) / torso   # ~-0.9 down .. +0.7 overhead
        arm = float(np.clip((arm_h + 0.9) / 1.6, 0.0, 1.0))
        ankle_w = abs(lm["27"]["x"] - lm["28"]["x"]) / sw                  # ~0.6 closed .. 2+ open
        leg = float(np.clip((ankle_w - 0.9) / 1.0, 0.0, 1.0))
        return {
            "effort": (arm + leg) / 2.0,
            "angle": 100.0 * (arm + leg) / 2.0,  # no single joint angle: show % open
            "arm": arm,
            "leg": leg,
            "arm_asym": abs(lm["15"]["y"] - lm["16"]["y"]) / torso,
            "leg_asym": abs(lm["27"]["x"] + lm["28"]["x"] - 2.0 * hip[0]) / sw,
        }

    def judge(self, peak, s, fps, ctx):
        out: List[PoseIssue] = []
        if max(s["arm"]) < self.ARMS_OVERHEAD:
            out.append(_issue(
                "ARMS_NOT_OVERHEAD", "medium", "Đưa tay lên cao quá đầu.",
                "Tay nên vượt qua đầu ở vị trí mở để đạt đủ biên độ vai.",
            ))
        if max(s["leg"]) < self.LEGS_WIDE:
            out.append(_issue(
                "LEGS_NOT_WIDE", "medium", "Mở chân rộng hơn (rộng hơn vai).",
                "Hai chân nên mở rộng hơn vai ở vị trí mở.",
            ))
        sync = float(np.mean(np.abs(np.array(s["arm"]) - np.array(s["leg"]))))
        if sync > self.SYNC_MAX:
            out.append(_issue(
                "OUT_OF_SYNC", "medium", "Tay và chân chưa đồng bộ.",
                "Tay và chân cần mở/khép cùng lúc. Tập chậm lại để phối hợp nhịp nhàng.",
            ))
        if max(s["arm_asym"]) > self.ARM_ASYM or max(s["leg_asym"]) > self.LEG_ASYM:
            out.append(_issue(
                "ASYMMETRY", "low", "Hai bên cơ thể mở không đều.",
                "Giữ hai tay lên cao đều nhau và hai chân mở đối xứng quanh trục thân.",
            ))
        if max(s["arm"][-1], s["leg"][-1]) > self.CLOSE_MAX:
            out.append(_issue(
                "INCOMPLETE_CLOSE", "low", "Khép tay và chân hoàn toàn ở cuối mỗi rep.",
                "Khép chân sát nhau và hạ tay xuống hông trước khi bắt đầu rep tiếp theo.",
            ))
        return out


# ---------------------------------------------------------------------------
# 4. Mountain Climber — side view, plank position
# ---------------------------------------------------------------------------

class MountainClimberRule(_RepRule):
    NAME = "Mountain Climber"
    VIS_MSG = "Camera cần thấy rõ vai, hông, gối và cổ chân (đặt camera từ bên hông)."
    HALF_MSG = "Kéo gối chưa đủ sâu về phía ngực."
    BREATH = ("REP", "Thở nhanh và đều. KHÔNG nín thở.")
    KEYPOINTS = ("11", "12", "15", "16", "23", "24", "25", "26", "27", "28")
    MIN_REP_SEC = 0.2
    COOLDOWN_SEC = 0.05
    ALPHA = 0.6
    RHYTHM = True
    START, END, PEAK_OK = 0.3, 0.15, 0.9   # effort = (170 - hip angle of driving leg) / 80

    PIKE_WARN, PIKE_HIGH, SAG_WARN = 0.10, 0.18, -0.10   # hip off shoulder-ankle line
    SHOULDER_BEHIND = 0.5                                # |wrist_x - shoulder_x| / torso
    SAME_LEG_RUN = 3

    def measure(self, lm):
        sh_any = _mid(lm, "11", "12")
        if sh_any is None:
            return None
        hip_ang: Dict[int, float] = {}
        for leg, (hk, kk) in enumerate((("23", "25"), ("24", "26"))):
            if _has(lm, hk, kk):
                sh = _p(lm, "11" if leg == 0 else "12") if ("11" if leg == 0 else "12") in lm else sh_any
                hip_ang[leg] = calculate_angle_2d(sh, _p(lm, hk), _p(lm, kk))
        if not hip_ang:
            return None

        drive = min(hip_ang, key=hip_ang.get)
        m = {
            "effort": max(0.0, (170.0 - hip_ang[drive]) / 80.0),
            "angle": hip_ang[drive],
            "leg": float(drive),
            "two_legs": 1.0 if len(hip_ang) == 2 else 0.0,
        }

        # Body line from the straighter (back) leg's ankle
        back = max(hip_ang, key=hip_ang.get)
        ak, hk = ("27" if back == 0 else "28"), ("23" if back == 0 else "24")
        if _has(lm, ak, hk) and abs(_p(lm, ak)[0] - sh_any[0]) > 1e-3:
            a, h = _p(lm, ak), _p(lm, hk)
            t = (h[0] - sh_any[0]) / (a[0] - sh_any[0])
            line_y = sh_any[1] + t * (a[1] - sh_any[1])
            m["hip_dev"] = (line_y - h[1]) / (np.linalg.norm(a - sh_any) + 1e-6)  # + = piked, - = sagging

        wr = _mid(lm, "15", "16")
        hip_mid = _mid(lm, "23", "24")
        if wr is not None and hip_mid is not None:
            m["wrist_off"] = abs(wr[0] - sh_any[0]) / (np.linalg.norm(sh_any - hip_mid) + 1e-6)
        return m

    def judge(self, peak, s, fps, ctx):
        out: List[PoseIssue] = []
        if "hip_dev" in s:
            dev_hi, dev_lo = max(s["hip_dev"]), min(s["hip_dev"])
            if dev_hi > self.PIKE_HIGH:
                out.append(_issue(
                    "HIPS_TOO_HIGH", "high", "Hông nhô quá cao. Hạ hông về ngang vai.",
                    "Hông nhô cao biến plank thành chữ V, giảm hiệu quả cơ bụng và tăng tải lên vai.",
                ))
            elif dev_hi > self.PIKE_WARN:
                out.append(_issue(
                    "HIPS_TOO_HIGH", "medium", "Hông hơi cao. Giữ thân thành một đường thẳng.",
                    "Hạ hông xuống ngang thân để cơ bụng làm việc nhiều hơn.",
                ))
            if dev_lo < self.SAG_WARN:
                out.append(_issue(
                    "HIPS_SAGGING", "high", "Hông võng xuống. Siết cơ bụng!",
                    "Hông võng làm ưỡn thắt lưng quá mức. Siết bụng, kéo rốn về phía cột sống.",
                ))
        if "wrist_off" in s and max(s["wrist_off"]) > self.SHOULDER_BEHIND:
            out.append(_issue(
                "SHOULDERS_NOT_OVER_HANDS", "medium", "Vai lệch khỏi vị trí trên cổ tay.",
                "Giữ vai nằm ngay phía trên cổ tay để ổn định vai và truyền lực tốt.",
            ))
        if max(s["two_legs"]) > 0:
            legs = ctx.setdefault("legs", [])
            legs.append(s["leg"][int(np.argmax(s["effort"]))])
            if len(legs) >= self.SAME_LEG_RUN and len(set(legs[-self.SAME_LEG_RUN:])) == 1:
                out.append(_issue(
                    "NOT_ALTERNATING", "medium", "Hãy đổi chân luân phiên, đừng chỉ kéo một chân.",
                    "Kéo gối trái và phải luân phiên để hai bên được tập đều.",
                ))
        return out


REP_RULES: Dict[str, _RepRule] = {
    "lunge": LungeRule(),
    "glute_bridge": GluteBridgeRule(),
    "jumping_jack": JumpingJackRule(),
    "mountain_climber": MountainClimberRule(),
}


# ---------------------------------------------------------------------------
# 5. Wall Sit — side view, hold-based
# ---------------------------------------------------------------------------

class WallSitRule(BasePoseRule):
    NAME = "Wall Sit"
    MIN_HOLD_SEC = 10.0
    KNEE_LOW, KNEE_HIGH = 75.0, 105.0   # knee angle window (target ~90°)
    THIGH_PARALLEL = 0.30               # |hip_y - knee_y| / thigh length
    KNEE_OVER_ANKLE = 0.35              # knee ahead of ankle / shin length
    BACK_LEAN = 15.0                    # degrees from vertical
    RATIO_WARN, RATIO_HIGH = 0.20, 0.50
    FATIGUE_DRIFT = 12.0
    KEYPOINTS = ("11", "12", "23", "24", "25", "26", "27", "28")

    FLAGS: Dict[str, Tuple[str, str, str]] = {
        "SITTING_TOO_HIGH": ("medium", "Ngồi thấp xuống thêm, gối gập ~90°.",
                             "Gối đang mở hơn 105°. Trượt thấp xuống để đùi song song sàn."),
        "SITTING_TOO_DEEP": ("medium", "Nâng người lên một chút, gối gập ~90°.",
                             "Gối gập dưới 75° tăng tải lên khớp gối. Giữ khoảng 90°."),
        "THIGH_NOT_PARALLEL": ("medium", "Đùi chưa song song sàn.",
                               "Hông nên ngang gối để đùi song song sàn."),
        "KNEE_OVER_ANKLE": ("medium", "Gối vượt quá mắt cá. Đưa chân ra xa tường hơn.",
                            "Gối nên nằm trên mắt cá. Gối vượt xa tăng lực cắt lên khớp gối."),
        "BACK_NOT_VERTICAL": ("low", "Giữ lưng sát tường, thẳng đứng.",
                              "Lưng nên áp sát tường và thẳng đứng, không ngả về trước."),
    }

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        pts = _side(lm, 23, 25, 27)
        if pts is None:
            return None
        hip, knee, ankle = pts
        thigh = np.linalg.norm(hip - knee) + 1e-6
        shin = np.linalg.norm(knee - ankle) + 1e-6
        fwd = np.sign(knee[0] - hip[0]) or 1.0
        m = {
            "knee": calculate_angle_2d(hip, knee, ankle),
            "thigh_par": abs(hip[1] - knee[1]) / thigh,
            "knee_fwd": (knee[0] - ankle[0]) * fwd / shin,
        }
        sh = _mid(lm, "11", "12")
        if sh is not None:
            m["lean"] = calculate_vertical_angle(hip, sh)
        return m

    def flags(self, m: Dict[str, float]) -> List[str]:
        out = []
        if m["knee"] > self.KNEE_HIGH:
            out.append("SITTING_TOO_HIGH")
        elif m["knee"] < self.KNEE_LOW:
            out.append("SITTING_TOO_DEEP")
        if m["thigh_par"] > self.THIGH_PARALLEL:
            out.append("THIGH_NOT_PARALLEL")
        if m["knee_fwd"] > self.KNEE_OVER_ANKLE:
            out.append("KNEE_OVER_ANKLE")
        if m.get("lean", 0.0) > self.BACK_LEAN:
            out.append("BACK_NOT_VERTICAL")
        return out

    def process_landmarks_sequence(
        self, frames_landmarks: List[Dict[str, Any]], fps: float
    ) -> PoseFeedbackResponse:
        fps = max(fps, 1.0)
        warnings: List[VisibilityWarning] = []
        counts: Dict[str, int] = {}
        knees: List[float] = []
        valid_frames = in_position = missing = 0

        for i, lm in enumerate(frames_landmarks):
            m = self.measure(lm) if lm else None
            if m is None:
                missing += 1
                if missing == MAX_CONSECUTIVE_MISSING:
                    warnings.append(VisibilityWarning(
                        warning_code="INCOMPLETE_BODY_VISIBLE",
                        message="Camera cần thấy rõ hông, gối và cổ chân (đặt camera từ bên hông).",
                        affected_landmarks=["23", "25", "27"],
                        frame_index=i,
                        timestamp_sec=round(i / fps, 2),
                    ))
                continue
            missing = 0
            valid_frames += 1
            knees.append(m["knee"])
            fl = self.flags(m)
            for f in fl:
                counts[f] = counts.get(f, 0) + 1
            if "SITTING_TOO_HIGH" not in fl and "SITTING_TOO_DEEP" not in fl:
                in_position += 1

        if valid_frames == 0:
            warnings.append(VisibilityWarning(
                warning_code="NO_VALID_FRAMES",
                message="Không có frame nào phát hiện được tư thế wall sit. Kiểm tra lại camera.",
                affected_landmarks=["23", "25", "27"],
            ))
            return PoseFeedbackResponse(
                rep_count=0, score=0.0, rep_feedback=[],
                session_summary=self.build_session_summary([], warnings, len(frames_landmarks), self.NAME),
                visibility_warnings=warnings,
            )

        issues: List[PoseIssue] = []
        for code, (sev, msg, detail) in self.FLAGS.items():
            ratio = counts.get(code, 0) / valid_frames
            if ratio > self.RATIO_WARN:
                if ratio > self.RATIO_HIGH:
                    sev = "high"
                issues.append(_issue(code, sev, f"{msg} ({int(ratio * 100)}% thời gian)", detail))

        if len(knees) > 20:
            q = len(knees) // 4
            if abs(float(np.mean(knees[:q])) - float(np.mean(knees[-q:]))) > self.FATIGUE_DRIFT:
                issues.append(_issue(
                    "FATIGUE_FORM_BREAKDOWN", "medium", "Form suy giảm rõ rệt ở cuối bài. Cơ đùi đang mệt.",
                    "Góc gối trôi dần theo thời gian. Kết thúc TRƯỚC khi form bị phá vỡ.",
                ))

        hold_sec = round(in_position / fps, 1)
        is_valid = hold_sec >= self.MIN_HOLD_SEC
        score = max(0.0, 100.0 - sum(SEV_PENALTY[i.severity] for i in issues))
        status, _ = self.classify_rep(is_valid, score, issues, rom_issue_codes=set())

        rep = RepFeedback(
            rep_number=1,
            score=score,
            status=status,
            is_rep_valid=is_valid,
            timestamp_sec=hold_sec,
            issues=issues,
            breathing_cue=BreathingCue(phase="HOLD", instruction="Thở đều và liên tục. KHÔNG nín thở."),
        )
        summary = self.build_session_summary([rep], warnings, len(frames_landmarks), self.NAME)
        if is_valid:
            summary.strengths.insert(0, f"Giữ wall sit đúng tư thế {hold_sec}s.")
        else:
            summary.improvement_areas.insert(
                0, f"Thời gian giữ đúng tư thế chỉ {hold_sec}s — cần tối thiểu {self.MIN_HOLD_SEC}s."
            )
        return PoseFeedbackResponse(
            rep_count=1 if is_valid else 0,
            valid_rep_count=1 if is_valid else 0,
            good_rep_count=1 if (is_valid and status == RepStatus.GOOD_REP) else 0,
            score=score,
            rep_feedback=[rep],
            session_summary=summary,
            visibility_warnings=warnings,
        )


WALL_SIT = WallSitRule()

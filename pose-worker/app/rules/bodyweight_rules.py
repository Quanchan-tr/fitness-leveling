"""
bodyweight_rules.py — Bodyweight exercise rules (Lunge, Glute Bridge, Jumping Jack, Mountain Climber, Wall Sit).

Rules follow the standard BasePoseRule / RepBasedRule architecture with:
- MediaPipe 2D normalized screen landmarks
- Visibility Gatekeeper (distinguishing POSE_NOT_DETECTED and INCOMPLETE_BODY_VISIBLE)
- Hysteresis & EMA smoothing
- Camera orientation tracking (camera_view)
- Vietnamese form cues with severity-based scoring
"""

from collections import Counter
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.cv.angle_math import (
    calculate_angle_2d,
    calculate_vertical_angle,
    detect_camera_view,
)
from app.rules.base_rule import BasePoseRule, RepBasedRule, SEVERITY_PENALTIES
from app.schemas.response import (
    BreathingCue,
    PoseFeedbackResponse,
    PoseIssue,
    RepFeedback,
    RepStatus,
    VisibilityWarning,
)

MAX_CONSECUTIVE_MISSING = 10


# ---------------------------------------------------------------------------
# 1. Lunge — side view recommended (front view enables knee valgus check)
# ---------------------------------------------------------------------------

class LungeRule(RepBasedRule):
    """
    Biomechanical Lunge evaluator.

    MediaPipe landmark indices:
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      23 = LEFT_HIP         24 = RIGHT_HIP
      25 = LEFT_KNEE        26 = RIGHT_KNEE
      27 = LEFT_ANKLE       28 = RIGHT_ANKLE

    Biomechanical checks:
      1. Front knee flexion ROM (target ~90 deg, threshold <= 100 deg)
      2. Back knee clearance (near floor, knee angle < 120 deg)
      3. Upright torso alignment (vertical angle < 20 deg warn, < 35 deg danger)
      4. Knee over toes tracking (knee forward displacement vs ankle)
      5. Knee valgus (front view only: inward caving)
      6. Cadence & tempo (controlled descent >= 1.0s)
    """

    NAME = "Lunge"
    REQUIRED_LANDMARKS = ["11", "12", "23", "24", "25", "26", "27", "28"]
    VIS_MSG = "Camera cần thấy rõ hông, đầu gối và cổ chân cả hai chân (nên đặt camera từ bên hông)."
    HALF_MSG = "Hạ chưa đủ sâu. Gập gối trước tới ~90°."
    BREATH = ("DESCENDING", "Hít vào khi hạ xuống, thở ra khi đẩy người lên.")
    MIN_REP_SEC = 0.8
    START, END = 0.25, 0.12
    PEAK_OK = 0.9

    BACK_KNEE_MAX = 120.0
    LEAN_WARN, LEAN_HIGH = 20.0, 35.0
    KNEE_OVER_TOE = 0.35      # Knee ahead of ankle fraction of shin
    VALGUS = 0.25             # Knee inside ankle fraction of thigh
    TOO_FAST_SEC = 1.0

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        if not self.has_landmarks(lm, "23", "24", "25", "26", "27", "28"):
            return None

        h = (self.get_point_2d(lm, "23"), self.get_point_2d(lm, "24"))
        k = (self.get_point_2d(lm, "25"), self.get_point_2d(lm, "26"))
        a = (self.get_point_2d(lm, "27"), self.get_point_2d(lm, "28"))

        ang = [calculate_angle_2d(h[i], k[i], a[i]) for i in (0, 1)]
        f = 0 if ang[0] <= ang[1] else 1  # Front leg = deeper knee bend
        b = 1 - f

        m = {
            "effort": max(0.0, (170.0 - ang[f]) / 80.0),
            "angle": ang[f],
            "back_knee": ang[b],
        }

        sh = self.get_midpoint_2d(lm, "11", "12")
        mid_hip = (h[0] + h[1]) / 2.0
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

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if min(s["back_knee"]) > self.BACK_KNEE_MAX:
            out.append(self.create_issue(
                "BACK_KNEE_HIGH",
                "medium",
                "Hạ gối sau thấp hơn, gần chạm sàn.",
                "Gối chân sau nên gập khoảng 90° và gần chạm sàn để hai chân chia đều tải.",
            ))

        if "lean" in s:
            lean = max(s["lean"])
            if lean > self.LEAN_HIGH:
                out.append(self.create_issue(
                    "EXCESSIVE_FORWARD_LEAN",
                    "high",
                    f"Thân nghiêng quá nhiều ({int(lean)}°). Giữ lưng thẳng!",
                    "Thân gập về trước tạo áp lực lên cột sống thắt lưng. Siết cơ bụng, giữ ngực mở.",
                ))
            elif lean > self.LEAN_WARN:
                out.append(self.create_issue(
                    "FORWARD_LEAN",
                    "medium",
                    f"Thân hơi nghiêng ({int(lean)}°). Giữ thân thẳng đứng.",
                    "Thân trên nên thẳng đứng suốt động tác.",
                ))

        if "knee_over" in s and max(s["knee_over"]) > self.KNEE_OVER_TOE:
            out.append(self.create_issue(
                "KNEE_OVER_TOES",
                "medium",
                "Gối trước vượt quá mũi chân. Bước dài hơn.",
                "Gối vượt mũi chân quá nhiều làm tăng lực cắt lên khớp gối. Bước chân dài hơn, dồn trọng tâm vào gót.",
            ))

        if "valgus" in s and max(s["valgus"]) > self.VALGUS:
            out.append(self.create_issue(
                "KNEE_VALGUS",
                "high",
                "Gối trước chụm vào trong. Đẩy gối ra ngoài!",
                "Gối khép vào trong gây xoắn dây chằng ACL. Hướng gối theo hướng các ngón chân.",
            ))

        if len(s["effort"]) / max(fps, 1.0) < self.TOO_FAST_SEC:
            out.append(self.create_issue(
                "TOO_FAST",
                "low",
                "Động tác quá nhanh. Hạ xuống có kiểm soát.",
                "Hạ người chậm (~2 giây) để cơ chân làm việc thay vì dùng quán tính.",
            ))

        return out


# ---------------------------------------------------------------------------
# 2. Glute Bridge — side view
# ---------------------------------------------------------------------------

class GluteBridgeRule(RepBasedRule):
    """
    Biomechanical Glute Bridge evaluator.

    MediaPipe landmark indices:
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      23 = LEFT_HIP         24 = RIGHT_HIP
      25 = LEFT_KNEE        26 = RIGHT_KNEE
      27 = LEFT_ANKLE       28 = RIGHT_ANKLE

    Biomechanical checks:
      1. Hip extension ROM (straight line shoulder-hip-knee >= 170 deg)
      2. Lumbar hyperextension / over-arching
      3. Knee flexion angle window (~80-100 deg)
      4. Bilateral pelvic level symmetry (no excessive pelvic tilt)
      5. Top isometric lockout hold (>= 1.0s)
      6. Controlled eccentric descent (no rapid hip dropping)
    """

    NAME = "Glute Bridge"
    REQUIRED_LANDMARKS = ["11", "23", "25", "27"]
    VIS_MSG = "Camera cần thấy rõ vai, hông, gối (đặt camera từ bên hông, thấy toàn thân)."
    HALF_MSG = "Nâng hông chưa đủ cao. Duỗi thẳng hông tới khi vai-hông-gối thành một đường."
    BREATH = ("ASCENDING", "Thở ra khi nâng hông, hít vào khi hạ xuống.")
    MIN_REP_SEC = 1.0
    START, END = 0.25, 0.15
    PEAK_OK = 0.9

    KNEE_MIN, KNEE_MAX = 70.0, 110.0
    ARCH_WARN, ARCH_HIGH = 0.10, 0.18
    HIP_TILT = 0.15
    TOP_HOLD_SEC = 1.0
    TOP_EFFORT = 0.85
    DROP_SEC = 0.6

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        pts = self.get_side_landmarks_2d(lm, 11, 23, 25, 27)
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

        if self.has_landmarks(lm, "23", "24", "25"):
            thigh = np.linalg.norm(self.get_point_2d(lm, "23") - self.get_point_2d(lm, "25")) + 1e-6
            m["tilt"] = abs(lm["23"]["y"] - lm["24"]["y"]) / thigh

        return m

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if "arch" in s:
            arch = max(s["arch"])
            if arch > self.ARCH_HIGH:
                out.append(self.create_issue(
                    "HIPS_OVER_EXTENDED",
                    "high",
                    "Ưỡn lưng quá mức. Siết bụng, dừng khi hông thẳng hàng.",
                    "Đẩy hông quá cao làm ưỡn thắt lưng, gây áp lực lên cột sống. Dừng khi vai-hông-gối thẳng hàng.",
                ))
            elif arch > self.ARCH_WARN:
                out.append(self.create_issue(
                    "HIPS_OVER_EXTENDED",
                    "medium",
                    "Hông hơi ưỡn. Siết cơ bụng khi ở đỉnh.",
                    "Siết cơ bụng và mông, tránh ưỡn thắt lưng ở đỉnh.",
                ))

        med_knee = float(np.median(s["knee"]))
        if not self.KNEE_MIN <= med_knee <= self.KNEE_MAX:
            out.append(self.create_issue(
                "KNEE_ANGLE_OFF",
                "low",
                f"Góc gối {int(med_knee)}°. Giữ gối gập khoảng 90°.",
                "Đặt bàn chân sao cho gối gập khoảng 80–100° để mông (không phải đùi sau) phát lực chính.",
            ))

        if "tilt" in s and max(s["tilt"]) > self.HIP_TILT:
            out.append(self.create_issue(
                "HIP_TILT",
                "medium",
                "Hông lệch hai bên. Nâng đều hai bên hông.",
                "Hông lệch cho thấy một bên mông yếu hơn. Dồn lực đều qua hai bàn chân.",
            ))

        eff = s["effort"]
        top_frames = sum(1 for v in eff if v >= self.TOP_EFFORT)
        if top_frames < fps * self.TOP_HOLD_SEC:
            out.append(self.create_issue(
                "NO_TOP_HOLD",
                "low",
                "Giữ ở đỉnh khoảng 1 giây rồi mới hạ.",
                "Dừng ~1 giây ở đỉnh và siết mông để tăng hiệu quả kích hoạt cơ.",
            ))

        last_top = max((i for i, v in enumerate(eff) if v >= self.TOP_EFFORT), default=0)
        if (len(eff) - last_top) < fps * self.DROP_SEC:
            out.append(self.create_issue(
                "DROPPED_TOO_FAST",
                "low",
                "Hạ hông quá nhanh. Hạ có kiểm soát.",
                "Hạ hông chậm (~1–2 giây) thay vì buông rơi để giữ cơ làm việc.",
            ))

        return out


# ---------------------------------------------------------------------------
# 3. Jumping Jack — front view
# ---------------------------------------------------------------------------

class JumpingJackRule(RepBasedRule):
    """
    Biomechanical Jumping Jack evaluator.

    MediaPipe landmark indices:
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      15 = LEFT_WRIST       16 = RIGHT_WRIST
      23 = LEFT_HIP         24 = RIGHT_HIP
      27 = LEFT_ANKLE       28 = RIGHT_ANKLE

    Biomechanical checks:
      1. Arms overhead ROM (wrists above shoulders at peak)
      2. Legs spread ROM (ankles spread wider than shoulders)
      3. Arm-leg temporal synchronization
      4. Bilateral symmetry (arms height and leg width relative to center)
      5. Full return/closure at bottom
      6. Cadence & tempo rhythm fatigue
    """

    NAME = "Jumping Jack"
    REQUIRED_LANDMARKS = ["11", "12", "15", "16", "23", "24", "27", "28"]
    VIS_MSG = "Camera cần thấy rõ tay, vai, hông và cổ chân (đứng đối diện camera, thấy toàn thân)."
    HALF_MSG = "Mở tay/chân chưa đủ rộng."
    BREATH = ("REP", "Thở đều theo nhịp nhảy: hít vào khi mở, thở ra khi khép.")
    MIN_REP_SEC = 0.35
    ALPHA = 0.6
    RHYTHM = True
    START, END, PEAK_OK = 0.3, 0.15, 0.85

    ARMS_OVERHEAD = 0.85
    LEGS_WIDE = 0.85
    SYNC_MAX = 0.35
    ARM_ASYM, LEG_ASYM = 0.25, 0.35
    CLOSE_MAX = 0.4

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        if not self.has_landmarks(lm, "11", "12", "15", "16", "23", "24", "27", "28"):
            return None

        sh = self.get_midpoint_2d(lm, "11", "12")
        hip = self.get_midpoint_2d(lm, "23", "24")
        if sh is None or hip is None:
            return None

        torso = np.linalg.norm(sh - hip) + 1e-6
        sw = abs(lm["11"]["x"] - lm["12"]["x"])
        if sw < 0.02:
            return None

        arm_h = (sh[1] - (lm["15"]["y"] + lm["16"]["y"]) / 2.0) / torso
        arm = float(np.clip((arm_h + 0.9) / 1.6, 0.0, 1.0))
        ankle_w = abs(lm["27"]["x"] - lm["28"]["x"]) / sw
        leg = float(np.clip((ankle_w - 0.9) / 1.0, 0.0, 1.0))

        return {
            "effort": (arm + leg) / 2.0,
            "angle": 100.0 * (arm + leg) / 2.0,
            "arm": arm,
            "leg": leg,
            "arm_asym": abs(lm["15"]["y"] - lm["16"]["y"]) / torso,
            "leg_asym": abs(lm["27"]["x"] + lm["28"]["x"] - 2.0 * hip[0]) / sw,
        }

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if max(s["arm"]) < self.ARMS_OVERHEAD:
            out.append(self.create_issue(
                "ARMS_NOT_OVERHEAD",
                "medium",
                "Đưa tay lên cao quá đầu.",
                "Tay nên vượt qua đầu ở vị trí mở để đạt đủ biên độ vai.",
            ))

        if max(s["leg"]) < self.LEGS_WIDE:
            out.append(self.create_issue(
                "LEGS_NOT_WIDE",
                "medium",
                "Mở chân rộng hơn (rộng hơn vai).",
                "Hai chân nên mở rộng hơn vai ở vị trí mở.",
            ))

        sync = float(np.mean(np.abs(np.array(s["arm"]) - np.array(s["leg"]))))
        if sync > self.SYNC_MAX:
            out.append(self.create_issue(
                "OUT_OF_SYNC",
                "medium",
                "Tay và chân chưa đồng bộ.",
                "Tay và chân cần mở/khép cùng lúc. Tập chậm lại để phối hợp nhịp nhàng.",
            ))

        if max(s["arm_asym"]) > self.ARM_ASYM or max(s["leg_asym"]) > self.LEG_ASYM:
            out.append(self.create_issue(
                "ASYMMETRY",
                "low",
                "Hai bên cơ thể mở không đều.",
                "Giữ hai tay lên cao đều nhau và hai chân mở đối xứng quanh trục thân.",
            ))

        if max(s["arm"][-1], s["leg"][-1]) > self.CLOSE_MAX:
            out.append(self.create_issue(
                "INCOMPLETE_CLOSE",
                "low",
                "Khép tay và chân hoàn toàn ở cuối mỗi rep.",
                "Khép chân sát nhau và hạ tay xuống hông trước khi bắt đầu rep tiếp theo.",
            ))

        return out


# ---------------------------------------------------------------------------
# 4. Mountain Climber — side view
# ---------------------------------------------------------------------------

class MountainClimberRule(RepBasedRule):
    """
    Biomechanical Mountain Climber evaluator.

    MediaPipe landmark indices:
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      15 = LEFT_WRIST       16 = RIGHT_WRIST
      23 = LEFT_HIP         24 = RIGHT_HIP
      25 = LEFT_KNEE        26 = RIGHT_KNEE
      27 = LEFT_ANKLE       28 = RIGHT_ANKLE

    Biomechanical checks:
      1. Knee drive ROM (hip flexion angle < 90 deg)
      2. Hip piking (hips too high above body line)
      3. Hip sagging (lumbar hyperextension)
      4. Shoulder positioning over hands
      5. Alternating leg drive balance
      6. Cadence & tempo rhythm fatigue
    """

    NAME = "Mountain Climber"
    REQUIRED_LANDMARKS = ["11", "12", "15", "16", "23", "24", "25", "26", "27", "28"]
    VIS_MSG = "Camera cần thấy rõ vai, hông, gối và cổ chân (đặt camera từ bên hông)."
    HALF_MSG = "Kéo gối chưa đủ sâu về phía ngực."
    BREATH = ("REP", "Thở nhanh và đều. KHÔNG nín thở.")
    MIN_REP_SEC = 0.2
    COOLDOWN_SEC = 0.05
    ALPHA = 0.6
    RHYTHM = True
    START, END, PEAK_OK = 0.3, 0.15, 0.9

    PIKE_WARN, PIKE_HIGH, SAG_WARN = 0.10, 0.18, -0.10
    SHOULDER_BEHIND = 0.5
    SAME_LEG_RUN = 3

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        sh_any = self.get_midpoint_2d(lm, "11", "12")
        if sh_any is None:
            return None

        hip_ang: Dict[int, float] = {}
        for leg, (hk, kk) in enumerate((("23", "25"), ("24", "26"))):
            if self.has_landmarks(lm, hk, kk):
                sh_idx = "11" if leg == 0 else "12"
                sh = self.get_point_2d(lm, sh_idx) if sh_idx in lm else sh_any
                hip_ang[leg] = calculate_angle_2d(
                    sh, self.get_point_2d(lm, hk), self.get_point_2d(lm, kk)
                )

        if not hip_ang:
            return None

        drive = min(hip_ang, key=hip_ang.get)
        m = {
            "effort": max(0.0, (170.0 - hip_ang[drive]) / 80.0),
            "angle": hip_ang[drive],
            "leg": float(drive),
            "two_legs": 1.0 if len(hip_ang) == 2 else 0.0,
        }

        back = max(hip_ang, key=hip_ang.get)
        ak, hk = ("27" if back == 0 else "28"), ("23" if back == 0 else "24")
        if self.has_landmarks(lm, ak, hk) and abs(lm[ak]["x"] - sh_any[0]) > 1e-3:
            a, h = self.get_point_2d(lm, ak), self.get_point_2d(lm, hk)
            t = (h[0] - sh_any[0]) / (a[0] - sh_any[0])
            line_y = sh_any[1] + t * (a[1] - sh_any[1])
            m["hip_dev"] = (line_y - h[1]) / (np.linalg.norm(a - sh_any) + 1e-6)

        wr = self.get_midpoint_2d(lm, "15", "16")
        hip_mid = self.get_midpoint_2d(lm, "23", "24")
        if wr is not None and hip_mid is not None:
            m["wrist_off"] = abs(wr[0] - sh_any[0]) / (np.linalg.norm(sh_any - hip_mid) + 1e-6)

        return m

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if "hip_dev" in s:
            dev_hi, dev_lo = max(s["hip_dev"]), min(s["hip_dev"])
            if dev_hi > self.PIKE_HIGH:
                out.append(self.create_issue(
                    "HIPS_TOO_HIGH",
                    "high",
                    "Hông nhô quá cao. Hạ hông về ngang vai.",
                    "Hông nhô cao biến plank thành chữ V, giảm hiệu quả cơ bụng và tăng tải lên vai.",
                ))
            elif dev_hi > self.PIKE_WARN:
                out.append(self.create_issue(
                    "HIPS_TOO_HIGH",
                    "medium",
                    "Hông hơi cao. Giữ thân thành một đường thẳng.",
                    "Hạ hông xuống ngang thân để cơ bụng làm việc nhiều hơn.",
                ))

            if dev_lo < self.SAG_WARN:
                out.append(self.create_issue(
                    "HIPS_SAGGING",
                    "high",
                    "Hông võng xuống. Siết cơ bụng!",
                    "Hông võng làm ưỡn thắt lưng quá mức. Siết bụng, kéo rốn về phía cột sống.",
                ))

        if "wrist_off" in s and max(s["wrist_off"]) > self.SHOULDER_BEHIND:
            out.append(self.create_issue(
                "SHOULDERS_NOT_OVER_HANDS",
                "medium",
                "Vai lệch khỏi vị trí trên cổ tay.",
                "Giữ vai nằm ngay phía trên cổ tay để ổn định vai và truyền lực tốt.",
            ))

        if max(s["two_legs"]) > 0:
            legs = ctx.setdefault("legs", [])
            legs.append(s["leg"][int(np.argmax(s["effort"]))])
            if len(legs) >= self.SAME_LEG_RUN and len(set(legs[-self.SAME_LEG_RUN:])) == 1:
                out.append(self.create_issue(
                    "NOT_ALTERNATING",
                    "medium",
                    "Hãy đổi chân luân phiên, đừng chỉ kéo một chân.",
                    "Kéo gối trái và phải luân phiên để hai bên được tập đều.",
                ))

        return out


# ---------------------------------------------------------------------------
# 5. Wall Sit — hold-based, side view
# ---------------------------------------------------------------------------

class WallSitRule(BasePoseRule):
    """
    Biomechanical Wall Sit hold evaluator.

    MediaPipe landmark indices:
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      23 = LEFT_HIP         24 = RIGHT_HIP
      25 = LEFT_KNEE        26 = RIGHT_KNEE
      27 = LEFT_ANKLE       28 = RIGHT_ANKLE

    Biomechanical checks:
      1. Knee angle window (75-105 deg, target ~90 deg)
      2. Thigh parallel to floor
      3. Knee tracking over ankle (knee not excessively in front of ankle)
      4. Back vertical alignment against wall
      5. Minimum hold duration (>= 10.0s)
      6. Fatigue breakdown drift over hold duration
    """

    NAME = "Wall Sit"
    REQUIRED_LANDMARKS = ["23", "24", "25", "26", "27", "28"]
    MIN_HOLD_SEC = 10.0
    KNEE_LOW, KNEE_HIGH = 75.0, 105.0
    THIGH_PARALLEL = 0.30
    KNEE_OVER_ANKLE = 0.35
    BACK_LEAN = 15.0
    RATIO_WARN, RATIO_HIGH = 0.20, 0.50
    FATIGUE_DRIFT = 12.0

    FLAGS: Dict[str, Tuple[str, str, str]] = {
        "SITTING_TOO_HIGH": (
            "medium",
            "Ngồi thấp xuống thêm, gối gập ~90°.",
            "Gối đang mở hơn 105°. Trượt thấp xuống để đùi song song sàn.",
        ),
        "SITTING_TOO_DEEP": (
            "medium",
            "Nâng người lên một chút, gối gập ~90°.",
            "Gối gập dưới 75° tăng tải lên khớp gối. Giữ khoảng 90°.",
        ),
        "THIGH_NOT_PARALLEL": (
            "medium",
            "Đùi chưa song song sàn.",
            "Hông nên ngang gối để đùi song song sàn.",
        ),
        "KNEE_OVER_ANKLE": (
            "medium",
            "Gối vượt quá mắt cá. Đưa chân ra xa tường hơn.",
            "Gối nên nằm trên mắt cá. Gối vượt xa tăng lực cắt lên khớp gối.",
        ),
        "BACK_NOT_VERTICAL": (
            "low",
            "Giữ lưng sát tường, thẳng đứng.",
            "Lưng nên áp sát tường và thẳng đứng, không ngả về trước.",
        ),
    }

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        pts = self.get_side_landmarks_2d(lm, 23, 25, 27)
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

        sh = self.get_midpoint_2d(lm, "11", "12")
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
        detected_views: List[str] = []
        counts: Dict[str, int] = {}
        knees: List[float] = []
        valid_frames = in_position = missing = 0

        for i, lm in enumerate(frames_landmarks):
            ts = round(i / fps, 2)
            if not lm:
                missing += 1
                if missing == MAX_CONSECUTIVE_MISSING:
                    warnings.append(VisibilityWarning(
                        warning_code="POSE_NOT_DETECTED",
                        message="Không phát hiện được tư thế. Hãy đứng vào khung hình camera.",
                        affected_landmarks=self.REQUIRED_LANDMARKS,
                        frame_index=i,
                        timestamp_sec=ts,
                    ))
                continue

            m = self.measure(lm)
            if m is None:
                missing += 1
                if missing == MAX_CONSECUTIVE_MISSING:
                    warnings.append(VisibilityWarning(
                        warning_code="INCOMPLETE_BODY_VISIBLE",
                        message="Camera cần thấy rõ hông, gối và cổ chân (đặt camera từ bên hông).",
                        affected_landmarks=self.REQUIRED_LANDMARKS,
                        frame_index=i,
                        timestamp_sec=ts,
                    ))
                continue

            missing = 0
            valid_frames += 1
            detected_views.append(detect_camera_view(lm))
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
                affected_landmarks=self.REQUIRED_LANDMARKS,
            ))
            return PoseFeedbackResponse(
                rep_count=0,
                score=0.0,
                rep_feedback=[],
                session_summary=self.build_session_summary(
                    [], warnings, len(frames_landmarks), self.NAME, camera_view="UNKNOWN"
                ),
                visibility_warnings=warnings,
                camera_view="UNKNOWN",
            )

        dominant_view = (
            Counter(detected_views).most_common(1)[0][0]
            if detected_views else "SIDE_VIEW"
        )

        issues: List[PoseIssue] = []
        for code, (sev, msg, detail) in self.FLAGS.items():
            ratio = counts.get(code, 0) / valid_frames
            if ratio > self.RATIO_WARN:
                if ratio > self.RATIO_HIGH:
                    sev = "high"
                issues.append(self.create_issue(
                    code, sev, f"{msg} ({int(ratio * 100)}% thời gian)", detail
                ))

        if len(knees) > 20:
            q = len(knees) // 4
            if abs(float(np.mean(knees[:q])) - float(np.mean(knees[-q:]))) > self.FATIGUE_DRIFT:
                issues.append(self.create_issue(
                    "FATIGUE_FORM_BREAKDOWN",
                    "medium",
                    "Form suy giảm rõ rệt ở cuối bài. Cơ đùi đang mệt.",
                    "Góc gối trôi dần theo thời gian. Kết thúc TRƯỚC khi form bị phá vỡ.",
                ))

        hold_sec = round(in_position / fps, 1)
        is_valid = hold_sec >= self.MIN_HOLD_SEC
        score = max(0.0, 100.0 - sum(SEVERITY_PENALTIES.get(i.severity, 15.0) for i in issues))
        status, _ = self.classify_rep(is_valid, score, issues, rom_issue_codes=set())

        rep = RepFeedback(
            rep_number=1,
            score=score,
            status=status,
            is_rep_valid=is_valid,
            timestamp_sec=hold_sec,
            issues=issues,
            breathing_cue=BreathingCue(
                phase="HOLD", instruction="Thở đều và liên tục. KHÔNG nín thở."
            ),
        )
        summary = self.build_session_summary(
            [rep], warnings, len(frames_landmarks), self.NAME, camera_view=dominant_view
        )
        if is_valid:
            summary.strengths.insert(0, f"Giữ wall sit đúng tư thế {hold_sec}s.")
        else:
            summary.improvement_areas.insert(
                0,
                f"Thời gian giữ đúng tư thế chỉ {hold_sec}s — cần tối thiểu {self.MIN_HOLD_SEC}s.",
            )

        return PoseFeedbackResponse(
            rep_count=1 if is_valid else 0,
            valid_rep_count=1 if is_valid else 0,
            good_rep_count=1 if (is_valid and status == RepStatus.GOOD_REP) else 0,
            score=score,
            rep_feedback=[rep],
            session_summary=summary,
            visibility_warnings=warnings,
            camera_view=dominant_view,
        )


WALL_SIT = WallSitRule()

BODYWEIGHT_RULES: Dict[str, BasePoseRule] = {
    "lunge": LungeRule(),
    "glute_bridge": GluteBridgeRule(),
    "jumping_jack": JumpingJackRule(),
    "mountain_climber": MountainClimberRule(),
}

# Alias for backwards compatibility
REP_RULES: Dict[str, BasePoseRule] = dict(BODYWEIGHT_RULES)

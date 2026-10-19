"""
weighted_rules.py — Exercise rules for Bicep Curl, Shoulder Press, Deadlift, Sit-up, Lateral Raise.

Evaluates body biomechanics using MediaPipe 2D normalized screen landmarks.
Equipment (dumbbells, barbells) is optional as analysis focuses on joint articulation,
torso posture, and bilateral symmetry.
"""

from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.cv.angle_math import calculate_angle_2d, calculate_vertical_angle
from app.rules.base_rule import BasePoseRule, RepBasedRule
from app.rules.bodyweight_rules import REP_RULES
from app.schemas.response import PoseIssue


# ---------------------------------------------------------------------------
# Biomechanical helper routines
# ---------------------------------------------------------------------------

def _extract_arms(
    rule: BasePoseRule, lm: Dict[str, Any]
) -> List[Tuple[np.ndarray, np.ndarray, np.ndarray]]:
    """Return (shoulder, elbow, wrist) for each fully visible arm."""
    arms: List[Tuple[np.ndarray, np.ndarray, np.ndarray]] = []
    for offset in (0, 1):
        sh_idx = str(11 + offset)
        el_idx = str(13 + offset)
        wr_idx = str(15 + offset)
        if rule.has_landmarks(lm, sh_idx, el_idx, wr_idx):
            arms.append((
                rule.get_point_2d(lm, sh_idx),
                rule.get_point_2d(lm, el_idx),
                rule.get_point_2d(lm, wr_idx),
            ))
    return arms


def _torso_lean(rule: BasePoseRule, lm: Dict[str, Any]) -> Optional[float]:
    """Calculate vertical spine angle in degrees."""
    sh = rule.get_midpoint_2d(lm, "11", "12")
    hip = rule.get_midpoint_2d(lm, "23", "24")
    if sh is None or hip is None:
        return None
    return calculate_vertical_angle(hip, sh)


def _neck_deviation(
    rule: BasePoseRule, lm: Dict[str, Any], sh: np.ndarray, hip: np.ndarray
) -> Optional[float]:
    """Calculate degrees of head tilt relative to spine (0 deg = aligned)."""
    if "0" not in lm:
        return None
    nose = rule.get_point_2d(lm, "0")
    return 180.0 - calculate_angle_2d(hip, sh, nose)


def _check_too_fast(
    rule: BasePoseRule, s: Dict[str, List[float]], fps: float, min_sec: float
) -> List[PoseIssue]:
    if len(s["effort"]) / max(fps, 1.0) < min_sec:
        return [
            rule.create_issue(
                "TOO_FAST",
                "low",
                "Động tác quá nhanh. Kiểm soát nhịp.",
                "Dùng đà thay vì cơ làm việc. Thực hiện chậm (~2 giây mỗi pha) và có kiểm soát.",
            )
        ]
    return []


def _check_body_swing(
    rule: BasePoseRule, s: Dict[str, List[float]], max_swing_deg: float = 12.0
) -> List[PoseIssue]:
    if "lean" in s and (max(s["lean"]) - min(s["lean"])) > max_swing_deg:
        return [
            rule.create_issue(
                "BODY_SWING",
                "medium",
                "Thân người đang đung đưa lấy đà. Giữ thân cố định.",
                "Đung đưa thân để lấy đà làm giảm tải lên cơ mục tiêu và dễ gây chấn thương lưng. "
                "Siết cơ bụng và giữ thân ổn định; giảm mức tạ nếu cần.",
            )
        ]
    return []


# ---------------------------------------------------------------------------
# 1. Bicep Curl — front or side view
# ---------------------------------------------------------------------------

class BicepCurlRule(RepBasedRule):
    """
    Biomechanical Bicep Curl evaluator.

    MediaPipe landmark indices:
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      13 = LEFT_ELBOW       14 = RIGHT_ELBOW
      15 = LEFT_WRIST       16 = RIGHT_WRIST
      23 = LEFT_HIP         24 = RIGHT_HIP

    Biomechanical checks:
      1. Elbow flexion ROM (curl up towards shoulder, elbow angle <= 60 deg)
      2. Elbow drift / swinging forward (cheating anterior deltoid engagement)
      3. Torso swinging / momentum usage
      4. Controlled cadence & tempo
      5. Cadence fatigue rhythm
    """

    NAME = "Bicep Curl"
    REQUIRED_LANDMARKS = ["11", "12", "13", "14", "15", "16", "23", "24"]
    VIS_MSG = "Camera cần thấy rõ vai, khuỷu tay và cổ tay (ít nhất một tay)."
    HALF_MSG = "Gập tay chưa đủ cao. Cuộn tạ lên gần vai."
    BREATH = ("ASCENDING", "Thở ra khi cuộn lên, hít vào khi hạ xuống.")
    MIN_REP_SEC = 0.8
    RHYTHM = True
    START, END, PEAK_OK = 0.25, 0.05, 0.85

    DRIFT_WARN, DRIFT_HIGH = 20.0, 35.0

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        arms = _extract_arms(self, lm)
        if not arms:
            return None

        elbows = [calculate_angle_2d(s, e, w) for s, e, w in arms]
        i = int(np.argmin(elbows))
        s, e, _ = arms[i]

        m = {
            "effort": max(0.0, (160.0 - elbows[i]) / 120.0),
            "angle": elbows[i],
            "drift": 180.0 - calculate_vertical_angle(s, e),
        }

        lean = _torso_lean(self, lm)
        if lean is not None:
            m["lean"] = lean

        return m

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []
        drift = max(s["drift"])

        if drift > self.DRIFT_HIGH:
            out.append(self.create_issue(
                "ELBOW_SWING",
                "high",
                "Khuỷu tay đưa ra trước quá nhiều. Giữ khuỷu sát thân!",
                "Khuỷu tay trôi về trước chuyển tải sang vai trước và giảm hiệu quả cho bắp tay. "
                "Giữ khuỷu cố định sát hông suốt động tác.",
            ))
        elif drift > self.DRIFT_WARN:
            out.append(self.create_issue(
                "ELBOW_DRIFT",
                "medium",
                "Khuỷu tay hơi trôi ra trước. Giữ sát thân.",
                "Giữ phần cánh tay trên cố định, chỉ cẳng tay chuyển động.",
            ))

        out.extend(_check_body_swing(self, s))
        out.extend(_check_too_fast(self, s, fps, 1.0))
        return out


# ---------------------------------------------------------------------------
# 2. Shoulder Press — front view
# ---------------------------------------------------------------------------

class ShoulderPressRule(RepBasedRule):
    """
    Biomechanical Overhead Shoulder Press evaluator.

    MediaPipe landmark indices:
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      13 = LEFT_ELBOW       14 = RIGHT_ELBOW
      15 = LEFT_WRIST       16 = RIGHT_WRIST
      23 = LEFT_HIP         24 = RIGHT_HIP

    Biomechanical checks:
      1. Overhead elbow extension lockout (elbow angle >= 160 deg)
      2. Full overhead wrist height (wrists high above shoulders)
      3. Bilateral pressing symmetry (even extension left vs right)
      4. Lumbar hyperextension / backward torso lean
      5. Cadence & tempo
    """

    NAME = "Shoulder Press"
    REQUIRED_LANDMARKS = ["11", "12", "13", "14", "15", "16", "23", "24"]
    VIS_MSG = "Camera cần thấy rõ hai vai, hai khuỷu, hai cổ tay và hông (đứng đối diện camera)."
    HALF_MSG = "Chưa đẩy thẳng tay lên. Duỗi hết khuỷu tay ở đỉnh."
    BREATH = ("ASCENDING", "Thở ra khi đẩy lên, hít vào khi hạ xuống.")
    MIN_REP_SEC = 1.0
    RHYTHM = True
    START, END, PEAK_OK = 0.3, 0.12, 0.85

    OVERHEAD_MIN = 0.5
    ELBOW_ASYM = 25.0
    WRIST_ASYM = 0.25
    LEAN_WARN, LEAN_HIGH = 15.0, 25.0

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        arms = _extract_arms(self, lm)
        sh = self.get_midpoint_2d(lm, "11", "12")
        hip = self.get_midpoint_2d(lm, "23", "24")
        if len(arms) < 2 or sh is None or hip is None:
            return None

        torso = np.linalg.norm(sh - hip) + 1e-6
        elb = [calculate_angle_2d(*a) for a in arms]
        wr_h = [(sh[1] - a[2][1]) / torso for a in arms]
        mean_elbow = float(np.mean(elb))

        return {
            "effort": max(0.0, (mean_elbow - 80.0) / 90.0),
            "angle": mean_elbow,
            "wrist_h": float(np.mean(wr_h)),
            "elbow_asym": abs(elb[0] - elb[1]),
            "wrist_asym": abs(wr_h[0] - wr_h[1]),
            "lean": calculate_vertical_angle(hip, sh),
        }

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if max(s["wrist_h"]) < self.OVERHEAD_MIN:
            out.append(self.create_issue(
                "NOT_OVERHEAD",
                "medium",
                "Đẩy tạ lên cao hẳn qua đầu.",
                "Ở đỉnh, cổ tay nên nằm cao trên vai, ngay phía trên khớp vai.",
            ))

        if max(s["elbow_asym"]) > self.ELBOW_ASYM or max(s["wrist_asym"]) > self.WRIST_ASYM:
            out.append(self.create_issue(
                "UNEVEN_PRESS",
                "medium",
                "Hai tay đẩy không đều nhau.",
                "Một tay lên nhanh hơn tay kia cho thấy mất cân bằng lực. Đẩy đồng thời, đều hai bên.",
            ))

        lean = max(s["lean"])
        if lean > self.LEAN_HIGH:
            out.append(self.create_issue(
                "BACK_ARCHING",
                "high",
                f"Thân ngả/ưỡn quá nhiều ({int(lean)}°). Siết bụng, giữ thẳng!",
                "Ưỡn lưng để đẩy tạ tạo áp lực nguy hiểm lên thắt lưng. Siết cơ bụng và mông, giữ thân thẳng đứng.",
            ))
        elif lean > self.LEAN_WARN:
            out.append(self.create_issue(
                "LEAN_BACK",
                "medium",
                f"Thân hơi ngả ({int(lean)}°). Giữ thân thẳng đứng.",
                "Giữ thân thẳng đứng, siết bụng khi đẩy lên.",
            ))

        out.extend(_check_too_fast(self, s, fps, 1.2))
        return out


# ---------------------------------------------------------------------------
# 3. Deadlift (Hip Hinge) — side view
# ---------------------------------------------------------------------------

class DeadliftRule(RepBasedRule):
    """
    Biomechanical Deadlift / Hip Hinge evaluator.

    MediaPipe landmark indices:
      0  = NOSE
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      15 = LEFT_WRIST       16 = RIGHT_WRIST
      23 = LEFT_HIP         24 = RIGHT_HIP
      25 = LEFT_KNEE        26 = RIGHT_KNEE
      27 = LEFT_ANKLE       28 = RIGHT_ANKLE

    Biomechanical checks:
      1. Hip hinge flexion ROM (hip angle <= 110 deg)
      2. Cervical spine alignment / neck neutral
      3. Avoiding squatting the hinge (knee flexion preserved > 110 deg)
      4. Bar / hands close to legs (horizontal bar offset)
      5. Complete hip lockout at standing top
      6. Cadence & tempo
    """

    NAME = "Deadlift"
    REQUIRED_LANDMARKS = ["0", "11", "15", "23", "25", "27"]
    VIS_MSG = "Camera cần thấy rõ vai, hông, gối, cổ chân (đặt camera từ bên hông)."
    HALF_MSG = "Gập hông chưa đủ sâu. Đẩy hông ra sau, hạ thân xuống thấp hơn."
    BREATH = ("DESCENDING", "Hít sâu và siết bụng trước khi hạ, thở ra khi đứng lên.")
    MIN_REP_SEC = 1.2
    RHYTHM = True
    START, END, PEAK_OK = 0.25, 0.1, 0.7

    NECK_DEV = 40.0
    KNEE_SQUATTING = 110.0
    BAR_OFFSET = 0.35
    LOCKOUT_LEAN = 12.0

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        pts = self.get_side_landmarks_2d(lm, 11, 23, 25, 27)
        if pts is None:
            return None

        sh, hip, knee, ankle = pts
        hip_ang = calculate_angle_2d(sh, hip, knee)
        m = {
            "effort": max(0.0, (170.0 - hip_ang) / 70.0),
            "angle": hip_ang,
            "knee": calculate_angle_2d(hip, knee, ankle),
            "lean": calculate_vertical_angle(hip, sh),
        }

        nd = _neck_deviation(self, lm, sh, hip)
        if nd is not None:
            m["neck"] = nd

        wr = self.get_side_landmarks_2d(lm, 15)
        if wr is not None:
            m["bar_off"] = abs(wr[0][0] - ankle[0]) / (np.linalg.norm(hip - ankle) + 1e-6)

        return m

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if "neck" in s and max(s["neck"]) > self.NECK_DEV:
            out.append(self.create_issue(
                "NECK_NOT_NEUTRAL",
                "high",
                "Đầu cúi/ngửa quá mức. Giữ cổ thẳng hàng với cột sống.",
                "Cổ lệch khỏi đường cột sống thường đi cùng lưng cong, rất nguy hiểm cho đĩa đệm. "
                "Nhìn xuống sàn trước mặt khoảng 1–2m và giữ lưng phẳng.",
            ))

        if min(s["knee"]) < self.KNEE_SQUATTING:
            out.append(self.create_issue(
                "SQUATTING_THE_LIFT",
                "medium",
                "Gập gối quá nhiều. Đẩy hông ra sau thay vì ngồi xuống.",
                "Deadlift là động tác bản lề hông: gối chỉ gập nhẹ, hông đẩy ra sau.",
            ))

        if "bar_off" in s and max(s["bar_off"]) > self.BAR_OFFSET:
            out.append(self.create_issue(
                "BAR_TOO_FAR",
                "medium",
                "Tạ trôi xa khỏi chân. Giữ tạ sát người.",
                "Tạ xa trọng tâm làm tăng mô-men lên lưng dưới. Kéo tạ trượt sát đùi và cẳng chân.",
            ))

        if s["lean"][-1] > self.LOCKOUT_LEAN:
            out.append(self.create_issue(
                "INCOMPLETE_LOCKOUT",
                "low",
                "Đứng thẳng hẳn ở cuối, hông duỗi hoàn toàn.",
                "Kết thúc rep bằng cách duỗi hết hông và đứng thẳng, không ngả ra sau.",
            ))

        out.extend(_check_too_fast(self, s, fps, 1.5))
        return out


# ---------------------------------------------------------------------------
# 4. Sit-up — side view
# ---------------------------------------------------------------------------

class SitUpRule(RepBasedRule):
    """
    Biomechanical Sit-up evaluator.

    MediaPipe landmark indices:
      0  = NOSE
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      23 = LEFT_HIP         24 = RIGHT_HIP
      25 = LEFT_KNEE        26 = RIGHT_KNEE
      27 = LEFT_ANKLE       28 = RIGHT_ANKLE

    Biomechanical checks:
      1. Trunk flexion ROM (hip angle <= 80 deg)
      2. Cervical neck pulling (hands yanking head forward)
      3. Knee stability (~80-100 deg window)
      4. Controlled eccentric descent (no dropping back onto floor)
      5. Cadence & tempo
    """

    NAME = "Sit-up"
    REQUIRED_LANDMARKS = ["0", "11", "23", "25", "27"]
    VIS_MSG = "Camera cần thấy rõ vai, hông, gối và cổ chân (đặt camera từ bên hông)."
    HALF_MSG = "Chưa gập đủ cao. Nâng thân lên gần chạm gối."
    BREATH = ("ASCENDING", "Thở ra khi gập lên, hít vào khi nằm xuống.")
    MIN_REP_SEC = 1.0
    RHYTHM = True
    START, END, PEAK_OK = 0.25, 0.1, 0.8

    KNEE_MIN, KNEE_MAX = 70.0, 110.0
    NECK_DEV = 50.0
    DROP_SEC = 0.6

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        pts = self.get_side_landmarks_2d(lm, 11, 23, 25, 27)
        if pts is None:
            return None

        sh, hip, knee, ankle = pts
        hip_ang = calculate_angle_2d(sh, hip, knee)
        m = {
            "effort": max(0.0, (140.0 - hip_ang) / 70.0),
            "angle": hip_ang,
            "knee": calculate_angle_2d(hip, knee, ankle),
        }

        nd = _neck_deviation(self, lm, sh, hip)
        if nd is not None:
            m["neck"] = nd

        return m

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if "neck" in s and max(s["neck"]) > self.NECK_DEV:
            out.append(self.create_issue(
                "NECK_PULLING",
                "medium",
                "Đừng kéo cổ bằng tay. Dùng cơ bụng để nâng thân.",
                "Kéo đầu bằng tay gây căng cơ cổ. Đặt tay chéo trước ngực hoặc sau tai nhẹ nhàng, mắt nhìn lên trần.",
            ))

        med_knee = float(np.median(s["knee"]))
        if not self.KNEE_MIN <= med_knee <= self.KNEE_MAX:
            out.append(self.create_issue(
                "KNEE_ANGLE_OFF",
                "low",
                f"Góc gối {int(med_knee)}°. Giữ gối gập khoảng 90°.",
                "Gối gập ~90° và bàn chân cố định giúp cơ bụng thay vì cơ gập hông làm việc chính.",
            ))

        eff = s["effort"]
        last_top = max((i for i, v in enumerate(eff) if v >= 0.8), default=0)
        if (len(eff) - last_top) < fps * self.DROP_SEC:
            out.append(self.create_issue(
                "DROPPED_TOO_FAST",
                "low",
                "Nằm xuống quá nhanh. Hạ có kiểm soát.",
                "Hạ thân chậm (~2 giây) để cơ bụng làm việc cả pha hạ xuống.",
            ))

        out.extend(_check_too_fast(self, s, fps, 1.2))
        return out


# ---------------------------------------------------------------------------
# 5. Lateral Raise — front view
# ---------------------------------------------------------------------------

class LateralRaiseRule(RepBasedRule):
    """
    Biomechanical Dumbbell Lateral Raise evaluator.

    MediaPipe landmark indices:
      0  = NOSE
      11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
      13 = LEFT_ELBOW       14 = RIGHT_ELBOW
      15 = LEFT_WRIST       16 = RIGHT_WRIST
      23 = LEFT_HIP         24 = RIGHT_HIP

    Biomechanical checks:
      1. Shoulder abduction ROM (arms raised to shoulder level ~85-95 deg)
      2. Raising excessively high (> 110 deg impinging subacromial space)
      3. Excessive elbow flexion (> 50 deg bend turning raise into row)
      4. Trapezius shrugging (shoulders lifting toward ears)
      5. Bilateral abduction symmetry
      6. Torso swinging / momentum cheating
    """

    NAME = "Lateral Raise"
    REQUIRED_LANDMARKS = ["0", "11", "12", "13", "14", "15", "16", "23", "24"]
    VIS_MSG = "Camera cần thấy rõ vai, khuỷu, cổ tay và hông (đứng đối diện camera)."
    HALF_MSG = "Nâng tay chưa đủ cao. Đưa tay lên ngang vai."
    BREATH = ("ASCENDING", "Thở ra khi nâng lên, hít vào khi hạ xuống.")
    MIN_REP_SEC = 1.0
    RHYTHM = True
    START, END, PEAK_OK = 0.25, 0.1, 0.85

    TOO_HIGH = 110.0
    ELBOW_BENT = 130.0
    SHRUG_RATIO = 0.85
    ASYM = 20.0

    def measure(self, lm: Dict[str, Any]) -> Optional[Dict[str, float]]:
        arms = _extract_arms(self, lm)
        sh = self.get_midpoint_2d(lm, "11", "12")
        hip = self.get_midpoint_2d(lm, "23", "24")
        if not arms or sh is None or hip is None:
            return None

        abd = []
        for s, _, w in arms:
            hp = self.get_point_2d(lm, "23") if "23" in lm else hip
            abd.append(calculate_angle_2d(hp, s, w))

        elb = [calculate_angle_2d(*a) for a in arms]
        mean_abd = float(np.mean(abd))

        m = {
            "effort": max(0.0, (mean_abd - 20.0) / 70.0),
            "angle": mean_abd,
            "elbow": float(np.mean(elb)),
            "abd_asym": abs(abd[0] - abd[1]) if len(abd) == 2 else 0.0,
            "lean": calculate_vertical_angle(hip, sh),
        }

        if "0" in lm:
            m["neck"] = (sh[1] - lm["0"]["y"]) / (np.linalg.norm(sh - hip) + 1e-6)

        return m

    def judge(
        self, peak: float, s: Dict[str, List[float]], fps: float, ctx: Dict[str, Any]
    ) -> List[PoseIssue]:
        out: List[PoseIssue] = []

        if max(s["angle"]) > self.TOO_HIGH:
            out.append(self.create_issue(
                "RAISING_TOO_HIGH",
                "medium",
                "Nâng quá cao. Dừng khi tay ngang vai.",
                "Nâng cao hơn vai chuyển tải sang cơ cầu vai (trap) và tăng nguy cơ chèn ép khớp vai. "
                "Dừng khi tay ngang vai.",
            ))

        top = int(np.argmax(s["effort"]))
        if s["elbow"][top] < self.ELBOW_BENT:
            out.append(self.create_issue(
                "ELBOWS_TOO_BENT",
                "low",
                "Giữ khuỷu hơi gập nhẹ, đừng gập quá.",
                "Gập khuỷu nhiều làm giảm đòn bẩy và biến động tác thành kéo. Giữ khuỷu gập nhẹ, cố định.",
            ))

        if "neck" in s and min(s["neck"]) < self.SHRUG_RATIO * s["neck"][0]:
            out.append(self.create_issue(
                "SHRUGGING",
                "medium",
                "Đừng nhún vai. Hạ vai xuống, tránh cổ.",
                "Nhún vai dùng cơ cầu vai thay cho cơ delta giữa. Giữ vai thấp và rời xa tai.",
            ))

        if max(s["abd_asym"]) > self.ASYM:
            out.append(self.create_issue(
                "UNEVEN_RAISE",
                "medium",
                "Hai tay nâng không đều.",
                "Nâng hai tay đều cùng độ cao để hai bên vai phát triển cân đối.",
            ))

        out.extend(_check_body_swing(self, s, max_swing_deg=10.0))
        out.extend(_check_too_fast(self, s, fps, 1.2))
        return out


WEIGHTED_RULES: Dict[str, BasePoseRule] = {
    "bicep_curl": BicepCurlRule(),
    "shoulder_press": ShoulderPressRule(),
    "deadlift": DeadliftRule(),
    "situp": SitUpRule(),
    "lateral_raise": LateralRaiseRule(),
}

# Update REP_RULES for backward compatibility
REP_RULES.update(WEIGHTED_RULES)

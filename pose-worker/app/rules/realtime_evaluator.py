"""
realtime_evaluator.py
=====================
Lightweight real-time pose state evaluator for live WebSocket camera stream.
Maintains state per active socket connection (reps, phases, angles, feedback).
"""

import time
from typing import Any, Dict, List, Optional
import numpy as np
from app.cv.angle_math import calculate_angle_3d, calculate_angle_2d
from app.rules.bodyweight_rules import REP_RULES, WALL_SIT
from app.schemas.response import RepStatus


def _pt3d(lm: Dict[str, Any], idx: str) -> np.ndarray:
    item = lm[idx]
    if "world_x" in item:
        return np.array([item["world_x"], item["world_y"], item["world_z"]], dtype=np.float32)
    return np.array([item["x"], item["y"], item["z"]], dtype=np.float32)


class RealtimePoseEvaluator:
    def __init__(self, exercise_type: str = "squat"):
        self.exercise_type = exercise_type.lower()
        self.rep_count = 0
        self.good_rep_count = 0
        self.state = "READY"  # READY -> DESCENDING -> BOTTOM -> ASCENDING
        self.smoothed_angle = 175.0
        self.min_angle_in_rep = 180.0
        self.feedback = "Đứng vào khung hình"
        self.last_rep_status: Optional[str] = None
        self.alpha = 0.4  # EMA smoothing factor
        # Generic rep rules (lunge, glute_bridge, ...) state
        self._effort = 0.0
        self._peak = 0.0
        self._series: Dict[str, List[float]] = {}
        self._t0 = 0.0
        self._ctx: Dict[str, Any] = {}

    def _update_ema(self, raw_angle: float) -> float:
        self.smoothed_angle = self.alpha * raw_angle + (1.0 - self.alpha) * self.smoothed_angle
        return self.smoothed_angle

    def evaluate_frame(self, lm: Dict[str, Any]) -> Dict[str, Any]:
        """Process one frame's landmarks and advance the state machine."""
        if not lm:
            return {
                "pose_detected": False,
                "rep_count": self.rep_count,
                "angle": 0.0,
                "state": "NO_POSE",
                "status": None,
                "feedback": "Không thấy người trong camera",
                "keypoints": {},
            }

        if "pushup" in self.exercise_type:
            return self._evaluate_pushup(lm)
        elif "plank" in self.exercise_type:
            return self._evaluate_plank(lm)
        elif "wall_sit" in self.exercise_type:
            return self._evaluate_wall_sit(lm)
        for name, rule in REP_RULES.items():
            if name in self.exercise_type:
                return self._evaluate_rep_rule(lm, rule)
        return self._evaluate_squat(lm)

    def _evaluate_rep_rule(self, lm: Dict[str, Any], rule) -> Dict[str, Any]:
        m = rule.measure(lm)
        if m is None:
            return {
                "pose_detected": True,
                "rep_count": self.rep_count,
                "good_rep_count": self.good_rep_count,
                "angle": 0.0,
                "state": self.state,
                "status": None,
                "feedback": rule.VIS_MSG,
                "keypoints": self._extract_keypoints(lm, list(rule.KEYPOINTS)),
            }

        now = time.monotonic()
        self._effort = rule.ALPHA * m["effort"] + (1.0 - rule.ALPHA) * self._effort
        m["effort"] = self._effort
        status_event = None

        if self.state != "ACTIVE":
            self.feedback = "Bắt đầu động tác"
            if self._effort >= rule.START:
                self.state, self._series, self._peak, self._t0 = "ACTIVE", {}, self._effort, now
        if self.state == "ACTIVE":
            self._peak = max(self._peak, self._effort)
            for k, v in m.items():
                self._series.setdefault(k, []).append(v)
            if self._effort <= rule.END:
                self.state = "READY"
                dur = now - self._t0
                if dur >= rule.MIN_REP_SEC:
                    fps = len(self._series["effort"]) / max(dur, 1e-3)
                    issues, _, st, _ = rule.grade_rep(self._peak, self._series, fps, self._ctx)
                    self.rep_count += 1
                    if st == RepStatus.GOOD_REP:
                        self.good_rep_count += 1
                        status_event, self.feedback = "GOOD_REP", "Rep chuẩn! Tiếp tục"
                    else:
                        status_event = "BAD_FORM"
                        self.feedback = issues[0].message if issues else "Chưa đạt form"

        return {
            "pose_detected": True,
            "rep_count": self.rep_count,
            "good_rep_count": self.good_rep_count,
            "angle": round(m["angle"], 1),
            "state": self.state,
            "status": status_event,
            "feedback": self.feedback,
            "keypoints": self._extract_keypoints(lm, list(rule.KEYPOINTS)),
        }

    def _evaluate_wall_sit(self, lm: Dict[str, Any]) -> Dict[str, Any]:
        m = WALL_SIT.measure(lm)
        keypoints = self._extract_keypoints(lm, list(WALL_SIT.KEYPOINTS))
        if m is None:
            return {
                "pose_detected": True, "rep_count": self.rep_count, "angle": 0.0, "state": "HOLD",
                "status": None, "feedback": "Cần thấy rõ hông, gối và cổ chân", "keypoints": keypoints,
            }
        knee = self._update_ema(m["knee"])
        flags = WALL_SIT.flags(m)
        self.feedback = WALL_SIT.FLAGS[flags[0]][1] if flags else "Tư thế wall sit chuẩn! Giữ vững"
        return {
            "pose_detected": True,
            "rep_count": self.rep_count,
            "good_rep_count": self.good_rep_count,
            "angle": round(knee, 1),
            "state": "HOLD",
            "status": "BAD_FORM" if flags else "GOOD_REP",
            "feedback": self.feedback,
            "keypoints": keypoints,
        }

    def _evaluate_squat(self, lm: Dict[str, Any]) -> Dict[str, Any]:
        # Knee angle from left or right side
        has_left = "23" in lm and "25" in lm and "27" in lm
        has_right = "24" in lm and "26" in lm and "28" in lm

        if not has_left and not has_right:
            return {
                "pose_detected": True,
                "rep_count": self.rep_count,
                "angle": round(self.smoothed_angle, 1),
                "state": self.state,
                "status": None,
                "feedback": "Cần thấy rõ chân để phân tích squat",
                "keypoints": self._extract_keypoints(lm, ["11", "12", "23", "24"]),
            }

        if has_left and not has_right:
            raw_knee = calculate_angle_3d(_pt3d(lm, "23"), _pt3d(lm, "25"), _pt3d(lm, "27"))
        elif has_right and not has_left:
            raw_knee = calculate_angle_3d(_pt3d(lm, "24"), _pt3d(lm, "26"), _pt3d(lm, "28"))
        else:
            ka_l = calculate_angle_3d(_pt3d(lm, "23"), _pt3d(lm, "25"), _pt3d(lm, "27"))
            ka_r = calculate_angle_3d(_pt3d(lm, "24"), _pt3d(lm, "26"), _pt3d(lm, "28"))
            raw_knee = (ka_l + ka_r) / 2.0

        ka = self._update_ema(raw_knee)
        status_event = None

        # Squat State Machine
        if self.state in ("READY", "TOP"):
            self.feedback = "Bắt đầu hạ người xuống"
            if ka < 148.0:
                self.state = "DESCENDING"
                self.min_angle_in_rep = ka
                self.feedback = "Đang xuống..."

        elif self.state == "DESCENDING":
            self.min_angle_in_rep = min(self.min_angle_in_rep, ka)
            if ka <= 95.0:
                self.state = "BOTTOM"
                self.feedback = "Độ sâu chuẩn! Đẩy lên"
            elif ka > self.min_angle_in_rep + 15.0 and self.min_angle_in_rep <= 125.0:
                # Started ascending without reaching full bottom
                self.state = "ASCENDING"
                self.feedback = "Hơi nông, lần sau xuống sâu hơn"

        elif self.state == "BOTTOM":
            self.min_angle_in_rep = min(self.min_angle_in_rep, ka)
            if ka > 105.0:
                self.state = "ASCENDING"
                self.feedback = "Đang đứng lên..."

        elif self.state == "ASCENDING":
            if ka >= 150.0:
                # Rep completed!
                self.rep_count += 1
                is_good = self.min_angle_in_rep <= 100.0
                if is_good:
                    self.good_rep_count += 1
                    status_event = "GOOD_REP"
                    self.feedback = "Rep chuẩn! Tiếp tục"
                else:
                    status_event = "BAD_FORM"
                    self.feedback = "Chưa đủ độ sâu (Squat nông)"

                self.state = "READY"
                self.min_angle_in_rep = 180.0

        return {
            "pose_detected": True,
            "rep_count": self.rep_count,
            "good_rep_count": self.good_rep_count,
            "angle": round(ka, 1),
            "state": self.state,
            "status": status_event,
            "feedback": self.feedback,
            "keypoints": self._extract_keypoints(lm, ["11", "12", "23", "24", "25", "26", "27", "28"]),
        }

    def _evaluate_pushup(self, lm: Dict[str, Any]) -> Dict[str, Any]:
        has_left = "11" in lm and "13" in lm and "15" in lm
        has_right = "12" in lm and "14" in lm and "16" in lm

        if not has_left and not has_right:
            return {
                "pose_detected": True,
                "rep_count": self.rep_count,
                "angle": round(self.smoothed_angle, 1),
                "state": self.state,
                "status": None,
                "feedback": "Cần thấy rõ cánh tay",
                "keypoints": {},
            }

        if has_left and not has_right:
            raw_elbow = calculate_angle_3d(_pt3d(lm, "11"), _pt3d(lm, "13"), _pt3d(lm, "15"))
        elif has_right and not has_left:
            raw_elbow = calculate_angle_3d(_pt3d(lm, "12"), _pt3d(lm, "14"), _pt3d(lm, "16"))
        else:
            ea_l = calculate_angle_3d(_pt3d(lm, "11"), _pt3d(lm, "13"), _pt3d(lm, "15"))
            ea_r = calculate_angle_3d(_pt3d(lm, "12"), _pt3d(lm, "14"), _pt3d(lm, "16"))
            raw_elbow = (ea_l + ea_r) / 2.0

        ea = self._update_ema(raw_elbow)
        status_event = None

        if self.state in ("READY", "TOP"):
            self.feedback = "Hạ thấp ngực xuống"
            if ea < 145.0:
                self.state = "DESCENDING"
                self.min_angle_in_rep = ea

        elif self.state == "DESCENDING":
            self.min_angle_in_rep = min(self.min_angle_in_rep, ea)
            if ea <= 90.0:
                self.state = "BOTTOM"
                self.feedback = "Tốt! Đẩy người lên"
            elif ea > self.min_angle_in_rep + 12.0:
                self.state = "ASCENDING"

        elif self.state == "BOTTOM":
            if ea > 100.0:
                self.state = "ASCENDING"

        elif self.state == "ASCENDING":
            if ea >= 148.0:
                self.rep_count += 1
                is_good = self.min_angle_in_rep <= 95.0
                if is_good:
                    self.good_rep_count += 1
                    status_event = "GOOD_REP"
                    self.feedback = "Chống đẩy chuẩn!"
                else:
                    status_event = "BAD_FORM"
                    self.feedback = "Chưa hạ đủ sâu"
                self.state = "READY"
                self.min_angle_in_rep = 180.0

        return {
            "pose_detected": True,
            "rep_count": self.rep_count,
            "good_rep_count": self.good_rep_count,
            "angle": round(ea, 1),
            "state": self.state,
            "status": status_event,
            "feedback": self.feedback,
            "keypoints": self._extract_keypoints(lm, ["11", "12", "13", "14", "15", "16", "23", "24"]),
        }

    def _evaluate_plank(self, lm: Dict[str, Any]) -> Dict[str, Any]:
        # Body alignment: shoulder - hip - ankle
        has_left = "11" in lm and "23" in lm and "27" in lm
        has_right = "12" in lm and "24" in lm and "28" in lm

        if not has_left and not has_right:
            return {
                "pose_detected": True,
                "rep_count": self.rep_count,
                "angle": 180.0,
                "state": "HOLD",
                "status": None,
                "feedback": "Cần thấy rõ toàn thân",
                "keypoints": {},
            }

        idx_s = "11" if has_left else "12"
        idx_h = "23" if has_left else "24"
        idx_a = "27" if has_left else "28"
        raw_align = calculate_angle_3d(_pt3d(lm, idx_s), _pt3d(lm, idx_h), _pt3d(lm, idx_a))
        align = self._update_ema(raw_align)

        is_aligned = 160.0 <= align <= 200.0
        if is_aligned:
            self.feedback = "Tư thế plank thẳng đẹp!"
        else:
            self.feedback = "Giữ thẳng lưng và hông"

        return {
            "pose_detected": True,
            "rep_count": self.rep_count,
            "good_rep_count": self.good_rep_count,
            "angle": round(align, 1),
            "state": "HOLD",
            "status": "GOOD_REP" if is_aligned else "BAD_FORM",
            "feedback": self.feedback,
            "keypoints": self._extract_keypoints(lm, ["11", "12", "23", "24", "25", "26", "27", "28"]),
        }

    def _extract_keypoints(self, lm: Dict[str, Any], indices: List[str]) -> Dict[str, Any]:
        """Extract simplified 2D screen normalized points for skeleton visualization."""
        out = {}
        for idx in indices:
            if idx in lm:
                out[idx] = {"x": lm[idx]["x"], "y": lm[idx]["y"]}
        return out

import numpy as np
from typing import Any, Dict, Optional, Tuple


def calculate_angle_2d(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Calculates 2D planar angle at joint B given 3 points A, B, C."""
    ba, bc = a - b, c - b
    cos_angle = np.clip(
        np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-7),
        -1.0,
        1.0,
    )
    return float(np.degrees(np.arccos(cos_angle)))


def calculate_angle_3d(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """
    Calculates 3D vector angle at joint B given 3 points A, B, C in metric/3D space.
    Formula: cos(theta) = (u . v) / (||u|| * ||v||) clamped to [-1.0, 1.0].
    """
    ba = a - b
    bc = c - b
    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)
    if norm_ba < 1e-7 or norm_bc < 1e-7:
        return 180.0
    cos_angle = np.clip(np.dot(ba, bc) / (norm_ba * norm_bc), -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_angle)))


def calculate_vertical_angle(a: np.ndarray, b: np.ndarray) -> float:
    """Calculates angle between vector AB and true vertical axis (upward in 2D image coords)."""
    vec = b - a
    cos_angle = np.clip(-vec[1] / (np.linalg.norm(vec) + 1e-7), -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_angle)))


def calculate_vertical_angle_3d(a: np.ndarray, b: np.ndarray) -> float:
    """
    Calculates 3D angle between vector AB (e.g. hip -> shoulder) and vertical axis.
    In MediaPipe world coords, Y points downwards, so true upward vector is [0, -1, 0].
    """
    vec = b - a
    norm_vec = np.linalg.norm(vec)
    if norm_vec < 1e-7:
        return 0.0
    # Dot product with upward unit vector [0, -1, 0] is -vec[1]
    cos_angle = np.clip(-vec[1] / norm_vec, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_angle)))


def detect_camera_view(lm: Dict[str, Any]) -> str:
    """
    Detects camera orientation relative to the user:
    - 'SIDE_VIEW': user is facing perpendicular to camera (narrow horizontal shoulder/hip width)
    - 'FRONT_VIEW': user is facing towards/away from camera (wide horizontal shoulder/hip width)
    - 'DIAGONAL_VIEW': ~45 degree angle between front and side

    Uses ratio of horizontal shoulder distance to torso length.
    """
    has_l_sh = "11" in lm
    has_r_sh = "12" in lm
    has_l_hip = "23" in lm
    has_r_hip = "24" in lm

    # If only one shoulder or hip is visible with required confidence, it's a side profile
    if (has_l_sh != has_r_sh) or (has_l_hip != has_r_hip):
        return "SIDE_VIEW"

    if not (has_l_sh and has_r_sh and has_l_hip and has_r_hip):
        return "UNKNOWN"

    # 2D screen plane projections
    l_sh_x, l_sh_y = lm["11"]["x"], lm["11"]["y"]
    r_sh_x, r_sh_y = lm["12"]["x"], lm["12"]["y"]
    l_hip_x, l_hip_y = lm["23"]["x"], lm["23"]["y"]
    r_hip_x, r_hip_y = lm["24"]["x"], lm["24"]["y"]

    shoulder_width_x = abs(l_sh_x - r_sh_x)
    mid_sh = np.array([(l_sh_x + r_sh_x) / 2.0, (l_sh_y + r_sh_y) / 2.0])
    mid_hip = np.array([(l_hip_x + r_hip_x) / 2.0, (l_hip_y + r_hip_y) / 2.0])
    torso_len = np.linalg.norm(mid_sh - mid_hip)

    if torso_len < 1e-5:
        return "FRONT_VIEW"

    ratio = shoulder_width_x / torso_len

    if ratio < 0.22:
        return "SIDE_VIEW"
    elif ratio > 0.42:
        return "FRONT_VIEW"
    else:
        return "DIAGONAL_VIEW"


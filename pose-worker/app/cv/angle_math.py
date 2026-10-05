import numpy as np


def calculate_angle_2d(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Calculates 2D planar angle at joint B given 3 points A, B, C."""
    ba, bc = a - b, c - b
    cos_angle = np.clip(
        np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-7),
        -1.0,
        1.0,
    )
    return float(np.degrees(np.arccos(cos_angle)))


def calculate_vertical_angle(a: np.ndarray, b: np.ndarray) -> float:
    """Calculates angle between vector AB and true vertical axis (upward)."""
    vec = b - a
    cos_angle = np.clip(-vec[1] / (np.linalg.norm(vec) + 1e-7), -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_angle)))


import numpy as np

def calculate_angle_2d(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """
    Calculates the 2D planar angle at joint B given 3 points A, B, C.
    Formula: arccos((BA . BC) / (|BA| * |BC|)) * 180 / pi
    """
    ba = a - b
    bc = c - b
    
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-7)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    
    angle = np.arccos(cosine_angle)
    return float(np.degrees(angle))

def calculate_vertical_angle(a: np.ndarray, b: np.ndarray) -> float:
    """
    Calculates the angle between vector AB and the true vertical axis.
    """
    vec = b - a
    vertical = np.array([0, -1])  # upward in image coordinates (y points down)
    
    cos_angle = np.dot(vec, vertical) / (np.linalg.norm(vec) * np.linalg.norm(vertical) + 1e-7)
    cos_angle = np.clip(cos_angle, -1.0, 1.0)
    
    angle = np.arccos(cos_angle)
    return float(np.degrees(angle))

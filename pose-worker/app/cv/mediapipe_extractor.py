"""
mediapipe_extractor.py
======================
Real MediaPipe Pose landmark extraction from a video file.

Replaces the simulated_landmarks stub in main.py.
Each frame produces a dict[str, dict] mapping landmark index (as string)
to {"x": float, "y": float, "z": float, "visibility": float}.

Key landmark indices (MediaPipe BlazePose 33-point model):
  11 = LEFT_SHOULDER    12 = RIGHT_SHOULDER
  13 = LEFT_ELBOW       14 = RIGHT_ELBOW
  15 = LEFT_WRIST       16 = RIGHT_WRIST
  23 = LEFT_HIP         24 = RIGHT_HIP
  25 = LEFT_KNEE        26 = RIGHT_KNEE
  27 = LEFT_ANKLE       28 = RIGHT_ANKLE
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import cv2
import mediapipe as mp
import numpy as np

logger = logging.getLogger("fitnessleveling-pose-worker")

# MediaPipe initialisation (module-level, reused across requests)
_mp_pose = mp.solutions.pose


class VideoMetadata:
    """Holds basic metadata about the opened video."""

    def __init__(self, fps: float, frame_count: int, width: int, height: int):
        self.fps = fps
        self.frame_count = frame_count
        self.width = width
        self.height = height
        self.duration_sec = frame_count / max(fps, 1.0)

    def __repr__(self) -> str:
        return (
            f"VideoMetadata(fps={self.fps:.1f}, frames={self.frame_count}, "
            f"duration={self.duration_sec:.1f}s, {self.width}x{self.height})"
        )


class MediaPipeExtractor:
    """
    Extracts normalised MediaPipe Pose landmarks from every frame of a video.

    Usage:
        extractor = MediaPipeExtractor()
        frames_landmarks, meta = extractor.extract(video_path)
        # frames_landmarks: List[Dict[str, Any]]
        # meta: VideoMetadata
    """

    # Only keep the 17 landmarks actually used by the rule engines.
    LANDMARK_INDICES = {0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28}
    # Minimum visibility threshold — landmarks below this are treated as absent.
    VISIBILITY_THRESHOLD = 0.65  # Raised: must match frontend gatekeeper (0.65)

    def __init__(
        self,
        model_complexity: int = 1,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        frame_skip: int = 1,
    ):
        """
        Args:
            model_complexity:          0 (fastest) | 1 (balanced) | 2 (most accurate).
            min_detection_confidence:  Minimum confidence for initial pose detection.
            min_tracking_confidence:   Minimum confidence for subsequent frame tracking.
            frame_skip:                Process every N-th frame (1 = every frame).
                                       Use 2 for 60fps video to keep ~30fps analysis.
        """
        self.model_complexity = model_complexity
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        self.frame_skip = max(1, frame_skip)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def extract(
        self, video_path: str
    ) -> Tuple[List[Dict[str, Any]], VideoMetadata]:
        """
        Open *video_path*, run MediaPipe Pose on every sampled frame and return:

        Returns:
            (frames_landmarks, metadata)

            frames_landmarks: list where each element is either:
              - dict[str, dict]  — successfully extracted landmarks for that frame
              - {}               — pose not detected (skipped / low confidence)

            metadata: VideoMetadata object with fps, frame_count, etc.

        Raises:
            RuntimeError: if the video file cannot be opened.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError(
                f"cv2.VideoCapture failed to open video: {video_path}"
            )

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        meta = VideoMetadata(fps, frame_count, width, height)

        logger.info(
            f"Opened video: {meta} | frame_skip={self.frame_skip}"
        )

        frames_landmarks: List[Dict[str, Any]] = []
        frames_read = 0
        frames_detected = 0

        with _mp_pose.Pose(
            model_complexity=self.model_complexity,
            min_detection_confidence=self.min_detection_confidence,
            min_tracking_confidence=self.min_tracking_confidence,
            smooth_landmarks=True,
        ) as pose:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frames_read += 1
                # Frame subsampling
                if (frames_read - 1) % self.frame_skip != 0:
                    continue

                lm_dict = self._process_frame(frame, pose)
                frames_landmarks.append(lm_dict)
                if lm_dict:
                    frames_detected += 1

        cap.release()

        detection_rate = (
            frames_detected / max(len(frames_landmarks), 1) * 100
        )
        logger.info(
            f"Extraction complete: {len(frames_landmarks)} sampled frames | "
            f"pose detected in {frames_detected} ({detection_rate:.0f}%)"
        )

        return frames_landmarks, meta

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _process_frame(
        self, bgr_frame: np.ndarray, pose: Any
    ) -> Dict[str, Any]:
        """
        Run MediaPipe Pose on a single BGR frame.
        Returns a landmark dict or {} if pose not detected.
        """
        # MediaPipe expects RGB
        rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
        rgb.flags.writeable = False  # Micro-optimisation: avoids a copy
        results = pose.process(rgb)

        if not results.pose_landmarks:
            return {}

        lm_dict: Dict[str, Any] = {}
        for idx, lm in enumerate(results.pose_landmarks.landmark):
            if idx not in self.LANDMARK_INDICES:
                continue
            if lm.visibility < self.VISIBILITY_THRESHOLD:
                continue
            lm_dict[str(idx)] = {
                "x": round(lm.x, 6),
                "y": round(lm.y, 6),
                "z": round(lm.z, 6),
                "visibility": round(lm.visibility, 4),
            }

        return lm_dict


# ---------------------------------------------------------------------------
# Module-level singleton — avoids repeated Pose() initialisation across calls.
# ---------------------------------------------------------------------------

_default_extractor: Optional[MediaPipeExtractor] = None


def get_extractor(
    model_complexity: int = 1,
    frame_skip: int = 1,
) -> MediaPipeExtractor:
    """Return (and lazily create) the module-level extractor singleton."""
    global _default_extractor
    if _default_extractor is None:
        _default_extractor = MediaPipeExtractor(
            model_complexity=model_complexity,
            frame_skip=frame_skip,
        )
    return _default_extractor

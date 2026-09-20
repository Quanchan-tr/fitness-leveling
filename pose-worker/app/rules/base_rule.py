from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.schemas.response import PoseFeedbackResponse

class BasePoseRule(ABC):
    @abstractmethod
    def process_landmarks_sequence(self, frames_landmarks: List[Dict[str, Any]], fps: float) -> PoseFeedbackResponse:
        """
        Process a sequence of extracted 33 MediaPipe landmarks per frame and return evaluated reps & issues.
        """
        pass

"""
Pose-worker rule engines.
Exports unified registry of all 13 supported exercise rule evaluators.
"""

from typing import Dict

from app.rules.base_rule import BasePoseRule, RepBasedRule
from app.rules.bodyweight_rules import (
    BODYWEIGHT_RULES,
    GluteBridgeRule,
    JumpingJackRule,
    LungeRule,
    MountainClimberRule,
    WALL_SIT,
    WallSitRule,
)
from app.rules.plank_rule import PlankRule
from app.rules.pushup_rule import PushupRule
from app.rules.squat_rule import SquatRule
from app.rules.weighted_rules import (
    WEIGHTED_RULES,
    BicepCurlRule,
    DeadliftRule,
    LateralRaiseRule,
    ShoulderPressRule,
    SitUpRule,
)

EXERCISE_RULES: Dict[str, BasePoseRule] = {
    "squat": SquatRule(),
    "pushup": PushupRule(),
    "plank": PlankRule(),
    "wall_sit": WALL_SIT,
    **BODYWEIGHT_RULES,
    **WEIGHTED_RULES,
}

__all__ = [
    "BasePoseRule",
    "RepBasedRule",
    "SquatRule",
    "PushupRule",
    "PlankRule",
    "WallSitRule",
    "LungeRule",
    "GluteBridgeRule",
    "JumpingJackRule",
    "MountainClimberRule",
    "BicepCurlRule",
    "ShoulderPressRule",
    "DeadliftRule",
    "SitUpRule",
    "LateralRaiseRule",
    "EXERCISE_RULES",
    "BODYWEIGHT_RULES",
    "WEIGHTED_RULES",
    "WALL_SIT",
]

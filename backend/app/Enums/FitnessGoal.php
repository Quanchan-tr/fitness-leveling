<?php

declare(strict_types=1);

namespace App\Enums;

enum FitnessGoal: string
{
    case LOSE_WEIGHT = 'lose_weight';
    case GAIN_MUSCLE = 'gain_muscle';
    case MAINTAIN = 'maintain';
}

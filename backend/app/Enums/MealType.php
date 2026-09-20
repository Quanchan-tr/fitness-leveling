<?php

declare(strict_types=1);

namespace App\Enums;

enum MealType: string
{
    case BREAKFAST = 'breakfast';
    case LUNCH = 'lunch';
    case DINNER = 'dinner';
    case SNACK = 'snack';
}

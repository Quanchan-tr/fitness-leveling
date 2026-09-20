<?php

declare(strict_types=1);

namespace App\Services\Ai;

class StaticPlanFallback
{
    public static function getExercisePlan(string $goal): array
    {
        return match ($goal) {
            'lose_weight' => [
                'plan_name' => 'Expert Foundation: Fat Loss & Conditioning',
                'goal' => 'lose_weight',
                'duration_weeks' => 4,
                'sessions' => [
                    [
                        'day_label' => 'Day 1',
                        'focus_area' => 'Full Body HIIT & Legs',
                        'exercises' => [
                            ['exercise_name' => 'Bodyweight Squat', 'exercise_id' => null, 'sets' => 4, 'reps' => '15 reps', 'rest_seconds' => 45],
                            ['exercise_name' => 'Push-up', 'exercise_id' => null, 'sets' => 3, 'reps' => '12 reps', 'rest_seconds' => 45],
                            ['exercise_name' => 'Plank', 'exercise_id' => null, 'sets' => 3, 'reps' => '45s', 'rest_seconds' => 30],
                        ],
                    ],
                ],
            ],
            'gain_muscle' => [
                'plan_name' => 'Expert Foundation: Hypertrophy & Strength',
                'goal' => 'gain_muscle',
                'duration_weeks' => 4,
                'sessions' => [
                    [
                        'day_label' => 'Day 1',
                        'focus_area' => 'Upper Body Push & Pull',
                        'exercises' => [
                            ['exercise_name' => 'Barbell Bench Press', 'exercise_id' => null, 'sets' => 4, 'reps' => '8-10 reps', 'rest_seconds' => 90],
                            ['exercise_name' => 'Bent Over Rows', 'exercise_id' => null, 'sets' => 3, 'reps' => '10 reps', 'rest_seconds' => 60],
                            ['exercise_name' => 'Overhead Shoulder Press', 'exercise_id' => null, 'sets' => 3, 'reps' => '10 reps', 'rest_seconds' => 60],
                        ],
                    ],
                ],
            ],
            default => [
                'plan_name' => 'Expert Foundation: Balanced Functional Fitness',
                'goal' => 'maintain',
                'duration_weeks' => 4,
                'sessions' => [
                    [
                        'day_label' => 'Day 1',
                        'focus_area' => 'Full Body Mobility & Core',
                        'exercises' => [
                            ['exercise_name' => 'Squats', 'exercise_id' => null, 'sets' => 3, 'reps' => '12 reps', 'rest_seconds' => 60],
                            ['exercise_name' => 'Push-ups', 'exercise_id' => null, 'sets' => 3, 'reps' => '10 reps', 'rest_seconds' => 60],
                        ],
                    ],
                ],
            ],
        };
    }

    public static function getMealPlan(int $targetCalories = 2400): array
    {
        return [
            'target_calories' => $targetCalories,
            'macros' => [
                'protein_g' => (int) round(($targetCalories * 0.3) / 4),
                'carbs_g' => (int) round(($targetCalories * 0.45) / 4),
                'fat_g' => (int) round(($targetCalories * 0.25) / 9),
            ],
            'meals' => [
                [
                    'meal_type' => 'breakfast',
                    'items' => [
                        ['food_name' => 'Oatmeal & Protein Shake', 'calories' => 550, 'protein_g' => 38, 'carbs_g' => 65, 'fat_g' => 10],
                    ],
                ],
                [
                    'meal_type' => 'lunch',
                    'items' => [
                        ['food_name' => 'Chicken Rice Bowl', 'calories' => 750, 'protein_g' => 55, 'carbs_g' => 80, 'fat_g' => 15],
                    ],
                ],
                [
                    'meal_type' => 'dinner',
                    'items' => [
                        ['food_name' => 'Salmon Sweet Potato Greens', 'calories' => 650, 'protein_g' => 45, 'carbs_g' => 50, 'fat_g' => 20],
                    ],
                ],
            ],
        ];
    }
}

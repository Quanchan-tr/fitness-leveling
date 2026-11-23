<?php

declare(strict_types=1);

namespace App\Services\Ai;

class StaticPlanFallback
{
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

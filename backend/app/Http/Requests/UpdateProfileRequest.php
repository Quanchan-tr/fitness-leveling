<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\FitnessGoal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:100',
            'avatar_url' => 'sometimes|nullable|string|max:500',
            'goal' => ['sometimes', Rule::enum(FitnessGoal::class)],
            'weight_kg' => 'sometimes|numeric|min:20|max:300',
            'height_cm' => 'sometimes|numeric|min:80|max:250',
            'birth_date' => 'sometimes|date|before:today',
            'gender' => 'sometimes|string|in:male,female,other',
            'activity_level' => 'sometimes|string|in:sedentary,light,moderate,active',
            'workout_preferences' => 'sometimes|nullable|array',
            'workout_preferences.experience' => 'sometimes|string|in:beginner,some_experience,intermediate,advanced',
            'workout_preferences.days_per_week' => 'sometimes|integer|min:1|max:7',
            'workout_preferences.duration_minutes' => 'sometimes|integer|min:15|max:180',
            'workout_preferences.equipment' => 'sometimes|string|max:50',
            'workout_preferences.focus_muscles' => 'sometimes|array|max:10',
            'workout_preferences.focus_muscles.*' => 'string|max:50',
        ];
    }
}

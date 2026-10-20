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
        ];
    }
}

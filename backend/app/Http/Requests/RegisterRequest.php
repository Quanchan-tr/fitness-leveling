<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\FitnessGoal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'goal' => ['sometimes', Rule::enum(FitnessGoal::class)],
            'weight_kg' => 'sometimes|numeric|min:20|max:300',
            'height_cm' => 'sometimes|numeric|min:80|max:250',
            'birth_date' => 'sometimes|date|before:today',
            'gender' => 'sometimes|string|in:male,female,other',
            'activity_level' => 'sometimes|string|in:sedentary,light,moderate,active',
        ];
    }
}

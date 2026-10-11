<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\MealType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNutritionLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'log_date' => 'required|date|before_or_equal:tomorrow',
            'meal_type' => ['required', Rule::enum(MealType::class)],
            'food_name' => 'required|string|max:150',
            'calories' => 'required|integer|min:0|max:10000',
            'protein_g' => 'sometimes|numeric|min:0|max:1000',
            'carbs_g' => 'sometimes|numeric|min:0|max:1000',
            'fat_g' => 'sometimes|numeric|min:0|max:1000',
        ];
    }
}

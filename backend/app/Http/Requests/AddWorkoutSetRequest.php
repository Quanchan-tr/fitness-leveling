<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddWorkoutSetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exercise_id' => 'required|uuid|exists:exercises,id',
            'set_number' => 'required|integer|min:1|max:100',
            'reps' => 'required|integer|min:0|max:1000',
            'weight_kg' => 'required|numeric|min:0|max:1000',
            'duration_sec' => 'sometimes|integer|min:0|max:86400',
        ];
    }
}

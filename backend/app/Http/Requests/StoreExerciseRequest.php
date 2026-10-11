<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'description' => 'required|string|max:5000',
            'muscle_group' => 'required|string|in:chest,back,legs,core,full_body',
            'equipment' => 'required|string|max:50',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
        ];
    }
}

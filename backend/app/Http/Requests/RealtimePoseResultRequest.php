<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RealtimePoseResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exercise_id' => 'required|uuid|exists:exercises,id',
            'rep_count' => 'required|integer|min:0|max:1000',
            'score' => 'required|numeric|min:0|max:100',
            'feedback_json' => 'required|array',
        ];
    }
}

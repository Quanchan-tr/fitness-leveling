<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkoutLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // `tomorrow` tolerates client/server timezone drift.
            'log_date' => 'required|date|before_or_equal:tomorrow',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}

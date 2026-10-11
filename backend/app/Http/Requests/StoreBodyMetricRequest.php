<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBodyMetricRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'log_date' => 'required|date|before_or_equal:tomorrow',
            'weight_kg' => 'required|numeric|min:20|max:300',
            'body_fat_pct' => 'nullable|numeric|min:0|max:100',
            'height_cm' => 'nullable|numeric|min:80|max:250',
        ];
    }
}

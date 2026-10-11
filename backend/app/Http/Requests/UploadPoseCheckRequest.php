<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadPoseCheckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exercise_id' => 'required|uuid|exists:exercises,id',
            // Size limit (KB) comes from the same config the worker is told about.
            'video' => 'required|file|mimes:mp4,mov,quicktime|max:' . (config('pose.max_video_size_mb') * 1024),
        ];
    }
}

<?php

declare(strict_types=1);

return [
    'provider' => env('AI_PROVIDER', 'gemini'),
    'api_key' => env('AI_API_KEY'),
    'model' => env('AI_MODEL', 'gemini-3.5-flash-lite'),
    'timeout' => (int) env('AI_TIMEOUT_SECONDS', 15),
    'max_retries' => (int) env('AI_MAX_RETRIES', 1),
];

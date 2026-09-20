<?php

declare(strict_types=1);

return [
    'provider' => env('AI_PROVIDER', 'openai'),
    'api_key' => env('AI_API_KEY'),
    'model' => env('AI_MODEL', 'gpt-4o-mini'),
    'timeout' => (int) env('AI_TIMEOUT_SECONDS', 15),
    'max_retries' => (int) env('AI_MAX_RETRIES', 1),
];

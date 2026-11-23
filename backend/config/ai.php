<?php

declare(strict_types=1);

return [
    'base_url' => rtrim((string) env('LLM_BASE_URL', 'https://api.openai.com/v1'), '/'),
    'api_key' => env('LLM_API_KEY'),
    'model' => env('LLM_MODEL_NAME', 'gpt-4o-mini'),
    'timeout' => (int) env('AI_TIMEOUT_SECONDS', 25),
];

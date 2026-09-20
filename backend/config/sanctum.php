<?php

declare(strict_types=1);

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', '')),
    'guard' => ['web'],
    'expiration' => (int) env('SANCTUM_TOKEN_EXPIRATION', 43200), // 30 days in minutes
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];

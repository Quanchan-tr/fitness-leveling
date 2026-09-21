<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Idempotency record.
 *
 * Used by IdempotencyMiddleware to prevent duplicate processing of POST/PUT/PATCH
 * requests. Replaces the previous Redis-based locking mechanism.
 *
 * Lifecycle:
 *   - Created with status='in_progress' when a new idempotent request arrives.
 *   - Updated to status='completed' with the cached response after success.
 *   - A duplicate request finds status='in_progress' → 409 Conflict.
 *   - A retry after success finds status='completed' → returns cached response.
 *
 * @property string $id
 * @property string $key          "{user_id}:{Idempotency-Key header value}"
 * @property string $status       'in_progress' | 'completed'
 * @property int|null $http_status
 * @property array|null $response_body
 * @property \Carbon\Carbon|null $expires_at
 */
class IdempotencyRecord extends Model
{
    use HasUuids;

    protected $table = 'idempotency_records';

    protected $fillable = [
        'key',
        'status',
        'http_status',
        'response_body',
        'expires_at',
    ];

    protected $casts = [
        'response_body' => 'array',
        'expires_at'    => 'datetime',
    ];
}

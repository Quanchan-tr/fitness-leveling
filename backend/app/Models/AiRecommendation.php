<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiRecommendation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'type',
        'input_context_json',
        'output_json',
        'model_used',
        'prompt_tokens',
        'completion_tokens',
        'latency_ms',
        'status',
        'fallback_reason',
        'idempotency_key',
    ];

    protected $casts = [
        'input_context_json' => 'array',
        'output_json' => 'array',
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
        'latency_ms' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

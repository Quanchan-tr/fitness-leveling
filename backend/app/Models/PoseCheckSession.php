<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoseCheckSession extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'exercise_id',
        'mode',
        's3_bucket',
        's3_object_key',
        'video_mime',
        'video_size_bytes',
        'video_duration_sec',
        'status',
        'rep_count',
        'score',
        'feedback_json',
        'worker_version',
        'error_code',
        'error_message',
        'processing_started_at',
        'completed_at',
    ];

    protected $casts = [
        'feedback_json' => 'array',
        'score' => 'float',
        'rep_count' => 'integer',
        'video_size_bytes' => 'integer',
        'video_duration_sec' => 'float',
        'processing_started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}

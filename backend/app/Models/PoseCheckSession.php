<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pose Check Session.
 *
 * Represents a single pose analysis session, either:
 *  - 'realtime' — client performed on-device MediaPipe inference and submitted a summary.
 *  - 'upload'   — client uploaded a video file for asynchronous server-side analysis.
 *
 * For upload sessions, the video file is stored on the private local disk and
 * referenced by `video_path`. The file is NOT stored in PostgreSQL.
 *
 * State machine:  PENDING → PROCESSING → COMPLETED
 *                                    \→ FAILED
 *
 * @property string      $id
 * @property string      $user_id
 * @property string      $exercise_id
 * @property string      $mode               'realtime' | 'upload'
 * @property string|null $video_path         Relative path within the private disk
 * @property string|null $mime               MIME type of the video file
 * @property int|null    $size               File size in bytes
 * @property string|null $hash               SHA-256 hex digest of the video file
 * @property float|null  $video_duration_sec
 * @property string      $status             'pending' | 'processing' | 'completed' | 'failed'
 * @property int|null    $rep_count
 * @property float|null  $score
 * @property array|null  $feedback_json
 * @property string|null $worker_version
 * @property string|null $error_code
 * @property string|null $error_message
 * @property \Carbon\Carbon|null $processing_started_at
 * @property \Carbon\Carbon|null $completed_at
 */
class PoseCheckSession extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'exercise_id',
        'mode',
        // v2 MVP: local storage fields (replaces s3_bucket + s3_object_key)
        'video_path',
        'mime',
        'size',
        'hash',
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
        'feedback_json'         => 'array',
        'score'                 => 'float',
        'rep_count'             => 'integer',
        'size'                  => 'integer',
        'video_duration_sec'    => 'float',
        'processing_started_at' => 'datetime',
        'completed_at'          => 'datetime',
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

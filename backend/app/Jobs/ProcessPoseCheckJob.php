<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\PoseCheckSession;
use App\Services\Pose\PoseWorkerClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessPoseCheckJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 180;
    public array $backoff = [10, 30];

    public function __construct(
        public string $sessionId
    ) {
        $this->onQueue('pose_processing');
    }

    public function handle(PoseWorkerClient $workerClient): void
    {
        $session = PoseCheckSession::with('exercise')->findOrFail($this->sessionId);

        $session->update([
            'status' => 'processing',
            'processing_started_at' => now(),
        ]);

        $rulesKey = $session->exercise?->pose_rules_key ?? 'squat_v1';
        
        // Generate pre-signed URL (15 min expiry)
        $videoUrl = Storage::disk('s3')->temporaryUrl(
            $session->s3_object_key,
            now()->addMinutes(15)
        );

        $result = $workerClient->processVideo(
            $session->id,
            $videoUrl,
            $rulesKey
        );

        $session->update([
            'status' => 'completed',
            'rep_count' => $result['rep_count'] ?? 0,
            'score' => $result['score'] ?? 0,
            'feedback_json' => $result['feedback_json'] ?? null,
            'worker_version' => $result['worker_version'] ?? '2.0.0',
            'completed_at' => now(),
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        Log::error("ProcessPoseCheckJob failed for session {$this->sessionId}: " . $exception?->getMessage());

        PoseCheckSession::where('id', $this->sessionId)->update([
            'status' => 'failed',
            'error_code' => 'WORKER_TIMEOUT_OR_ERROR',
            'error_message' => 'Video processing encountered an error. Please try uploading again.',
            'completed_at' => now(),
        ]);
    }
}

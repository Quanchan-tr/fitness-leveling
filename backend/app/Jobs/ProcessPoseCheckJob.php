<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\PoseCheckSession;
use App\Services\Pose\PrivateVideoStorageService;
use App\Services\Pose\PoseWorkerClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Process Pose Check Job.
 *
 * Dispatched to the Laravel Database Queue (PostgreSQL `jobs` table) after a
 * video is uploaded via POST /api/v1/pose-check/sessions.
 *
 * State transitions managed by this job:
 *   PENDING → PROCESSING → COMPLETED
 *                       \→ FAILED
 *
 * v2 MVP change: Instead of generating a presigned S3 URL, the job resolves
 * the absolute path of the video file on the shared private_storage Docker
 * volume and passes it directly to the Python CV Worker. No S3 / MinIO needed.
 *
 * Queue: pose_processing (falls back to default)
 * Tries: 2 (one retry after initial failure)
 * Timeout: 180 seconds per attempt
 * Backoff: 10s after first failure, 30s after second
 */
class ProcessPoseCheckJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 180;
    public array $backoff = [10, 30];

    public function __construct(
        public readonly string $sessionId
    ) {
        $this->onQueue('pose_processing');
    }

    public function handle(PoseWorkerClient $workerClient, PrivateVideoStorageService $storage): void
    {
        $session = PoseCheckSession::with('exercise')->findOrFail($this->sessionId);

        $session->update([
            'status'                => 'processing',
            'processing_started_at' => now(),
        ]);

        $rulesKey = $session->exercise?->pose_rules_key ?? 'squat_v1';

        // Resolve the absolute path on the shared Docker volume.
        // The Python worker reads the file directly from the filesystem;
        // no presigned URL or S3 download needed.
        $videoAbsPath = $storage->absolutePath($session->video_path);

        Log::info("ProcessPoseCheckJob: dispatching session {$this->sessionId} to CV worker", [
            'exercise_type' => $rulesKey,
            'video_path'    => $session->video_path,
        ]);

        $result = $workerClient->processVideo(
            $session->id,
            $videoAbsPath,
            $rulesKey
        );

        $session->update([
            'status'         => 'completed',
            'rep_count'      => $result['rep_count'] ?? 0,
            'score'          => $result['score'] ?? 0,
            'feedback_json'  => $result['feedback_json'] ?? null,
            'worker_version' => $result['worker_version'] ?? '2.0.0',
            'completed_at'   => now(),
        ]);

        Log::info("ProcessPoseCheckJob: session {$this->sessionId} completed", [
            'rep_count' => $result['rep_count'] ?? 0,
            'score'     => $result['score'] ?? 0,
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        Log::error("ProcessPoseCheckJob failed for session {$this->sessionId}", [
            'error' => $exception?->getMessage(),
        ]);

        PoseCheckSession::where('id', $this->sessionId)->update([
            'status'        => 'failed',
            'error_code'    => 'WORKER_TIMEOUT_OR_ERROR',
            'error_message' => 'Video processing encountered an error. Please try uploading again.',
            'completed_at'  => now(),
        ]);
    }
}

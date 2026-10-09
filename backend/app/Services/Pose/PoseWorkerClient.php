<?php

declare(strict_types=1);

namespace App\Services\Pose;

use Illuminate\Support\Facades\Http;

/**
 * Pose Worker Client.
 *
 * HTTP client for communicating with the internal Python FastAPI CV Worker.
 * The worker is not a public API — it is only reachable within the Docker
 * Compose private network.
 *
 * v2 MVP change: video is delivered as an absolute filesystem path on the
 * shared Docker named volume (private_storage), instead of a presigned S3 URL.
 * The Python worker reads the file directly from the volume.
 */
class PoseWorkerClient
{
    private string $baseUrl;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('pose.worker_url', 'http://pose-worker:8001');
        $this->timeout = (int) config('pose.timeout', 180);
    }

    /**
     * Submit a video for pose analysis.
     *
     * @param  string $sessionId       UUID of the PoseCheckSession.
     * @param  string $videoAbsPath    Absolute path to the video file on the
     *                                 shared private_storage Docker volume,
     *                                 e.g. "/var/www/html/storage/app/private/pose-videos/{uid}/{sid}.mp4"
     * @param  string $exerciseType    Rule key, e.g. 'squat_v1', 'pushup_v1'.
     * @return array                   Decoded JSON response from the worker.
     *
     * @throws \RuntimeException       On non-2xx response from the worker.
     */
    public function processVideo(string $sessionId, string $videoAbsPath, string $exerciseType): array
    {
        // The backend resolves paths under its own storage root (e.g.
        // /var/www/html/storage/app/private), but the pose-worker accesses the
        // same named Docker volume at a different mount point (/app/private_storage).
        // Rewrite the prefix so the Python worker can actually find the file.
        $workerPath = $this->rewritePathForWorker($videoAbsPath);

        $response = Http::timeout($this->timeout)
            ->post("{$this->baseUrl}/v1/process-video", [
                'session_id'    => $sessionId,
                'video_path'    => $workerPath,
                'exercise_type' => $exerciseType,
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException(
                "Pose worker failed with status {$response->status()}: " . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Translate a backend-absolute path to the equivalent path inside the
     * pose-worker container.
     *
     * Both services share the same Docker named volume (private_storage) but
     * mount it at different paths:
     *   backend:     /var/www/html/storage/app/private  (Laravel private disk root)
     *   pose-worker: /app/private_storage
     *
     * Example:
     *   In:  /var/www/html/storage/app/private/pose-videos/uuid/abc.mp4
     *   Out: /app/private_storage/pose-videos/uuid/abc.mp4
     */
    private function rewritePathForWorker(string $backendAbsPath): string
    {
        $backendRoot = rtrim((string) config('pose.backend_storage_root', '/var/www/html/storage/app/private'), '/');
        $workerRoot  = rtrim((string) config('pose.worker_storage_root', '/app/private_storage'), '/');

        if (str_starts_with($backendAbsPath, $backendRoot)) {
            return $workerRoot . substr($backendAbsPath, strlen($backendRoot));
        }

        // Path doesn't match the expected prefix — return as-is and let the
        // worker's own validation produce a clear error.
        return $backendAbsPath;
    }
}

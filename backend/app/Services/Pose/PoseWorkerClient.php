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
        $response = Http::timeout($this->timeout)
            ->post("{$this->baseUrl}/v1/process-video", [
                'session_id'    => $sessionId,
                'video_path'    => $videoAbsPath,
                'exercise_type' => $exerciseType,
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException(
                "Pose worker failed with status {$response->status()}: " . $response->body()
            );
        }

        return $response->json();
    }
}

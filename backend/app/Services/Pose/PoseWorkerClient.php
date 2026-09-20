<?php

declare(strict_types=1);

namespace App\Services\Pose;

use Illuminate\Support\Facades\Http;

class PoseWorkerClient
{
    private string $baseUrl;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.pose_worker.url', 'http://pose-worker:8001');
        $this->timeout = (int) config('services.pose_worker.timeout', 180);
    }

    public function processVideo(string $sessionId, string $videoUrl, string $exerciseType): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->baseUrl}/v1/process-video", [
                'session_id' => $sessionId,
                'video_url' => $videoUrl,
                'exercise_type' => $exerciseType,
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException("Pose worker failed with status {$response->status()}: " . $response->body());
        }

        return $response->json();
    }
}

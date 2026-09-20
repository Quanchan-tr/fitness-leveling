<?php

declare(strict_types=1);

return [
    'worker_url' => env('POSE_WORKER_URL', 'http://pose-worker:8001'),
    'timeout' => (int) env('POSE_WORKER_TIMEOUT_SECONDS', 180),
    'max_video_size_mb' => (int) env('POSE_VIDEO_MAX_SIZE_MB', 100),
    'max_duration_sec' => (int) env('POSE_VIDEO_MAX_DURATION_SEC', 60),
];

<?php

declare(strict_types=1);

namespace App\Services\Pose;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Private Video Storage Service.
 *
 * Handles all file operations for pose-check video files stored on the private
 * local disk (storage/app/private/). Replaces S3/MinIO-based storage from v1.
 *
 * File naming convention:
 *   pose-videos/{user_id}/{session_id}.{ext}
 *
 * The private disk is configured in config/filesystems.php and shared between
 * the Laravel backend/queue-worker and the Python CV Worker via a Docker named
 * volume (private_storage).
 *
 * Files are NEVER publicly accessible. The Laravel application must check
 * ownership/authorization before allowing access to any file.
 */
class PrivateVideoStorageService
{
    private const DISK = 'private';
    private const BASE_DIR = 'pose-videos';

    /**
     * Store an uploaded video file on the private disk.
     *
     * @return string  Relative path within the private disk,
     *                 e.g. "pose-videos/{userId}/{sessionId}.mp4"
     */
    public function store(UploadedFile $file, string $userId, string $sessionId): string
    {
        $ext          = strtolower($file->getClientOriginalExtension()) ?: 'mp4';
        $directory    = self::BASE_DIR . "/{$userId}";
        $filename     = "{$sessionId}.{$ext}";
        $relativePath = "{$directory}/{$filename}";

        Storage::disk(self::DISK)->putFileAs($directory, $file, $filename);

        return $relativePath;
    }

    /**
     * Delete a video file from the private disk.
     */
    public function delete(string $relativePath): void
    {
        if (Storage::disk(self::DISK)->exists($relativePath)) {
            Storage::disk(self::DISK)->delete($relativePath);
        }
    }

    /**
     * Resolve the absolute filesystem path for use by the Python CV Worker.
     *
     * The Python worker reads files directly from the shared Docker volume,
     * so it needs the absolute path that corresponds to the private disk root.
     */
    public function absolutePath(string $relativePath): string
    {
        return Storage::disk(self::DISK)->path($relativePath);
    }

    /**
     * Compute the SHA-256 hex digest of a stored video file.
     *
     * Used for integrity checking and deduplication.
     */
    public function hash(string $relativePath): string
    {
        $absolutePath = $this->absolutePath($relativePath);

        return hash_file('sha256', $absolutePath) ?: '';
    }

    /**
     * Check whether a video file exists on the private disk.
     */
    public function exists(string $relativePath): bool
    {
        return Storage::disk(self::DISK)->exists($relativePath);
    }
}

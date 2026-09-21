<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pose check sessions table.
 *
 * Stores metadata for both realtime and upload-video pose sessions.
 *
 * v2 Course MVP changes (vs original v1 design):
 *   - Removed: s3_bucket, s3_object_key  (no S3/MinIO in MVP)
 *   - Added:   video_path  — relative path within the private storage disk,
 *                            e.g. "pose-videos/{user_id}/{session_id}.mp4"
 *   - Added:   mime        — MIME type of the uploaded video file
 *   - Added:   size        — file size in bytes
 *   - Added:   hash        — SHA-256 hex digest for integrity / deduplication
 *
 * Binary video is NOT stored in PostgreSQL. The `video_path` column only holds
 * the relative path; the actual file lives on the private local storage disk
 * (storage/app/private/) shared via Docker named volume.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pose_check_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('exercise_id');

            // 'realtime' | 'upload'
            $table->string('mode', 20)->index();

            // --- Video file metadata (upload mode only) ---
            // Relative path on the private disk: "pose-videos/{user_id}/{session_id}.mp4"
            $table->string('video_path', 500)->nullable();
            $table->string('mime', 50)->nullable();
            $table->bigInteger('size')->nullable();
            // SHA-256 hex digest of the uploaded file
            $table->string('hash', 64)->nullable();
            $table->decimal('video_duration_sec', 6, 2)->nullable();

            // --- Processing state ---
            // PENDING → PROCESSING → COMPLETED | FAILED
            $table->string('status', 20)->default('pending')->index();

            // --- Results (populated after processing) ---
            $table->unsignedSmallInteger('rep_count')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->jsonb('feedback_json')->nullable();
            $table->string('worker_version', 50)->nullable();

            // --- Failure info ---
            $table->string('error_code', 50)->nullable();
            $table->text('error_message')->nullable();

            // --- Timestamps ---
            $table->timestamp('processing_started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('exercise_id')->references('id')->on('exercises')->restrictOnDelete();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pose_check_sessions');
    }
};

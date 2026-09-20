<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pose_check_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('exercise_id');
            $table->string('mode', 20)->index();
            $table->string('s3_bucket', 100)->nullable();
            $table->string('s3_object_key', 500)->nullable();
            $table->string('video_mime', 50)->nullable();
            $table->bigInteger('video_size_bytes')->nullable();
            $table->decimal('video_duration_sec', 6, 2)->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->unsignedSmallInteger('rep_count')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->jsonb('feedback_json')->nullable();
            $table->string('worker_version', 50)->nullable();
            $table->string('error_code', 50)->nullable();
            $table->text('error_message')->nullable();
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

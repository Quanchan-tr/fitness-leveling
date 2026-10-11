<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('created_by')->nullable();
            $table->string('external_id', 50)->nullable()->index();
            $table->string('name', 255)->index();
            $table->text('description')->nullable();
            $table->string('muscle_group', 100)->nullable()->index();
            $table->string('category', 100)->nullable()->index();
            $table->string('body_part', 100)->nullable()->index();
            $table->string('target_muscle', 100)->nullable()->index();
            $table->json('secondary_muscles')->nullable();
            $table->string('equipment', 100)->nullable()->index();
            $table->string('difficulty', 50)->default('beginner');
            $table->string('video_url', 500)->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->string('gif_url', 500)->nullable();
            $table->json('instructions')->nullable();
            $table->boolean('has_pose_check')->default(false)->index();
            $table->boolean('has_ai_check')->default(false)->index();
            $table->string('pose_rules_key', 50)->nullable();
            $table->boolean('verified')->default(false)->index();
            $table->decimal('avg_rating', 3, 2)->default(0.00);
            $table->integer('rating_count')->default(0);
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};

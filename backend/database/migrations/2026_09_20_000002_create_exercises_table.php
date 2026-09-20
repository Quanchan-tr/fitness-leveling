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
            $table->string('name', 150);
            $table->text('description');
            $table->string('muscle_group', 30)->index();
            $table->string('equipment', 50);
            $table->string('difficulty', 20);
            $table->string('video_url', 500)->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->boolean('has_pose_check')->default(false)->index();
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

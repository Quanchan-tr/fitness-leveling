<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exercise_id');
            $table->uuid('user_id');
            $table->unsignedSmallInteger('stars');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('exercise_id')->references('id')->on('exercises')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['exercise_id', 'user_id']);
        });

        Schema::create('exercise_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exercise_id');
            $table->uuid('reporter_id');
            $table->string('reason', 30);
            $table->text('detail')->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->uuid('resolved_by')->nullable();
            $table->timestamps();

            $table->foreign('exercise_id')->references('id')->on('exercises')->cascadeOnDelete();
            $table->foreign('reporter_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('resolved_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_reports');
        Schema::dropIfExists('exercise_ratings');
    }
};

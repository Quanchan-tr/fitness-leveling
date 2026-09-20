<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_log_sets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workout_log_id');
            $table->uuid('exercise_id');
            $table->unsignedSmallInteger('set_number');
            $table->unsignedSmallInteger('reps');
            $table->decimal('weight_kg', 6, 2)->default(0);
            $table->unsignedInteger('duration_sec')->default(0);
            $table->timestamps();

            $table->foreign('workout_log_id')->references('id')->on('workout_logs')->cascadeOnDelete();
            $table->foreign('exercise_id')->references('id')->on('exercises')->restrictOnDelete();
            $table->index('workout_log_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_log_sets');
    }
};

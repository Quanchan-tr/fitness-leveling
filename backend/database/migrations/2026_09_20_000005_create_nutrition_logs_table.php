<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutrition_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->date('log_date');
            $table->string('meal_type', 20);
            $table->string('food_name', 150);
            $table->unsignedInteger('calories');
            $table->decimal('protein_g', 5, 1)->default(0);
            $table->decimal('carbs_g', 5, 1)->default(0);
            $table->decimal('fat_g', 5, 1)->default(0);
            $table->uuid('idempotency_key')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['user_id', 'log_date']);
            $table->unique(['user_id', 'idempotency_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nutrition_logs');
    }
};

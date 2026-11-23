<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->jsonb('workout_preferences')->nullable()->after('activity_level');
        });

        Schema::table('workout_routines', function (Blueprint $table) {
            $table->jsonb('routine_data')->nullable()->after('schedule_days');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('workout_preferences');
        });

        Schema::table('workout_routines', function (Blueprint $table) {
            $table->dropColumn('routine_data');
        });
    }
};

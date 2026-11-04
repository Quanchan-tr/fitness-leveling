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
            $table->unsignedInteger('xp')->default(0)->after('activity_level');
            $table->unsignedInteger('level')->default(1)->after('xp');
            $table->unsignedInteger('current_streak')->default(0)->after('level');
            $table->date('last_active_date')->nullable()->after('current_streak');

            $table->index('xp');
            $table->index('level');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['xp']);
            $table->dropIndex(['level']);
            $table->dropColumn(['xp', 'level', 'current_streak', 'last_active_date']);
        });
    }
};


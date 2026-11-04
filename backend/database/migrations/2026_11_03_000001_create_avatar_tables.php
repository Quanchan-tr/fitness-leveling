<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Catalog of Avatar Equipment Items
        Schema::create('avatar_items', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('item_code', 50)->unique();
            $table->string('name', 100);
            $table->string('theme', 100);
            $table->string('gender', 15)->default('unisex'); // male, female, unisex
            $table->string('slot', 20); // HEADWEAR, HAIR, TOP, BOTTOM, SHOES, ACCESSORIES, SPECIAL
            $table->string('rarity', 20)->default('COMMON'); // COMMON, RARE, EPIC, LEGENDARY
            $table->string('mesh_url', 500);
            $table->string('icon_url', 500)->nullable();
            $table->string('unlock_type', 30)->default('DEFAULT'); // DEFAULT, LEVEL, FITCOIN, STREAK
            $table->unsignedInteger('unlock_value')->default(0);
            $table->unsignedInteger('fitcoin_price')->nullable();
            $table->json('colors')->nullable();
            $table->boolean('hides_hair')->default(false);
            $table->timestamps();

            $table->index(['slot', 'gender']);
            $table->index('rarity');
        });

        // 2. User Unlocked Item Inventory
        Schema::create('user_inventories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('item_id', 50);
            $table->timestamp('unlocked_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('item_id')->references('id')->on('avatar_items')->cascadeOnDelete();

            $table->unique(['user_id', 'item_id']);
            $table->index('user_id');
        });

        // 3. User Active Equipped Avatar Configuration
        Schema::create('user_avatar_configs', function (Blueprint $table) {
            $table->uuid('user_id')->primary();
            $table->string('character_gender', 10)->default('male');
            $table->string('headwear_id', 50)->nullable();
            $table->string('hair_id', 50)->nullable();
            $table->string('top_id', 50)->nullable();
            $table->string('bottom_id', 50)->nullable();
            $table->string('shoes_id', 50)->nullable();
            $table->string('accessory_id', 50)->nullable();
            $table->string('special_id', 50)->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('headwear_id')->references('id')->on('avatar_items')->nullOnDelete();
            $table->foreign('hair_id')->references('id')->on('avatar_items')->nullOnDelete();
            $table->foreign('top_id')->references('id')->on('avatar_items')->nullOnDelete();
            $table->foreign('bottom_id')->references('id')->on('avatar_items')->nullOnDelete();
            $table->foreign('shoes_id')->references('id')->on('avatar_items')->nullOnDelete();
            $table->foreign('accessory_id')->references('id')->on('avatar_items')->nullOnDelete();
            $table->foreign('special_id')->references('id')->on('avatar_items')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_avatar_configs');
        Schema::dropIfExists('user_inventories');
        Schema::dropIfExists('avatar_items');
    }
};


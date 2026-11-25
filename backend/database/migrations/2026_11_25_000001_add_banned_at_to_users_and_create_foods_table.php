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
            $table->timestamp('banned_at')->nullable()->index();
        });

        Schema::create('foods', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name', 255)->index();
            $table->string('name_en', 255)->nullable();
            $table->text('search_text')->nullable();
            $table->string('category', 100)->index();
            $table->string('item_type', 20)->default('DISH')->index();
            $table->string('serving_size', 100)->default('1 phần');
            $table->decimal('serving_weight_g', 7, 2)->nullable();
            $table->unsignedInteger('calories')->default(0);
            $table->decimal('protein', 6, 2)->default(0);
            $table->decimal('carbs', 6, 2)->default(0);
            $table->decimal('fat', 6, 2)->default(0);
            $table->decimal('fiber', 6, 2)->default(0);
            $table->decimal('min_multiplier', 4, 2)->default(0.5);
            $table->decimal('max_multiplier', 4, 2)->default(2.5);
            $table->string('image_url', 500)->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foods');

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['banned_at']);
            $table->dropColumn('banned_at');
        });
    }
};

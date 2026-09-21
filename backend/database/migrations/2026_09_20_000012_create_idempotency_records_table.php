<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Idempotency records table.
 *
 * Replaces Redis-based idempotency locking. The unique constraint on `key`
 * ensures that only one record per (user_id, Idempotency-Key) pair can exist.
 *
 * Flow (handled by IdempotencyMiddleware):
 *   1. Attempt INSERT with status='in_progress' (unique constraint on `key`).
 *   2. If UniqueConstraintViolationException → duplicate in-progress → 409.
 *   3. If existing record with status='completed' → return cached response.
 *   4. After successful response → UPDATE to status='completed' with response body.
 *
 * Records expire after `expires_at` and can be pruned with a scheduled command.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idempotency_records', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Composite key: "{user_id}:{idempotency_key_header_value}"
            $table->string('key', 255)->unique();

            // 'in_progress' while the original request is still being handled.
            // 'completed' once the response has been stored.
            $table->string('status', 20)->default('in_progress');

            $table->smallInteger('http_status')->nullable();
            $table->jsonb('response_body')->nullable();

            // Records expire after 24 hours (same TTL as the old Redis implementation).
            $table->timestamp('expires_at')->nullable()->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idempotency_records');
    }
};

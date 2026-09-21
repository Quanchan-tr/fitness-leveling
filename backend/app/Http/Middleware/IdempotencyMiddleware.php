<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\IdempotencyRecord;
use Closure;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Idempotency Middleware (PostgreSQL-backed).
 *
 * Enforces idempotent semantics for POST/PUT/PATCH requests that supply an
 * `Idempotency-Key` header. If the client retries the same request, it receives
 * the original response without the operation being executed again.
 *
 * Implementation uses a PostgreSQL `idempotency_records` table with a UNIQUE
 * constraint on the `key` column — replacing the former Redis-based locking.
 *
 * Flow:
 *   1. Extract `Idempotency-Key` header + authenticated user ID.
 *   2. Build composite key: "{user_id}:{idempotency_key}".
 *   3. Look up existing record:
 *      a. status='in_progress' → return 409 (concurrent duplicate).
 *      b. status='completed'   → return cached response (idempotent replay).
 *   4. Attempt to INSERT a new record (status='in_progress') inside a DB transaction.
 *      - If UniqueConstraintViolationException → concurrent duplicate → 409.
 *   5. Execute the original request handler.
 *   6. On success → UPDATE record to status='completed', store response body.
 *   7. On failure → DELETE the record so the client can retry.
 *
 * TTL: completed records expire after 24 hours (prunable via scheduled command).
 */
class IdempotencyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $idempotencyKey = $request->header('Idempotency-Key');

        // Only apply to mutating requests that supply the header.
        if (!$idempotencyKey || !in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            return $next($request);
        }

        $userId = $request->user()?->id ?? 'anon';
        $compositeKey = "{$userId}:{$idempotencyKey}";

        // --- Check for an existing record ---
        $existing = IdempotencyRecord::where('key', $compositeKey)->first();

        if ($existing) {
            if ($existing->status === 'in_progress') {
                return response()->json([
                    'error' => [
                        'code'    => 'IDEMPOTENCY_CONFLICT',
                        'message' => 'A duplicate request is currently being processed.',
                    ],
                ], Response::HTTP_CONFLICT);
            }

            if ($existing->status === 'completed') {
                // Replay the original successful response.
                return response()->json(
                    $existing->response_body,
                    (int) $existing->http_status
                );
            }
        }

        // --- Attempt to claim the key ---
        // The UNIQUE constraint on `key` prevents a race condition where two
        // concurrent identical requests both pass the check above.
        try {
            DB::transaction(function () use ($compositeKey) {
                IdempotencyRecord::create([
                    'id'         => (string) Str::uuid(),
                    'key'        => $compositeKey,
                    'status'     => 'in_progress',
                    'expires_at' => now()->addDay(),
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            // Another concurrent request already claimed this key.
            return response()->json([
                'error' => [
                    'code'    => 'IDEMPOTENCY_CONFLICT',
                    'message' => 'A duplicate request is currently being processed.',
                ],
            ], Response::HTTP_CONFLICT);
        }

        /** @var \Illuminate\Http\JsonResponse $response */
        $response = $next($request);

        // --- Store or release the record based on outcome ---
        if ($response->isSuccessful()) {
            IdempotencyRecord::where('key', $compositeKey)->update([
                'status'        => 'completed',
                'http_status'   => $response->getStatusCode(),
                'response_body' => json_decode((string) $response->getContent(), true),
            ]);
        } else {
            // Release the lock so the client may retry after fixing the error.
            IdempotencyRecord::where('key', $compositeKey)->delete();
        }

        return $response;
    }
}

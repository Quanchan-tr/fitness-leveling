<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

class IdempotencyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $idempotencyKey = $request->header('Idempotency-Key');

        if (!$idempotencyKey || !in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            return $next($request);
        }

        $userId = $request->user()?->id ?? 'anon';
        $redisKey = "idempotency:{$userId}:{$idempotencyKey}";

        try {
            $cached = Redis::get($redisKey);
            if ($cached) {
                $payload = json_decode($cached, true);
                if ($payload['status'] === 'IN_PROGRESS') {
                    return response()->json([
                        'error' => [
                            'code' => 'IDEMPOTENCY_CONFLICT',
                            'message' => 'A duplicate request is currently being processed.',
                        ],
                    ], Response::HTTP_CONFLICT);
                }

                if ($payload['status'] === 'COMPLETED') {
                    return response()->json(
                        $payload['body'],
                        $payload['http_code']
                    );
                }
            }

            // Set lock with 120s TTL
            Redis::setex($redisKey, 120, json_encode([
                'status' => 'IN_PROGRESS',
                'created_at' => now()->toISOString(),
            ]));
        } catch (\Exception $e) {
            // Redis fallback if down during dev
        }

        /** @var \Illuminate\Http\JsonResponse $response */
        $response = $next($request);

        try {
            if ($response->isSuccessful()) {
                Redis::setex($redisKey, 86400, json_encode([
                    'status' => 'COMPLETED',
                    'http_code' => $response->getStatusCode(),
                    'body' => json_decode($response->getContent(), true),
                ]));
            } else {
                Redis::del($redisKey);
            }
        } catch (\Exception $e) {
            // Silently ignore Redis error
        }

        return $response;
    }
}

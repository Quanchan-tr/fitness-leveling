<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\StoreBodyMetricRequest;
use App\Models\BodyMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class BodyMetricController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 20), 100);
        $metrics = BodyMetric::where('user_id', $request->user()->id)
            ->orderBy('log_date', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $metrics->items(),
            'meta' => [
                'page' => $metrics->currentPage(),
                'per_page' => $metrics->perPage(),
                'total' => $metrics->total(),
                'last_page' => $metrics->lastPage(),
            ],
        ]);
    }

    public function store(StoreBodyMetricRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $metric = BodyMetric::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'log_date' => $validated['log_date'],
            ],
            [
                'weight_kg' => $validated['weight_kg'],
                'body_fat_pct' => $validated['body_fat_pct'] ?? null,
                'height_cm' => $validated['height_cm'] ?? $request->user()->height_cm,
            ]
        );

        // Also sync recent user profile weight
        $request->user()->update(['weight_kg' => $validated['weight_kg']]);

        return response()->json([
            'data' => $metric,
        ], 201);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\NutritionLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NutritionLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 20), 100);
        $logs = NutritionLog::where('user_id', $request->user()->id)
            ->orderBy('log_date', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'log_date' => 'required|date',
            'meal_type' => 'required|string|in:breakfast,lunch,dinner,snack',
            'food_name' => 'required|string|max:150',
            'calories' => 'required|integer|min:0',
            'protein_g' => 'sometimes|numeric|min:0',
            'carbs_g' => 'sometimes|numeric|min:0',
            'fat_g' => 'sometimes|numeric|min:0',
        ]);

        $log = NutritionLog::create([
            'user_id' => $request->user()->id,
            'log_date' => $validated['log_date'],
            'meal_type' => $validated['meal_type'],
            'food_name' => $validated['food_name'],
            'calories' => $validated['calories'],
            'protein_g' => $validated['protein_g'] ?? 0,
            'carbs_g' => $validated['carbs_g'] ?? 0,
            'fat_g' => $validated['fat_g'] ?? 0,
            'idempotency_key' => $request->header('Idempotency-Key'),
        ]);

        return response()->json([
            'data' => $log,
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $log = NutritionLog::where('user_id', $request->user()->id)->findOrFail($id);
        $log->delete();

        return response()->json([
            'data' => [
                'message' => 'Nutrition entry removed successfully.',
            ],
        ]);
    }
}

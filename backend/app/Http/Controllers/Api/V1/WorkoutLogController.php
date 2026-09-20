<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\WorkoutLog;
use App\Models\WorkoutLogSet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WorkoutLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 20), 100);
        $logs = WorkoutLog::with('sets.exercise')
            ->where('user_id', $request->user()->id)
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
            'notes' => 'nullable|string|max:1000',
        ]);

        $log = WorkoutLog::create([
            'user_id' => $request->user()->id,
            'log_date' => $validated['log_date'],
            'notes' => $validated['notes'] ?? null,
            'idempotency_key' => $request->header('Idempotency-Key'),
        ]);

        return response()->json([
            'data' => $log,
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $log = WorkoutLog::with('sets.exercise')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'data' => $log,
        ]);
    }

    public function addSet(Request $request, string $id): JsonResponse
    {
        $log = WorkoutLog::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'exercise_id' => 'required|uuid|exists:exercises,id',
            'set_number' => 'required|integer|min:1',
            'reps' => 'required|integer|min:0',
            'weight_kg' => 'required|numeric|min:0',
            'duration_sec' => 'sometimes|integer|min:0',
        ]);

        $set = $log->sets()->create($validated);

        return response()->json([
            'data' => $set,
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $log = WorkoutLog::where('user_id', $request->user()->id)->findOrFail($id);
        $log->delete();

        return response()->json([
            'data' => [
                'message' => 'Workout log deleted successfully.',
            ],
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\WorkoutRoutine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WorkoutRoutineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $routines = WorkoutRoutine::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $routines,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'target_split' => 'nullable|string|max:50',
            'schedule_days' => 'required|array',
            'is_active' => 'nullable|boolean',
        ]);

        $routine = WorkoutRoutine::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'target_split' => $validated['target_split'] ?? 'full_body',
            'schedule_days' => $validated['schedule_days'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'data' => $routine,
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $routine = WorkoutRoutine::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'data' => $routine,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $routine = WorkoutRoutine::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'description' => 'nullable|string',
            'target_split' => 'nullable|string|max:50',
            'schedule_days' => 'sometimes|required|array',
            'is_active' => 'nullable|boolean',
        ]);

        $routine->update($validated);

        return response()->json([
            'data' => $routine->fresh(),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $routine = WorkoutRoutine::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $routine->delete();

        return response()->json([
            'data' => [
                'message' => 'Routine deleted successfully.',
            ],
        ]);
    }
}


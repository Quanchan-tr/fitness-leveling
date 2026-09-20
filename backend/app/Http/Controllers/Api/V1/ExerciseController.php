<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\Exercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ExerciseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 20), 100);
        $query = Exercise::where('status', 'active');

        if ($request->filled('muscle_group')) {
            $query->where('muscle_group', $request->query('muscle_group'));
        }

        if ($request->boolean('has_pose_check')) {
            $query->where('has_pose_check', true);
        }

        if ($request->filled('q')) {
            $searchTerm = '%' . $request->query('q') . '%';
            $query->where('name', 'ilike', $searchTerm);
        }

        $exercises = $query->paginate($perPage);

        return response()->json([
            'data' => $exercises->items(),
            'meta' => [
                'page' => $exercises->currentPage(),
                'per_page' => $exercises->perPage(),
                'total' => $exercises->total(),
                'last_page' => $exercises->lastPage(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $exercise = Exercise::findOrFail($id);

        return response()->json([
            'data' => $exercise,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'required|string',
            'muscle_group' => 'required|string|in:chest,back,legs,core,full_body',
            'equipment' => 'required|string|max:50',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
        ]);

        $exercise = Exercise::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status' => 'under_review',
            'verified' => false,
        ]);

        return response()->json([
            'data' => $exercise,
        ], 201);
    }
}

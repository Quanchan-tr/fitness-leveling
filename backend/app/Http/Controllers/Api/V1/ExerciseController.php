<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\StoreExerciseRequest;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ExerciseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 24), 1), 100);
        $query = Exercise::where('status', 'active');

        if ($request->filled('category')) {
            $cat = strtolower(trim((string) $request->query('category')));
            if ($cat !== 'all') {
                $query->where(function ($q) use ($cat) {
                    $q->whereRaw('LOWER(category) = ?', [$cat])
                        ->orWhereRaw('LOWER(body_part) = ?', [$cat])
                        ->orWhereRaw('LOWER(muscle_group) = ?', [$cat])
                        ->orWhereRaw('LOWER(target_muscle) = ?', [$cat]);
                });
            }
        } elseif ($request->filled('body_part')) {
            $bp = strtolower(trim((string) $request->query('body_part')));
            if ($bp !== 'all') {
                $query->where(function ($q) use ($bp) {
                    $q->whereRaw('LOWER(body_part) = ?', [$bp])
                        ->orWhereRaw('LOWER(category) = ?', [$bp])
                        ->orWhereRaw('LOWER(muscle_group) = ?', [$bp])
                        ->orWhereRaw('LOWER(target_muscle) = ?', [$bp]);
                });
            }
        } elseif ($request->filled('muscle_group')) {
            $mg = strtolower(trim((string) $request->query('muscle_group')));
            if ($mg !== 'all') {
                $query->where(function ($q) use ($mg) {
                    $q->whereRaw('LOWER(muscle_group) = ?', [$mg])
                        ->orWhereRaw('LOWER(body_part) = ?', [$mg])
                        ->orWhereRaw('LOWER(category) = ?', [$mg])
                        ->orWhereRaw('LOWER(target_muscle) = ?', [$mg]);
                });
            }
        }

        if ($request->filled('equipment')) {
            $eq = strtolower(trim((string) $request->query('equipment')));
            if ($eq !== 'all') {
                $query->whereRaw('LOWER(equipment) = ?', [$eq]);
            }
        }

        if ($request->boolean('has_ai') || $request->boolean('has_pose_check')) {
            $query->where(function ($q) {
                $q->where('has_ai_check', true)->orWhere('has_pose_check', true);
            });
        }

        if ($request->filled('q')) {
            $searchTerm = '%' . strtolower(trim((string) $request->query('q'))) . '%';
            $query->whereRaw('LOWER(name) LIKE ?', [$searchTerm]);
        }

        $exercises = $query->orderBy('name', 'asc')->paginate($perPage);

        return response()->json([
            'data' => $exercises->items(),
            'current_page' => $exercises->currentPage(),
            'last_page' => $exercises->lastPage(),
            'total' => $exercises->total(),
            'per_page' => $exercises->perPage(),
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

    public function store(StoreExerciseRequest $request): JsonResponse
    {
        $exercise = Exercise::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'status' => 'under_review',
            'verified' => false,
        ]);

        return response()->json([
            'data' => $exercise,
        ], 201);
    }
}

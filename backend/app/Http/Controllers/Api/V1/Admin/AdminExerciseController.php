<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Exercise;
use App\Models\ExerciseReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class AdminExerciseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $status = trim((string) $request->query('status', 'all'));
        $category = strtolower(trim((string) $request->query('category', '')));
        $q = strtolower(trim((string) $request->query('q', '')));
        $trashed = (string) $request->query('trashed', '');

        $query = $trashed === 'only' ? Exercise::onlyTrashed() : Exercise::query();

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($category !== '' && $category !== 'all') {
            $query->where(function ($sub) use ($category) {
                $sub->whereRaw('LOWER(category) = ?', [$category])
                    ->orWhereRaw('LOWER(body_part) = ?', [$category])
                    ->orWhereRaw('LOWER(muscle_group) = ?', [$category])
                    ->orWhereRaw('LOWER(target_muscle) = ?', [$category]);
            });
        }

        if ($q !== '') {
            $term = '%' . $q . '%';
            $query->whereRaw('LOWER(name) LIKE ?', [$term]);
        }

        $paginator = $query
            ->with('creator:id,name,email')
            ->withCount(['reports as pending_reports_count' => fn ($sub) => $sub->where('status', 'pending')])
            ->orderByDesc('updated_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateExercise($request, isCreate: true);
        $hasPoseCheck = (bool) ($validated['has_pose_check'] ?? false);

        $exercise = Exercise::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status' => $validated['status'] ?? 'active',
            'verified' => $validated['verified'] ?? true,
            'difficulty' => $validated['difficulty'] ?? 'beginner',
            'has_pose_check' => $hasPoseCheck,
            'has_ai_check' => $hasPoseCheck,
        ]);

        return response()->json([
            'data' => $exercise,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $exercise = Exercise::withTrashed()->findOrFail($id);
        $validated = $this->validateExercise($request, isCreate: false);

        if (array_key_exists('has_pose_check', $validated)) {
            $validated['has_ai_check'] = (bool) $validated['has_pose_check'];
        }

        if (($validated['status'] ?? null) === 'active' && !array_key_exists('verified', $validated)) {
            $validated['verified'] = true;
        }

        $exercise->update($validated);

        return response()->json([
            'data' => $exercise->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $exercise = Exercise::findOrFail($id);
        $exercise->delete();

        return response()->json([
            'data' => [
                'id' => $id,
                'deleted' => true,
            ],
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $exercise = Exercise::onlyTrashed()->findOrFail($id);
        $exercise->restore();

        return response()->json([
            'data' => $exercise->fresh(),
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $status = trim((string) $request->query('status', 'pending'));

        $query = ExerciseReport::with([
            'exercise' => fn ($q) => $q->withTrashed()->select('id', 'name', 'muscle_group', 'status', 'deleted_at'),
            'reporter:id,name,email',
            'resolver:id,name,email',
        ]);

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        $paginator = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function resolveReport(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:dismiss,resolve_and_hide',
        ]);

        $report = DB::transaction(function () use ($request, $id, $validated) {
            $report = ExerciseReport::findOrFail($id);
            $report->resolved_by = $request->user()->id;

            if ($validated['action'] === 'dismiss') {
                $report->status = 'dismissed';
            } else {
                $report->status = 'resolved';
                $exercise = Exercise::find($report->exercise_id);
                if ($exercise) {
                    $exercise->update([
                        'status' => 'rejected',
                        'verified' => false,
                    ]);
                    $exercise->delete();
                }
            }

            $report->save();

            return $report->fresh([
                'exercise' => fn ($q) => $q->withTrashed()->select('id', 'name', 'muscle_group', 'status', 'deleted_at'),
                'reporter:id,name,email',
                'resolver:id,name,email',
            ]);
        });

        return response()->json([
            'data' => $report,
        ]);
    }

    private function validateExercise(Request $request, bool $isCreate): array
    {
        $req = $isCreate ? 'required' : 'sometimes';

        return $request->validate([
            'name' => "{$req}|string|max:255",
            'description' => 'nullable|string|max:5000',
            'muscle_group' => "{$req}|string|max:100",
            'category' => 'nullable|string|max:100',
            'body_part' => 'nullable|string|max:100',
            'target_muscle' => 'nullable|string|max:100',
            'equipment' => 'nullable|string|max:100',
            'difficulty' => 'sometimes|in:beginner,intermediate,advanced',
            'thumbnail_url' => 'nullable|string|max:500',
            'gif_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'instructions' => 'nullable|array',
            'has_pose_check' => 'sometimes|boolean',
            'pose_rules_key' => 'nullable|string|max:50',
            'verified' => 'sometimes|boolean',
            'status' => 'sometimes|in:active,under_review,rejected',
        ]);
    }
}

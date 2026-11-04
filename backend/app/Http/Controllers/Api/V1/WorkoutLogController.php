<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\AddWorkoutSetRequest;
use App\Http\Requests\StoreWorkoutLogRequest;
use App\Models\WorkoutLog;
use App\Services\Gamification\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WorkoutLogController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamificationService = new GamificationService()
    ) {}

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

    public function store(StoreWorkoutLogRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $log = WorkoutLog::create([
            'user_id' => $user->id,
            'log_date' => $validated['log_date'],
            'notes' => $validated['notes'] ?? null,
            'idempotency_key' => $request->header('Idempotency-Key'),
        ]);

        $gamification = $this->gamificationService->recordWorkout($user, $log);

        return response()->json([
            'data' => [
                ...$log->toArray(),
                'gamification' => $gamification,
            ],
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

    public function addSet(AddWorkoutSetRequest $request, string $id): JsonResponse
    {
        $user = $request->user();
        $log = WorkoutLog::where('user_id', $user->id)->findOrFail($id);

        $set = $log->sets()->create($request->validated());

        // Award bonus XP for logged set
        $gamification = $this->gamificationService->addXp($user, GamificationService::SET_BONUS_XP);

        return response()->json([
            'data' => [
                ...$set->toArray(),
                'gamification' => $gamification,
            ],
        ], 201);
    }

    public function complete(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $log = WorkoutLog::with('sets.exercise')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $gamification = $this->gamificationService->getGamificationSummary($user);

        return response()->json([
            'data' => [
                'log' => $log,
                'gamification' => $gamification,
                'message' => 'Workout completed successfully!',
            ],
        ]);
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

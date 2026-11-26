<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Services\Ai\AiOrchestrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AiController extends Controller
{
    public function __construct(
        private readonly AiOrchestrationService $aiService
    ) {}

    public function exercisePlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'auto_save' => 'sometimes|boolean',
            'goal' => 'sometimes|string|max:50',
            'experience' => 'sometimes|string|in:beginner,some_experience,intermediate,advanced',
            'days_per_week' => 'sometimes|integer|min:1|max:7',
            'duration_minutes' => 'sometimes|integer|min:15|max:180',
            'equipment' => 'sometimes|string|max:50',
            'split_type' => 'sometimes|string|max:50',
            'focus_muscles' => 'sometimes|nullable|array|max:10',
            'focus_muscles.*' => 'string|max:50',
            'injuries' => 'sometimes|nullable|array|max:10',
            'injuries.*' => 'string|max:50',
            'target_days' => 'sometimes|nullable|array|max:7',
            'target_days.*' => 'string|max:30',
        ]);

        $idempotencyKey = $request->header('Idempotency-Key');
        $plan = $this->aiService->generateWorkoutPlan($request->user(), $validated, $idempotencyKey);

        return response()->json([
            'data' => $plan,
        ]);
    }
}

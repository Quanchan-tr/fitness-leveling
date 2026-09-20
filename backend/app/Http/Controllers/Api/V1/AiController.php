<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Services\Ai\AiOrchestrationService;
use App\Services\Ai\StaticPlanFallback;
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
        $idempotencyKey = $request->header('Idempotency-Key');
        $plan = $this->aiService->generateWorkoutPlan($request->user(), $idempotencyKey);

        return response()->json([
            'data' => $plan,
        ]);
    }

    public function mealPlan(Request $request): JsonResponse
    {
        $targetCalories = $request->user()->goal === 'lose_weight' ? 1900 : ($request->user()->goal === 'gain_muscle' ? 2700 : 2400);
        $plan = StaticPlanFallback::getMealPlan($targetCalories);

        return response()->json([
            'data' => $plan,
        ]);
    }
}

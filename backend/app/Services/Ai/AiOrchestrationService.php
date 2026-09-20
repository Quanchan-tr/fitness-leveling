<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Models\AiRecommendation;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiOrchestrationService
{
    /**
     * Generate an AI Workout plan with triple-layer fallback.
     */
    public function generateWorkoutPlan(User $user, ?string $idempotencyKey = null): array
    {
        $startTime = microtime(true);
        $context = [
            'age' => $user->birth_date ? (int) $user->birth_date->diffInYears(now()) : 25,
            'gender' => $user->gender,
            'goal' => $user->goal,
            'activity_level' => $user->activity_level,
            'weight_kg' => $user->weight_kg,
            'height_cm' => $user->height_cm,
        ];

        $apiKey = config('ai.api_key');
        $model = config('ai.model', 'gpt-4o-mini');

        // Check if real AI call is configured
        if (!$apiKey || str_starts_with($apiKey, 'sk-proj-YOUR_API_KEY')) {
            $fallbackPlan = StaticPlanFallback::getExercisePlan($user->goal);
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            AiRecommendation::create([
                'user_id' => $user->id,
                'type' => 'exercise_plan',
                'input_context_json' => $context,
                'output_json' => $fallbackPlan,
                'model_used' => 'static-expert-template',
                'latency_ms' => $latencyMs,
                'status' => 'fallback_used',
                'fallback_reason' => 'AI_KEY_NOT_CONFIGURED',
                'idempotency_key' => $idempotencyKey,
            ]);

            return $fallbackPlan;
        }

        try {
            $response = Http::timeout(15)
                ->withToken($apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an elite fitness architect. Respond ONLY in valid JSON matching the ExercisePlan schema.',
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode($context),
                        ],
                    ],
                    'temperature' => 0.2,
                ]);

            $rawContent = $response->json('choices.0.message.content');
            $cleanedJson = $this->repairJson($rawContent);
            $parsed = json_decode($cleanedJson, true);

            if ($parsed && isset($parsed['sessions'])) {
                $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
                AiRecommendation::create([
                    'user_id' => $user->id,
                    'type' => 'exercise_plan',
                    'input_context_json' => $context,
                    'output_json' => $parsed,
                    'model_used' => $model,
                    'latency_ms' => $latencyMs,
                    'status' => 'success',
                    'idempotency_key' => $idempotencyKey,
                ]);
                return $parsed;
            }
        } catch (\Exception $e) {
            Log::warning("AI Generation Error: " . $e->getMessage());
        }

        // Layer 3: Static Fallback
        $fallback = StaticPlanFallback::getExercisePlan($user->goal);
        $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
        AiRecommendation::create([
            'user_id' => $user->id,
            'type' => 'exercise_plan',
            'input_context_json' => $context,
            'output_json' => $fallback,
            'model_used' => 'static-expert-template',
            'latency_ms' => $latencyMs,
            'status' => 'fallback_used',
            'fallback_reason' => 'LLM_EXCEPTION_TRIGGERED',
            'idempotency_key' => $idempotencyKey,
        ]);

        return $fallback;
    }

    /**
     * Local JSON sanitization (Layer 1).
     */
    private function repairJson(?string $raw): string
    {
        if (!$raw) return '{}';
        // Strip markdown code fences
        $cleaned = preg_replace('/^```(?:json)?/i', '', trim($raw));
        $cleaned = preg_replace('/```$/', '', trim($cleaned));
        // Remove trailing commas before } or ]
        $cleaned = preg_replace('/,\s*([\}\]])/', '$1', $cleaned);
        return trim($cleaned);
    }
}

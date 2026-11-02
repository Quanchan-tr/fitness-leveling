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
    public function generateWorkoutPlan(User $user, array $options = [], ?string $idempotencyKey = null): array
    {
        $startTime = microtime(true);
        $context = [
            'age' => $user->birth_date ? (int) $user->birth_date->diffInYears(now()) : 25,
            'gender' => $user->gender ?? 'male',
            'goal' => $options['goal'] ?? $user->goal ?? 'gain_muscle',
            'activity_level' => $user->activity_level ?? 'moderately_active',
            'weight_kg' => $user->weight_kg ?? 70.0,
            'height_cm' => $user->height_cm ?? 175.0,
            'split_type' => $options['split_type'] ?? 'auto',
            'days_per_week' => $options['days_per_week'] ?? 4,
            'equipment' => $options['equipment'] ?? 'all',
            'duration_minutes' => $options['duration_minutes'] ?? 60,
        ];

        $provider = config('ai.provider', 'openai');
        $apiKey = config('ai.api_key');
        $geminiKey = env('GEMINI_API_KEY');
        $model = config('ai.model', 'gpt-4o-mini');

        $hasOpenAi = !empty($apiKey) && !str_starts_with($apiKey, 'sk-proj-YOUR_API_KEY');
        $hasGemini = !empty($geminiKey) && !str_starts_with($geminiKey, 'YOUR_GEMINI_KEY');

        // Check if real AI call is configured
        if (!$hasOpenAi && !$hasGemini) {
            $rulePlan = (new WorkoutPlanRuleEngine())->generatePlan($user, $options);
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            AiRecommendation::create([
                'user_id' => $user->id,
                'type' => 'exercise_plan',
                'input_context_json' => $context,
                'output_json' => $rulePlan,
                'model_used' => 'rule-engine-hybrid',
                'latency_ms' => $latencyMs,
                'status' => 'fallback_used',
                'fallback_reason' => 'AI_KEY_NOT_CONFIGURED',
                'idempotency_key' => $idempotencyKey,
            ]);

            return $rulePlan;
        }

        try {
            $parsed = null;

            // Branch A: Google Gemini
            if ($provider === 'gemini' || ($hasGemini && !$hasOpenAi)) {
                $geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$geminiKey}";
                $promptText = "You are an elite fitness architect. Design a 7-day workout plan based on this user profile: " . json_encode($context) . ". Respond ONLY with a valid JSON object matching: { plan_id, plan_name, split_type, split_label, rationale, duration_weeks: 4, days_per_week, sessions: [{ day_of_week, is_rest: boolean, session_title, focus_area, estimated_duration_min, exercises: [{ exercise_name, sets, reps, rpe, rest_seconds }] }] }";

                $response = Http::timeout(config('ai.timeout', 15))
                    ->post($geminiEndpoint, [
                        'contents' => [
                            ['parts' => [['text' => $promptText]]]
                        ],
                        'generationConfig' => [
                            'response_mime_type' => 'application/json',
                            'temperature' => 0.2,
                        ],
                    ]);

                $rawContent = $response->json('candidates.0.content.parts.0.text');
                $cleanedJson = $this->repairJson($rawContent);
                $parsed = json_decode($cleanedJson, true);
                $modelUsed = 'gemini-1.5-flash';
            } 
            // Branch B: OpenAI
            else {
                $response = Http::timeout(config('ai.timeout', 15))
                    ->withToken($apiKey)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => $model,
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are an elite fitness architect. Respond ONLY in valid JSON matching a 7-day weekly ExercisePlan schema.',
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
                $modelUsed = $model;
            }

            if ($parsed && isset($parsed['sessions']) && count($parsed['sessions']) >= 7) {
                $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
                AiRecommendation::create([
                    'user_id' => $user->id,
                    'type' => 'exercise_plan',
                    'input_context_json' => $context,
                    'output_json' => $parsed,
                    'model_used' => $modelUsed,
                    'latency_ms' => $latencyMs,
                    'status' => 'success',
                    'idempotency_key' => $idempotencyKey,
                ]);
                return $parsed;
            }
        } catch (\Exception $e) {
            Log::warning("AI Generation Error: " . $e->getMessage());
        }

        // Layer 3: Rule Engine Fallback
        $fallback = (new WorkoutPlanRuleEngine())->generatePlan($user, $options);
        $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
        AiRecommendation::create([
            'user_id' => $user->id,
            'type' => 'exercise_plan',
            'input_context_json' => $context,
            'output_json' => $fallback,
            'model_used' => 'rule-engine-hybrid',
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

<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Models\AiRecommendation;
use App\Models\Exercise;
use App\Models\User;
use App\Models\WorkoutRoutine;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AiOrchestrationService
{
    private const DAY_MAP = [
        'thứ 2' => 'monday',
        'thu 2' => 'monday',
        'monday' => 'monday',
        'thứ 3' => 'tuesday',
        'thu 3' => 'tuesday',
        'tuesday' => 'tuesday',
        'thứ 4' => 'wednesday',
        'thu 4' => 'wednesday',
        'wednesday' => 'wednesday',
        'thứ 5' => 'thursday',
        'thu 5' => 'thursday',
        'thursday' => 'thursday',
        'thứ 6' => 'friday',
        'thu 6' => 'friday',
        'friday' => 'friday',
        'thứ 7' => 'saturday',
        'thu 7' => 'saturday',
        'saturday' => 'saturday',
        'chủ nhật' => 'sunday',
        'chu nhat' => 'sunday',
        'sunday' => 'sunday',
    ];

    /**
     * Generate a 7-day workout plan via an OpenAI-compatible LLM API with strict schema validation
     * and deterministic rule-engine fallback.
     */
    public function generateWorkoutPlan(User $user, array $options = [], ?string $idempotencyKey = null): array
    {
        $startTime = microtime(true);
        $prefs = is_array($user->workout_preferences) ? $user->workout_preferences : [];
        $mergedOptions = array_merge($prefs, array_filter($options, fn ($v) => $v !== null));

        $context = [
            'age' => $user->birth_date ? (int) $user->birth_date->diffInYears(now()) : 25,
            'gender' => $user->gender ?? 'male',
            'goal' => $mergedOptions['goal'] ?? $user->goal ?? 'gain_muscle',
            'activity_level' => $user->activity_level ?? 'moderate',
            'weight_kg' => (float) ($user->weight_kg ?? 70.0),
            'height_cm' => (float) ($user->height_cm ?? 175.0),
            'experience' => $mergedOptions['experience'] ?? 'intermediate',
            'split_type' => $mergedOptions['split_type'] ?? 'auto',
            'days_per_week' => (int) ($mergedOptions['days_per_week'] ?? 4),
            'duration_minutes' => (int) ($mergedOptions['duration_minutes'] ?? 60),
            'equipment' => $mergedOptions['equipment'] ?? 'all',
            'focus_muscles' => $mergedOptions['focus_muscles'] ?? [],
            'injuries' => $mergedOptions['injuries'] ?? [],
        ];

        $autoSave = filter_var($options['auto_save'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $apiKey = (string) config('ai.api_key', '');
        $baseUrl = rtrim((string) config('ai.base_url', 'https://api.openai.com/v1'), '/');
        $model = (string) config('ai.model', 'gpt-4o-mini');

        if ($apiKey === '') {
            return $this->fallbackAndRecord($user, $mergedOptions, $context, $idempotencyKey, $startTime, 'AI_KEY_NOT_CONFIGURED', $autoSave);
        }

        $candidates = $this->selectCandidateExercises((string) $context['equipment']);
        $endpoint = str_ends_with($baseUrl, '/chat/completions') ? $baseUrl : "{$baseUrl}/chat/completions";

        try {
            $response = Http::timeout((int) config('ai.timeout', 25))
                ->withToken($apiKey)
                ->post($endpoint, [
                    'model' => $model,
                    'temperature' => 0.2,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        ['role' => 'system', 'content' => $this->buildSystemPrompt()],
                        ['role' => 'user', 'content' => $this->buildUserPrompt($context, $candidates)],
                    ],
                ]);

            if (!$response->successful()) {
                $apiErr = $response->json('error.message') ?? $response->json('0.error.message');
                $detail = is_string($apiErr) && $apiErr !== ''
                    ? Str::limit(trim($apiErr), 180)
                    : Str::limit(trim((string) $response->body()), 180);
                $fallbackReason = 'LLM_HTTP_' . $response->status() . ($detail !== '' ? ': ' . $detail : '');
                Log::warning('LLM API HTTP failure', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->fallbackAndRecord($user, $mergedOptions, $context, $idempotencyKey, $startTime, $fallbackReason, $autoSave);
            }

            $rawContent = $response->json('choices.0.message.content');
            $parsed = json_decode($this->repairJson(is_string($rawContent) ? $rawContent : null), true);
            $validatedPlan = $this->validateAndNormalizePlan($parsed, $candidates);

            if ($validatedPlan === null) {
                return $this->fallbackAndRecord(
                    $user,
                    $mergedOptions,
                    $context,
                    $idempotencyKey,
                    $startTime,
                    'LLM_SCHEMA_VALIDATION_FAILED',
                    $autoSave,
                    $response->json('usage.prompt_tokens'),
                    $response->json('usage.completion_tokens')
                );
            }

            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
            AiRecommendation::create([
                'user_id' => $user->id,
                'type' => 'exercise_plan',
                'input_context_json' => $context,
                'output_json' => $validatedPlan,
                'model_used' => $model,
                'prompt_tokens' => $response->json('usage.prompt_tokens'),
                'completion_tokens' => $response->json('usage.completion_tokens'),
                'latency_ms' => $latencyMs,
                'status' => 'success',
                'idempotency_key' => $idempotencyKey,
            ]);

            return $autoSave ? $this->attachSavedRoutine($user, $validatedPlan) : $validatedPlan;
        } catch (\Throwable $e) {
            Log::warning('AI Generation Error: ' . $e->getMessage());
            $detail = Str::limit(trim($e->getMessage()), 180);
            $reason = 'LLM_EXCEPTION: ' . ($detail !== '' ? $detail : class_basename($e));
            return $this->fallbackAndRecord($user, $mergedOptions, $context, $idempotencyKey, $startTime, $reason, $autoSave);
        }
    }

    /**
     * Select ~50 representative active exercises across major muscle groups for prompt grounding.
     */
    private function selectCandidateExercises(string $equipment): Collection
    {
        $query = Exercise::query()
            ->where('status', 'active')
            ->select(['id', 'name', 'muscle_group', 'target_muscle', 'equipment', 'gif_url', 'has_pose_check'])
            ->orderByDesc('has_pose_check')
            ->orderByDesc('verified');

        $eq = strtolower(trim($equipment));
        if ($eq === 'bodyweight') {
            $query->whereRaw('LOWER(COALESCE(equipment, \'\')) LIKE ?', ['%body%']);
        } elseif ($eq === 'dumbbell') {
            $query->where(function ($q) {
                $q->whereRaw('LOWER(COALESCE(equipment, \'\')) LIKE ?', ['%dumbbell%'])
                    ->orWhereRaw('LOWER(COALESCE(equipment, \'\')) LIKE ?', ['%body%']);
            });
        }

        $pool = $query->limit(180)->get();
        if ($pool->isEmpty()) {
            return collect();
        }

        $targetGroups = ['chest', 'back', 'shoulders', 'upper legs', 'upper arms', 'waist'];
        $selected = collect();
        $perGroup = 8;

        foreach ($targetGroups as $group) {
            $groupItems = $pool->filter(
                fn (Exercise $ex) => str_contains(strtolower((string) $ex->muscle_group), $group)
            )->take($perGroup);
            $selected = $selected->merge($groupItems);
        }

        $selectedIds = $selected->pluck('id')->all();
        if ($selected->count() < 50) {
            $remaining = $pool->whereNotIn('id', $selectedIds)->take(50 - $selected->count());
            $selected = $selected->merge($remaining);
        }

        return $selected->unique('id')->take(50)->values();
    }

    private function buildSystemPrompt(): string
    {
        return <<<'PROMPT'
You are an elite certified strength and conditioning coach.
Create a personalized 7-day weekly workout plan matching the user's profile, preferences, and equipment.
Respond ONLY with a valid JSON object (no markdown, no explanation) with this exact schema:
{
  "plan_name": "string (max 150 chars)",
  "split_type": "full_body | upper_lower | ppl | bro_split | strength",
  "split_label": "string",
  "rationale": "string explaining why this plan fits the user",
  "duration_weeks": 4,
  "days_per_week": 4,
  "sessions": [
    {
      "day_of_week": "Thứ 2 | Thứ 3 | Thứ 4 | Thứ 5 | Thứ 6 | Thứ 7 | Chủ nhật",
      "is_rest": false,
      "session_title": "string",
      "focus_area": "string",
      "estimated_duration_min": 60,
      "exercises": [
        {
          "exercise_id": "uuid from provided catalog or null",
          "exercise_name": "string (prefer exact name from catalog)",
          "sets": 3,
          "reps": "8-12 reps",
          "rpe": 8,
          "rest_seconds": 60,
          "notes": "short coaching cue"
        }
      ]
    }
  ]
}
Rules:
- "sessions" MUST contain exactly 7 items from "Thứ 2" to "Chủ nhật".
- Exactly "days_per_week" sessions must have "is_rest": false; rest days must have "is_rest": true, "estimated_duration_min": 0, and "exercises": [].
- Prefer selecting exercises from the provided Exercise Catalog and copy their exact "exercise_id" and "exercise_name".
PROMPT;
    }

    private function buildUserPrompt(array $context, Collection $candidates): string
    {
        $catalogLines = $candidates->map(
            fn (Exercise $ex) => "- {$ex->id} | {$ex->name} | {$ex->muscle_group} | {$ex->equipment}"
        )->implode("\n");

        $catalogBlock = $catalogLines !== '' ? $catalogLines : '(No catalog exercises available — use standard gym exercise names)';

        return "User Profile & Preferences:\n"
            . json_encode($context, JSON_UNESCAPED_UNICODE)
            . "\n\nExercise Catalog (id | name | muscle_group | equipment):\n"
            . $catalogBlock;
    }

    /**
     * Validate LLM JSON payload against strict schema rules and resolve DB exercise IDs.
     */
    private function validateAndNormalizePlan(mixed $parsed, Collection $candidates): ?array
    {
        if (!is_array($parsed)) {
            return null;
        }

        $validator = Validator::make($parsed, [
            'plan_name' => 'required|string|max:150',
            'split_type' => 'required|string|max:50',
            'split_label' => 'required|string|max:100',
            'rationale' => 'required|string',
            'days_per_week' => 'required|integer|min:1|max:7',
            'sessions' => 'required|array|size:7',
            'sessions.*.day_of_week' => 'required|string|max:30',
            'sessions.*.is_rest' => 'required|boolean',
            'sessions.*.session_title' => 'required|string|max:150',
            'sessions.*.focus_area' => 'required|string|max:150',
            'sessions.*.estimated_duration_min' => 'required|integer|min:0|max:240',
            'sessions.*.exercises' => 'present|array',
            'sessions.*.exercises.*.exercise_id' => 'nullable|string|max:64',
            'sessions.*.exercises.*.exercise_name' => 'required|string|max:255',
            'sessions.*.exercises.*.sets' => 'required|integer|min:1|max:10',
            'sessions.*.exercises.*.reps' => 'required',
            'sessions.*.exercises.*.rpe' => 'nullable|numeric|min:1|max:10',
            'sessions.*.exercises.*.rest_seconds' => 'required|integer|min:15|max:300',
            'sessions.*.exercises.*.notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            Log::warning('LLM JSON schema validation failed', ['errors' => $validator->errors()->toArray()]);
            return null;
        }

        $candidatesById = $candidates->keyBy('id');
        $candidatesByName = $candidates->keyBy(fn (Exercise $ex) => strtolower(trim($ex->name)));

        $sessions = array_map(function (array $session) use ($candidatesById, $candidatesByName) {
            $exercises = array_map(function (array $item) use ($candidatesById, $candidatesByName) {
                $matched = $this->resolveExercise($item, $candidatesById, $candidatesByName);

                return [
                    'exercise_id' => $matched?->id,
                    'exercise_name' => $matched?->name ?? trim((string) $item['exercise_name']),
                    'target_muscle' => $matched?->target_muscle ?? $matched?->muscle_group ?? ($item['target_muscle'] ?? null),
                    'gif_url' => $matched?->gif_url,
                    'has_pose_check' => (bool) ($matched?->has_pose_check ?? false),
                    'sets' => (int) $item['sets'],
                    'reps' => (string) $item['reps'],
                    'rpe' => isset($item['rpe']) ? (float) $item['rpe'] : 8.0,
                    'rest_seconds' => (int) $item['rest_seconds'],
                    'notes' => isset($item['notes']) ? (string) $item['notes'] : null,
                ];
            }, $session['exercises'] ?? []);

            return [
                'day_of_week' => (string) $session['day_of_week'],
                'is_rest' => (bool) $session['is_rest'],
                'session_title' => (string) $session['session_title'],
                'focus_area' => (string) $session['focus_area'],
                'estimated_duration_min' => (int) $session['estimated_duration_min'],
                'exercises' => $exercises,
            ];
        }, $parsed['sessions']);

        return [
            'plan_id' => 'ai-plan-' . time(),
            'plan_name' => Str::limit((string) $parsed['plan_name'], 150, ''),
            'split_type' => Str::limit((string) $parsed['split_type'], 50, ''),
            'split_label' => Str::limit((string) $parsed['split_label'], 100, ''),
            'rationale' => (string) $parsed['rationale'],
            'duration_weeks' => (int) ($parsed['duration_weeks'] ?? 4),
            'days_per_week' => (int) $parsed['days_per_week'],
            'sessions' => $sessions,
        ];
    }

    private function resolveExercise(array $item, Collection $candidatesById, Collection $candidatesByName): ?Exercise
    {
        $rawId = isset($item['exercise_id']) ? trim((string) $item['exercise_id']) : '';
        if ($rawId !== '' && $candidatesById->has($rawId)) {
            return $candidatesById->get($rawId);
        }

        $nameKey = strtolower(trim((string) ($item['exercise_name'] ?? '')));
        if ($nameKey === '') {
            return null;
        }

        if ($candidatesByName->has($nameKey)) {
            return $candidatesByName->get($nameKey);
        }

        return Exercise::query()
            ->where('status', 'active')
            ->whereRaw('LOWER(name) = ?', [$nameKey])
            ->first();
    }

    private function fallbackAndRecord(
        User $user,
        array $options,
        array $context,
        ?string $idempotencyKey,
        float $startTime,
        string $reason,
        bool $autoSave,
        ?int $promptTokens = null,
        ?int $completionTokens = null
    ): array {
        $fallback = (new WorkoutPlanRuleEngine())->generatePlan($user, $options);
        $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

        AiRecommendation::create([
            'user_id' => $user->id,
            'type' => 'exercise_plan',
            'input_context_json' => $context,
            'output_json' => $fallback,
            'model_used' => 'rule-engine-hybrid',
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'latency_ms' => $latencyMs,
            'status' => 'fallback_used',
            'fallback_reason' => $reason,
            'idempotency_key' => $idempotencyKey,
        ]);

        return $autoSave ? $this->attachSavedRoutine($user, $fallback) : $fallback;
    }

    private function attachSavedRoutine(User $user, array $plan): array
    {
        WorkoutRoutine::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        $scheduleDays = [];
        foreach ($plan['sessions'] ?? [] as $session) {
            if (!empty($session['is_rest'])) {
                continue;
            }
            $dayKey = strtolower(trim((string) ($session['day_of_week'] ?? '')));
            if (isset(self::DAY_MAP[$dayKey])) {
                $scheduleDays[] = self::DAY_MAP[$dayKey];
            }
        }

        $scheduleDays = array_values(array_unique($scheduleDays));
        if ($scheduleDays === []) {
            $scheduleDays = ['monday', 'wednesday', 'friday'];
        }

        $routine = WorkoutRoutine::create([
            'user_id' => $user->id,
            'title' => Str::limit((string) ($plan['plan_name'] ?? 'AI Workout Plan'), 150, ''),
            'description' => $plan['rationale'] ?? null,
            'target_split' => Str::limit((string) ($plan['split_type'] ?? 'full_body'), 50, ''),
            'schedule_days' => $scheduleDays,
            'routine_data' => $plan,
            'is_active' => true,
        ]);

        $plan['saved_routine_id'] = $routine->id;
        $plan['saved_routine'] = $routine->toArray();

        return $plan;
    }

    private function repairJson(?string $raw): string
    {
        if (!$raw) {
            return '{}';
        }
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $cleaned = preg_replace('/\s*```$/', '', trim((string) $cleaned));
        $cleaned = preg_replace('/,\s*([\}\]])/', '$1', (string) $cleaned);
        return trim((string) $cleaned);
    }
}

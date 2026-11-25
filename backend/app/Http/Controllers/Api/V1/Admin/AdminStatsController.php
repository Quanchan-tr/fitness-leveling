<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\AiRecommendation;
use App\Models\CommunityPost;
use App\Models\Exercise;
use App\Models\ExerciseReport;
use App\Models\Food;
use App\Models\NutritionLog;
use App\Models\PoseCheckSession;
use App\Models\User;
use App\Models\WorkoutLog;
use App\Models\WorkoutLogSet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $range = (string) $request->query('range', '30d');
        $days = match ($range) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };
        $normalizedRange = match ($days) {
            7 => '7d',
            90 => '90d',
            default => '30d',
        };

        $since = now()->subDays($days - 1)->startOfDay();

        // Core platform KPIs
        $kpis = [
            'total_users' => User::count(),
            'new_users' => User::where('created_at', '>=', $since)->count(),
            'active_users' => User::where('last_active_date', '>=', $since->toDateString())->count(),
            'banned_users' => User::whereNotNull('banned_at')->count(),
            'total_workouts' => WorkoutLog::count(),
            'workouts_in_range' => WorkoutLog::where('created_at', '>=', $since)->count(),
            'total_nutrition_logs' => NutritionLog::count(),
            'nutrition_logs_in_range' => NutritionLog::where('created_at', '>=', $since)->count(),
            'total_exercises' => Exercise::where('status', 'active')->count(),
            'total_foods' => Food::count(),
            'pending_exercises_count' => Exercise::where('status', 'under_review')->count(),
            'pending_reports_count' => ExerciseReport::where('status', 'pending')->count(),
            'community_posts_in_range' => CommunityPost::where('created_at', '>=', $since)->count(),
        ];

        // AI Exercise Plan (LLM_API_KEY) usage, token consumption, and latency
        $aiRangeQuery = AiRecommendation::where('type', 'exercise_plan')
            ->where('created_at', '>=', $since);

        $promptTokens = (int) (clone $aiRangeQuery)->sum(DB::raw('COALESCE(prompt_tokens, 0)'));
        $completionTokens = (int) (clone $aiRangeQuery)->sum(DB::raw('COALESCE(completion_tokens, 0)'));
        $allTimeTokens = (int) AiRecommendation::where('type', 'exercise_plan')
            ->sum(DB::raw('COALESCE(prompt_tokens, 0) + COALESCE(completion_tokens, 0)'));

        $avgLatency = (clone $aiRangeQuery)->avg('latency_ms');
        $avgLlmLatency = (clone $aiRangeQuery)->where('status', 'success')->avg('latency_ms');

        $aiExercisePlan = [
            'total_uses' => (clone $aiRangeQuery)->count(),
            'all_time_uses' => AiRecommendation::where('type', 'exercise_plan')->count(),
            'llm_calls' => (clone $aiRangeQuery)
                ->where(fn ($q) => $q->where('status', 'success')->orWhereNotNull('prompt_tokens'))
                ->count(),
            'fallback_calls' => (clone $aiRangeQuery)->where('status', 'fallback_used')->count(),
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens' => $promptTokens + $completionTokens,
            'all_time_tokens' => $allTimeTokens,
            'avg_latency_ms' => $avgLatency !== null ? (int) round((float) $avgLatency) : 0,
            'avg_llm_latency_ms' => $avgLlmLatency !== null ? (int) round((float) $avgLlmLatency) : 0,
        ];

        // AI Pose Check (pose-worker MediaPipe) usage
        $poseRangeQuery = PoseCheckSession::where('created_at', '>=', $since);
        $avgPoseScore = (clone $poseRangeQuery)
            ->where('status', 'completed')
            ->whereNotNull('score')
            ->avg('score');

        $aiPose = [
            'total_uses' => (clone $poseRangeQuery)->count(),
            'all_time_uses' => PoseCheckSession::count(),
            'video_upload_uses' => (clone $poseRangeQuery)->where('mode', 'upload')->count(),
            'realtime_uses' => (clone $poseRangeQuery)->where('mode', 'realtime')->count(),
            'completed_uses' => (clone $poseRangeQuery)->where('status', 'completed')->count(),
            'failed_uses' => (clone $poseRangeQuery)->where('status', 'failed')->count(),
            'avg_score' => $avgPoseScore !== null ? round((float) $avgPoseScore, 1) : 0.0,
        ];

        $series = $this->buildSeries($since, $days);

        $topExercises = WorkoutLogSet::query()
            ->join('exercises', 'workout_log_sets.exercise_id', '=', 'exercises.id')
            ->where('workout_log_sets.created_at', '>=', $since)
            ->whereNull('exercises.deleted_at')
            ->select(
                'exercises.id',
                'exercises.name',
                'exercises.muscle_group',
                DB::raw('COUNT(workout_log_sets.id) as sets_count')
            )
            ->groupBy('exercises.id', 'exercises.name', 'exercises.muscle_group')
            ->orderByDesc('sets_count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name,
                'muscle_group' => $row->muscle_group,
                'sets_count' => (int) $row->sets_count,
            ])
            ->values()
            ->all();

        return response()->json([
            'data' => [
                'range' => $normalizedRange,
                'kpis' => $kpis,
                'ai_exercise_plan' => $aiExercisePlan,
                'ai_pose' => $aiPose,
                'series' => $series,
                'top_exercises' => $topExercises,
                'recent_errors' => $this->buildRecentErrors($since, 4),
            ],
        ]);
    }

    private function buildRecentErrors(Carbon $since, int $limit = 4): array
    {
        $llmErrors = AiRecommendation::where('type', 'exercise_plan')
            ->where('created_at', '>=', $since)
            ->where('status', '!=', 'success')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (AiRecommendation $row) => [
                'id' => $row->id,
                'source' => 'llm',
                'service' => 'AI Đề xuất bài tập',
                'status' => $row->status,
                'code' => $row->status,
                'reason' => $row->fallback_reason ?: 'Không nhận được phản hồi từ dịch vụ AI',
                'occurred_at' => $row->created_at?->toIso8601String(),
            ]);

        $poseErrors = PoseCheckSession::where('created_at', '>=', $since)
            ->where('status', 'failed')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (PoseCheckSession $row) => [
                'id' => $row->id,
                'source' => 'pose_worker',
                'service' => 'AI Pose Check',
                'status' => $row->status,
                'code' => $row->error_code,
                'reason' => $row->error_message ?: ($row->error_code ?: 'Lỗi xử lý khung hình'),
                'occurred_at' => $row->created_at?->toIso8601String(),
            ]);

        return $llmErrors
            ->concat($poseErrors)
            ->sortByDesc('occurred_at')
            ->take($limit)
            ->values()
            ->all();
    }

    private function buildSeries(Carbon $since, int $days): array
    {
        $userDates = User::where('created_at', '>=', $since)->pluck('created_at');
        $workoutDates = WorkoutLog::where('created_at', '>=', $since)->pluck('created_at');
        $aiPlanDates = AiRecommendation::where('type', 'exercise_plan')
            ->where('created_at', '>=', $since)
            ->pluck('created_at');
        $aiPoseDates = PoseCheckSession::where('created_at', '>=', $since)->pluck('created_at');

        // 90d uses weekly buckets (~13 points); 7d and 30d use daily buckets.
        if ($days === 90) {
            $buckets = [];
            $cursor = $since->copy();
            $end = now()->endOfDay();

            while ($cursor->lte($end)) {
                $bucketEnd = $cursor->copy()->addDays(6)->endOfDay();
                if ($bucketEnd->gt($end)) {
                    $bucketEnd = $end->copy();
                }

                $buckets[] = [
                    'start' => $cursor->copy()->startOfDay(),
                    'end' => $bucketEnd,
                    'label' => $cursor->format('d/m'),
                    'date' => $cursor->toDateString(),
                    'new_users' => 0,
                    'workouts' => 0,
                    'ai_plan_uses' => 0,
                    'ai_pose_uses' => 0,
                ];

                $cursor->addDays(7);
            }

            foreach ($buckets as &$bucket) {
                $bucket['new_users'] = $this->countInWindow($userDates, $bucket['start'], $bucket['end']);
                $bucket['workouts'] = $this->countInWindow($workoutDates, $bucket['start'], $bucket['end']);
                $bucket['ai_plan_uses'] = $this->countInWindow($aiPlanDates, $bucket['start'], $bucket['end']);
                $bucket['ai_pose_uses'] = $this->countInWindow($aiPoseDates, $bucket['start'], $bucket['end']);
                unset($bucket['start'], $bucket['end']);
            }

            return $buckets;
        }

        $userByDay = $this->groupByDate($userDates);
        $workoutByDay = $this->groupByDate($workoutDates);
        $aiPlanByDay = $this->groupByDate($aiPlanDates);
        $aiPoseByDay = $this->groupByDate($aiPoseDates);

        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $since->copy()->addDays($i);
            $key = $day->toDateString();
            $series[] = [
                'label' => $day->format('d/m'),
                'date' => $key,
                'new_users' => $userByDay[$key] ?? 0,
                'workouts' => $workoutByDay[$key] ?? 0,
                'ai_plan_uses' => $aiPlanByDay[$key] ?? 0,
                'ai_pose_uses' => $aiPoseByDay[$key] ?? 0,
            ];
        }

        return $series;
    }

    private function groupByDate(Collection $timestamps): array
    {
        $counts = [];
        foreach ($timestamps as $ts) {
            $day = Carbon::parse($ts)->toDateString();
            $counts[$day] = ($counts[$day] ?? 0) + 1;
        }

        return $counts;
    }

    private function countInWindow(Collection $timestamps, Carbon $start, Carbon $end): int
    {
        $count = 0;
        foreach ($timestamps as $ts) {
            $dt = Carbon::parse($ts);
            if ($dt->betweenIncluded($start, $end)) {
                $count++;
            }
        }

        return $count;
    }
}

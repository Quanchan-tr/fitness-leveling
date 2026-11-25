<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AiRecommendation;
use App\Models\BodyMetric;
use App\Models\CommunityPost;
use App\Models\Exercise;
use App\Models\ExerciseReport;
use App\Models\NutritionLog;
use App\Models\PoseCheckSession;
use App\Models\PostComment;
use App\Models\User;
use App\Models\WorkoutLog;
use App\Models\WorkoutLogSet;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds 90 days of realistic showcase data across Admin & User dashboards.
 *
 * All generated records use deterministic UUIDs in the dedicated range
 * `11111111-2222-4333-8444-*` so re-seeding is idempotent and `app:clear-showcase-data`
 * removes every showcase row without touching real user or production data.
 */
class ShowcaseDataSeeder extends Seeder
{
    public const UUID_PREFIX = '11111111-2222-4333-8444-';
    public const UUID_MIN = '11111111-2222-4333-8444-000000000000';
    public const UUID_MAX = '11111111-2222-4333-8444-ffffffffffff';
    public const SHOWCASE_EMAIL_DOMAIN = '@seed.fittrack.local';

    /**
     * Remove all showcase rows in FK-safe order without touching production data.
     *
     * @return array<string, int> Deleted counts keyed by table name.
     */
    public static function clear(): array
    {
        return DB::transaction(function (): array {
            $counts = [];

            $counts['post_comments'] = PostComment::withTrashed()
                ->whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->forceDelete();

            $counts['community_posts'] = CommunityPost::withTrashed()
                ->whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->forceDelete();

            $counts['exercise_reports'] = ExerciseReport::whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->delete();

            $counts['pose_check_sessions'] = PoseCheckSession::whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->delete();

            $counts['ai_recommendations'] = AiRecommendation::whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->delete();

            $counts['workout_log_sets'] = WorkoutLogSet::whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->delete();

            $counts['workout_logs'] = WorkoutLog::withTrashed()
                ->whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->forceDelete();

            $counts['nutrition_logs'] = NutritionLog::withTrashed()
                ->whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->forceDelete();

            $counts['body_metrics'] = BodyMetric::whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->delete();

            $counts['exercises'] = Exercise::withTrashed()
                ->whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->whereNotIn('id', DB::table('workout_log_sets')->select('exercise_id'))
                ->whereNotIn('id', DB::table('pose_check_sessions')->select('exercise_id'))
                ->forceDelete();

            $counts['users'] = User::withTrashed()
                ->whereBetween('id', [self::UUID_MIN, self::UUID_MAX])
                ->where('email', 'like', '%' . self::SHOWCASE_EMAIL_DOMAIN)
                ->forceDelete();

            return $counts;
        });
    }

    public function run(): void
    {
        // Idempotent: wipe previous showcase records before re-inserting.
        self::clear();

        $now = Carbon::now();
        $testUser = $this->ensureTestUser($now);
        $activeExercises = $this->loadOrSeedActiveExercises($now);

        $showcaseUsers = $this->seedUsers($now);
        $this->seedTestUserBodyMetrics($testUser, $now);
        $this->seedTestUserNutritionLogs($testUser, $now);

        $workoutLogs = $this->seedWorkouts($testUser, $showcaseUsers, $activeExercises, $now);
        $this->seedAiRecommendations($testUser, $showcaseUsers, $now);
        $this->seedPoseCheckSessions($testUser, $showcaseUsers, $activeExercises, $now);
        $this->seedPendingExercises($showcaseUsers, $now);
        $this->seedExerciseReports($showcaseUsers, $activeExercises, $now);
        $this->seedCommunity($testUser, $showcaseUsers, $workoutLogs, $now);

        $this->command?->info('ShowcaseDataSeeder: Đã tạo đầy đủ dữ liệu mẫu 90 ngày (Admin + test@example.com).');
    }

    private function showcaseUuid(int $seq): string
    {
        return self::UUID_PREFIX . str_pad(dechex($seq), 12, '0', STR_PAD_LEFT);
    }

    private function saveWithTimestamps(
        Model $model,
        int $seq,
        Carbon $createdAt,
        ?Carbon $updatedAt = null
    ): Model {
        $model->forceFill([
            'id' => $this->showcaseUuid($seq),
            'created_at' => $createdAt,
            'updated_at' => $updatedAt ?? $createdAt,
        ]);
        $model->timestamps = false;
        $model->save();

        return $model;
    }

    private function ensureTestUser(Carbon $now): User
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User (Lv.50)',
                'password' => Hash::make('password'),
                'role' => 'user',
                'goal' => 'fat_loss',
                'gender' => 'female',
                'weight_kg' => 59.8,
                'height_cm' => 165.0,
                'birth_date' => '2000-01-01',
                'activity_level' => 'moderate',
                'email_verified_at' => $now,
            ]
        );

        if ((int) $user->xp === 0) {
            $user->forceFill([
                'xp' => 3850,
                'level' => 12,
                'current_streak' => 6,
                'last_active_date' => $now->toDateString(),
            ])->save();
        }

        return $user;
    }

    private function loadOrSeedActiveExercises(Carbon $now): Collection
    {
        $exercises = Exercise::where('status', 'active')
            ->whereNull('deleted_at')
            ->limit(10)
            ->get();

        if ($exercises->isEmpty() && file_exists(database_path('data/exercises.json'))) {
            $this->call(ExerciseDatasetSeeder::class);
            $exercises = Exercise::where('status', 'active')
                ->whereNull('deleted_at')
                ->limit(10)
                ->get();
        }

        if ($exercises->isNotEmpty()) {
            return $exercises;
        }

        // Fallback when exercises.json is absent (e.g. minimal test environment).
        $fallbacks = [
            ['name' => 'Barbell Squat', 'muscle_group' => 'Legs', 'target_muscle' => 'quads', 'equipment' => 'barbell', 'has_pose' => true, 'rules' => 'squat'],
            ['name' => 'Push Up', 'muscle_group' => 'Chest', 'target_muscle' => 'pectorals', 'equipment' => 'body weight', 'has_pose' => true, 'rules' => 'pushup'],
            ['name' => 'Forearm Plank', 'muscle_group' => 'Core', 'target_muscle' => 'abs', 'equipment' => 'body weight', 'has_pose' => true, 'rules' => 'plank'],
            ['name' => 'Dumbbell Bench Press', 'muscle_group' => 'Chest', 'target_muscle' => 'pectorals', 'equipment' => 'dumbbell', 'has_pose' => false, 'rules' => null],
            ['name' => 'Lat Pulldown', 'muscle_group' => 'Back', 'target_muscle' => 'lats', 'equipment' => 'cable', 'has_pose' => false, 'rules' => null],
        ];

        $created = collect();
        foreach ($fallbacks as $idx => $item) {
            $exercise = new Exercise([
                'name' => $item['name'],
                'description' => "Bài tập nền tảng cho nhóm cơ {$item['muscle_group']}.",
                'muscle_group' => $item['muscle_group'],
                'category' => 'strength',
                'body_part' => strtolower($item['muscle_group']),
                'target_muscle' => $item['target_muscle'],
                'equipment' => $item['equipment'],
                'difficulty' => 'intermediate',
                'has_pose_check' => $item['has_pose'],
                'has_ai_check' => $item['has_pose'],
                'pose_rules_key' => $item['rules'],
                'verified' => true,
                'status' => 'active',
            ]);
            $this->saveWithTimestamps($exercise, 1501 + $idx, $now->copy()->subDays(90));
            $created->push($exercise);
        }

        return $created;
    }

    /**
     * @return Collection<int, User>
     */
    private function seedUsers(Carbon $now): Collection
    {
        $passwordHash = Hash::make('Showcase@123');
        $profiles = [
            ['name' => 'Nguyễn Minh Khôi', 'days_ago' => 86, 'goal' => 'muscle_gain', 'gender' => 'male', 'xp' => 5400, 'level' => 15, 'streak' => 12, 'active_days_ago' => 0],
            ['name' => 'Trần Thảo Vy', 'days_ago' => 80, 'goal' => 'fat_loss', 'gender' => 'female', 'xp' => 4200, 'level' => 13, 'streak' => 7, 'active_days_ago' => 1],
            ['name' => 'Lê Hoàng Nam', 'days_ago' => 73, 'goal' => 'muscle_gain', 'gender' => 'male', 'xp' => 3150, 'level' => 10, 'streak' => 4, 'active_days_ago' => 2],
            ['name' => 'Phạm Ngọc Anh', 'days_ago' => 64, 'goal' => 'maintain', 'gender' => 'female', 'xp' => 2700, 'level' => 9, 'streak' => 5, 'active_days_ago' => 0],
            ['name' => 'Đặng Quốc Bảo', 'days_ago' => 55, 'goal' => 'fat_loss', 'gender' => 'male', 'xp' => 1950, 'level' => 7, 'streak' => 0, 'active_days_ago' => 14, 'banned_days_ago' => 5],
            ['name' => 'Vũ Khánh Linh', 'days_ago' => 47, 'goal' => 'fat_loss', 'gender' => 'female', 'xp' => 3420, 'level' => 11, 'streak' => 9, 'active_days_ago' => 1],
            ['name' => 'Bùi Đức Thịnh', 'days_ago' => 39, 'goal' => 'muscle_gain', 'gender' => 'male', 'xp' => 2280, 'level' => 8, 'streak' => 3, 'active_days_ago' => 3],
            ['name' => 'Đỗ Hải Yến', 'days_ago' => 28, 'goal' => 'maintain', 'gender' => 'female', 'xp' => 1840, 'level' => 7, 'streak' => 4, 'active_days_ago' => 2],
            ['name' => 'Hoàng Gia Huy', 'days_ago' => 24, 'goal' => 'muscle_gain', 'gender' => 'male', 'xp' => 2510, 'level' => 9, 'streak' => 6, 'active_days_ago' => 0],
            ['name' => 'Ngô Thanh Trúc', 'days_ago' => 20, 'goal' => 'fat_loss', 'gender' => 'female', 'xp' => 1620, 'level' => 6, 'streak' => 2, 'active_days_ago' => 1],
            ['name' => 'Phan Tuấn Kiệt', 'days_ago' => 16, 'goal' => 'muscle_gain', 'gender' => 'male', 'xp' => 1290, 'level' => 5, 'streak' => 0, 'active_days_ago' => 9, 'banned_days_ago' => 2],
            ['name' => 'Tô Bảo Ngọc', 'days_ago' => 12, 'goal' => 'fat_loss', 'gender' => 'female', 'xp' => 1100, 'level' => 5, 'streak' => 4, 'active_days_ago' => 0],
            ['name' => 'Dương Quang Vinh', 'days_ago' => 9, 'goal' => 'maintain', 'gender' => 'male', 'xp' => 950, 'level' => 4, 'streak' => 0, 'active_days_ago' => 6, 'deleted_days_ago' => 4],
            ['name' => 'Lý Mỹ Duyên', 'days_ago' => 6, 'goal' => 'fat_loss', 'gender' => 'female', 'xp' => 780, 'level' => 4, 'streak' => 5, 'active_days_ago' => 0],
            ['name' => 'Trịnh Công Sơn', 'days_ago' => 5, 'goal' => 'muscle_gain', 'gender' => 'male', 'xp' => 640, 'level' => 3, 'streak' => 3, 'active_days_ago' => 1],
            ['name' => 'Huỳnh Lan Phương', 'days_ago' => 3, 'goal' => 'maintain', 'gender' => 'female', 'xp' => 520, 'level' => 3, 'streak' => 3, 'active_days_ago' => 0],
            ['name' => 'Mai Tiến Dũng', 'days_ago' => 2, 'goal' => 'muscle_gain', 'gender' => 'male', 'xp' => 390, 'level' => 2, 'streak' => 2, 'active_days_ago' => 0],
            ['name' => 'Võ Nhật Hạ', 'days_ago' => 1, 'goal' => 'fat_loss', 'gender' => 'female', 'xp' => 240, 'level' => 2, 'streak' => 1, 'active_days_ago' => 0],
        ];

        $users = collect();
        foreach ($profiles as $i => $p) {
            $createdAt = $now->copy()->subDays($p['days_ago'])->setTime(9 + ($i % 10), ($i * 7) % 60);
            $user = new User([
                'name' => $p['name'],
                'email' => sprintf('athlete%02d%s', $i + 1, self::SHOWCASE_EMAIL_DOMAIN),
                'password' => $passwordHash,
                'role' => 'user',
                'goal' => $p['goal'],
                'weight_kg' => $p['gender'] === 'male' ? 70.0 + ($i % 8) : 53.0 + ($i % 7),
                'height_cm' => $p['gender'] === 'male' ? 172.0 + ($i % 7) : 158.0 + ($i % 6),
                'birth_date' => '1997-06-15',
                'gender' => $p['gender'],
                'activity_level' => 'moderate',
                'email_verified_at' => $createdAt,
                'xp' => $p['xp'],
                'level' => $p['level'],
                'current_streak' => $p['streak'],
                'last_active_date' => $now->copy()->subDays($p['active_days_ago'])->toDateString(),
                'banned_at' => isset($p['banned_days_ago']) ? $now->copy()->subDays($p['banned_days_ago']) : null,
            ]);

            if (isset($p['deleted_days_ago'])) {
                $user->forceFill(['deleted_at' => $now->copy()->subDays($p['deleted_days_ago'])]);
            }

            $this->saveWithTimestamps($user, 1001 + $i, $createdAt);
            $users->push($user);
        }

        return $users;
    }

    private function seedTestUserBodyMetrics(User $testUser, Carbon $now): void
    {
        $existingDates = BodyMetric::where('user_id', $testUser->id)
            ->pluck('log_date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip()
            ->all();

        // 14 points over the last 84 days showing gradual cut from 62.4kg -> 59.8kg
        $points = [
            [84, 62.4, 25.2], [77, 62.2, 25.0], [70, 61.9, 24.8], [63, 61.7, 24.5],
            [56, 61.4, 24.3], [49, 61.2, 24.1], [42, 60.9, 23.9], [35, 60.8, 23.7],
            [28, 60.6, 23.5], [21, 60.4, 23.3], [14, 60.2, 23.1], [7, 60.0, 23.0],
            [3, 59.9, 22.9], [0, 59.8, 22.8],
        ];

        $seq = 3001;
        foreach ($points as [$daysAgo, $weight, $fat]) {
            $date = $now->copy()->subDays($daysAgo)->setTime(7, 30);
            if (isset($existingDates[$date->toDateString()])) {
                continue;
            }

            $metric = new BodyMetric([
                'user_id' => $testUser->id,
                'log_date' => $date->toDateString(),
                'weight_kg' => $weight,
                'body_fat_pct' => $fat,
                'height_cm' => 165.0,
            ]);
            $this->saveWithTimestamps($metric, $seq++, $date);
        }
    }

    private function seedTestUserNutritionLogs(User $testUser, Carbon $now): void
    {
        $menus = [
            'breakfast' => [
                ['Phở bò tái chín', 460, 28.0, 55.0, 12.0],
                ['Yến mạch sữa chua Hy Lạp & chuối', 380, 24.0, 52.0, 8.0],
                ['Bánh mì ốp la 2 trứng & dưa leo', 420, 22.0, 44.0, 16.0],
            ],
            'lunch' => [
                ['Cơm gạo lứt ức gà áp chảo & bông cải', 560, 46.0, 58.0, 14.0],
                ['Cơm tấm sườn nướng (ít mỡ)', 640, 38.0, 68.0, 21.0],
                ['Bún thịt nướng & rau sống', 540, 32.0, 62.0, 16.0],
            ],
            'dinner' => [
                ['Cá hồi áp chảo, khoai lang & salad', 520, 40.0, 42.0, 19.0],
                ['Thịt bò xào đậu cô ve & cơm trắng', 580, 39.0, 56.0, 20.0],
                ['Salad ức gà nướng mật ong', 410, 36.0, 28.0, 14.0],
            ],
        ];

        $seq = 4001;
        for ($daysAgo = 13; $daysAgo >= 0; $daysAgo--) {
            $day = $now->copy()->subDays($daysAgo);
            foreach (['breakfast' => 8, 'lunch' => 12, 'dinner' => 19] as $meal => $hour) {
                $item = $menus[$meal][$daysAgo % count($menus[$meal])];
                $ts = $day->copy()->setTime($hour, 15);
                $log = new NutritionLog([
                    'user_id' => $testUser->id,
                    'log_date' => $day->toDateString(),
                    'meal_type' => $meal,
                    'food_name' => $item[0],
                    'calories' => $item[1],
                    'protein_g' => $item[2],
                    'carbs_g' => $item[3],
                    'fat_g' => $item[4],
                ]);
                $this->saveWithTimestamps($log, $seq++, $ts);
            }
        }
    }

    /**
     * @return Collection<int, WorkoutLog>
     */
    private function seedWorkouts(
        User $testUser,
        Collection $showcaseUsers,
        Collection $exercises,
        Carbon $now
    ): Collection {
        $activeShowcaseUsers = $showcaseUsers->filter(fn (User $u) => !$u->trashed())->values();
        $notesPool = [
            'Buổi tập sức mạnh toàn thân, form ổn định.',
            'Tăng tạ nhẹ ở hiệp cuối, cảm nhận cơ tốt.',
            'Cardio kết hợp thân trên 45 phút.',
            'Tập thân dưới & core, nghỉ 60 giây giữa hiệp.',
        ];

        // 24 sessions for test@example.com across 84 days + 70 across showcase users = 94 workouts
        $offsets = [
            // test@example.com offsets (24 sessions, including 4 within 7d)
            0, 1, 3, 5, 8, 10, 13, 16, 19, 22, 25, 29, 33, 37, 41, 46, 51, 56, 61, 66, 71, 75, 79, 83,
        ];

        $workoutSeq = 5001;
        $setSeq = 6001;
        $createdWorkouts = collect();
        $exerciseList = $exercises->values();
        $exCount = $exerciseList->count();

        $createWorkoutWithSets = function (User $owner, int $daysAgo, int $index) use (
            &$workoutSeq,
            &$setSeq,
            $createdWorkouts,
            $exerciseList,
            $exCount,
            $notesPool,
            $now
        ): void {
            $ts = $now->copy()->subDays($daysAgo)->setTime(17 + ($index % 4), (10 + $index * 9) % 60);
            $workout = new WorkoutLog([
                'user_id' => $owner->id,
                'log_date' => $ts->toDateString(),
                'notes' => $notesPool[$index % count($notesPool)],
            ]);
            $this->saveWithTimestamps($workout, $workoutSeq++, $ts);
            $createdWorkouts->push($workout);

            // Skew exercise selection slightly toward first 5 exercises so Top 5 has a clear curve
            $setsForWorkout = 3 + ($index % 2);
            for ($s = 0; $s < $setsForWorkout; $s++) {
                $poolIdx = ($s < 2)
                    ? (($index + $s) % min(5, $exCount))
                    : (($index * 3 + $s) % $exCount);
                $exercise = $exerciseList[$poolIdx];

                $set = new WorkoutLogSet([
                    'workout_log_id' => $workout->id,
                    'exercise_id' => $exercise->id,
                    'set_number' => $s + 1,
                    'reps' => 8 + (($index + $s) % 7),
                    'weight_kg' => 20.0 + (($poolIdx + $s) * 5.0),
                    'duration_sec' => 45 + ($s * 10),
                ]);
                $this->saveWithTimestamps($set, $setSeq++, $ts);
            }
        };

        foreach ($offsets as $idx => $daysAgo) {
            $createWorkoutWithSets($testUser, $daysAgo, $idx);
        }

        // 70 additional sessions across showcase users spanning 88 days (weighted toward recent 30d/7d)
        for ($i = 0; $i < 70; $i++) {
            $owner = $activeShowcaseUsers[$i % $activeShowcaseUsers->count()];
            if ($i < 16) {
                $daysAgo = $i % 7;
            } elseif ($i < 42) {
                $daysAgo = 7 + ($i % 23);
            } else {
                $daysAgo = 30 + (($i * 3) % 58);
            }
            $createWorkoutWithSets($owner, $daysAgo, $i + 24);
        }

        return $createdWorkouts;
    }

    private function seedAiRecommendations(User $testUser, Collection $showcaseUsers, Carbon $now): void
    {
        $pool = $showcaseUsers->filter(fn (User $u) => !$u->trashed())->values()->prepend($testUser);
        $goals = ['muscle_gain', 'fat_loss', 'maintain'];
        $seq = 7001;

        for ($i = 0; $i < 32; $i++) {
            if ($i < 7) {
                $daysAgo = $i;
            } elseif ($i < 19) {
                $daysAgo = 7 + (($i * 2) % 23);
            } else {
                $daysAgo = 30 + (($i * 5) % 58);
            }

            $ts = $now->copy()->subDays($daysAgo)->setTime(10 + ($i % 10), (15 + $i * 7) % 60);
            $isFallback = ($i % 6 === 5); // 5 fallback_used, 27 success
            $owner = $pool[$i % $pool->count()];

            $rec = new AiRecommendation([
                'user_id' => $owner->id,
                'type' => 'exercise_plan',
                'input_context_json' => [
                    'goal' => $goals[$i % count($goals)],
                    'days_per_week' => 3 + ($i % 3),
                    'equipment' => ['dumbbell', 'barbell', 'body weight'],
                ],
                'output_json' => [
                    'split' => $i % 2 === 0 ? 'Upper / Lower' : 'Push / Pull / Legs',
                    'sessions_count' => 4,
                    'summary' => 'Lịch tập tối ưu theo mục tiêu cá nhân và khả năng phục hồi.',
                ],
                'model_used' => $isFallback ? 'rule-based-fallback' : 'gemini-2.5-flash',
                'prompt_tokens' => $isFallback ? null : 780 + ($i * 21) % 650,
                'completion_tokens' => $isFallback ? null : 520 + ($i * 19) % 580,
                'latency_ms' => $isFallback ? (55 + $i * 4) : (1250 + ($i * 173) % 2100),
                'status' => $isFallback ? 'fallback_used' : 'success',
                'fallback_reason' => $isFallback ? 'llm_timeout' : null,
            ]);
            $this->saveWithTimestamps($rec, $seq++, $ts);
        }
    }

    private function seedPoseCheckSessions(
        User $testUser,
        Collection $showcaseUsers,
        Collection $exercises,
        Carbon $now
    ): void {
        $pool = $showcaseUsers->filter(fn (User $u) => !$u->trashed())->values()->prepend($testUser);
        $poseExercises = $exercises->filter(fn (Exercise $e) => (bool) $e->has_pose_check)->values();
        if ($poseExercises->isEmpty()) {
            $poseExercises = $exercises->values();
        }

        $seq = 8001;
        for ($i = 0; $i < 26; $i++) {
            if ($i < 6) {
                $daysAgo = $i;
            } elseif ($i < 16) {
                $daysAgo = 7 + (($i * 2) % 22);
            } else {
                $daysAgo = 30 + (($i * 5) % 57);
            }

            $started = $now->copy()->subDays($daysAgo)->setTime(18, (5 + $i * 11) % 60);
            $completed = $started->copy()->addSeconds(38);
            $isFailed = ($i % 9 === 8); // 3 failed, 23 completed
            $mode = ($i % 3 === 0) ? 'upload' : 'realtime';

            $session = new PoseCheckSession([
                'user_id' => $pool[$i % $pool->count()]->id,
                'exercise_id' => $poseExercises[$i % $poseExercises->count()]->id,
                'mode' => $mode,
                'video_duration_sec' => $mode === 'upload' ? 28.5 : null,
                'status' => $isFailed ? 'failed' : 'completed',
                'rep_count' => $isFailed ? null : (10 + ($i % 9)),
                'score' => $isFailed ? null : round(74.5 + (($i * 3.7) % 21.5), 1),
                'feedback_json' => $isFailed ? null : [
                    'summary' => 'Biên độ chuyển động tốt, giữ lưng trung tính ở pha hạ người.',
                    'cues' => ['Giữ đầu gối thẳng hàng với mũi chân', 'Hít sâu trước khi hạ tạ'],
                ],
                'worker_version' => 'mediapipe-0.10.14',
                'error_code' => $isFailed ? 'LOW_LIGHT' : null,
                'error_message' => $isFailed ? 'Ánh sáng khung hình quá tối, không nhận diện đủ 33 điểm khớp.' : null,
                'processing_started_at' => $started,
                'completed_at' => $completed,
            ]);
            $this->saveWithTimestamps($session, $seq++, $started, $completed);
        }
    }

    private function seedPendingExercises(Collection $showcaseUsers, Carbon $now): void
    {
        $authors = $showcaseUsers->filter(fn (User $u) => !$u->trashed())->values();
        $items = [
            [
                'name' => 'Bulgarian Split Squat Với Tạ Đơn',
                'muscle_group' => 'Legs',
                'target_muscle' => 'quads',
                'equipment' => 'dumbbell',
                'difficulty' => 'intermediate',
                'description' => 'Bài tập đơn chân giúp tăng sức mạnh cơ đùi trước, cơ mông và cải thiện thăng bằng.',
                'instructions' => ['Đặt mu bàn chân sau lên ghế băng.', 'Hạ gối sau xuống gần chạm sàn, giữ thân người hơi nghiêng.', 'Đạp gót chân trước đứng lên vị trí ban đầu.'],
            ],
            [
                'name' => 'Incline Dumbbell Fly',
                'muscle_group' => 'Chest',
                'target_muscle' => 'pectorals',
                'equipment' => 'dumbbell',
                'difficulty' => 'beginner',
                'description' => 'Mở rộng lồng ngực trên ghế dốc 30 độ, tập trung vào phần ngực trên.',
                'instructions' => ['Nằm trên ghế dốc 30 độ, giữ hai tạ tay phía trên ngực.', 'Hơi cong khuỷu tay và mở rộng hai tay sang ngang.', 'Ép ngực kéo tạ về vị trí ban đầu.'],
            ],
            [
                'name' => 'Hollow Body Hold',
                'muscle_group' => 'Core',
                'target_muscle' => 'abs',
                'equipment' => 'body weight',
                'difficulty' => 'intermediate',
                'description' => 'Bài tập isometric siết chặt toàn bộ thành bụng và lưng dưới.',
                'instructions' => ['Nằm ngửa, ép sát thắt lưng xuống sàn.', 'Nâng vai và hai chân duỗi thẳng cách mặt đất 15cm.', 'Giữ tư thế trong 30–45 giây.'],
            ],
        ];

        foreach ($items as $i => $item) {
            $ts = $now->copy()->subDays(2 - ($i % 2))->setTime(14 + $i, 20);
            $exercise = new Exercise([
                'created_by' => $authors[$i % $authors->count()]->id,
                'name' => $item['name'],
                'description' => $item['description'],
                'muscle_group' => $item['muscle_group'],
                'category' => 'strength',
                'body_part' => strtolower($item['muscle_group']),
                'target_muscle' => $item['target_muscle'],
                'equipment' => $item['equipment'],
                'difficulty' => $item['difficulty'],
                'instructions' => $item['instructions'],
                'has_pose_check' => false,
                'has_ai_check' => false,
                'verified' => false,
                'status' => 'under_review',
            ]);
            $this->saveWithTimestamps($exercise, 2001 + $i, $ts);
        }
    }

    private function seedExerciseReports(
        Collection $showcaseUsers,
        Collection $exercises,
        Carbon $now
    ): void {
        $reporters = $showcaseUsers->filter(fn (User $u) => !$u->trashed())->values();
        $exList = $exercises->values();

        $reports = [
            ['reason' => 'incorrect_form', 'detail' => 'Ảnh minh hoạ đang bị lệch góc lưng dưới ở pha hạ tạ.'],
            ['reason' => 'misleading_tags', 'detail' => 'Bài này tác động chính vào vai sau nhưng đang gắn tag ngực.'],
            ['reason' => 'other', 'detail' => 'Video hướng dẫn hiện tải hơi chậm trên mạng di động.'],
            ['reason' => 'incorrect_form', 'detail' => 'Mô tả nhịp thở bị ngược giữa pha hít vào và thở ra.'],
        ];

        foreach ($reports as $i => $r) {
            $ts = $now->copy()->subDays(4 - $i)->setTime(16, 10 + $i * 5);
            $report = new ExerciseReport([
                'exercise_id' => $exList[$i % $exList->count()]->id,
                'reporter_id' => $reporters[$i % $reporters->count()]->id,
                'reason' => $r['reason'],
                'detail' => $r['detail'],
                'status' => 'pending',
            ]);
            $this->saveWithTimestamps($report, 2501 + $i, $ts);
        }
    }

    private function seedCommunity(
        User $testUser,
        Collection $showcaseUsers,
        Collection $workoutLogs,
        Carbon $now
    ): void {
        $authors = $showcaseUsers->filter(fn (User $u) => !$u->trashed())->values()->prepend($testUser);
        $postsData = [
            ['content' => 'Hoàn thành mốc streak 6 ngày liên tiếp! Cảm giác form squat hôm nay ổn hơn tuần trước rất nhiều.', 'days_ago' => 0, 'likes' => 14],
            ['content' => 'Vừa test tính năng AI Pose cho Push-up đạt 92.4 điểm, máy nhắc giữ hông cao rất kịp lúc.', 'days_ago' => 1, 'likes' => 21],
            ['content' => 'Thực đơn hôm nay: ức gà áp chảo khoai lang + cá hồi buổi tối, đủ 125g protein mà vẫn nhẹ bụng.', 'days_ago' => 2, 'likes' => 9],
            ['content' => 'Ai đang tập lịch Upper/Lower 4 buổi/tuần chia sẻ kinh nghiệm sắp xếp ngày tập chân với mình nhé!', 'days_ago' => 4, 'likes' => 18],
            ['content' => 'Cán mốc Level 12 rồi anh em ơi! Mục tiêu tháng tới là chinh phục 100kg Deadlift chuẩn kỹ thuật.', 'days_ago' => 6, 'likes' => 27],
            ['content' => 'Chiều nay phòng gym đông quá nên ở nhà tập chuỗi bodyweight 30 phút vẫn ướt đẫm áo.', 'days_ago' => 9, 'likes' => 11],
            ['content' => 'AI Đề xuất bài tập gợi ý chuyển sang Superset cho nhóm tay sau khá ổn, tiết kiệm hẳn 15 phút.', 'days_ago' => 12, 'likes' => 16],
            ['content' => 'Cân sáng nay giảm thêm 0.6kg mỡ thừa sau 3 tuần giữ thâm hụt nhẹ 300 kcal/ngày.', 'days_ago' => 15, 'likes' => 23],
            ['content' => 'Nhắc nhẹ mọi người nhớ khởi động kỹ khớp vai trước khi vào bài đẩy ngực nhé.', 'days_ago' => 20, 'likes' => 12],
            ['content' => 'Bài đăng test kiểm duyệt nội dung cộng đồng (đã được ẩn để kiểm tra bộ lọc Admin).', 'days_ago' => 5, 'likes' => 0, 'deleted' => true],
        ];

        $commentTexts = [
            'Tuyệt vời quá bạn ơi, giữ vững phong độ nhé!',
            'Mình cũng đang theo lịch này, thấy phục hồi rất ổn.',
            'Chuẩn form luôn, chúc bạn sớm đạt PR mới!',
            'Cảm ơn bạn đã chia sẻ thực đơn rất chi tiết.',
        ];

        $postSeq = 9001;
        $commentSeq = 9501;

        foreach ($postsData as $i => $p) {
            $ts = $now->copy()->subDays($p['days_ago'])->setTime(19, 10 + $i);
            $post = new CommunityPost([
                'user_id' => $authors[$i % $authors->count()]->id,
                'content' => $p['content'],
                'workout_log_id' => $workoutLogs->get($i)?->id,
                'likes_count' => $p['likes'],
                'comments_count' => 0,
            ]);

            if (!empty($p['deleted'])) {
                $post->forceFill(['deleted_at' => $ts->copy()->addHour()]);
            }

            $this->saveWithTimestamps($post, $postSeq++, $ts);

            if (!empty($p['deleted'])) {
                continue;
            }

            $numComments = ($i % 3) + 2; // 2..4 comments per visible post -> ~25 comments
            $activeCommentsCount = 0;

            for ($c = 0; $c < $numComments; $c++) {
                $cTs = $ts->copy()->addMinutes(20 + $c * 15);
                $isHiddenComment = ($i === 3 && $c === 1) || ($i === 6 && $c === 0);

                $comment = new PostComment([
                    'user_id' => $authors[($i + $c + 1) % $authors->count()]->id,
                    'post_id' => $post->id,
                    'content' => $isHiddenComment
                        ? 'Bình luận thử nghiệm đã bị ẩn để kiểm tra chức năng khôi phục.'
                        : $commentTexts[($i + $c) % count($commentTexts)],
                ]);

                if ($isHiddenComment) {
                    $comment->forceFill(['deleted_at' => $cTs->copy()->addMinutes(30)]);
                } else {
                    $activeCommentsCount++;
                }

                $this->saveWithTimestamps($comment, $commentSeq++, $cTs);
            }

            $post->timestamps = false;
            $post->forceFill(['comments_count' => $activeCommentsCount])->save();
        }
    }
}

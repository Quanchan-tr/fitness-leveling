<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Models\Exercise;
use App\Models\User;

class WorkoutPlanRuleEngine
{
    /**
     * Generate a 7-day science-based workout plan using rules and database exercises.
     */
    public function generatePlan(User $user, array $options = []): array
    {
        $goal = $options['goal'] ?? $user->goal ?? 'gain_muscle';
        $experience = $options['experience'] ?? 'intermediate';
        $daysCount = (int) ($options['days_per_week'] ?? 4);
        $daysCount = max(2, min(6, $daysCount));
        
        $requestedSplit = $options['split_type'] ?? 'auto';
        $equipment = $options['equipment'] ?? 'all';
        $duration = (int) ($options['duration_minutes'] ?? 60);

        // 1. Determine optimal split
        $split = $requestedSplit === 'auto'
            ? $this->recommendSplit($experience, $daysCount, $goal)
            : $requestedSplit;

        $splitMetadata = $this->getSplitMetadata($split);

        // 2. Map day schedule (7 days from Monday to Sunday)
        $weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        $dayAllocations = $this->allocateSplitDays($split, $daysCount, $options['target_days'] ?? null);

        // 3. Populate exercises for each day
        $sessions = [];
        foreach ($weekDays as $dayName) {
            $allocation = $dayAllocations[$dayName] ?? null;

            if (!$allocation || $allocation['is_rest']) {
                $sessions[] = [
                    'day_of_week' => $dayName,
                    'is_rest' => true,
                    'session_title' => 'Nghỉ ngơi & Phục hồi',
                    'focus_area' => 'Rest & Active Recovery',
                    'estimated_duration_min' => 0,
                    'exercises' => [],
                ];
                continue;
            }

            $exercises = $this->selectExercisesForFocus(
                $allocation['focus_key'],
                $goal,
                $equipment,
                $duration
            );

            $sessions[] = [
                'day_of_week' => $dayName,
                'is_rest' => false,
                'session_title' => $allocation['title'],
                'focus_area' => $allocation['focus_area'],
                'estimated_duration_min' => $duration,
                'exercises' => $exercises,
            ];
        }

        return [
            'plan_id' => 'ai-plan-' . time(),
            'plan_name' => "Kế hoạch {$splitMetadata['name']} ({$daysCount} buổi/tuần)",
            'split_type' => $split,
            'split_label' => $splitMetadata['name'],
            'rationale' => $splitMetadata['rationale'],
            'duration_weeks' => 4,
            'days_per_week' => $daysCount,
            'sessions' => $sessions,
        ];
    }

    public function recommendSplit(string $experience, int $daysCount, string $goal): string
    {
        if ($daysCount <= 3) {
            return 'full_body';
        }
        if ($daysCount === 4) {
            return 'upper_lower';
        }
        if ($daysCount >= 5) {
            return $goal === 'gain_muscle' ? 'ppl' : ($experience === 'advanced' ? 'bro_split' : 'ppl');
        }
        return 'upper_lower';
    }

    private function getSplitMetadata(string $split): array
    {
        return match ($split) {
            'full_body' => [
                'name' => 'Full Body (Toàn thân)',
                'rationale' => 'Kích thích tất cả các nhóm cơ chính trong mỗi buổi tập, tối ưu tần suất phục hồi cho người tập 2-3 buổi/tuần.',
            ],
            'upper_lower' => [
                'name' => 'Upper / Lower (Thân trên / Thân dưới)',
                'rationale' => 'Tách biệt thân trên và thân dưới, cho phép đẩy mức tạ cao và tối ưu hóa tổng khối lượng vận động 4 buổi/tuần.',
            ],
            'ppl' => [
                'name' => 'Push / Pull / Legs (Đẩy / Kéo / Chân)',
                'rationale' => 'Phân chia nhóm cơ theo chuỗi động học phối hợp, tối đa hóa kích thích phì đại cơ bắp (Hypertrophy) 3-6 buổi/tuần.',
            ],
            'bro_split' => [
                'name' => 'Bro Split (1 Nhóm cơ mỗi ngày)',
                'rationale' => 'Tập trung triệt để vào 1 nhóm cơ lớn trong ngày, mang lại cảm giác pump cơ tối đa cho người có kinh nghiệm.',
            ],
            'strength' => [
                'name' => 'Strength & Powerlifting (Sức mạnh nền tảng)',
                'rationale' => 'Xoay quanh bộ 3 bài tập lớn (Squat, Bench Press, Deadlift) để xây dựng sức mạnh thô và mật độ xương khớp.',
            ],
            default => [
                'name' => 'Cân bằng chức năng',
                'rationale' => 'Lịch tập tối ưu hóa thể lực, tính linh hoạt và duy trì vóc dáng cân đối.',
            ],
        };
    }

    private function allocateSplitDays(string $split, int $daysCount, ?array $userPreferredDays = null): array
    {
        $allocations = [];

        if ($split === 'full_body') {
            if ($daysCount === 2) {
                $allocations['Thứ 2'] = ['is_rest' => false, 'title' => 'Full Body A', 'focus_area' => 'Ngực, Chân, Lưng xô', 'focus_key' => 'full_body_a'];
                $allocations['Thứ 5'] = ['is_rest' => false, 'title' => 'Full Body B', 'focus_area' => 'Vai, Đùi sau, Tay & Bụng', 'focus_key' => 'full_body_b'];
            } else {
                $allocations['Thứ 2'] = ['is_rest' => false, 'title' => 'Full Body A', 'focus_area' => 'Ngực, Đùi trước, Lưng xô', 'focus_key' => 'full_body_a'];
                $allocations['Thứ 4'] = ['is_rest' => false, 'title' => 'Full Body B', 'focus_area' => 'Vai, Đùi sau, Tay', 'focus_key' => 'full_body_b'];
                $allocations['Thứ 6'] = ['is_rest' => false, 'title' => 'Full Body C', 'focus_area' => 'Toàn thân bùng nổ & Bụng', 'focus_key' => 'full_body_c'];
            }
        } elseif ($split === 'upper_lower') {
            $allocations['Thứ 2'] = ['is_rest' => false, 'title' => 'Upper A (Thân trên)', 'focus_area' => 'Ngực, Lưng xô, Vai trước', 'focus_key' => 'upper_a'];
            $allocations['Thứ 3'] = ['is_rest' => false, 'title' => 'Lower A (Thân dưới)', 'focus_area' => 'Đùi trước, Bắp chân, Bụng', 'focus_key' => 'lower_a'];
            $allocations['Thứ 5'] = ['is_rest' => false, 'title' => 'Upper B (Thân trên)', 'focus_area' => 'Lưng, Vai sau, Tay trước & Tay sau', 'focus_key' => 'upper_b'];
            if ($daysCount >= 4) {
                $allocations['Thứ 6'] = ['is_rest' => false, 'title' => 'Lower B (Thân dưới)', 'focus_area' => 'Đùi sau, Mông, Core', 'focus_key' => 'lower_b'];
            }
        } elseif ($split === 'ppl') {
            $allocations['Thứ 2'] = ['is_rest' => false, 'title' => 'Push (Đẩy)', 'focus_area' => 'Ngực, Vai trước, Tay sau', 'focus_key' => 'push'];
            $allocations['Thứ 3'] = ['is_rest' => false, 'title' => 'Pull (Kéo)', 'focus_area' => 'Lưng xô, Vai sau, Tay trước', 'focus_key' => 'pull'];
            $allocations['Thứ 4'] = ['is_rest' => false, 'title' => 'Legs (Chân & Mông)', 'focus_area' => 'Đùi trước, Đùi sau, Bắp chân, Bụng', 'focus_key' => 'legs'];
            if ($daysCount >= 4) {
                $allocations['Thứ 6'] = ['is_rest' => false, 'title' => 'Push Focus (Đẩy nâng cao)', 'focus_area' => 'Ngực trên, Vai & Tay sau', 'focus_key' => 'push'];
            }
            if ($daysCount >= 5) {
                $allocations['Thứ 7'] = ['is_rest' => false, 'title' => 'Pull Focus (Kéo nâng cao)', 'focus_area' => 'Lưng dày & Tay trước', 'focus_key' => 'pull'];
            }
        } elseif ($split === 'bro_split') {
            $allocations['Thứ 2'] = ['is_rest' => false, 'title' => 'Chest Day (Ngực)', 'focus_area' => 'Cơ ngực toàn diện', 'focus_key' => 'chest'];
            $allocations['Thứ 3'] = ['is_rest' => false, 'title' => 'Back Day (Lưng xô)', 'focus_area' => 'Độ rộng và dày lưng', 'focus_key' => 'back'];
            $allocations['Thứ 5'] = ['is_rest' => false, 'title' => 'Shoulders Day (Vai)', 'focus_area' => 'Vai trước, vai giữa, vai sau', 'focus_key' => 'shoulders'];
            $allocations['Thứ 6'] = ['is_rest' => false, 'title' => 'Arms Day (Tay)', 'focus_area' => 'Tay trước & Tay sau siêu cấp', 'focus_key' => 'arms'];
            if ($daysCount >= 5) {
                $allocations['Thứ 7'] = ['is_rest' => false, 'title' => 'Legs Day (Chân)', 'focus_area' => 'Đùi trước, đùi sau, bắp chân', 'focus_key' => 'legs'];
            }
        } else { // strength
            $allocations['Thứ 2'] = ['is_rest' => false, 'title' => 'Squat Focus', 'focus_area' => 'Squat nặng & Bench phụ trợ', 'focus_key' => 'lower_a'];
            $allocations['Thứ 4'] = ['is_rest' => false, 'title' => 'Bench Press Focus', 'focus_area' => 'Bench Press nặng & Thân trên phụ trợ', 'focus_key' => 'upper_a'];
            $allocations['Thứ 6'] = ['is_rest' => false, 'title' => 'Deadlift Focus', 'focus_area' => 'Deadlift nặng & Sức mạnh thân dưới', 'focus_key' => 'lower_b'];
        }

        return $allocations;
    }

    private function selectExercisesForFocus(string $focusKey, string $goal, string $equipment, int $duration): array
    {
        $reps = match ($goal) {
            'gain_muscle' => '8-12 reps',
            'lose_weight' => '12-15 reps',
            default => '10-12 reps',
        };

        $sets = $duration >= 60 ? 4 : 3;

        $exerciseTemplates = [
            'push' => [
                ['name' => 'Barbell Bench Press', 'target_muscle' => 'chest', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Incline Dumbbell Press', 'target_muscle' => 'chest', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Dumbbell Lateral Raise', 'target_muscle' => 'shoulders', 'reps' => '12-15 reps', 'rpe' => 8.5, 'rest' => 45],
                ['name' => 'Overhead Triceps Extension', 'target_muscle' => 'upper arms', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
            ],
            'pull' => [
                ['name' => 'Lat Pulldown', 'target_muscle' => 'back', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Bent Over Dumbbell Row', 'target_muscle' => 'back', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Face Pull', 'target_muscle' => 'shoulders', 'reps' => '12-15 reps', 'rpe' => 8, 'rest' => 45],
                ['name' => 'Dumbbell Bicep Curl', 'target_muscle' => 'upper arms', 'reps' => '10-12 reps', 'rpe' => 8.5, 'rest' => 60],
            ],
            'legs' => [
                ['name' => 'Barbell Squat', 'target_muscle' => 'upper legs', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Romanian Deadlift', 'target_muscle' => 'upper legs', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 75],
                ['name' => 'Walking Lunges', 'target_muscle' => 'upper legs', 'reps' => '12-14 bước', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Plank', 'target_muscle' => 'waist', 'reps' => '45-60s', 'rpe' => 8, 'rest' => 45],
            ],
            'upper_a' => [
                ['name' => 'Barbell Bench Press', 'target_muscle' => 'chest', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Seated Cable Row', 'target_muscle' => 'back', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Dumbbell Shoulder Press', 'target_muscle' => 'shoulders', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Triceps Pushdown', 'target_muscle' => 'upper arms', 'reps' => '12-15 reps', 'rpe' => 8, 'rest' => 45],
            ],
            'lower_a' => [
                ['name' => 'Barbell Squat', 'target_muscle' => 'upper legs', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Leg Extension', 'target_muscle' => 'upper legs', 'reps' => '12-15 reps', 'rpe' => 8.5, 'rest' => 60],
                ['name' => 'Standing Calf Raise', 'target_muscle' => 'lower legs', 'reps' => '15 reps', 'rpe' => 8, 'rest' => 45],
                ['name' => 'Hanging Leg Raise', 'target_muscle' => 'waist', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 45],
            ],
            'upper_b' => [
                ['name' => 'Lat Pulldown', 'target_muscle' => 'back', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Incline Dumbbell Press', 'target_muscle' => 'chest', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Cable Lateral Raise', 'target_muscle' => 'shoulders', 'reps' => '12-15 reps', 'rpe' => 8, 'rest' => 45],
                ['name' => 'Incline Hammer Curl', 'target_muscle' => 'upper arms', 'reps' => '10-12 reps', 'rpe' => 8.5, 'rest' => 60],
            ],
            'lower_b' => [
                ['name' => 'Romanian Deadlift', 'target_muscle' => 'upper legs', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Bulgarian Split Squat', 'target_muscle' => 'upper legs', 'reps' => '10 reps/bên', 'rpe' => 8.5, 'rest' => 60],
                ['name' => 'Seated Leg Curl', 'target_muscle' => 'upper legs', 'reps' => '12-15 reps', 'rpe' => 8, 'rest' => 45],
                ['name' => 'Ab Wheel Rollout', 'target_muscle' => 'waist', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 45],
            ],
            'full_body_a' => [
                ['name' => 'Barbell Squat', 'target_muscle' => 'upper legs', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Barbell Bench Press', 'target_muscle' => 'chest', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Bent Over Row', 'target_muscle' => 'back', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Plank', 'target_muscle' => 'waist', 'reps' => '45s', 'rpe' => 8, 'rest' => 45],
            ],
            'full_body_b' => [
                ['name' => 'Romanian Deadlift', 'target_muscle' => 'upper legs', 'reps' => '8-10 reps', 'rpe' => 8, 'rest' => 90],
                ['name' => 'Dumbbell Shoulder Press', 'target_muscle' => 'shoulders', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Lat Pulldown', 'target_muscle' => 'back', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Dumbbell Bicep Curl', 'target_muscle' => 'upper arms', 'reps' => '12 reps', 'rpe' => 8, 'rest' => 45],
            ],
            'full_body_c' => [
                ['name' => 'Leg Press', 'target_muscle' => 'upper legs', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 75],
                ['name' => 'Push-up', 'target_muscle' => 'chest', 'reps' => '15 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Seated Cable Row', 'target_muscle' => 'back', 'reps' => '10-12 reps', 'rpe' => 8, 'rest' => 60],
                ['name' => 'Hanging Leg Raise', 'target_muscle' => 'waist', 'reps' => '12 reps', 'rpe' => 8, 'rest' => 45],
            ],
        ];

        $template = $exerciseTemplates[$focusKey] ?? $exerciseTemplates['full_body_a'];

        $result = [];
        foreach ($template as $item) {
            $result[] = [
                'exercise_name' => $item['name'],
                'exercise_id' => null,
                'target_muscle' => $item['target_muscle'],
                'sets' => $sets,
                'reps' => $item['reps'],
                'rpe' => $item['rpe'],
                'rest_seconds' => $item['rest'],
            ];
        }

        return $result;
    }
}


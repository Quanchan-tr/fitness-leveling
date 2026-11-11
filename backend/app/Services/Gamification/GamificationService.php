<?php

declare(strict_types=1);

namespace App\Services\Gamification;

use App\Models\NutritionLog;
use App\Models\PoseCheckSession;
use App\Models\User;
use App\Models\WorkoutLog;
use Carbon\Carbon;

class GamificationService
{
    public const BASE_WORKOUT_XP = 100;
    public const SET_BONUS_XP = 5;

    /**
     * Calculate level from total XP.
     * Level 1: 0 - 99 XP
     * Level 2: 100 - 399 XP
     * Level 3: 400 - 899 XP
     * Formula: level = floor(sqrt(XP / 100)) + 1
     */
    public function calculateLevel(int $xp): int
    {
        if ($xp <= 0) {
            return 1;
        }

        return (int) floor(sqrt($xp / 100)) + 1;
    }

    /**
     * Calculate XP required for next level.
     */
    public function getNextLevelXp(int $level): int
    {
        return ($level * $level) * 100;
    }

    /**
     * Calculate current level base XP.
     */
    public function getCurrentLevelBaseXp(int $level): int
    {
        if ($level <= 1) {
            return 0;
        }

        $prev = $level - 1;
        return ($prev * $prev) * 100;
    }

    /**
     * Add XP to user, update level if leveled up, and persist.
     */
    public function addXp(User $user, int $amount): array
    {
        $oldXp = $user->xp ?? 0;
        $oldLevel = $user->level ?? 1;

        $newXp = $oldXp + max(0, $amount);
        $newLevel = $this->calculateLevel($newXp);

        $leveledUp = $newLevel > $oldLevel;

        $user->update([
            'xp' => $newXp,
            'level' => $newLevel,
        ]);

        return [
            'xp_earned' => $amount,
            'total_xp' => $newXp,
            'level' => $newLevel,
            'leveled_up' => $leveledUp,
            'next_level_xp' => $this->getNextLevelXp($newLevel),
            'current_level_base_xp' => $this->getCurrentLevelBaseXp($newLevel),
        ];
    }

    /**
     * Record workout completion: update streak and award XP.
     */
    public function recordWorkout(User $user, WorkoutLog $log): array
    {
        $today = Carbon::today();
        $setsCount = $log->sets()->count();
        $xpEarned = self::BASE_WORKOUT_XP + ($setsCount * self::SET_BONUS_XP);

        // Update streak
        $lastActive = $user->last_active_date ? Carbon::parse($user->last_active_date) : null;
        $currentStreak = $user->current_streak ?? 0;

        if ($lastActive === null) {
            $currentStreak = 1;
        } elseif ($lastActive->isToday()) {
            // Already active today, streak doesn't change
        } elseif ($lastActive->isYesterday()) {
            $currentStreak += 1;
        } else {
            // Broken streak, reset to 1
            $currentStreak = 1;
        }

        $user->current_streak = $currentStreak;
        $user->last_active_date = $today->toDateString();
        $user->save();

        // Award XP
        $xpResult = $this->addXp($user, $xpEarned);

        return [
            ...$xpResult,
            'streak' => $currentStreak,
        ];
    }

    /**
     * Record daily login / active app entry.
     * Increases streak if logged in consecutive days, resets to 1 if a day was skipped.
     */
    public function recordDailyLogin(User $user): int
    {
        $today = Carbon::today();
        $lastActive = $user->last_active_date ? Carbon::parse($user->last_active_date)->startOfDay() : null;
        $currentStreak = $user->current_streak ?? 0;

        if ($lastActive === null) {
            $currentStreak = 1;
            $user->current_streak = $currentStreak;
            $user->last_active_date = $today->toDateString();
            $user->save();
        } elseif ($lastActive->isToday()) {
            // Already active today, streak remains unchanged
            if ($currentStreak <= 0) {
                $currentStreak = 1;
                $user->current_streak = 1;
                $user->save();
            }
        } elseif ($lastActive->copy()->addDay()->isToday()) {
            // Consecutive day login (yesterday was last active)
            $currentStreak += 1;
            $user->current_streak = $currentStreak;
            $user->last_active_date = $today->toDateString();
            $user->save();
        } else {
            // Broken streak (more than 1 day missed), reset to 1
            $currentStreak = 1;
            $user->current_streak = $currentStreak;
            $user->last_active_date = $today->toDateString();
            $user->save();
        }

        return $currentStreak;
    }

    /**
     * Compute dynamic daily quests for today.
     * No separate database table or midnight cronjob needed.
     */
    public function getDailyQuests(User $user, ?Carbon $date = null): array
    {
        $targetDate = $date ?? Carbon::today();
        $dateStr = $targetDate->toDateString();

        $workoutCount = WorkoutLog::query()
            ->where('user_id', $user->id)
            ->whereDate('log_date', $dateStr)
            ->count();

        $nutritionCount = NutritionLog::query()
            ->where('user_id', $user->id)
            ->whereDate('log_date', $dateStr)
            ->count();

        $poseCount = PoseCheckSession::query()
            ->where('user_id', $user->id)
            ->whereDate('created_at', $dateStr)
            ->count();

        return [
            [
                'id' => 'quest_workout',
                'title' => 'Hoàn thành 1 buổi tập',
                'description' => 'Ghi nhận và hoàn thành ít nhất 1 buổi tập trong ngày.',
                'target' => 1,
                'current' => min(1, $workoutCount),
                'completed' => $workoutCount >= 1,
                'xp_reward' => 100,
            ],
            [
                'id' => 'quest_nutrition',
                'title' => 'Ghi nhận dinh dưỡng',
                'description' => 'Ghi lại ít nhất 1 bữa ăn để theo dõi calo và macro.',
                'target' => 1,
                'current' => min(1, $nutritionCount),
                'completed' => $nutritionCount >= 1,
                'xp_reward' => 50,
            ],
            [
                'id' => 'quest_pose_check',
                'title' => 'Kiểm tra kỹ thuật với AI Pose',
                'description' => 'Thực hiện 1 lượt kiểm tra tư thế chuyển động cùng AI Coach.',
                'target' => 1,
                'current' => min(1, $poseCount),
                'completed' => $poseCount >= 1,
                'xp_reward' => 75,
            ],
        ];
    }

    /**
     * Get full RPG profile summary for the user.
     */
    public function getGamificationSummary(User $user): array
    {
        $level = $user->level ?? 1;
        $xp = $user->xp ?? 0;
        $baseXp = $this->getCurrentLevelBaseXp($level);
        $nextXp = $this->getNextLevelXp($level);
        $progressPct = $nextXp > $baseXp 
            ? round((($xp - $baseXp) / ($nextXp - $baseXp)) * 100, 1)
            : 100.0;

        return [
            'level' => $level,
            'xp' => $xp,
            'current_streak' => $user->current_streak ?? 0,
            'last_active_date' => $user->last_active_date ? (string) $user->last_active_date : null,
            'current_level_base_xp' => $baseXp,
            'next_level_xp' => $nextXp,
            'level_progress_percent' => min(100.0, max(0.0, $progressPct)),
            'daily_quests' => $this->getDailyQuests($user),
        ];
    }
}


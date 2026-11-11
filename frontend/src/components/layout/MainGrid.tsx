'use strict';
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalorieCard } from '@/components/cards/CalorieCard';
import { HydrationStepsCard } from '@/components/cards/HydrationStepsCard';
import { WeightSleepCard } from '@/components/cards/WeightSleepCard';
import { AvatarHeroCard } from '@/components/home/AvatarHeroCard';
import { CharacterOutfit } from '@/components/home/3d/Character';
import { useFitness } from '@/contexts/FitnessContext';
import {
  LayoutDashboard,
  Dumbbell,
  Flame,
  CheckCircle2,
  Clock,
  Play,
} from 'lucide-react';

interface MainGridProps {
  outfit: CharacterOutfit;
  photoCount?: number;
  isAutoRotating?: boolean;
  onToggleAutoRotate?: () => void;
  onOpenBodyMetrics: () => void;
  onOpenProgressPhotos: () => void;
  onOpenOutfit: () => void;
  onUpdateName?: (newName: string) => void;
}

export const MainGrid: React.FC<MainGridProps> = ({
  outfit,
  photoCount = 4,
  isAutoRotating = false,
  onToggleAutoRotate = () => {},
  onOpenBodyMetrics,
  onOpenProgressPhotos,
  onOpenOutfit,
  onUpdateName,
}) => {
  const router = useRouter();
  const {
    todaySchedule,
    startWorkout,
    activeWorkout,
    vitals,
    addWater,
    updateWeight,
    updateSleep,
    profile,
    updateProfile,
    routines,
  } = useFitness();

  const assignedRoutine = todaySchedule?.assignedRoutines?.[0] || todaySchedule?.assignedRoutine || null;
  const exerciseCount = assignedRoutine?.exercises?.length || 0;
  const estimatedDuration = 45; // Minutes

  const handleStartTodayWorkout = () => {
    if (!activeWorkout && assignedRoutine) {
      startWorkout(assignedRoutine);
    }
    router.push('/workout/live');
  };

  const handleUpdateHeroName = (newName: string) => {
    updateProfile({ name: newName });
    onUpdateName?.(newName);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
      {/* 1. Information-First Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF5722]" />
            <span>Bảng điều khiển</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            <span>
              Mục tiêu tuần: <strong className="text-slate-900 font-bold">5/7 buổi</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Mục tiêu: <strong className="text-slate-900 font-bold">Tăng cơ</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: 3D Avatar + Weight & Sleep (5 cols) | Fitness Command & Vitals (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT COLUMN: 3D AVATAR & WEIGHT/SLEEP (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <AvatarHeroCard
            user={{
              name: profile.name,
              level: profile.level,
              exp: { current: profile.xp, max: profile.maxXp },
              stats: { STR: 24, END: 18, AGI: 15 },
            }}
            outfit={outfit}
            photoCount={photoCount}
            isAutoRotating={isAutoRotating}
            onToggleAutoRotate={onToggleAutoRotate}
            onOpenOutfit={onOpenOutfit}
            onOpenBodyMetrics={onOpenBodyMetrics}
            onOpenProgressPhotos={onOpenProgressPhotos}
            onUpdateName={handleUpdateHeroName}
          />

          {/* Section: Cân nặng & Giấc ngủ moved directly under 3D character */}
          <WeightSleepCard
            weightHistory={vitals.weightHistory}
            sleepLastNight={vitals.sleep}
            onUpdateWeight={updateWeight}
            onUpdateSleep={updateSleep}
            onOpenBodyMetrics={onOpenBodyMetrics}
          />
        </div>

        {/* ================= RIGHT COLUMN: WORKOUT & VITALS (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Section 6.1: Today's Workout Spotlight */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 text-[#FF5722] flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tiêu điểm buổi tập hôm nay ({todaySchedule.dayOfWeek})
                  </div>
                  <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                    {assignedRoutine ? assignedRoutine.title : 'Nghỉ ngơi phục hồi'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {todaySchedule.status === 'completed' ? (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã xong
                  </span>
                ) : assignedRoutine ? (
                  <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Sẵn sàng
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    Chưa có lịch
                  </span>
                )}
              </div>
            </div>

            {assignedRoutine ? (
              <>
                {/* Routine details */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Dumbbell className="w-4 h-4 text-[#FF5722]" />
                      {exerciseCount} bài tập
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-slate-500" />
                      ~{estimatedDuration} phút
                    </span>
                  </div>

                  <button
                    onClick={handleStartTodayWorkout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Vào buổi tập</span>
                  </button>
                </div>

                {/* Exercise preview pills */}
                {assignedRoutine.exercises && assignedRoutine.exercises.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                    {assignedRoutine.exercises.slice(0, 3).map((item, idx) => (
                      <div
                        key={`preview-${idx}`}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">
                          Bài {idx + 1}
                        </div>
                        <div className="font-bold text-xs text-slate-900 truncate mt-0.5">
                          {item.exercise.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {item.sets.length} sets
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-slate-500">
                  Chưa có lịch tập cho hôm nay. Bạn có thể nghỉ ngơi phục hồi cơ bắp hoặc lên lịch tập mới.
                </p>
                <button
                  onClick={() => router.push('/workout')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  <Dumbbell className="w-4 h-4 text-orange-400" />
                  <span>Lên lịch tập ngay</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 6.4: Activity & Streak bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Streak */}
              <div className="flex items-center gap-3.5 bg-orange-50/70 border border-orange-200/70 p-3.5 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-[#FF5722] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-[#C2410C] tracking-wide">
                    Chuỗi ngày liên tục
                  </div>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    {profile.streak} ngày streak 🔥
                  </div>
                </div>
              </div>

              {/* Total Workouts Completed (Replaced Steps counter) */}
              <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                    Tổng buổi tập
                  </div>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    {profile.totalWorkouts} buổi hoàn thành
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6.2 & 6.3: Quick Log Vitals (Nutrition & Water) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalorieCard nutrition={vitals.nutrition} />

            <HydrationStepsCard
              hydration={{
                water: vitals.water,
              }}
              onAddWater={addWater}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

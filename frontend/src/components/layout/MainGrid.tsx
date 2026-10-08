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
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  Play,
  Footprints,
} from 'lucide-react';
import Link from 'next/link';

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

  const assignedRoutine = todaySchedule.assignedRoutine || routines[0];
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

  const stepTarget = 8000;
  const stepPercentage = Math.min(100, Math.round((vitals.steps / stepTarget) * 100));

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
      {/* 1. Information-First Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
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

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleStartTodayWorkout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Vào buổi tập</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
                ) : (
                  <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Sẵn sàng
                  </span>
                )}
              </div>
            </div>

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

              {/* Section 6.1 CTA: Vào buổi tập -> Navigates to Live Workout Player */}
              <button
                onClick={handleStartTodayWorkout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Vào buổi tập</span>
              </button>
            </div>

            {/* Exercise preview pills */}
            {assignedRoutine && assignedRoutine.exercises.length > 0 && (
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
                    Chuỗi tập liên tục
                  </div>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    {profile.streak} ngày streak 🔥
                  </div>
                </div>
              </div>

              {/* Steps & Mini progress bar */}
              <div className="flex flex-col justify-between bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wide flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-slate-600" />
                    Bước chân hôm nay
                  </span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {vitals.steps.toLocaleString('vi-VN')} / {stepTarget.toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-slate-800 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stepPercentage}%` }}
                  />
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
                steps: vitals.steps,
              }}
              onAddWater={addWater}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

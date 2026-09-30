'use strict';
'use client';

import React from 'react';
import { DashboardData } from '@/types/dashboard.types';
import { CalorieCard } from '@/components/cards/CalorieCard';
import { HydrationStepsCard } from '@/components/cards/HydrationStepsCard';
import { WeightSleepCard } from '@/components/cards/WeightSleepCard';
import { WorkoutCard } from '@/components/cards/WorkoutCard';
import { AvatarHeroCard } from '@/components/home/AvatarHeroCard';
import { CharacterOutfit } from '@/components/home/3d/Character';
import {
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Video,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface MainGridProps {
  data: DashboardData;
  outfit: CharacterOutfit;
  photoCount?: number;
  isAutoRotating?: boolean;
  onToggleAutoRotate?: () => void;
  onOpenBodyMetrics: () => void;
  onOpenProgressPhotos: () => void;
  onOpenOutfit: () => void;
  onAddWater: (amount: number) => void;
  onUpdateName?: (newName: string) => void;
}

export const MainGrid: React.FC<MainGridProps> = ({
  data,
  outfit,
  photoCount = 4,
  isAutoRotating = false,
  onToggleAutoRotate = () => {},
  onOpenBodyMetrics,
  onOpenProgressPhotos,
  onOpenOutfit,
  onAddWater,
  onUpdateName,
}) => {
  const { user, nutrition, hydration, weightSleep, workout } = data;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Information-First Header (Concise, scannable, no duplicate text) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Bảng điều khiển
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base text-slate-600 mt-1.5 font-medium">
            <span>Mục tiêu tuần: <strong className="text-slate-900 font-bold">3/4 buổi</strong></span>
            <span className="text-slate-300">•</span>
            <span>Mục tiêu: <strong className="text-slate-900 font-bold">Tăng cơ</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/workout"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Vào buổi tập</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ai-coach"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm transition-colors border border-slate-300 cursor-pointer"
          >
            <Video className="w-4 h-4 text-slate-600" />
            <span>AI Pose Check</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Grid: 3D Avatar (5 cols) | Fitness Command & Vitals (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: 3D AVATAR FOCAL CARD (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <AvatarHeroCard
            user={user}
            outfit={outfit}
            photoCount={photoCount}
            isAutoRotating={isAutoRotating}
            onToggleAutoRotate={onToggleAutoRotate}
            onOpenOutfit={onOpenOutfit}
            onOpenBodyMetrics={onOpenBodyMetrics}
            onOpenProgressPhotos={onOpenProgressPhotos}
            onUpdateName={onUpdateName}
          />

          {/* Contextual AI Feedback Note (Factual & Restrained) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Nhận định phục hồi &amp; Tải trọng</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Nhóm cơ ngực đã phục hồi đầy đủ sau 48h. Buổi Squat gần nhất đạt form{' '}
                <strong className="text-slate-900">92/100</strong>. Bạn có thể sẵn sàng tăng tải trọng 2.5kg cho bài Bench Press hôm nay.
              </p>
              <Link
                href="/ai-coach"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 mt-1.5"
              >
                <span>Xem phân tích chi tiết</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: WORKOUT & VITALS (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Primary Action Hero: Today's Active Routine Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/80 text-[#FF5722] flex items-center justify-center shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                    Ngực &amp; Tay Sau
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                    <span>3 bài tập</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      45 phút
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng
              </span>
            </div>

            {/* Exercise List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Bài 1 • Cơ ngực
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5 truncate">
                  Barbell Bench Press
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1 tabular-nums">
                  4 sets × 8 reps (80kg)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Bài 2 • Ngực trên
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5 truncate">
                  Incline DB Press
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1 tabular-nums">
                  3 sets × 10 reps (26kg)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Bài 3 • Pose Check
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5 truncate">
                  Tricep Dips
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1 tabular-nums">
                  3 sets × 12 reps (Body)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-400 font-normal">
                Gợi ý: Nghỉ 90s giữa các hiệp nặng
              </span>
              <Link
                href="/workout"
                className="font-bold text-[#FF5722] hover:text-[#E64A19] flex items-center gap-1 transition-colors"
              >
                <span>Mở nhật ký buổi tập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Vitals Grid: Energy & Recovery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalorieCard nutrition={nutrition} />
            <WorkoutCard workout={workout} />
            <HydrationStepsCard
              hydration={hydration}
              onAddWater={onAddWater}
            />
            <WeightSleepCard
              weightSleep={weightSleep}
              onOpenBodyMetrics={onOpenBodyMetrics}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

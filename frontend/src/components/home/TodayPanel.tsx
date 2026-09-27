'use strict';
'use client';

import React from 'react';
import { Flame, Clock, Footprints, Droplets, Target, Award } from 'lucide-react';
import { TodayStats } from '@/lib/fitnessData';

interface TodayPanelProps {
  today: TodayStats;
}

export const TodayPanel: React.FC<TodayPanelProps> = ({ today }) => {
  const caloriePercent = Math.min(100, Math.round((today.calories / today.calorieGoal) * 100));
  const waterPercent = Math.min(100, Math.round((today.water / today.waterGoal) * 100));

  return (
    <div className="w-full bg-[#EFECE6]/95 backdrop-blur-2xl rounded-t-3xl border-t border-white/80 shadow-[0_-12px_36px_rgba(0,0,0,0.16)] pointer-events-auto select-none pt-3 pb-3 sm:pb-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-2.5">
        {/* Header Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
              <Target className="w-3 h-3 text-[#FF6B35]" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-[#1F2328]">Today's Activity</h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#4E8539] bg-[#E2F0D9] border border-[#7FB069]/40 px-2.5 py-0.5 rounded-full shadow-2xs">
            On Track
          </span>
        </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* 1. Calories */}
        <div className="bg-white/95 p-2.5 sm:p-3 rounded-xl border border-stone-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#76583E] text-[11px] sm:text-xs font-bold mb-1">
            <span>Calories</span>
            <Flame className="w-3.5 h-3.5 text-[#FF6B35]" />
          </div>
          <div className="text-sm sm:text-base font-black text-[#1F2328]">
            {today.calories.toLocaleString()}{' '}
            <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7662]">/ {today.calorieGoal} kcal</span>
          </div>
          <div className="w-full bg-[#EFE9DF] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#FF6B35] h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* 2. Workout */}
        <div className="bg-white/95 p-2.5 sm:p-3 rounded-xl border border-stone-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#76583E] text-[11px] sm:text-xs font-bold mb-1">
            <span>Workout</span>
            <Clock className="w-3.5 h-3.5 text-[#4D96FF]" />
          </div>
          <div className="text-sm sm:text-base font-black text-[#1F2328]">
            {today.workoutMinutes}{' '}
            <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7662]">min</span>
          </div>
          <div className="text-[9.5px] sm:text-[10px] text-[#76583E] font-medium mt-1.5 flex items-center gap-1">
            <Award className="w-2.5 h-2.5 text-[#7FB069] shrink-0" />
            <span className="truncate">Chest & Triceps completed</span>
          </div>
        </div>

        {/* 3. Steps */}
        <div className="bg-white/95 p-2.5 sm:p-3 rounded-xl border border-stone-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#76583E] text-[11px] sm:text-xs font-bold mb-1">
            <span>Steps</span>
            <Footprints className="w-3.5 h-3.5 text-[#7FB069]" />
          </div>
          <div className="text-sm sm:text-base font-black text-[#1F2328]">
            {today.steps.toLocaleString()}{' '}
            <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7662]">steps</span>
          </div>
          <div className="text-[9.5px] sm:text-[10px] text-[#8C7662] font-medium mt-1.5">
            Target: 10,000 steps
          </div>
        </div>

        {/* 4. Hydration */}
        <div className="bg-white/95 p-2.5 sm:p-3 rounded-xl border border-stone-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#76583E] text-[11px] sm:text-xs font-bold mb-1">
            <span>Hydration</span>
            <Droplets className="w-3.5 h-3.5 text-[#4D96FF]" />
          </div>
          <div className="text-sm sm:text-base font-black text-[#1F2328]">
            {today.water}{' '}
            <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7662]">/ {today.waterGoal} L</span>
          </div>
          <div className="w-full bg-[#EFE9DF] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#4D96FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

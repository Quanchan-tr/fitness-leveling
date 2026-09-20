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
    <div className="bg-[#F7F3EA] rounded-2xl border border-[#B9A78E]/40 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#B9A78E]/30 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#FF6B35]" />
          <h3 className="font-bold text-sm text-[#1F2328]">Today's Activity</h3>
        </div>
        <span className="text-[11px] font-bold text-[#7FB069] bg-[#7FB069]/15 px-2.5 py-0.5 rounded-full">
          On Track
        </span>
      </div>

      {/* Metrics List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Calories */}
        <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#76583E] text-xs font-semibold mb-1">
            <span>Calories</span>
            <Flame className="w-4 h-4 text-[#FF6B35]" />
          </div>
          <div className="text-lg font-bold text-[#1F2328]">
            {today.calories}{' '}
            <span className="text-[11px] font-normal text-[#76583E]">/ {today.calorieGoal} kcal</span>
          </div>
          <div className="w-full bg-[#E8E1D5] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#FF6B35] h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Workout Duration */}
        <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#76583E] text-xs font-semibold mb-1">
            <span>Workout</span>
            <Clock className="w-4 h-4 text-[#4D96FF]" />
          </div>
          <div className="text-lg font-bold text-[#1F2328]">
            {today.workoutMinutes}{' '}
            <span className="text-[11px] font-normal text-[#76583E]">min</span>
          </div>
          <div className="text-[10px] text-[#7FB069] font-medium mt-2 flex items-center gap-1">
            <Award className="w-3 h-3" /> Chest & Triceps completed
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#76583E] text-xs font-semibold mb-1">
            <span>Steps</span>
            <Footprints className="w-4 h-4 text-[#7FB069]" />
          </div>
          <div className="text-lg font-bold text-[#1F2328]">
            {today.steps.toLocaleString()}{' '}
            <span className="text-[11px] font-normal text-[#76583E]">steps</span>
          </div>
          <div className="text-[10px] text-[#76583E] font-medium mt-2">
            Target: 10,000 steps
          </div>
        </div>

        {/* Water Intake */}
        <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#76583E] text-xs font-semibold mb-1">
            <span>Hydration</span>
            <Droplets className="w-4 h-4 text-[#4D96FF]" />
          </div>
          <div className="text-lg font-bold text-[#1F2328]">
            {today.water}{' '}
            <span className="text-[11px] font-normal text-[#76583E]">/ {today.waterGoal} L</span>
          </div>
          <div className="w-full bg-[#E8E1D5] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#4D96FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

'use strict';
'use client';

import React from 'react';
import {
  X,
  Flame,
  Clock,
  Footprints,
  Droplets,
  Activity,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { TodayStats } from '@/lib/fitnessData';

interface FocusedMetricsOverlayProps {
  today?: Partial<TodayStats>;
  onClose: () => void;
  onOpenBodyMetrics: () => void;
}

export const FocusedMetricsOverlay: React.FC<FocusedMetricsOverlayProps> = ({
  today,
  onClose,
  onOpenBodyMetrics,
}) => {
  // Format metric helpers with fallback
  const calories = today?.calories !== undefined ? today.calories.toLocaleString() : '--';
  const calorieGoal = today?.calorieGoal !== undefined ? today.calorieGoal.toLocaleString() : '--';
  const caloriePercent =
    today?.calories !== undefined && today?.calorieGoal !== undefined && today.calorieGoal > 0
      ? Math.min(100, Math.round((today.calories / today.calorieGoal) * 100))
      : 0;

  const workoutMinutes = today?.workoutMinutes !== undefined ? today.workoutMinutes : '--';
  const steps = today?.steps !== undefined ? today.steps.toLocaleString() : '--';
  const water = today?.water !== undefined ? today.water.toFixed(1) : '--';
  const waterGoal = today?.waterGoal !== undefined ? today.waterGoal.toFixed(1) : '--';
  const waterPercent =
    today?.water !== undefined && today?.waterGoal !== undefined && today.waterGoal > 0
      ? Math.min(100, Math.round((today.water / today.waterGoal) * 100))
      : 0;

  const streak = today?.streak !== undefined ? today.streak : '--';

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-between p-6 pointer-events-auto bg-black/35 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Top Controls: Close / Zoom Out Bar */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-none">
        <div className="bg-[#303238]/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2 pointer-events-auto shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span>Focused Activity Board</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="bg-[#303238]/90 hover:bg-[#FF6B35] text-white p-2.5 rounded-xl border border-white/10 transition-all pointer-events-auto shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          title="Zoom Out (Exit Focus)"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Zoom Out</span>
        </button>
      </div>

      {/* Left Area (Spacer allowing clear view of the 3D board in focus) */}
      <div className="flex-1 hidden md:block" />

      {/* Right Area: Vertical Metrics Panel */}
      <div
        className="w-full max-w-sm bg-[#F7F3EA]/95 backdrop-blur-xl rounded-2xl border border-[#B9A78E]/50 p-5 shadow-2xl space-y-3.5 pointer-events-auto text-[#1F2328] animate-slide-left ml-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#B9A78E]/30 pb-3">
          <div>
            <div className="text-[10px] text-[#76583E] uppercase font-bold tracking-wider">
              Daily Target Overview
            </div>
            <h3 className="text-base font-extrabold text-[#1F2328] flex items-center gap-1.5">
              <span>Today's Performance</span>
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-[#FF6B35]/15 text-[#FF6B35] font-extrabold text-xs px-2.5 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 fill-[#FF6B35]" />
            <span>{streak}d Streak</span>
          </div>
        </div>

        {/* Vertical Metric 1: Calories */}
        <div className="bg-white p-3 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#76583E] mb-1">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF6B35]" />
              <span>Calories Burned</span>
            </span>
            <span className="text-[11px] font-bold text-[#FF6B35]">
              {caloriePercent}% Goal
            </span>
          </div>
          <div className="text-lg font-black text-[#1F2328]">
            {calories}{' '}
            <span className="text-xs font-medium text-[#76583E]">/ {calorieGoal} kcal</span>
          </div>
          <div className="w-full bg-[#E8E1D5] h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FF6B35] to-[#F4C95D] h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Vertical Metric 2: Workout Duration */}
        <div className="bg-white p-3 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#76583E] mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#4D96FF]" />
              <span>Workout Active Time</span>
            </span>
            <span className="text-[10px] font-bold text-[#7FB069] bg-[#7FB069]/15 px-2 py-0.5 rounded">
              Completed
            </span>
          </div>
          <div className="text-lg font-black text-[#1F2328]">
            {workoutMinutes} <span className="text-xs font-medium text-[#76583E]">minutes</span>
          </div>
          <div className="text-[11px] text-[#76583E] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#7FB069]" />
            <span>Chest & Triceps Hypertrophy</span>
          </div>
        </div>

        {/* Vertical Metric 3: Daily Steps */}
        <div className="bg-white p-3 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#76583E] mb-1">
            <span className="flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-[#7FB069]" />
              <span>Step Count</span>
            </span>
            <span className="text-[11px] text-[#76583E]">Target 10,000</span>
          </div>
          <div className="text-lg font-black text-[#1F2328]">
            {steps} <span className="text-xs font-medium text-[#76583E]">steps</span>
          </div>
        </div>

        {/* Vertical Metric 4: Hydration */}
        <div className="bg-white p-3 rounded-xl border border-[#B9A78E]/30 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#76583E] mb-1">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#4D96FF]" />
              <span>Hydration Intake</span>
            </span>
            <span className="text-[11px] font-bold text-[#4D96FF]">{waterPercent}%</span>
          </div>
          <div className="text-lg font-black text-[#1F2328]">
            {water} <span className="text-xs font-medium text-[#76583E]">/ {waterGoal} L</span>
          </div>
          <div className="w-full bg-[#E8E1D5] h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#4D96FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button: Body Metrics Modal */}
        <button
          onClick={() => {
            onClose();
            onOpenBodyMetrics();
          }}
          className="w-full bg-[#303238] hover:bg-[#1F2328] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group mt-2"
        >
          <Activity className="w-4 h-4 text-[#FF6B35]" />
          <span>Open Full Body Metrics Log</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

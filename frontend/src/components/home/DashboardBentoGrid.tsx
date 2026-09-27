'use strict';
'use client';

import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Footprints,
  Droplets,
  Activity,
  TrendingDown,
  TrendingUp,
  Dumbbell,
  CheckCircle2,
  Moon,
  Plus,
  ArrowUpRight,
  Sparkles,
  Layers,
  Repeat,
  Weight,
} from 'lucide-react';
import { FitnessDataState } from '@/lib/fitnessData';

interface DashboardBentoGridProps {
  data: FitnessDataState;
  onOpenBodyMetrics: () => void;
  onOpenProgressPhotos: () => void;
  onOpenOutfit: () => void;
  onAddWater?: (amount: number) => void;
}

export const DashboardBentoGrid: React.FC<DashboardBentoGridProps> = ({
  data,
  onOpenBodyMetrics,
  onOpenProgressPhotos,
  onOpenOutfit,
  onAddWater,
}) => {
  const { today, body, recentMetrics } = data;
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // 1. Weekly Calorie Data (T2 -> CN)
  const CALORIE_GOAL = 2400;
  const weeklyCalories = [
    { day: 'T2', val: 2150 },
    { day: 'T3', val: 2420 },
    { day: 'T4', val: 2380 },
    { day: 'T5', val: 2510 },
    { day: 'T6', val: 2280 },
    { day: 'T7', val: 2600 },
    { day: 'CN', val: today.calories, active: true },
  ];

  // 2. Weight trend data for 1 month (4 weeks)
  const weightTrend = recentMetrics && recentMetrics.length >= 4
    ? recentMetrics
    : [
        { date: '01/09', weight: 70.2 },
        { date: '08/09', weight: 69.5 },
        { date: '15/09', weight: 68.9 },
        { date: '22/09', weight: 68.4 },
      ];

  const minWeight = 67.5;
  const maxWeight = 71.0;
  const weightPointsSvg = weightTrend
    .map((item, idx) => {
      const x = 15 + (idx / (weightTrend.length - 1)) * 170; // viewBox width = 200
      const y = 50 - ((item.weight - minWeight) / (maxWeight - minWeight)) * 38; // viewBox height = 60
      return { x, y, ...item };
    });

  const weightPolyline = weightPointsSvg.map((p) => `${p.x},${p.y}`).join(' ');
  const weightAreaPath = `M ${weightPointsSvg[0].x},55 L ${weightPointsSvg.map((p) => `${p.x},${p.y}`).join(' L ')} L ${weightPointsSvg[weightPointsSvg.length - 1].x},55 Z`;

  // 3. Sleep data (7 days / 1 week)
  const sleepDays = [
    { day: 'T2', hours: 7.2 },
    { day: 'T3', hours: 7.8 },
    { day: 'T4', hours: 7.0 },
    { day: 'T5', hours: 8.1 },
    { day: 'T6', hours: 6.8 },
    { day: 'T7', hours: 8.4 },
    { day: 'CN', hours: 7.5, active: true },
  ];
  const avgSleep = 7.5;

  // 4. Workout Radial Progress
  const workoutTargetMins = 45;
  const workoutCurrentMins = today.workoutMinutes; // 42m
  const workoutProgressPct = Math.min(100, Math.round((workoutCurrentMins / workoutTargetMins) * 100));
  const radialRadius = 32;
  const radialCircumference = 2 * Math.PI * radialRadius;
  const radialStrokeDashoffset = radialCircumference - (workoutProgressPct / 100) * radialCircumference;

  // 5. Daily Habits Data
  const waterTarget = 2.0; // 2.0L
  const waterCurrent = today.water; // 1.8L
  const waterPercent = Math.min(100, Math.round((waterCurrent / waterTarget) * 100));

  const stepsTarget = 8000; // 8,000 steps
  const stepsCurrent = today.steps > 0 ? (today.steps < 8000 ? today.steps : 5421) : 5421; // 5,421 steps
  const stepsPercent = Math.min(100, Math.round((stepsCurrent / stepsTarget) * 100));

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 select-none overflow-y-auto lg:overflow-hidden p-1 custom-scrollbar text-[#1F2328]">
      
      {/* ========================================================================= */}
      {/* CARD 1 - LƯỢNG CALO TUẦN (T2 - CN)                                        */}
      {/* ========================================================================= */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 p-3.5 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between shrink-0 min-h-[170px] max-h-[220px] transition-all hover:shadow-[0_12px_36px_rgb(0,0,0,0.09)]">
        
        {/* Header Card 1 */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5ED] border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35] shrink-0 shadow-2xs">
              <Flame className="w-4 h-4 fill-[#FF6B35]" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-[#1F2328] leading-tight truncate">
                Lượng Calo Tuần (T2 — CN)
              </h3>
              <span className="text-[10px] text-[#76583E] font-medium hidden sm:inline">
                Tiêu hao hàng ngày so với mục tiêu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF5ED] border border-[#FF6B35]/30 text-[#E65100] font-black text-xs shadow-2xs">
              <Flame className="w-3.5 h-3.5 fill-[#FF6B35]" />
              <span>Hôm nay: {today.calories.toLocaleString()} kcal</span>
            </div>
          </div>
        </div>

        {/* 7-Day Calorie Bar Chart with Dashed Goal Line */}
        <div className="relative flex-1 flex items-end justify-between gap-2 pt-5 pb-1 px-2 min-h-[65px]">
          
          {/* Dashed Goal Line (Mục tiêu: 2,400 kcal) */}
          <div
            className="absolute left-2 right-2 border-t-2 border-dashed border-[#FF6B35]/60 z-10 flex items-center justify-end pointer-events-none"
            style={{ bottom: '52%' }}
          >
            <span className="text-[8.5px] font-black text-[#E65100] bg-white/90 px-1.5 py-0.5 rounded shadow-2xs border border-[#FF6B35]/30 -translate-y-1/2">
              Mục tiêu: 2,400 kcal
            </span>
          </div>

          {/* 7 Bar Columns */}
          {weeklyCalories.map((d, i) => {
            const heightPct = Math.min(100, Math.round((d.val / 3000) * 100));
            const isHovered = hoveredDay === i;
            return (
              <div
                key={`cal-col-${i}`}
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip Hover Value */}
                <span
                  className={`absolute -top-5 text-[9px] font-black px-1.5 py-0.5 rounded-md transition-all shadow-xs z-20 ${
                    d.active || isHovered
                      ? 'bg-[#1F2328] text-white opacity-100 scale-100'
                      : 'opacity-0 scale-90 pointer-events-none'
                  }`}
                >
                  {d.val}
                </span>

                {/* Column Body */}
                <div className="w-full bg-[#EFE9DF]/80 rounded-t-lg h-full flex items-end overflow-hidden border border-stone-200/50 p-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-700 ${
                      d.active
                        ? 'bg-gradient-to-t from-[#FF6B35] via-[#FB923C] to-[#FBBF24] shadow-xs'
                        : 'bg-[#C9B9A6] group-hover:bg-[#B39E88]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-[10px] font-black ${
                    d.active ? 'text-[#FF6B35]' : 'text-[#76583E]'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Macro Nutrients Footer (Protein, Carbs, Fat) */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 text-[10px] font-bold text-[#76583E]">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] shadow-xs" />
              <span>Protein: <strong className="text-[#1F2328] font-black">118g</strong> <span className="text-[8.5px] text-[#76583E]">(30%)</span></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shadow-xs" />
              <span>Carbs: <strong className="text-[#1F2328] font-black">195g</strong> <span className="text-[8.5px] text-[#76583E]">(48%)</span></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-xs" />
              <span>Fat: <strong className="text-[#1F2328] font-black">46g</strong> <span className="text-[8.5px] text-[#76583E]">(22%)</span></span>
            </span>
          </div>
          <span className="hidden sm:flex items-center gap-1 text-[#059669] font-black text-[9.5px]">
            <CheckCircle2 className="w-3 h-3" /> Chuẩn Macros
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 CARDS CÒN LẠI DẠNG GRID GỌN GÀNG (2 HÀNG HOẶC 3 CARDS CÂN ĐỐI)         */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 min-h-0">

        {/* ===================================================================== */}
        {/* CARD 2 - CÂN NẶNG & GIẤC NGỦ (NỬA TRÊN: LINE CHART, NỬA DƯỚI: SLEEP) */}
        {/* ===================================================================== */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 p-3 sm:p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between overflow-hidden transition-all hover:shadow-[0_12px_36px_rgb(0,0,0,0.09)]">
          {/* Header Card 2 */}
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shadow-2xs">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-black text-[#1F2328]">Cân Nặng & Giấc Ngủ</h4>
            </div>
            <span className="text-[9px] font-black text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-lg border border-[#A7F3D0] flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> -1.8 kg
            </span>
          </div>

          {/* NỬA TRÊN: Biểu đồ đường (Line Chart) Xu hướng Cân Nặng (1 tháng) */}
          <div className="my-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-bold text-[#76583E]">Cân nặng hiện tại:</span>
                <div className="text-lg font-black text-[#1F2328] leading-none">
                  {body.weight} <span className="text-xs font-bold text-[#76583E]">kg</span>
                </div>
              </div>
              <button
                onClick={onOpenBodyMetrics}
                className="text-[9px] font-extrabold text-[#FF6B35] bg-[#FFF5ED] hover:bg-[#FFEAD9] px-2 py-0.5 rounded-lg border border-[#FF6B35]/30 transition-colors cursor-pointer"
              >
                Nhập số đo
              </button>
            </div>

            {/* SVG Line Chart */}
            <div className="w-full h-14 mt-1 relative">
              <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="weightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path d={weightAreaPath} fill="url(#weightGrad)" />
                {/* Grid guidelines */}
                <line x1="15" y1="15" x2="185" y2="15" stroke="#E5E7EB" strokeDasharray="2,2" strokeWidth="0.75" />
                <line x1="15" y1="35" x2="185" y2="35" stroke="#E5E7EB" strokeDasharray="2,2" strokeWidth="0.75" />
                {/* Polyline */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weightPolyline}
                />
                {/* Data Points */}
                {weightPointsSvg.map((pt, pidx) => (
                  <g key={`pt-${pidx}`}>
                    <circle cx={pt.x} cy={pt.y} r="3.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
                    <text x={pt.x} y="58" textAnchor="middle" fontSize="7" fill="#76583E" fontWeight="700">
                      {pt.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* NỬA DƯỚI: Thời gian ngủ (Trung bình 7.5h/đêm) */}
          <div className="border-t border-stone-200/60 pt-1.5 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#76583E] flex items-center gap-1">
                <Moon className="w-3 h-3 text-[#6366F1]" />
                Giấc ngủ trung bình:
              </span>
              <span className="font-black text-[#6366F1]">{avgSleep}h / đêm</span>
            </div>

            {/* Mini Sleep Bar Chart (7 Days) */}
            <div className="flex items-end justify-between gap-1 h-7 pt-1 px-1">
              {sleepDays.map((s, si) => {
                const sHeight = Math.min(100, Math.round((s.hours / 9) * 100));
                return (
                  <div key={`sleep-${si}`} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group">
                    <div className="w-full bg-[#EEF2FF] rounded-t-sm h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-xs transition-all ${
                          s.active ? 'bg-[#6366F1]' : 'bg-[#C7D2FE] group-hover:bg-[#A5B4FC]'
                        }`}
                        style={{ height: `${sHeight}%` }}
                        title={`${s.day}: ${s.hours}h`}
                      />
                    </div>
                    <span className="text-[7.5px] font-bold text-[#76583E]">{s.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CARD 3 - LUYỆN TẬP GẦN ĐÂY (RADIAL PROGRESS + VOLUME / SETS / REPS)   */}
        {/* ===================================================================== */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 p-3 sm:p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between overflow-hidden transition-all hover:shadow-[0_12px_36px_rgb(0,0,0,0.09)]">
          {/* Header Card 3 */}
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#FFF5ED] border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35] shadow-2xs">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-black text-[#1F2328]">Luyện Tập Gần Đây</h4>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Đạt chuẩn
            </span>
          </div>

          {/* Workout Title */}
          <div className="my-1">
            <span className="text-[9.5px] font-bold text-[#76583E]">Bài tập vừa hoàn thành:</span>
            <div className="text-sm font-black text-[#1F2328] flex items-center gap-1.5">
              <span>Chest & Triceps</span>
              <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                4 Bài tập
              </span>
            </div>
          </div>

          {/* Radial Progress Circle + Details List */}
          <div className="flex items-center gap-3 my-1">
            {/* Radial Progress Circle */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                {/* Background Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={radialRadius}
                  stroke="#E5DDD0"
                  strokeWidth="7"
                  fill="none"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={radialRadius}
                  stroke="url(#workoutGrad)"
                  strokeWidth="7"
                  strokeDasharray={radialCircumference}
                  strokeDashoffset={radialStrokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="workoutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Inner Center Content */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm sm:text-base font-black text-[#1F2328] leading-none">
                  {workoutCurrentMins}<span className="text-[10px] font-bold text-[#76583E]">m</span>
                </span>
                <span className="text-[8px] font-extrabold text-[#76583E]">/ {workoutTargetMins}m</span>
              </div>
            </div>

            {/* Quick Stats: Sets, Reps, Volume */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] bg-[#FAF8F5] px-2 py-1 rounded-lg border border-stone-200/60">
                <span className="text-[#76583E] font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#FF6B35]" /> Tổng Sets:
                </span>
                <strong className="text-[#1F2328] font-black">14 sets</strong>
              </div>

              <div className="flex items-center justify-between text-[10px] bg-[#FAF8F5] px-2 py-1 rounded-lg border border-stone-200/60">
                <span className="text-[#76583E] font-bold flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-[#3B82F6]" /> Tổng Reps:
                </span>
                <strong className="text-[#1F2328] font-black">168 reps</strong>
              </div>

              <div className="flex items-center justify-between text-[10px] bg-[#FAF8F5] px-2 py-1 rounded-lg border border-stone-200/60">
                <span className="text-[#76583E] font-bold flex items-center gap-1">
                  <Weight className="w-3 h-3 text-[#10B981]" /> Volume:
                </span>
                <strong className="text-[#059669] font-black">4,250 kg</strong>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-[#76583E] font-bold border-t border-stone-200/60 pt-1 flex justify-between">
            <span>Cường độ: RPE 8.5</span>
            <span className="text-[#E65100] font-black">🔥 Tiêu hao 380 kcal</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CARD 4 - THÓI QUEN HÀNG NGÀY (NƯỚC & BƯỚC CHÂN) - 2 HÀNG NGANG RÕ RÀNG */}
        {/* ===================================================================== */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 p-3 sm:p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between overflow-hidden transition-all hover:shadow-[0_12px_36px_rgb(0,0,0,0.09)]">
          {/* Header Card 4 */}
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#E0F2FE] border border-[#0284C7]/30 flex items-center justify-center text-[#0284C7] shadow-2xs">
                <Droplets className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-black text-[#1F2328]">Thói Quen Hàng Ngày</h4>
            </div>
            <span className="text-[9px] font-black text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-lg border border-[#BAE6FD]">
              Hôm nay
            </span>
          </div>

          {/* 2 DISTINCT HORIZONTAL ROWS LAYOUT */}
          <div className="flex-1 flex flex-col justify-center gap-2.5 my-1">
            
            {/* --- HÀNG 1: NƯỚC (WATER) --- */}
            <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-stone-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                    <Droplets className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#1F2328] block leading-none">Nước Uống</span>
                    <span className="text-[8.5px] font-bold text-[#76583E]">Mục tiêu {waterTarget}L</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#0284C7]">
                    {waterCurrent}L <span className="text-[9px] text-[#76583E] font-bold">/ {waterTarget}L</span>
                  </span>
                  {onAddWater && (
                    <button
                      onClick={() => onAddWater(0.25)}
                      className="px-2 py-0.5 rounded-md bg-[#0284C7] hover:bg-[#0369A1] text-white text-[9px] font-black transition-colors cursor-pointer shadow-2xs flex items-center gap-0.5"
                      title="Uống thêm 250ml"
                    >
                      <Plus className="w-2.5 h-2.5" /> 250ml
                    </button>
                  )}
                </div>
              </div>

              {/* Water Progress Bar (Blue) */}
              <div className="w-full bg-[#E5DDD0] h-2 rounded-full overflow-hidden p-0.5 border border-[#B9A78E]/20">
                <div
                  className="bg-gradient-to-r from-[#38BDF8] to-[#0284C7] h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>

            {/* --- HÀNG 2: BƯỚC CHÂN (STEPS) --- */}
            <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-stone-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                    <Footprints className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#1F2328] block leading-none">Bước Chân</span>
                    <span className="text-[8.5px] font-bold text-[#76583E]">Mục tiêu {stepsTarget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#059669]">
                    {stepsCurrent.toLocaleString()} <span className="text-[9px] text-[#76583E] font-bold">/ {stepsTarget.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Steps Progress Bar (Green / Orange) */}
              <div className="w-full bg-[#E5DDD0] h-2 rounded-full overflow-hidden p-0.5 border border-[#B9A78E]/20">
                <div
                  className="bg-gradient-to-r from-[#34D399] to-[#059669] h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${stepsPercent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Footer Card 4 */}
          <div className="text-[9px] text-[#76583E] font-bold border-t border-stone-200/60 pt-1 flex justify-between">
            <span>Còn {Math.max(0, stepsTarget - stepsCurrent).toLocaleString()} bước nữa</span>
            <span className="text-[#0284C7] font-black">{waterPercent}% mục tiêu nước</span>
          </div>
        </div>

      </div>
    </div>
  );
};


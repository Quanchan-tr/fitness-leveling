'use strict';
'use client';

import React from 'react';
import { WeightSleepData } from '@/types/dashboard.types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Activity, Moon, TrendingDown } from 'lucide-react';

interface WeightSleepCardProps {
  weightSleep?: WeightSleepData;
  onOpenBodyMetrics?: () => void;
}

export const WeightSleepCard: React.FC<WeightSleepCardProps> = ({
  weightSleep = {
    weightHistory: [
      { date: '2026-09-21', weightKg: 68.4 },
      { date: '2026-09-22', weightKg: 68.2 },
      { date: '2026-09-23', weightKg: 68.3 },
      { date: '2026-09-24', weightKg: 68.0 },
      { date: '2026-09-25', weightKg: 67.9 },
      { date: '2026-09-26', weightKg: 67.7 },
      { date: '2026-09-27', weightKg: 67.6 },
    ],
    sleepLastNight: { hours: 7, minutes: 30 },
  },
  onOpenBodyMetrics,
}) => {
  const { weightHistory, sleepLastNight } = weightSleep;
  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weightKg : 67.6;
  const firstWeight = weightHistory.length > 0 ? weightHistory[0].weightKg : 68.4;
  const weightDiff = (latestWeight - firstWeight).toFixed(1);

  // Format first & last dates for X-Axis display
  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return isoDate;
    }
  };

  const firstDateLabel = weightHistory.length > 0 ? formatDateLabel(weightHistory[0].date) : '';
  const lastDateLabel = weightHistory.length > 0 ? formatDateLabel(weightHistory[weightHistory.length - 1].date) : '';

  // Calculate SVG line chart path
  const weights = weightHistory.map((d) => d.weightKg);
  const minW = Math.min(...weights) - 0.3;
  const maxW = Math.max(...weights) + 0.3;
  const svgWidth = 260;
  const svgHeight = 65;

  const points = weightHistory.map((item, idx) => {
    const x = 12 + (idx / Math.max(1, weightHistory.length - 1)) * (svgWidth - 24);
    const y = svgHeight - 12 - ((item.weightKg - minW) / Math.max(0.1, maxW - minW)) * (svgHeight - 24);
    return { x, y, ...item };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${points[0].x},${svgHeight} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${svgHeight} Z`;

  return (
    <GlassCard className="w-full flex flex-col justify-between p-3.5 sm:p-4 overflow-hidden shadow-rest hover:shadow-hover transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#1A1A1A]">Cân Nặng & Giấc Ngủ</h3>
        </div>
        {onOpenBodyMetrics && (
          <button
            onClick={onOpenBodyMetrics}
            className="text-[10px] font-bold text-[#FF6B35] hover:underline cursor-pointer"
          >
            Chi tiết
          </button>
        )}
      </div>

      {/* Top: Weight Trend with Clean X-Axis (First & Last Date Only) */}
      <div className="my-1">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#1A1A1A]">{latestWeight}</span>
            <span className="text-xs text-[#888888] font-semibold">kg</span>
          </div>
          <span className="text-[10px] font-bold text-[#22C55E] bg-[#ECFDF5] px-2 py-0.5 rounded-lg border border-[#A7F3D0] flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" /> {weightDiff} kg (7 ngày)
          </span>
        </div>

        {/* SVG Line Chart */}
        <div className="w-full h-15 mt-1 relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="weightLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area Fill */}
            <path d={areaPath} fill="url(#weightLineGrad)" />
            {/* Polyline */}
            <polyline
              fill="none"
              stroke="#FF6B35"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineStr}
            />
            {/* Dots */}
            {points.map((pt, i) => (
              <circle
                key={`dot-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={i === points.length - 1 ? 4 : 2.5}
                fill={i === points.length - 1 ? '#FF6B35' : '#FFFFFF'}
                stroke="#FF6B35"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>

        {/* X-Axis: First and Last Dates Only to avoid overlapping */}
        <div className="flex items-center justify-between text-[10px] text-[#888888] font-medium px-1">
          <span>{firstDateLabel}</span>
          <span>{lastDateLabel}</span>
        </div>
      </div>

      {/* Bottom: Sleep Last Night */}
      <div className="flex items-center justify-between border-t border-stone-200/60 pt-2 bg-white/50 px-3 py-1.5 rounded-xl">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-[#6366F1]" />
          <span className="text-xs font-semibold text-[#4A4A4A]">Giấc ngủ đêm qua</span>
        </div>
        <span className="text-sm font-bold text-[#1A1A1A]">
          {sleepLastNight.hours}h {sleepLastNight.minutes}m
        </span>
      </div>
    </GlassCard>
  );
};

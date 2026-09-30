'use strict';
'use client';

import React from 'react';
import { WeightSleepData } from '@/types/dashboard.types';
import { Scale, Moon, TrendingDown } from 'lucide-react';

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

  const weights = weightHistory.map((d) => d.weightKg);
  const minW = Math.min(...weights) - 0.2;
  const maxW = Math.max(...weights) + 0.2;
  const svgWidth = 260;
  const svgHeight = 52;

  const points = weightHistory.map((item, idx) => {
    const x = 10 + (idx / Math.max(1, weightHistory.length - 1)) * (svgWidth - 20);
    const y = svgHeight - 10 - ((item.weightKg - minW) / Math.max(0.1, maxW - minW)) * (svgHeight - 20);
    return { x, y, ...item };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Cân nặng &amp; Giấc ngủ
          </h3>
        </div>
        {onOpenBodyMetrics && (
          <button
            onClick={onOpenBodyMetrics}
            className="text-xs font-semibold text-slate-500 hover:text-[#FF5722] transition-colors cursor-pointer"
          >
            InBody
          </button>
        )}
      </div>

      {/* Weight & Sparkline */}
      <div className="py-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {latestWeight}
            </span>
            <span className="text-xs font-semibold text-slate-400">kg</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 tabular-nums">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{weightDiff} kg so với 7 ngày trước</span>
          </span>
        </div>

        {/* Clean Line Sparkline without decorative gradient fill */}
        <div className="w-full h-12 relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <line
              x1="0"
              y1={svgHeight}
              x2={svgWidth}
              y2={svgHeight}
              stroke="#F1F5F9"
              strokeWidth="1"
            />
            <polyline
              fill="none"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineStr}
            />
            {points.map((pt, i) => (
              <circle
                key={`dot-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={i === points.length - 1 ? 3.5 : 2}
                fill={i === points.length - 1 ? '#FF5722' : '#FFFFFF'}
                stroke={i === points.length - 1 ? '#FF5722' : '#0F172A'}
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-0.5 mt-1">
          <span>{firstDateLabel}</span>
          <span>{lastDateLabel}</span>
        </div>
      </div>

      {/* Sleep Sub-metric */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Moon className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium">Giấc ngủ đêm qua:</span>
        </div>
        <span className="font-bold text-slate-900 tabular-nums">
          {sleepLastNight.hours}h {sleepLastNight.minutes}m
        </span>
      </div>
    </div>
  );
};

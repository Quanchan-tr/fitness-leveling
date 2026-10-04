'use strict';
'use client';

import React, { useState } from 'react';
import { Scale, Moon, TrendingDown, TrendingUp, Check, Pencil, X } from 'lucide-react';

interface WeightSleepCardProps {
  weightHistory?: { date: string; weightKg: number }[];
  sleepLastNight?: { hours: number; minutes: number };
  onUpdateWeight?: (weightKg: number) => void;
  onUpdateSleep?: (hours: number, minutes: number) => void;
  onOpenBodyMetrics?: () => void;
}

export const WeightSleepCard: React.FC<WeightSleepCardProps> = ({
  weightHistory = [
    { date: '2026-09-28', weightKg: 68.4 },
    { date: '2026-09-29', weightKg: 68.2 },
    { date: '2026-09-30', weightKg: 68.3 },
    { date: '2026-10-01', weightKg: 68.0 },
    { date: '2026-10-02', weightKg: 67.9 },
    { date: '2026-10-03', weightKg: 67.7 },
    { date: '2026-10-04', weightKg: 67.6 },
  ],
  sleepLastNight = { hours: 7, minutes: 30 },
  onUpdateWeight,
  onUpdateSleep,
  onOpenBodyMetrics,
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [sleepHoursInput, setSleepHoursInput] = useState(sleepLastNight.hours.toString());
  const [sleepMinsInput, setSleepMinsInput] = useState(sleepLastNight.minutes.toString());

  const latestWeight =
    weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weightKg : 67.6;
  const firstWeight =
    weightHistory.length > 0 ? weightHistory[0].weightKg : 68.4;
  const rawDiff = latestWeight - firstWeight;
  const weightDiff = Math.abs(rawDiff).toFixed(1);
  const isLoss = rawDiff <= 0;

  const handleSaveWeight = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 250) {
      onUpdateWeight?.(val);
    }
    setIsEditingWeight(false);
    setWeightInput('');
  };

  const handleSaveSleep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const h = parseInt(sleepHoursInput, 10);
    const m = parseInt(sleepMinsInput, 10);
    if (!isNaN(h) && h >= 0 && h <= 24) {
      onUpdateSleep?.(h, !isNaN(m) && m >= 0 && m < 60 ? m : 0);
    }
    setIsEditingSleep(false);
  };

  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return isoDate;
    }
  };

  const firstDateLabel =
    weightHistory.length > 0 ? formatDateLabel(weightHistory[0].date) : '';
  const lastDateLabel =
    weightHistory.length > 0
      ? formatDateLabel(weightHistory[weightHistory.length - 1].date)
      : '';

  const weights = weightHistory.map((d) => d.weightKg);
  const minW = Math.min(...weights) - 0.2;
  const maxW = Math.max(...weights) + 0.2;
  const svgWidth = 260;
  const svgHeight = 52;

  const points = weightHistory.map((item, idx) => {
    const x =
      10 + (idx / Math.max(1, weightHistory.length - 1)) * (svgWidth - 20);
    const y =
      svgHeight -
      10 -
      ((item.weightKg - minW) / Math.max(0.1, maxW - minW)) * (svgHeight - 20);
    return { x, y, ...item };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Cân nặng &amp; Giấc ngủ
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setWeightInput(latestWeight.toString());
              setIsEditingWeight(true);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#FF5722] transition-colors cursor-pointer"
            title="Ghi nhận cân nặng hôm nay"
          >
            <Pencil className="w-3 h-3" />
            <span>Ghi cân nặng</span>
          </button>
        </div>
      </div>

      {/* Weight & Sparkline */}
      <div className="py-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1">
            {isEditingWeight ? (
              <form onSubmit={handleSaveWeight} className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-20 px-2 py-0.5 text-lg font-black text-slate-900 border border-[#FF5722] rounded-md outline-none bg-orange-50/40"
                  placeholder="67.5"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-[#FF5722] text-white hover:bg-[#E64A19] transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingWeight(false)}
                  className="p-1 rounded text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <>
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {latestWeight}
                </span>
                <span className="text-xs font-semibold text-slate-400">kg</span>
              </>
            )}
          </div>

          <span
            className={`text-xs font-semibold flex items-center gap-1 tabular-nums ${
              isLoss ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isLoss ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            <span>
              {isLoss ? '-' : '+'}
              {weightDiff} kg so với 7 ngày trước
            </span>
          </span>
        </div>

        {/* Clean Line Sparkline */}
        <div className="w-full h-12 relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
          >
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

      {/* Sleep Sub-metric with Quick Entry */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Moon className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium">Giấc ngủ đêm qua:</span>
        </div>

        {isEditingSleep ? (
          <form onSubmit={handleSaveSleep} className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="24"
              value={sleepHoursInput}
              onChange={(e) => setSleepHoursInput(e.target.value)}
              className="w-10 px-1 py-0.5 text-xs font-bold border border-slate-300 rounded text-center"
            />
            <span className="text-[11px] text-slate-500">h</span>
            <input
              type="number"
              min="0"
              max="59"
              value={sleepMinsInput}
              onChange={(e) => setSleepMinsInput(e.target.value)}
              className="w-10 px-1 py-0.5 text-xs font-bold border border-slate-300 rounded text-center"
            />
            <span className="text-[11px] text-slate-500">m</span>
            <button
              type="submit"
              className="p-1 rounded bg-[#FF5722] text-white hover:bg-[#E64A19]"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingSleep(false)}
              className="p-1 rounded text-slate-400 hover:bg-slate-100"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 tabular-nums">
              {sleepLastNight.hours}h {sleepLastNight.minutes}m
            </span>
            <button
              onClick={() => {
                setSleepHoursInput(sleepLastNight.hours.toString());
                setSleepMinsInput(sleepLastNight.minutes.toString());
                setIsEditingSleep(true);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              title="Chỉnh sửa giấc ngủ"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

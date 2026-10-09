'use strict';
'use client';

import React from 'react';
import { HydrationData } from '@/types/dashboard.types';
import { Footprints, Droplets, Plus } from 'lucide-react';

interface HydrationStepsCardProps {
  hydration?: HydrationData;
  onAddWater?: (amount: number) => void;
}

export const HydrationStepsCard: React.FC<HydrationStepsCardProps> = ({
  hydration = { water: { current: 1.8, target: 2.0 }, steps: 5421 },
  onAddWater,
}) => {
  const { water, steps } = hydration;
  const waterPercent = Math.min(100, Math.max(0, (water.current / water.target) * 100));
  const stepsTarget = 8000;
  const stepsPercent = Math.min(100, Math.max(0, (steps / stepsTarget) * 100));

  const fillHeight = (waterPercent / 100) * 36;
  const fillY = 44 - fillHeight;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-600" />
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Nước uống &amp; Vận động
          </h3>
        </div>
        {onAddWater && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddWater(0.25)}
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors cursor-pointer border border-sky-200"
              title="Thêm 250ml nước"
            >
              <Plus className="w-3 h-3" />
              <span>250ml</span>
            </button>
            <button
              onClick={() => onAddWater(0.5)}
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors cursor-pointer border border-sky-200"
              title="Thêm 500ml nước"
            >
              <Plus className="w-3 h-3" />
              <span>500ml</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 py-3">
        {/* Water metric */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 flex items-center gap-3">
          <div className="relative w-7 h-12 shrink-0">
            <svg viewBox="0 0 28 50" className="w-full h-full overflow-hidden">
              <defs>
                <clipPath id="hydrationBottleClip">
                  <rect x="10" y="2" width="8" height="4" rx="1.5" />
                  <rect x="11" y="6" width="6" height="4" />
                  <rect x="4" y="10" width="20" height="36" rx="4" />
                </clipPath>
              </defs>
              <g clipPath="url(#hydrationBottleClip)">
                <rect x="0" y="0" width="28" height="50" fill="#E2E8F0" />
                <rect
                  x="0"
                  y={fillY}
                  width="28"
                  height={fillHeight + 6}
                  fill="#0284C7"
                  className="transition-all duration-500 ease-out"
                />
              </g>
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wide">
              Nước uống
            </span>
            <div className="text-xl font-black text-slate-900 tabular-nums leading-tight">
              {water.current}L
            </div>
            <span className="text-xs text-slate-500 font-medium tabular-nums block mt-0.5">
              Mục tiêu {water.target}L ({Math.round(waterPercent)}%)
            </span>
          </div>
        </div>

        {/* Steps metric */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Bước chân
            </span>
            <Footprints className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums leading-tight">
              {steps.toLocaleString()}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2 mb-1">
              <div
                className="bg-slate-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium tabular-nums block text-right">
              / {stepsTarget.toLocaleString()} bước
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

'use strict';
'use client';

import React from 'react';
import { Droplets, Plus } from 'lucide-react';

interface HydrationStepsCardProps {
  hydration?: {
    water: { current: number; target: number };
    steps?: number;
  };
  onAddWater?: (amount: number) => void;
}

export const HydrationStepsCard: React.FC<HydrationStepsCardProps> = ({
  hydration = { water: { current: 0, target: 2.0 } },
  onAddWater,
}) => {
  const { water } = hydration;
  const currentSafe = Math.round((water?.current || 0) * 100) / 100;
  const targetSafe = water?.target || 2.0;
  const waterPercent = Math.min(100, Math.max(0, Math.round((currentSafe / targetSafe) * 100)));
  const remaining = Math.max(0, Math.round((targetSafe - currentSafe) * 100) / 100);

  const fillHeight = (waterPercent / 100) * 36;
  const fillY = 44 - fillHeight;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-600" />
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Nước uống trong ngày
          </h3>
        </div>
        {onAddWater && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddWater(0.25)}
              className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors cursor-pointer border border-sky-200 shadow-2xs"
              title="Thêm 250ml nước"
            >
              <Plus className="w-3 h-3" />
              <span>+250ml</span>
            </button>
            <button
              onClick={() => onAddWater(0.5)}
              className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors cursor-pointer border border-sky-200 shadow-2xs"
              title="Thêm 500ml nước"
            >
              <Plus className="w-3 h-3" />
              <span>+500ml</span>
            </button>
          </div>
        )}
      </div>

      {/* Water Detail Row */}
      <div className="py-3">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-8 h-14 shrink-0">
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
                Lượng nước đã nạp
              </span>
              <div className="text-2xl font-black text-slate-900 tabular-nums leading-tight">
                {currentSafe}L
              </div>
              <span className="text-xs text-slate-500 font-medium tabular-nums block mt-0.5">
                Mục tiêu {targetSafe}L ({waterPercent}%)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wide">
              Còn thiếu
            </span>
            <div className="text-lg font-bold text-sky-700 tabular-nums">
              {remaining > 0 ? `${remaining}L` : 'Đã đạt tiêu chuẩn'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${waterPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

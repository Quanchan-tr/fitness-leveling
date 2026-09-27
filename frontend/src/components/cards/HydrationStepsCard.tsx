'use strict';
'use client';

import React from 'react';
import { HydrationData } from '@/types/dashboard.types';
import { GlassCard } from '@/components/ui/GlassCard';
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

  // Bottle fill height calculation (viewBox height is 50, water rect from y=8 to 44 -> 36px range)
  const fillHeight = (waterPercent / 100) * 36;
  const fillY = 44 - fillHeight;

  return (
    <GlassCard className="w-full flex flex-col justify-between p-3.5 sm:p-4 overflow-hidden shadow-rest hover:shadow-hover transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] border border-[#0284C7]/30 flex items-center justify-center text-[#0284C7]">
            <Droplets className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#1A1A1A]">Nước Uống & Bước Chân</h3>
        </div>
        {onAddWater && (
          <button
            onClick={() => onAddWater(0.25)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
            title="Thêm 250ml nước"
          >
            <Plus className="w-3 h-3" />
            <span>250ml</span>
          </button>
        )}
      </div>

      {/* Main Content: Water Bottle Animation + Steps Counter */}
      <div className="grid grid-cols-2 gap-3 items-center my-1">
        {/* Animated Water Bottle SVG with clipPath */}
        <div className="flex items-center gap-2.5 bg-white/60 p-2 rounded-xl border border-stone-200/50">
          <div className="relative w-7 h-13 shrink-0">
            <svg viewBox="0 0 28 50" className="w-full h-full overflow-hidden">
              <defs>
                <clipPath id="bottleClip">
                  {/* Bottle Cap */}
                  <rect x="10" y="2" width="8" height="4" rx="1.5" />
                  {/* Bottle Neck */}
                  <rect x="11" y="6" width="6" height="4" />
                  {/* Bottle Body with Rounded Base */}
                  <rect x="4" y="10" width="20" height="36" rx="5" />
                </clipPath>
              </defs>
              {/* Bottle Outline Background Track */}
              <g clipPath="url(#bottleClip)">
                <rect x="0" y="0" width="28" height="50" fill="rgba(0, 0, 0, 0.06)" />
                {/* Water Level Fill */}
                <rect
                  x="0"
                  y={fillY}
                  width="28"
                  height={fillHeight + 6}
                  fill="#0284C7"
                  className="transition-all duration-700 ease-out"
                />
              </g>
              {/* Bottle Glass Gloss Reflection */}
              <rect
                x="6"
                y="12"
                width="3"
                height="30"
                rx="1.5"
                fill="rgba(255, 255, 255, 0.6)"
              />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#888888] block">Nước</span>
            <span className="text-sm font-bold text-[#1A1A1A] block leading-none">
              {water.current}L
            </span>
            <span className="text-[9.5px] font-medium text-[#0284C7]">
              / {water.target}L ({Math.round(waterPercent)}%)
            </span>
          </div>
        </div>

        {/* Steps Counter */}
        <div className="bg-white/60 p-2 rounded-xl border border-stone-200/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#888888]">Bước chân</span>
            <Footprints className="w-3.5 h-3.5 text-[#22C55E]" />
          </div>
          <span className="text-sm font-bold text-[#1A1A1A] block leading-none">
            {steps.toLocaleString()}
          </span>
          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#22C55E] h-full rounded-full transition-all duration-700"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-[#888888] block text-right font-medium">
            Mục tiêu: {stepsTarget.toLocaleString()}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

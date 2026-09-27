'use strict';
'use client';

import React from 'react';
import { NutritionData } from '@/types/dashboard.types';
import { GlassCard } from '@/components/ui/GlassCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Flame } from 'lucide-react';

interface CalorieCardProps {
  nutrition?: NutritionData;
}

export const CalorieCard: React.FC<CalorieCardProps> = ({
  nutrition = {
    calories: { current: 1800, target: 2400 },
    macros: {
      protein: { current: 90, target: 150 },
      carbs: { current: 180, target: 250 },
      fat: { current: 45, target: 70 },
    },
  },
}) => {
  const { calories, macros } = nutrition;
  const current = calories?.current ?? 0;
  const target = calories?.target ?? 2400;

  return (
    <GlassCard className="w-full flex flex-col justify-between p-3.5 sm:p-4 overflow-hidden shadow-rest hover:shadow-hover transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35] shrink-0">
            <Flame className="w-4 h-4 fill-[#FF6B35]" />
          </div>
          <h3 className="font-bold text-sm text-[#1A1A1A]">Năng Lượng & Calo</h3>
        </div>
        <span className="text-[10.5px] font-semibold text-[#888888]">
          Hôm nay
        </span>
      </div>

      {/* Main Circular Progress Body */}
      <div className="flex items-center justify-center py-2">
        <CircularProgress
          value={current}
          max={target}
          size={98}
          strokeWidth={8.5}
          strokeColor="#FF6B35"
          trackColor="rgba(0,0,0,0.06)"
        >
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-bold text-[#1A1A1A] block leading-none">
              {current.toLocaleString()}
            </span>
            <span className="text-[9.5px] text-[#888888] font-medium uppercase tracking-wide block mt-0.5">
              / {target.toLocaleString()} kcal
            </span>
          </div>
        </CircularProgress>
      </div>

      {/* 3 Macro Linear Progress Bars */}
      <div className="space-y-1.5 border-t border-stone-200/60 pt-2 pb-0.5">
        <LinearProgress
          label="Protein"
          valueLabel={`${macros.protein.current}/${macros.protein.target}g`}
          value={macros.protein.current}
          max={macros.protein.target}
          height={4.5}
          fillColor="#FF6B35"
        />
        <LinearProgress
          label="Carbs"
          valueLabel={`${macros.carbs.current}/${macros.carbs.target}g`}
          value={macros.carbs.current}
          max={macros.carbs.target}
          height={4.5}
          fillColor="#3B82F6"
        />
        <LinearProgress
          label="Fat"
          valueLabel={`${macros.fat.current}/${macros.fat.target}g`}
          value={macros.fat.current}
          max={macros.fat.target}
          height={4.5}
          fillColor="#F59E0B"
        />
      </div>
    </GlassCard>
  );
};


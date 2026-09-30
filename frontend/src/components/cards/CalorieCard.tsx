'use strict';
'use client';

import React from 'react';
import { NutritionData } from '@/types/dashboard.types';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Flame } from 'lucide-react';
import Link from 'next/link';

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
  const remaining = Math.max(0, target - current);
  const percentage = Math.round((current / target) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#FF5722]" />
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Năng lượng &amp; Calo
          </h3>
        </div>
        <Link
          href="/nutrition"
          className="text-xs font-semibold text-slate-500 hover:text-[#FF5722] transition-colors"
        >
          Chi tiết
        </Link>
      </div>

      {/* Main Metric Hero */}
      <div className="flex items-center justify-between py-4 gap-4">
        <div>
          <span className="text-3xl font-black text-slate-900 tabular-nums tracking-tight block">
            {current.toLocaleString()}
          </span>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            Mục tiêu: <span className="text-slate-700 font-semibold tabular-nums">{target.toLocaleString()} kcal</span>
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Còn lại <span className="text-slate-700 font-semibold tabular-nums">{remaining.toLocaleString()} kcal</span> hôm nay
          </div>
        </div>

        <div className="shrink-0">
          <CircularProgress
            value={current}
            max={target}
            size={88}
            strokeWidth={8}
            strokeColor="#FF5722"
            trackColor="#F1F5F9"
          >
            <div className="text-center">
              <span className="text-base font-black text-slate-900 tabular-nums">
                {percentage}%
              </span>
            </div>
          </CircularProgress>
        </div>
      </div>

      {/* 3 Macro Distribution Rows */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <LinearProgress
          label="Protein"
          valueLabel={`${macros.protein.current}/${macros.protein.target}g`}
          value={macros.protein.current}
          max={macros.protein.target}
          height={5}
          fillColor="#FF5722"
        />
        <LinearProgress
          label="Carbs"
          valueLabel={`${macros.carbs.current}/${macros.carbs.target}g`}
          value={macros.carbs.current}
          max={macros.carbs.target}
          height={5}
          fillColor="#0284C7"
        />
        <LinearProgress
          label="Fat"
          valueLabel={`${macros.fat.current}/${macros.fat.target}g`}
          value={macros.fat.current}
          max={macros.fat.target}
          height={5}
          fillColor="#F59E0B"
        />
      </div>
    </div>
  );
};

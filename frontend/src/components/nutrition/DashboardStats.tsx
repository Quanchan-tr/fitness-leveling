'use client';

import React from 'react';
import { DailyMacroSummary, FoodLogItem } from '@/types/nutrition.types';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Flame, PieChart, Clock } from 'lucide-react';

interface DashboardStatsProps {
  summary: DailyMacroSummary;
  foodLog?: FoodLogItem[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ summary, foodLog = [] }) => {
  const {
    calories,
    protein,
    carbs,
    fat,
    targets,
    calorieProgress,
    proteinProgress,
    carbProgress,
    fatProgress,
  } = summary;

  const remainingCalories = Math.max(0, targets.calories - calories);
  const isOverTarget = calories > targets.calories;

  // Breakdown calories by meal
  const mealCalories = React.useMemo(() => {
    const breakdown = { breakfast: 0, lunch: 0, dinner: 0 };
    for (const item of foodLog) {
      if (item.meal in breakdown) {
        breakdown[item.meal] += item.calories || 0;
      }
    }
    return breakdown;
  }, [foodLog]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm h-[520px] flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5722]">
            <Flame className="w-4 h-4 text-[#FF5722]" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 tracking-tight">
              Thống kê dinh dưỡng
            </h2>
          </div>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold tabular-nums ${
            isOverTarget
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {calorieProgress}%
        </span>
      </div>

      {/* 2. Circular Calorie Hero Progress */}
      <div className="flex flex-col items-center justify-center py-1 text-center shrink-0">
        <CircularProgress
          value={calories}
          max={targets.calories}
          size={132}
          strokeWidth={10}
          strokeColor={isOverTarget ? '#E11D48' : '#FF5722'}
          trackColor="#F1F5F9"
        >
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">
              {calories.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
              / {targets.calories.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Calories
            </span>
          </div>
        </CircularProgress>

        <div className="mt-2 text-center">
          {isOverTarget ? (
            <p className="text-xs font-semibold text-rose-600">
              Vượt mục tiêu {(calories - targets.calories).toLocaleString()} kcal hôm nay
            </p>
          ) : (
            <p className="text-xs text-slate-500 font-medium">
              Còn lại{' '}
              <span className="text-slate-800 font-bold tabular-nums">
                {remainingCalories.toLocaleString()} kcal
              </span>{' '}
              để đạt mục tiêu
            </p>
          )}
        </div>
      </div>

      {/* 3. 3 Macro Linear Progress Bars */}
      <div className="space-y-2.5 border-t border-slate-100 pt-3 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <PieChart className="w-3.5 h-3.5 text-slate-500" />
          <span>Phân bổ dinh dưỡng</span>
        </div>

        <LinearProgress
          label="Đạm"
          valueLabel={`${protein}g / ${targets.protein}g`}
          value={protein}
          max={targets.protein}
          height={6}
          fillColor="#FF5722"
        />

        <LinearProgress
          label="Tinh bột"
          valueLabel={`${carbs}g / ${targets.carbs}g`}
          value={carbs}
          max={targets.carbs}
          height={6}
          fillColor="#0284C7"
        />

        <LinearProgress
          label="Chất béo"
          valueLabel={`${fat}g / ${targets.fat}g`}
          value={fat}
          max={targets.fat}
          height={6}
          fillColor="#F59E0B"
        />
      </div>

      {/* 4. Meal Distribution Breakdown (Eliminates white space and adds actionable meal insight) */}
      <div className="border-t border-slate-100 pt-3 shrink-0">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Năng lượng theo bữa</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] text-amber-700 font-bold block">Sáng</span>
            <span className="font-bold text-slate-800 tabular-nums text-xs">
              {mealCalories.breakfast} kcal
            </span>
          </div>
          <div className="p-2 rounded-lg bg-orange-50/70 border border-orange-100">
            <span className="text-[10px] text-orange-700 font-bold block">Trưa</span>
            <span className="font-bold text-slate-800 tabular-nums text-xs">
              {mealCalories.lunch} kcal
            </span>
          </div>
          <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100">
            <span className="text-[10px] text-indigo-700 font-bold block">Tối</span>
            <span className="font-bold text-slate-800 tabular-nums text-xs">
              {mealCalories.dinner} kcal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

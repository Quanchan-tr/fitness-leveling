'use client';

import { useMemo } from 'react';
import { FoodLogItem, MacroTargets, DailyMacroSummary } from '@/types/nutrition.types';
import { defaultMacroTargets } from '@/data/vietnameseFoods';

function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function useDailyMacros(
  foodLog: FoodLogItem[],
  customTargets?: Partial<MacroTargets>
): DailyMacroSummary {
  const targets: MacroTargets = useMemo(
    () => ({
      ...defaultMacroTargets,
      ...customTargets,
    }),
    [customTargets]
  );

  return useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    for (const item of foodLog) {
      calories += item.calories || 0;
      protein += item.macros?.protein || 0;
      carbs += item.macros?.carbs || 0;
      fat += item.macros?.fat || 0;
    }

    const calorieProgress = targets.calories > 0
      ? clamp(Math.round((calories / targets.calories) * 100))
      : 0;

    const proteinProgress = targets.protein > 0
      ? clamp(Math.round((protein / targets.protein) * 100))
      : 0;

    const carbProgress = targets.carbs > 0
      ? clamp(Math.round((carbs / targets.carbs) * 100))
      : 0;

    const fatProgress = targets.fat > 0
      ? clamp(Math.round((fat / targets.fat) * 100))
      : 0;

    return {
      calories,
      protein,
      carbs,
      fat,
      targets,
      calorieProgress,
      proteinProgress,
      carbProgress,
      fatProgress,
    };
  }, [foodLog, targets]);
}

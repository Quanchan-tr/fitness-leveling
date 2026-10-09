'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  FoodItem,
  FoodLogItem,
  MealType,
  SavedCombo,
  MacroNutrients,
} from '@/types/nutrition.types';
import { useLocalStorage } from './useLocalStorage';
import { vietnameseFoods, initialDefaultCombos } from '@/data/vietnameseFoods';

const STORAGE_KEY_FOOD_LOG = 'fitnessleveling_food_log_v1';
const STORAGE_KEY_COMBOS = 'fitnessleveling_saved_combos_v1';

export function getDefaultMealByTime(date: Date = new Date()): MealType {
  const totalMinutes = date.getHours() * 60 + date.getMinutes();

  // 05:00 (300p) - 10:59 (659p) -> Bữa sáng
  if (totalMinutes >= 5 * 60 && totalMinutes < 11 * 60) {
    return 'breakfast';
  }
  // 11:00 (660p) - 16:59 (1019p) -> Bữa trưa
  if (totalMinutes >= 11 * 60 && totalMinutes < 17 * 60) {
    return 'lunch';
  }
  // 17:00 - 04:59 -> Bữa tối
  return 'dinner';
}

function isSameCalendarDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const initialSampleFoodLog: FoodLogItem[] = [
  {
    id: 'sample-log-1',
    foodId: 'pho-bo',
    name: 'Phở bò tái nạm',
    meal: 'breakfast',
    multiplier: 1.0,
    calories: 450,
    macros: {
      protein: 28,
      carbs: 52,
      fat: 14,
    },
    loggedAt: new Date().toISOString(),
  },
];

export function useFoodLog(availableFoods: FoodItem[] = vietnameseFoods) {
  const [allLogs, setAllLogs] = useLocalStorage<FoodLogItem[]>(
    STORAGE_KEY_FOOD_LOG,
    initialSampleFoodLog
  );

  const [savedCombos, setSavedCombos] = useLocalStorage<SavedCombo[]>(
    STORAGE_KEY_COMBOS,
    initialDefaultCombos
  );

  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

  // Filter logs strictly for the current calendar day
  const todayFoodLog = useMemo(() => {
    const today = new Date();
    return allLogs.filter((item) => {
      if (!item.loggedAt) return true;
      const itemDate = new Date(item.loggedAt);
      return !isNaN(itemDate.getTime()) && isSameCalendarDay(itemDate, today);
    });
  }, [allLogs]);

  // Add new food log entry
  const addFood = useCallback(
    (item: {
      foodId: string;
      name: string;
      meal: MealType;
      multiplier: number;
      calories: number;
      macros: MacroNutrients;
    }) => {
      const newEntry: FoodLogItem = {
        id: `food-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        foodId: item.foodId,
        name: item.name,
        meal: item.meal,
        multiplier: item.multiplier,
        calories: item.calories,
        macros: item.macros,
        loggedAt: new Date().toISOString(),
      };

      setAllLogs((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    [setAllLogs]
  );

  // Update existing food log entry
  const updateFood = useCallback(
    (id: string, updated: Partial<Omit<FoodLogItem, 'id'>>) => {
      setAllLogs((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
    },
    [setAllLogs]
  );

  // Remove food log entry
  const removeFood = useCallback(
    (id: string) => {
      setAllLogs((prev) => prev.filter((item) => item.id !== id));
      setSelectedLogIds((prev) => prev.filter((selectedId) => selectedId !== id));
    },
    [setAllLogs]
  );

  // Toggle multi-select checkbox for combo creation
  const toggleLogSelection = useCallback((id: string) => {
    setSelectedLogIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLogIds([]);
  }, []);

  // Create a reusable combo from selected log items
  const createComboFromSelected = useCallback(
    (comboName: string): SavedCombo | null => {
      const trimmed = comboName.trim();
      if (!trimmed || selectedLogIds.length === 0) return null;

      const selectedItems = todayFoodLog.filter((item) =>
        selectedLogIds.includes(item.id)
      );
      if (selectedItems.length === 0) return null;

      const newCombo: SavedCombo = {
        id: `combo-${Date.now()}`,
        name: trimmed,
        items: selectedItems.map((item) => ({
          foodId: item.foodId,
          multiplier: item.multiplier,
        })),
        createdAt: new Date().toISOString(),
      };

      setSavedCombos((prev) => [newCombo, ...prev]);
      clearSelection();
      return newCombo;
    },
    [selectedLogIds, todayFoodLog, setSavedCombos, clearSelection]
  );

  // Delete a saved combo
  const removeCombo = useCallback(
    (comboId: string) => {
      setSavedCombos((prev) => prev.filter((combo) => combo.id !== comboId));
    },
    [setSavedCombos]
  );

  // Update an existing combo (name and items)
  const updateCombo = useCallback(
    (comboId: string, updated: { name: string; items: { foodId: string; multiplier: number }[] }) => {
      setSavedCombos((prev) =>
        prev.map((c) =>
          c.id === comboId
            ? { ...c, name: updated.name.trim(), items: updated.items }
            : c
        )
      );
    },
    [setSavedCombos]
  );

  // Create a brand new combo directly from editor
  const createCustomCombo = useCallback(
    (newComboData: { name: string; items: { foodId: string; multiplier: number }[] }): SavedCombo => {
      const created: SavedCombo = {
        id: `combo-${Date.now()}`,
        name: newComboData.name.trim(),
        items: newComboData.items,
        createdAt: new Date().toISOString(),
      };
      setSavedCombos((prev) => [created, ...prev]);
      return created;
    },
    [setSavedCombos]
  );

  // Quick Add Combo: expand items using base nutrition from food list, add to current default meal
  const quickAddCombo = useCallback(
    (combo: SavedCombo, targetMeal?: MealType) => {
      const meal = targetMeal || getDefaultMealByTime();
      const newItems: FoodLogItem[] = [];

      combo.items.forEach((ref) => {
        const food = availableFoods.find((f) => f.id === ref.foodId);
        if (!food) return;

        const currentMultiplier = ref.multiplier;
        const calories = Math.round(food.base_calories * currentMultiplier);
        const macros = {
          protein: Math.round(food.base_macros.protein * currentMultiplier),
          carbs: Math.round(food.base_macros.carbs * currentMultiplier),
          fat: Math.round(food.base_macros.fat * currentMultiplier),
        };

        newItems.push({
          id: `food-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          foodId: food.id,
          name: food.name,
          meal,
          multiplier: currentMultiplier,
          calories,
          macros,
          loggedAt: new Date().toISOString(),
        });
      });

      if (newItems.length > 0) {
        setAllLogs((prev) => [...newItems, ...prev]);
      }
    },
    [availableFoods, setAllLogs]
  );

  return {
    foodLog: todayFoodLog,
    allFoodLogs: allLogs,
    addFood,
    updateFood,
    removeFood,
    savedCombos,
    createComboFromSelected,
    updateCombo,
    createCustomCombo,
    removeCombo,
    quickAddCombo,
    selectedLogIds,
    toggleLogSelection,
    clearSelection,
  };
}

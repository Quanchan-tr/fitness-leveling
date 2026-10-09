'use strict';
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { useShell } from '@/components/layout/ShellLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useFitness } from '@/contexts/FitnessContext';
import { Utensils } from 'lucide-react';

import { vietnameseFoods } from '@/data/vietnameseFoods';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useDailyMacros } from '@/hooks/useDailyMacros';
import { FoodItem, FoodLogItem, SavedCombo, MealType } from '@/types/nutrition.types';

import { DashboardStats } from '@/components/nutrition/DashboardStats';
import { NutritionTabsPanel } from '@/components/nutrition/NutritionTabsPanel';
import { ComboList } from '@/components/nutrition/ComboList';
import { PortionSliderModal } from '@/components/nutrition/PortionSliderModal';
import { ComboCreatorModal } from '@/components/nutrition/ComboCreatorModal';
import { ComboEditorModal } from '@/components/nutrition/ComboEditorModal';

export default function NutritionPage() {
  const { toggleMobileNav } = useShell();
  const { user, signOut } = useAuth();
  const { updateNutrition } = useFitness();

  const topBarUser = {
    ...initialFitnessData.user,
    name: user?.displayName || initialFitnessData.user.name,
  };

  // 1. Food Search Hook
  const {
    query,
    setQuery,
    results: searchResults,
    clearSearch,
  } = useFoodSearch(vietnameseFoods);

  // 2. Food Log Hook
  const {
    foodLog,
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
  } = useFoodLog(vietnameseFoods);

  // 3. Daily Macros (Derived State)
  const dailySummary = useDailyMacros(foodLog);

  // Synchronize in-memory FitnessContext and fitnessleveling_vitals so Dashboard stays 100% in sync
  useEffect(() => {
    if (updateNutrition) {
      updateNutrition({
        calories: {
          current: dailySummary.calories,
          target: dailySummary.targets.calories,
        },
        macros: {
          protein: {
            current: dailySummary.protein,
            target: dailySummary.targets.protein,
          },
          carbs: {
            current: dailySummary.carbs,
            target: dailySummary.targets.carbs,
          },
          fat: {
            current: dailySummary.fat,
            target: dailySummary.targets.fat,
          },
        },
      });
    }
  }, [dailySummary, updateNutrition]);

  // Modal States
  const [isPortionModalOpen, setIsPortionModalOpen] = useState(false);
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState<FoodItem | null>(null);
  const [editingLogItem, setEditingLogItem] = useState<FoodLogItem | null>(null);

  // Combo Modals
  const [isComboCreatorOpen, setIsComboCreatorOpen] = useState(false);
  const [isComboEditorOpen, setIsComboEditorOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<SavedCombo | null>(null);

  // Open portion modal from search
  const handleSelectFoodFromSearch = useCallback((food: FoodItem) => {
    setSelectedFoodForPortion(food);
    setEditingLogItem(null);
    setIsPortionModalOpen(true);
  }, []);

  // Open portion modal to edit existing food in daily log
  const handleStartEditFood = useCallback((item: FoodLogItem) => {
    const matchingFood = vietnameseFoods.find((f) => f.id === item.foodId) || {
      id: item.foodId,
      name: item.name,
      category: 'Món ăn',
      base_serving: '1 khẩu phần',
      base_calories: Math.round(item.calories / (item.multiplier || 1)),
      base_macros: {
        protein: Math.round(item.macros.protein / (item.multiplier || 1)),
        carbs: Math.round(item.macros.carbs / (item.multiplier || 1)),
        fat: Math.round(item.macros.fat / (item.multiplier || 1)),
      },
      min_multiplier: 0.5,
      max_multiplier: 1.5,
    };

    setSelectedFoodForPortion(matchingFood);
    setEditingLogItem(item);
    setIsPortionModalOpen(true);
  }, []);

  // Save portion (both Add and Edit)
  const handleSavePortion = useCallback(
    (payload: {
      foodId: string;
      name: string;
      meal: MealType;
      multiplier: number;
      calories: number;
      macros: { protein: number; carbs: number; fat: number };
    }) => {
      if (editingLogItem) {
        updateFood(editingLogItem.id, {
          meal: payload.meal,
          multiplier: payload.multiplier,
          calories: payload.calories,
          macros: payload.macros,
        });
      } else {
        addFood(payload);
      }
    },
    [editingLogItem, updateFood, addFood]
  );

  // Quick add combo
  const handleQuickAddCombo = useCallback(
    (combo: SavedCombo, targetMeal?: MealType) => {
      quickAddCombo(combo, targetMeal);
    },
    [quickAddCombo]
  );

  // Drop combo onto a specific meal section
  const handleDropCombo = useCallback(
    (meal: MealType, combo: SavedCombo) => {
      quickAddCombo(combo, meal);
    },
    [quickAddCombo]
  );

  // Items currently selected for combo creation from Daily Log
  const selectedLogObjects = foodLog.filter((item) =>
    selectedLogIds.includes(item.id)
  );

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      {/* TopBar */}
      <TopBar
        user={topBarUser}
        streak={initialFitnessData.today.streak}
        onToggleMobileMenu={toggleMobileNav}
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header (Clean, no AI subtitle) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF5722]" />
              <span>Dinh dưỡng</span>
            </h1>
          </div>
        </div>

        {/* Top Row: Balanced 1/3 (Stats) and 2/3 (Daily Log & Food Search Tabs) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Column 1: Thống kê dinh dưỡng (4/12 = 1 phần) */}
          <div className="lg:col-span-4 flex flex-col">
            <DashboardStats summary={dailySummary} foodLog={foodLog} />
          </div>

          {/* Column 2: Gộp Nhật ký & Tìm kiếm (8/12 = 2 phần, cân đối, cùng chiều cao) */}
          <div className="lg:col-span-8 flex flex-col">
            <NutritionTabsPanel
              foodLog={foodLog}
              selectedLogIds={selectedLogIds}
              onToggleSelect={toggleLogSelection}
              onClearSelection={clearSelection}
              onOpenComboModal={() => setIsComboCreatorOpen(true)}
              onEditFood={handleStartEditFood}
              onDeleteFood={removeFood}
              onDropCombo={handleDropCombo}
              query={query}
              onQueryChange={setQuery}
              onClearQuery={clearSearch}
              searchResults={searchResults}
              onSelectFoodFromSearch={handleSelectFoodFromSearch}
            />
          </div>
        </div>

        {/* Bottom Section: Full Width Saved Combos (Kéo thả & Thêm/Sửa/Xóa) */}
        <div className="w-full">
          <ComboList
            combos={savedCombos}
            availableFoods={vietnameseFoods}
            onQuickAdd={handleQuickAddCombo}
            onEditCombo={(combo) => {
              setEditingCombo(combo);
              setIsComboEditorOpen(true);
            }}
            onDeleteCombo={removeCombo}
            onOpenCreateCombo={() => {
              setEditingCombo(null);
              setIsComboEditorOpen(true);
            }}
          />
        </div>
      </div>

      {/* Portion Slider Modal */}
      <PortionSliderModal
        isOpen={isPortionModalOpen}
        onClose={() => {
          setIsPortionModalOpen(false);
          setSelectedFoodForPortion(null);
          setEditingLogItem(null);
        }}
        food={selectedFoodForPortion}
        editingLogItem={editingLogItem}
        onSave={handleSavePortion}
      />

      {/* Combo Creator Modal (from Daily Log checked items) */}
      <ComboCreatorModal
        isOpen={isComboCreatorOpen}
        onClose={() => setIsComboCreatorOpen(false)}
        selectedItems={selectedLogObjects}
        onCreateCombo={createComboFromSelected}
      />

      {/* Combo Editor Modal (Full Edit & Manual Create) */}
      <ComboEditorModal
        isOpen={isComboEditorOpen}
        onClose={() => {
          setIsComboEditorOpen(false);
          setEditingCombo(null);
        }}
        initialCombo={editingCombo}
        availableFoods={vietnameseFoods}
        onSave={(data) => {
          if (editingCombo) {
            updateCombo(editingCombo.id, data);
          } else {
            createCustomCombo(data);
          }
        }}
      />
    </main>
  );
}

'use client';

import React, { useMemo } from 'react';
import { FoodLogItem, MealType, SavedCombo } from '@/types/nutrition.types';
import { MealSection } from './MealSection';
import { BookmarkPlus, CheckSquare, Utensils } from 'lucide-react';

interface DailyLogProps {
  foodLog: FoodLogItem[];
  selectedLogIds: string[];
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onOpenComboModal: () => void;
  onEditFood: (item: FoodLogItem) => void;
  onDeleteFood: (id: string) => void;
  onDropCombo?: (meal: MealType, combo: SavedCombo) => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({
  foodLog,
  selectedLogIds,
  onToggleSelect,
  onClearSelection,
  onOpenComboModal,
  onEditFood,
  onDeleteFood,
  onDropCombo,
}) => {
  const breakfastItems = useMemo(
    () => foodLog.filter((item) => item.meal === 'breakfast'),
    [foodLog]
  );
  const lunchItems = useMemo(
    () => foodLog.filter((item) => item.meal === 'lunch'),
    [foodLog]
  );
  const dinnerItems = useMemo(
    () => foodLog.filter((item) => item.meal === 'dinner'),
    [foodLog]
  );

  const totalCaloriesToday = useMemo(
    () => foodLog.reduce((acc, curr) => acc + (curr.calories || 0), 0),
    [foodLog]
  );

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Sub-header info row */}
      <div className="flex items-center justify-between pb-1 text-xs shrink-0">
        <span className="font-semibold text-slate-500">
          Tổng cộng hôm nay:{' '}
          <span className="font-bold text-slate-900 tabular-nums">
            {totalCaloriesToday.toLocaleString()} kcal
          </span>
        </span>
        <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
          {foodLog.length} món
        </span>
      </div>

      {/* Multi-Select Action Bar Banner */}
      {selectedLogIds.length > 0 && (
        <div className="shrink-0 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF5722]">
            <CheckSquare className="w-4 h-4" />
            <span>Đã chọn {selectedLogIds.length} món</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-white transition-colors"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={onOpenComboModal}
              className="px-3 py-1.5 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Lưu thành Combo</span>
            </button>
          </div>
        </div>
      )}

      {/* Scrollable list container that fixes height and prevents vertical box expanding */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {foodLog.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
            <Utensils className="w-7 h-7 text-slate-300 mx-auto" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-700">Chưa có món ăn hôm nay</h3>
            <p className="text-xs text-slate-400">
              Kéo thả Combo từ bên dưới hoặc chuyển sang tab Tìm kiếm để thêm món
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            <MealSection
              mealType="breakfast"
              title="Bữa sáng"
              items={breakfastItems}
              selectedLogIds={selectedLogIds}
              onToggleSelect={onToggleSelect}
              onEdit={onEditFood}
              onDelete={onDeleteFood}
              onDropCombo={onDropCombo}
            />

            <MealSection
              mealType="lunch"
              title="Bữa trưa"
              items={lunchItems}
              selectedLogIds={selectedLogIds}
              onToggleSelect={onToggleSelect}
              onEdit={onEditFood}
              onDelete={onDeleteFood}
              onDropCombo={onDropCombo}
            />

            <MealSection
              mealType="dinner"
              title="Bữa tối"
              items={dinnerItems}
              selectedLogIds={selectedLogIds}
              onToggleSelect={onToggleSelect}
              onEdit={onEditFood}
              onDelete={onDeleteFood}
              onDropCombo={onDropCombo}
            />
          </div>
        )}
      </div>
    </div>
  );
};

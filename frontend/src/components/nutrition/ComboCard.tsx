'use client';

import React from 'react';
import { SavedCombo, FoodItem } from '@/types/nutrition.types';
import { Zap, Trash2, Edit2, GripVertical, Layers } from 'lucide-react';

interface ComboCardProps {
  combo: SavedCombo;
  availableFoods: FoodItem[];
  onQuickAdd: (combo: SavedCombo) => void;
  onEditCombo: (combo: SavedCombo) => void;
  onDeleteCombo: (comboId: string) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({
  combo,
  availableFoods,
  onQuickAdd,
  onEditCombo,
  onDeleteCombo,
}) => {
  const { resolvedItems, estimatedCalories } = React.useMemo(() => {
    let totalCal = 0;
    const items = combo.items.map((ref) => {
      const food = availableFoods.find((f) => f.id === ref.foodId);
      const name = food ? food.name : ref.foodId;
      const cal = food ? Math.round(food.base_calories * ref.multiplier) : 0;
      totalCal += cal;
      return {
        name,
        multiplier: ref.multiplier,
        calories: cal,
      };
    });
    return { resolvedItems: items, estimatedCalories: totalCal };
  }, [combo, availableFoods]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'COMBO', combo })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group relative p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-grab active:cursor-grabbing select-none"
    >
      <div>
        {/* Header: Title, Grip & Actions */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
            <h4 className="font-bold text-sm text-slate-900 truncate">
              {combo.name}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditCombo(combo);
              }}
              aria-label={`Sửa combo ${combo.name}`}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCombo(combo.id);
              }}
              aria-label={`Xóa combo ${combo.name}`}
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Resolved Items List */}
        <div className="mt-2.5 space-y-1.5">
          {resolvedItems.map((item, idx) => (
            <div
              key={idx}
              className="text-xs text-slate-600 flex items-center justify-between"
            >
              <span className="truncate pr-2">• {item.name}</span>
              <span className="text-slate-400 font-semibold tabular-nums text-[11px] shrink-0">
                {item.multiplier}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Calories & Quick Add Button */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-800 tabular-nums">
          ~{estimatedCalories.toLocaleString()} kcal
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(combo);
          }}
          aria-label={`Thêm nhanh combo ${combo.name}`}
          className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-[#FF5722] text-[#FF5722] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Thêm nhanh</span>
        </button>
      </div>
    </div>
  );
};

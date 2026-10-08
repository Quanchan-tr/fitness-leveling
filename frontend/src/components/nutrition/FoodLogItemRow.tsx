'use client';

import React from 'react';
import { FoodLogItem } from '@/types/nutrition.types';
import { Edit2, Trash2 } from 'lucide-react';

interface FoodLogItemRowProps {
  item: FoodLogItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (item: FoodLogItem) => void;
  onDelete: (id: string) => void;
}

export const FoodLogItemRow: React.FC<FoodLogItemRowProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`group p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
        isSelected
          ? 'bg-orange-50/50 border-orange-200'
          : 'bg-white hover:bg-slate-50/70 border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Left: Checkbox & Name info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <label
          htmlFor={`checkbox-log-${item.id}`}
          className="flex items-center cursor-pointer select-none p-1 -m-1"
        >
          <input
            type="checkbox"
            id={`checkbox-log-${item.id}`}
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={`Chọn ${item.name} để tạo combo`}
            className="w-4 h-4 rounded text-[#FF5722] accent-[#FF5722] border-slate-300 focus:ring-[#FF5722]/30 cursor-pointer"
          />
        </label>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-900 truncate">
              {item.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold tabular-nums">
              {item.multiplier}x
            </span>
          </div>

          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 tabular-nums">
            <span>P: {item.macros.protein}g</span>
            <span>•</span>
            <span>C: {item.macros.carbs}g</span>
            <span>•</span>
            <span>F: {item.macros.fat}g</span>
          </div>
        </div>
      </div>

      {/* Right: Calories & Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="font-black text-sm text-slate-800 tabular-nums block">
            {item.calories}
          </span>
          <span className="text-[10px] text-slate-400">kcal</span>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Sửa món ${item.name}`}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Xóa món ${item.name}`}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

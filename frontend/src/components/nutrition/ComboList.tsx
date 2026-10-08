'use client';

import React from 'react';
import { SavedCombo, FoodItem } from '@/types/nutrition.types';
import { ComboCard } from './ComboCard';
import { Plus, GripVertical, Layers } from 'lucide-react';

interface ComboListProps {
  combos: SavedCombo[];
  availableFoods: FoodItem[];
  onQuickAdd: (combo: SavedCombo) => void;
  onEditCombo: (combo: SavedCombo) => void;
  onDeleteCombo: (comboId: string) => void;
  onOpenCreateCombo: () => void;
}

export const ComboList: React.FC<ComboListProps> = ({
  combos,
  availableFoods,
  onQuickAdd,
  onEditCombo,
  onDeleteCombo,
  onOpenCreateCombo,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5722]">
            <Layers className="w-4 h-4 text-[#FF5722]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Combo bữa ăn đã lưu
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
                {combos.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5 text-slate-400 inline" />
              <span>Kéo thả combo vào Nhật ký hoặc bấm Thêm nhanh</span>
            </p>
          </div>
        </div>

        {/* Action Button: Create New Combo */}
        <button
          type="button"
          onClick={onOpenCreateCombo}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Combo mới</span>
        </button>
      </div>

      {/* Grid of Combo Cards */}
      {combos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {combos.map((combo) => (
            <ComboCard
              key={combo.id}
              combo={combo}
              availableFoods={availableFoods}
              onQuickAdd={onQuickAdd}
              onEditCombo={onEditCombo}
              onDeleteCombo={onDeleteCombo}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs sm:text-sm font-semibold text-slate-700">Chưa có Combo nào</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bấm &quot;Tạo Combo mới&quot; hoặc chọn các món trong Nhật ký để lưu combo yêu thích.
          </p>
        </div>
      )}
    </div>
  );
};

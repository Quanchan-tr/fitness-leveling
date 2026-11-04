'use client';

import React, { useState } from 'react';
import { FoodLogItem, MealType, SavedCombo } from '@/types/nutrition.types';
import { FoodLogItemRow } from './FoodLogItemRow';
import { Coffee, Sun, Moon, Utensils, Download, Plus } from 'lucide-react';

interface MealSectionProps {
  mealType: MealType;
  title: string;
  items: FoodLogItem[];
  selectedLogIds: string[];
  onToggleSelect: (id: string) => void;
  onEdit: (item: FoodLogItem) => void;
  onDelete: (id: string) => void;
  onDropCombo?: (meal: MealType, combo: SavedCombo) => void;
}

const mealConfig: Record<
  MealType,
  { icon: React.ReactNode; borderLeft: string; badgeBg: string }
> = {
  breakfast: {
    icon: <Coffee className="w-3.5 h-3.5 text-amber-500" />,
    borderLeft: 'border-l-4 border-l-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700',
  },
  lunch: {
    icon: <Sun className="w-3.5 h-3.5 text-orange-500" />,
    borderLeft: 'border-l-4 border-l-[#FF5722]',
    badgeBg: 'bg-orange-50 text-[#FF5722]',
  },
  dinner: {
    icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />,
    borderLeft: 'border-l-4 border-l-indigo-500',
    badgeBg: 'bg-indigo-50 text-indigo-700',
  },
};

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  title,
  items,
  selectedLogIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onDropCombo,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const totalMealCalories = items.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const config = mealConfig[mealType] || mealConfig.breakfast;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed?.combo && onDropCombo) {
          onDropCombo(mealType, parsed.combo);
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl border border-slate-200/80 bg-white p-3 space-y-2 transition-all shadow-2xs ${config.borderLeft} ${
        isDragOver
          ? 'bg-orange-50/90 ring-2 ring-dashed ring-[#FF5722] border-transparent'
          : ''
      }`}
    >
      {/* Meal Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100/90">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">{title}</h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${config.badgeBg}`}>
            {items.length} món
          </span>
        </div>
        <div className="text-right">
          <span className="font-black text-xs text-slate-900 tabular-nums">
            {totalMealCalories.toLocaleString()}
          </span>{' '}
          <span className="text-[10px] text-slate-400 font-semibold">kcal</span>
        </div>
      </div>

      {/* Drag Over Hint */}
      {isDragOver && (
        <div className="py-2 px-3 rounded-lg bg-orange-100/90 border border-orange-300 text-center text-xs font-bold text-[#FF5722] flex items-center justify-center gap-1.5 animate-pulse">
          <Download className="w-3.5 h-3.5" />
          <span>Thả vào đây để thêm vào {title}</span>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-1.5">
        {items.length > 0 ? (
          items.map((item) => (
            <FoodLogItemRow
              key={item.id}
              item={item}
              isSelected={selectedLogIds.includes(item.id)}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          !isDragOver && (
            <div className="py-2 px-3 rounded-lg bg-slate-50/70 border border-dashed border-slate-200 text-slate-400 hover:border-orange-300 hover:bg-orange-50/30 transition-colors flex items-center justify-between">
              <span className="text-[11px] font-medium">Chưa có món — Kéo thả Combo vào đây</span>
              <Plus className="w-3.5 h-3.5 text-slate-300" />
            </div>
          )
        )}
      </div>
    </div>
  );
};

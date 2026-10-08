'use client';

import React, { useState } from 'react';
import { FoodLogItem, MealType, SavedCombo } from '@/types/nutrition.types';
import { FoodLogItemRow } from './FoodLogItemRow';
import { Coffee, Sun, Moon, Utensils, Download } from 'lucide-react';

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

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4 text-amber-500" />,
  lunch: <Sun className="w-4 h-4 text-orange-500" />,
  dinner: <Moon className="w-4 h-4 text-indigo-500" />,
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving the actual container
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
      className={`space-y-2 p-2 rounded-xl transition-all ${
        isDragOver
          ? 'bg-orange-50/80 ring-2 ring-dashed ring-[#FF5722]'
          : 'bg-transparent'
      }`}
    >
      {/* Meal Header */}
      <div className="flex items-center justify-between px-1 py-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {mealIcons[mealType] || <Utensils className="w-4 h-4 text-slate-400" />}
          <h3 className="font-bold text-sm text-slate-800">{title}</h3>
          <span className="text-[11px] text-slate-400 font-medium">{items.length} món</span>
        </div>
        <div className="text-right">
          <span className="font-bold text-xs text-slate-800 tabular-nums">
            {totalMealCalories.toLocaleString()}
          </span>{' '}
          <span className="text-[10px] text-slate-400">kcal</span>
        </div>
      </div>

      {/* Drag Over Hint */}
      {isDragOver && (
        <div className="py-2.5 px-3 rounded-lg bg-orange-100/70 border border-orange-200 text-center text-xs font-bold text-[#FF5722] flex items-center justify-center gap-1.5 animate-pulse">
          <Download className="w-3.5 h-3.5" />
          <span>Thả vào đây để thêm vào {title}</span>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
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
            <div className="py-3 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-400 font-medium">Chưa có món ăn</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

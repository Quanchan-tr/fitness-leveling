'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, FoodLogItem, MealType } from '@/types/nutrition.types';
import { getDefaultMealByTime } from '@/hooks/useFoodLog';
import { X, Sliders, Check, Clock } from 'lucide-react';

interface PortionSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodItem | null;
  editingLogItem?: FoodLogItem | null;
  onSave: (payload: {
    foodId: string;
    name: string;
    meal: MealType;
    multiplier: number;
    calories: number;
    macros: { protein: number; carbs: number; fat: number };
  }) => void;
}

export const PortionSliderModal: React.FC<PortionSliderModalProps> = ({
  isOpen,
  onClose,
  food,
  editingLogItem,
  onSave,
}) => {
  const initialSliderValue = useMemo(() => {
    if (editingLogItem && food) {
      const min = food.min_multiplier;
      const max = food.max_multiplier;
      if (max > min) {
        const percent = ((editingLogItem.multiplier - min) / (max - min)) * 100;
        return Math.min(100, Math.max(0, Math.round(percent)));
      }
    }
    return 50;
  }, [editingLogItem, food]);

  const [sliderValue, setSliderValue] = useState<number>(initialSliderValue);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');

  useEffect(() => {
    if (isOpen) {
      if (editingLogItem) {
        setSelectedMeal(editingLogItem.meal);
        setSliderValue(initialSliderValue);
      } else {
        setSelectedMeal(getDefaultMealByTime());
        setSliderValue(50);
      }
    }
  }, [isOpen, editingLogItem, initialSliderValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !food) return null;

  /*
   * Công thức nội suy tuyến tính (Linear Interpolation) tính khẩu phần ăn:
   * Slider chạy từ 0 đến 100%. 0% tương ứng minMultiplier (ít/nạc),
   * 50% là khẩu phần chuẩn, 100% tương ứng maxMultiplier (nhiều/béo).
   */
  const sliderPercent = sliderValue / 100;
  const rawMultiplier = food.min_multiplier + sliderPercent * (food.max_multiplier - food.min_multiplier);
  const currentMultiplier = Math.round((rawMultiplier + Number.EPSILON) * 100) / 100;

  const currentCalories = Math.round(food.base_calories * currentMultiplier);
  const currentProtein = Math.round(food.base_macros.protein * currentMultiplier);
  const currentCarbs = Math.round(food.base_macros.carbs * currentMultiplier);
  const currentFat = Math.round(food.base_macros.fat * currentMultiplier);

  const portionDescription =
    sliderValue < 35
      ? 'Khẩu phần nhỏ, ăn nhẹ'
      : sliderValue > 65
      ? 'Khẩu phần lớn, no lâu'
      : 'Khẩu phần tiêu chuẩn';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      foodId: food.id,
      name: food.name,
      meal: selectedMeal,
      multiplier: currentMultiplier,
      calories: currentCalories,
      macros: {
        protein: currentProtein,
        carbs: currentCarbs,
        fat: currentFat,
      },
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#FF5722] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 id="portion-modal-title" className="font-bold text-base text-slate-900">
                {editingLogItem ? 'Chỉnh sửa khẩu phần' : 'Khẩu phần món ăn'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Food Info Summary */}
          <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100/80 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider block mb-0.5">
                {food.category}
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{food.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Định lượng: <span className="font-semibold text-slate-700">{food.base_serving}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-[#FF5722] tabular-nums block">
                {currentCalories}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">kcal</span>
            </div>
          </div>

          {/* Meal Selection Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="meal-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Bữa ăn</span>
            </label>
            <select
              id="meal-select"
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value as MealType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors"
            >
              <option value="breakfast">Bữa sáng</option>
              <option value="lunch">Bữa trưa</option>
              <option value="dinner">Bữa tối</option>
            </select>
          </div>

          {/* Portion Slider Control */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Khẩu phần</span>
              <span className="font-bold text-[#FF5722] tabular-nums px-2 py-0.5 bg-orange-100/60 rounded-md">
                {sliderValue}% ({currentMultiplier}x)
              </span>
            </div>

            {/* Range Input */}
            <div className="py-2">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                id="portion-range-slider"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                aria-label="Điều chỉnh khẩu phần ăn"
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40"
              />
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-2">
                <span>Ít</span>
                <span className="text-slate-600">Chuẩn</span>
                <span>Nhiều</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 font-medium text-center">
              {portionDescription}
            </p>
          </div>

          {/* Calculated Realtime Macros Grid */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">Dinh dưỡng:</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-center">
                <span className="text-[11px] font-bold text-orange-700 block">Đạm</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">{currentProtein}g</span>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-center">
                <span className="text-[11px] font-bold text-sky-700 block">Tinh bột</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">{currentCarbs}g</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-center">
                <span className="text-[11px] font-bold text-amber-700 block">Chất béo</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">{currentFat}g</span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingLogItem ? 'Lưu thay đổi' : 'Thêm vào nhật ký'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

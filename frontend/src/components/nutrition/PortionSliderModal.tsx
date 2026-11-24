'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, FoodLogItem, MealType } from '@/types/nutrition.types';
import { getDefaultMealByTime } from '@/hooks/useFoodLog';
import { X, Sliders, Check, Clock, Scale, Utensils } from 'lucide-react';

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
  const isRaw = food?.item_type === 'RAW';

  // For RAW items: store grams directly (default 100g)
  // For DISH items: store multiplier directly (default 1.0)
  const [grams, setGrams] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');

  useEffect(() => {
    if (isOpen && food) {
      if (editingLogItem) {
        setSelectedMeal(editingLogItem.meal);
        const m = editingLogItem.multiplier || 1.0;
        setMultiplier(m);
        setGrams(Math.round(m * 100));
      } else {
        setSelectedMeal(getDefaultMealByTime());
        setMultiplier(1.0);
        setGrams(100);
      }
    }
  }, [isOpen, editingLogItem, food]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !food) return null;

  // Active multiplier calculation
  const currentMultiplier = isRaw
    ? Math.max(0.1, Math.round((grams / 100) * 100) / 100)
    : Math.max(0.2, Math.round(multiplier * 100) / 100);

  const currentCalories = Math.round(food.base_calories * currentMultiplier);
  const currentProtein = Number((food.base_macros.protein * currentMultiplier).toFixed(1));
  const currentCarbs = Number((food.base_macros.carbs * currentMultiplier).toFixed(1));
  const currentFat = Number((food.base_macros.fat * currentMultiplier).toFixed(1));

  const portionDescription = isRaw
    ? `${grams} gram (${currentMultiplier}x định lượng chuẩn 100g)`
    : `${currentMultiplier} suất (${food.base_serving || '1 khẩu phần'})`;

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
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isRaw ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-[#FF5722]'
              }`}
            >
              {isRaw ? <Scale className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="portion-modal-title" className="font-bold text-base text-slate-900">
                {editingLogItem
                  ? 'Chỉnh sửa khẩu phần'
                  : isRaw
                  ? 'Khối lượng nguyên liệu'
                  : 'Khẩu phần món ăn'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Food Info Summary */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
              isRaw ? 'bg-sky-50/40 border-sky-100' : 'bg-orange-50/40 border-orange-100'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isRaw ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-[#FF5722]'
                  }`}
                >
                  {isRaw ? 'Nguyên liệu thô (RAW)' : food.category}
                </span>
                {isRaw && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    {food.category}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">
                {food.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Định lượng gốc: <span className="font-semibold text-slate-700">{food.base_serving || '100g'}</span>
                {food.base_calories ? ` (${food.base_calories} kcal)` : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`text-2xl font-black tabular-nums block ${
                  isRaw ? 'text-sky-600' : 'text-[#FF5722]'
                }`}
              >
                {currentCalories}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">kcal tính được</span>
            </div>
          </div>

          {/* Meal Selection Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="meal-select"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Bữa ăn</span>
            </label>
            <select
              id="meal-select"
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value as MealType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors cursor-pointer"
            >
              <option value="breakfast">Bữa sáng</option>
              <option value="lunch">Bữa trưa</option>
              <option value="dinner">Bữa tối</option>
            </select>
          </div>

          {/* Portion Controls: Specialized for RAW (Grams) vs DISH (Servings) */}
          {isRaw ? (
            /* RAW INGREDIENT CONTROLS: Grams adjustment */
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-sky-600" />
                  <span>Khối lượng (gram)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="5"
                    value={grams}
                    onChange={(e) => setGrams(Math.max(10, Number(e.target.value) || 0))}
                    className="w-20 px-2.5 py-1 text-center font-bold text-sky-700 bg-white border border-sky-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
                    aria-label="Nhập số gram"
                  />
                  <span className="text-xs font-bold text-slate-500">g</span>
                </div>
              </div>

              {/* Quick Gram Preset Chips */}
              <div className="flex items-center gap-2">
                {[50, 100, 150, 200, 250, 300].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGrams(preset)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      grams === preset
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}g
                  </button>
                ))}
              </div>

              {/* Range Slider for Grams */}
              <div className="py-1">
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  id="gram-range-slider"
                  value={grams}
                  onChange={(e) => setGrams(Number(e.target.value))}
                  aria-label="Thanh trượt gram"
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-1.5">
                  <span>20g</span>
                  <span className="text-slate-600">100g (Chuẩn)</span>
                  <span>500g</span>
                </div>
              </div>

              <p className="text-xs text-sky-900 bg-sky-50/80 p-2.5 rounded-lg border border-sky-100 font-medium text-center">
                {portionDescription}
              </p>
            </div>
          ) : (
            /* DISH CONTROLS: Servings multiplier */
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Số lượng phần / Suất ăn</span>
                </span>
                <span className="font-bold text-[#FF5722] tabular-nums px-2 py-0.5 bg-orange-100/60 rounded-md">
                  {currentMultiplier} suất
                </span>
              </div>

              {/* Quick Multiplier Chips */}
              <div className="flex items-center gap-2">
                {[
                  { label: '0.5 phần', val: 0.5 },
                  { label: '1 phần', val: 1.0 },
                  { label: '1.5 phần', val: 1.5 },
                  { label: '2 phần', val: 2.0 },
                ].map((chip) => (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => setMultiplier(chip.val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      Math.abs(multiplier - chip.val) < 0.05
                        ? 'bg-[#FF5722] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Range Slider for Multiplier */}
              <div className="py-1">
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  id="portion-range-slider"
                  value={multiplier}
                  onChange={(e) => setMultiplier(Number(e.target.value))}
                  aria-label="Điều chỉnh khẩu phần ăn"
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40"
                />
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-1.5">
                  <span>0.5x (Ít)</span>
                  <span className="text-slate-600">1.0x (Chuẩn)</span>
                  <span>3.0x (Nhiều)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 font-medium text-center">
                {portionDescription}
              </p>
            </div>
          )}

          {/* Calculated Realtime Macros Grid */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">Dinh dưỡng tự động tính:</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-center">
                <span className="text-[11px] font-bold text-orange-700 block">Đạm (Protein)</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">
                  {currentProtein}g
                </span>
              </div>
              <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-center">
                <span className="text-[11px] font-bold text-sky-700 block">Tinh bột (Carb)</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">
                  {currentCarbs}g
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-center">
                <span className="text-[11px] font-bold text-amber-700 block">Chất béo (Fat)</span>
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
              className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer ${
                isRaw
                  ? 'bg-sky-600 hover:bg-sky-700'
                  : 'bg-[#FF5722] hover:bg-[#E64A19]'
              }`}
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

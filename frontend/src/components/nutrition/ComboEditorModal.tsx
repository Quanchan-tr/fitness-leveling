'use client';

import React, { useState, useEffect } from 'react';
import { FoodItem, SavedCombo, ComboFoodRef } from '@/types/nutrition.types';
import { X, Plus, Trash2, Check, Layers } from 'lucide-react';

interface ComboEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCombo?: SavedCombo | null;
  availableFoods: FoodItem[];
  onSave: (data: { name: string; items: ComboFoodRef[] }) => void;
}

export const ComboEditorModal: React.FC<ComboEditorModalProps> = ({
  isOpen,
  onClose,
  initialCombo,
  availableFoods,
  onSave,
}) => {
  const [comboName, setComboName] = useState('');
  const [items, setItems] = useState<ComboFoodRef[]>([]);
  const [selectedFoodIdToAdd, setSelectedFoodIdToAdd] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialCombo) {
        setComboName(initialCombo.name);
        setItems([...initialCombo.items]);
      } else {
        setComboName('');
        setItems([]);
      }
      setSelectedFoodIdToAdd('');
      setError('');
    }
  }, [isOpen, initialCombo, availableFoods]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedFoodIdToAdd) return;
    setItems((prev) => [...prev, { foodId: selectedFoodIdToAdd, multiplier: 1.0 }]);
    setSelectedFoodIdToAdd('');
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMultiplier = (index: number, multiplier: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, multiplier } : item))
    );
  };

  // Estimate calories
  const totalCalories = items.reduce((acc, curr) => {
    const food = availableFoods.find((f) => f.id === curr.foodId);
    return acc + (food ? Math.round(food.base_calories * curr.multiplier) : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comboName.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên cho Combo');
      return;
    }
    if (items.length === 0) {
      setError('Combo cần có ít nhất 1 món ăn');
      return;
    }
    onSave({ name: trimmed, items });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="combo-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#FF5722] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 id="combo-editor-title" className="font-bold text-base text-slate-900">
                {initialCombo ? 'Chỉnh sửa Combo' : 'Tạo Combo mới'}
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Combo Name */}
          <div className="space-y-1.5">
            <label htmlFor="combo-editor-name" className="text-xs font-bold text-slate-700 block">
              Tên Combo
            </label>
            <input
              type="text"
              id="combo-editor-name"
              value={comboName}
              onChange={(e) => {
                setComboName(e.target.value);
                if (error) setError('');
              }}
              placeholder="VD: Cơm trưa văn phòng, Bữa sáng đầy đủ..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors"
              autoFocus
            />
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
          </div>

          {/* Items in Combo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Các món trong Combo: {items.length}</span>
              <span className="text-[#FF5722] tabular-nums">~{totalCalories} kcal</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const food = availableFoods.find((f) => f.id === item.foodId);
                  const cal = food ? Math.round(food.base_calories * item.multiplier) : 0;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <span className="font-bold text-slate-800 truncate flex-1">
                        {food?.name || item.foodId}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={item.multiplier}
                          onChange={(e) => handleUpdateMultiplier(idx, Number(e.target.value))}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value={0.75}>0.75x</option>
                          <option value={1.0}>1.0x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                        </select>

                        <span className="text-slate-500 font-semibold tabular-nums w-14 text-right">
                          {cal} kcal
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-600">Chưa có món nào trong Combo</p>
                  <p className="text-[11px] text-slate-400">Chọn món ở mục bên dưới rồi bấm Thêm món</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Food Row */}
          <div className="flex items-center gap-2 pt-1">
            <select
              value={selectedFoodIdToAdd}
              onChange={(e) => setSelectedFoodIdToAdd(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="">-- Chọn món để thêm vào combo --</option>
              {availableFoods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.base_calories} kcal)
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedFoodIdToAdd}
              onClick={handleAddItem}
              className="px-3 py-2 bg-slate-900 disabled:opacity-40 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm món</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialCombo ? 'Cập nhật Combo' : 'Tạo Combo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

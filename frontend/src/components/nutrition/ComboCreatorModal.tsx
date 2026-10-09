'use client';

import React, { useState, useEffect } from 'react';
import { FoodLogItem } from '@/types/nutrition.types';
import { X, BookmarkPlus, Check } from 'lucide-react';

interface ComboCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: FoodLogItem[];
  onCreateCombo: (name: string) => void;
}

export const ComboCreatorModal: React.FC<ComboCreatorModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onCreateCombo,
}) => {
  const [comboName, setComboName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComboName('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalCalories = selectedItems.reduce((acc, curr) => acc + curr.calories, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comboName.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên cho Combo');
      return;
    }
    onCreateCombo(trimmed);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="combo-creator-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#FF5722] flex items-center justify-center">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="combo-creator-title" className="font-bold text-base text-slate-900">
                Lưu thành Combo
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Selected Items Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Các món đã chọn ({selectedItems.length})</span>
              <span className="text-[#FF5722] tabular-nums">~{totalCalories} kcal</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60"
                >
                  <span className="font-medium text-slate-800 truncate">{item.name}</span>
                  <div className="flex items-center gap-2 text-slate-500 tabular-nums text-[11px] shrink-0">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-600">
                      {item.multiplier}x
                    </span>
                    <span>{item.calories} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="combo-name-input" className="text-xs font-bold text-slate-700 block">
              Tên Combo
            </label>
            <input
              type="text"
              id="combo-name-input"
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

          {/* Actions */}
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
              <span>Lưu Combo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

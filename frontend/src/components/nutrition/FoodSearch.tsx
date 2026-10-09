'use client';

import React, { useState } from 'react';
import { FoodItem } from '@/types/nutrition.types';
import { Search, X, Plus, Utensils } from 'lucide-react';

interface FoodSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClearQuery: () => void;
  results: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
}

const CATEGORIES = ['Tất cả', 'Món nước', 'Cơm', 'Bánh mì', 'Món canh', 'Món thêm'];

export const FoodSearch: React.FC<FoodSearchProps> = ({
  query,
  onQueryChange,
  onClearQuery,
  results,
  onSelectFood,
}) => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const filteredResults = React.useMemo(() => {
    if (activeCategory === 'Tất cả') return results;
    return results.filter((f) => f.category === activeCategory);
  }, [results, activeCategory]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search Input Bar */}
      <div className="relative shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          id="food-search-input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm phở bò, cơm tấm, bún bò, bánh mì..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-all"
          aria-label="Tìm kiếm món ăn"
        />
        {query && (
          <button
            type="button"
            onClick={onClearQuery}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              if (query) onClearQuery();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat && !query
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Results List */}
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
        {filteredResults.length > 0 ? (
          filteredResults.map((food) => (
            <div
              key={food.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectFood(food)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectFood(food);
                }
              }}
              className="group p-3 rounded-xl border border-slate-100 hover:border-orange-200 bg-white hover:bg-orange-50/30 transition-all flex items-center justify-between gap-3 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
              aria-label={`Chọn món ${food.name}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-[#FF5722] transition-colors truncate">
                    {food.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium shrink-0">
                    {food.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {food.base_calories} kcal
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-[11px]">
                    Khẩu phần: {food.base_serving}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 tabular-nums">
                  <span>P: {food.base_macros.protein}g</span>
                  <span>C: {food.base_macros.carbs}g</span>
                  <span>F: {food.base_macros.fat}g</span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#FF5722] text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
            <Utensils className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-600">
              Không tìm thấy món ăn phù hợp
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useMemo } from 'react';
import { FoodItem, FoodItemType } from '@/types/nutrition.types';
import { Search, X, Plus, Utensils, Apple, Soup } from 'lucide-react';
import { NoSearchResults } from '@/components/ui/NoSearchResults';

interface FoodSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClearQuery: () => void;
  results: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
}

const TYPE_FILTERS: { label: string; value: 'ALL' | FoodItemType }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Món ăn (DISH)', value: 'DISH' },
  { label: 'Nguyên liệu 100g (RAW)', value: 'RAW' },
];

const CATEGORIES = [
  'Tất cả',
  'Món nước',
  'Cơm',
  'Bánh mì',
  'Món canh',
  'Món mặn',
  'Thịt',
  'Thủy hải sản',
  'Rau củ',
  'Trái cây',
  'Trứng',
  'Ngũ cốc & Hạt',
  'Món chay',
];

const MAX_DISPLAY_RESULTS = 60;

export const FoodSearch: React.FC<FoodSearchProps> = ({
  query,
  onQueryChange,
  onClearQuery,
  results,
  onSelectFood,
}) => {
  const [activeType, setActiveType] = useState<'ALL' | FoodItemType>('ALL');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      if (activeType !== 'ALL' && item.item_type !== activeType) {
        return false;
      }
      if (activeCategory !== 'Tất cả' && item.category !== activeCategory) {
        return false;
      }
      return true;
    });
  }, [results, activeType, activeCategory]);

  const displayedResults = useMemo(() => {
    return filteredResults.slice(0, MAX_DISPLAY_RESULTS);
  }, [filteredResults]);

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
          placeholder="Tìm phở bò, ức gà, cá hồi, cơm tấm, rau muống..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-all"
          aria-label="Tìm kiếm món ăn và nguyên liệu"
        />
        {query && (
          <button
            type="button"
            onClick={onClearQuery}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Item Type Selector: Dish vs Raw Ingredient */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setActiveType(t.value)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeType === t.value
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category Horizontal Scrolling Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 shrink-0">
        <span>
          Tìm thấy <strong className="text-slate-700">{filteredResults.length}</strong> món / nguyên liệu
        </span>
        {filteredResults.length > MAX_DISPLAY_RESULTS && (
          <span>Hiển thị {MAX_DISPLAY_RESULTS} kết quả đầu tiên</span>
        )}
      </div>

      {/* Search Results List */}
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
        {displayedResults.length > 0 ? (
          displayedResults.map((food) => {
            const isRaw = food.item_type === 'RAW';
            return (
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-[#FF5722] transition-colors truncate">
                      {food.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                        isRaw
                          ? 'bg-sky-50 text-sky-700 border border-sky-100'
                          : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}
                    >
                      {isRaw ? 'RAW 100g' : 'Món ăn'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium shrink-0">
                      {food.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {food.base_calories} kcal
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 text-[11px]">
                      Định lượng: {food.base_serving || '100g'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 tabular-nums">
                    <span>P: {food.base_macros.protein}g</span>
                    <span>C: {food.base_macros.carbs}g</span>
                    <span>F: {food.base_macros.fat}g</span>
                    {food.fiber ? <span>• Xơ: {food.fiber}g</span> : null}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#FF5722] text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            );
          })
        ) : (
          <NoSearchResults
            query={query}
            filterLabel={activeCategory !== 'Tất cả' ? activeCategory : undefined}
            onClear={() => {
              onClearQuery();
              setActiveCategory('Tất cả');
              setActiveType('ALL');
            }}
            title="Không tìm thấy món hoặc nguyên liệu"
            description={`Không tìm thấy kết quả nào khớp với "${query || activeCategory}". Bạn có thể chọn danh mục khác hoặc xóa bộ lọc tìm kiếm.`}
            className="py-6 border-dashed"
          />
        )}
      </div>
    </div>
  );
};

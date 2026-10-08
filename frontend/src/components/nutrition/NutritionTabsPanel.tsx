'use client';

import React, { useState } from 'react';
import { FoodItem, FoodLogItem, MealType, SavedCombo } from '@/types/nutrition.types';
import { DailyLog } from './DailyLog';
import { FoodSearch } from './FoodSearch';
import { Calendar, Search } from 'lucide-react';

interface NutritionTabsPanelProps {
  foodLog: FoodLogItem[];
  selectedLogIds: string[];
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onOpenComboModal: () => void;
  onEditFood: (item: FoodLogItem) => void;
  onDeleteFood: (id: string) => void;
  onDropCombo: (meal: MealType, combo: SavedCombo) => void;
  // Search props
  query: string;
  onQueryChange: (q: string) => void;
  onClearQuery: () => void;
  searchResults: FoodItem[];
  onSelectFoodFromSearch: (food: FoodItem) => void;
}

export const NutritionTabsPanel: React.FC<NutritionTabsPanelProps> = ({
  foodLog,
  selectedLogIds,
  onToggleSelect,
  onClearSelection,
  onOpenComboModal,
  onEditFood,
  onDeleteFood,
  onDropCombo,
  query,
  onQueryChange,
  onClearQuery,
  searchResults,
  onSelectFoodFromSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'search'>('log');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col h-[520px]">
      {/* Navigation Header with Clean Tabs (redundant extra action button removed) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'log'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Nhật ký hôm nay</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
                activeTab === 'log' ? 'bg-orange-50 text-[#FF5722]' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {foodLog.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Tìm kiếm &amp; Thêm món</span>
          </button>
        </div>
      </div>

      {/* Tab Panels (flex-1 min-h-0 allows internal child scrolling without expanding card) */}
      <div className="flex-1 min-h-0 pt-3">
        {activeTab === 'log' ? (
          <DailyLog
            foodLog={foodLog}
            selectedLogIds={selectedLogIds}
            onToggleSelect={onToggleSelect}
            onClearSelection={onClearSelection}
            onOpenComboModal={onOpenComboModal}
            onEditFood={onEditFood}
            onDeleteFood={onDeleteFood}
            onDropCombo={onDropCombo}
          />
        ) : (
          <FoodSearch
            query={query}
            onQueryChange={onQueryChange}
            onClearQuery={onClearQuery}
            results={searchResults}
            onSelectFood={(food) => {
              onSelectFoodFromSearch(food);
            }}
          />
        )}
      </div>
    </div>
  );
};

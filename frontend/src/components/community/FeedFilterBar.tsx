'use strict';
'use client';

import React from 'react';
import { Search, Video, X, Filter } from 'lucide-react';

interface FeedFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterGroup: string;
  onFilterGroupChange: (val: string) => void;
  onlyPoseCheck: boolean;
  onOnlyPoseCheckChange: (val: boolean) => void;
  totalResults: number;
}

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterGroup,
  onFilterGroupChange,
  onlyPoseCheck,
  onOnlyPoseCheckChange,
  totalResults,
}) => {
  return (
    <div className="sticky top-16 z-10 bg-[#F7F3EA]/95 backdrop-blur-md border-b border-[#B9A78E]/30 py-3 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-[680px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#76583E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white/90 focus:bg-white rounded-xl border border-[#B9A78E]/40 text-xs font-medium text-[#1F2328] placeholder-[#76583E]/70 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76583E] hover:text-[#1F2328] p-0.5 rounded-full hover:bg-[#E8E1D5] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2">
          {/* Muscle Group Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filterGroup}
              onChange={(e) => onFilterGroupChange(e.target.value)}
              className="w-full appearance-none bg-white/90 hover:bg-white px-3.5 pr-8 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-semibold text-[#1F2328] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] cursor-pointer shadow-sm transition-all"
            >
              <option value="all">All Muscle Groups</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="shoulders">Shoulders</option>
              <option value="core">Core</option>
            </select>
            <Filter className="w-3 h-3 text-[#76583E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Pose Check Only toggle */}
          <label
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all shadow-sm ${
              onlyPoseCheck
                ? 'bg-[#FF6B35]/15 border-[#FF6B35] text-[#FF6B35]'
                : 'bg-white/90 hover:bg-white border-[#B9A78E]/40 text-[#76583E] hover:text-[#1F2328]'
            }`}
          >
            <input
              type="checkbox"
              checked={onlyPoseCheck}
              onChange={(e) => onOnlyPoseCheckChange(e.target.checked)}
              className="sr-only"
            />
            <Video className={`w-3.5 h-3.5 ${onlyPoseCheck ? 'text-[#FF6B35]' : 'text-[#76583E]'}`} />
            <span className="whitespace-nowrap">Pose Check Only</span>
          </label>
        </div>
      </div>

      {/* Active Filter Chips indicator if filtered */}
      {(searchQuery || filterGroup !== 'all' || onlyPoseCheck) && (
        <div className="max-w-[680px] mx-auto mt-2 flex items-center justify-between text-[11px] text-[#76583E]">
          <span>
            Found <strong className="text-[#1F2328]">{totalResults}</strong> exercise {totalResults === 1 ? 'post' : 'posts'}
          </span>
          <button
            onClick={() => {
              onSearchChange('');
              onFilterGroupChange('all');
              onOnlyPoseCheckChange(false);
            }}
            className="text-[#FF6B35] hover:underline font-semibold"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};

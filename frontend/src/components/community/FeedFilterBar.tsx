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
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 space-y-2 select-none">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập, kỹ thuật..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 focus:bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5722] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Xóa tìm kiếm"
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
              className="w-full appearance-none bg-slate-50 hover:bg-white px-3 pr-7 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5722] cursor-pointer transition-colors"
            >
              <option value="all">Tất cả nhóm cơ</option>
              <option value="chest">Ngực</option>
              <option value="back">Lưng &amp; Xô</option>
              <option value="legs">Đùi &amp; Mông</option>
              <option value="shoulders">Vai</option>
              <option value="core">Bụng &amp; Lõi</option>
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Pose Check Only toggle */}
          <label
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-colors ${
              onlyPoseCheck
                ? 'bg-orange-50 border-[#FF5722] text-[#FF5722]'
                : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <input
              type="checkbox"
              checked={onlyPoseCheck}
              onChange={(e) => onOnlyPoseCheckChange(e.target.checked)}
              className="sr-only"
            />
            <Video className={`w-3.5 h-3.5 ${onlyPoseCheck ? 'text-[#FF5722]' : 'text-slate-400'}`} />
            <span className="whitespace-nowrap">Có Pose Check</span>
          </label>
        </div>
      </div>

      {/* Active Filter Results */}
      {(searchQuery || filterGroup !== 'all' || onlyPoseCheck) && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>
            Tìm thấy <strong className="text-slate-900 tabular-nums">{totalResults}</strong> bài tập phù hợp
          </span>
          <button
            onClick={() => {
              onSearchChange('');
              onFilterGroupChange('all');
              onOnlyPoseCheckChange(false);
            }}
            className="text-[#FF5722] hover:text-[#E64A19] font-bold cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

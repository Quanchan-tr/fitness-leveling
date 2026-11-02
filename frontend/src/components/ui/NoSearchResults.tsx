import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface NoSearchResultsProps {
  query?: string;
  filterLabel?: string;
  onClear: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export const NoSearchResults: React.FC<NoSearchResultsProps> = ({
  query,
  filterLabel,
  onClear,
  title = 'Không tìm thấy kết quả phù hợp',
  description,
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center space-y-3.5 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
        <SearchX className="w-6 h-6" />
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
          {title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description || (
            <>
              Không có dữ liệu nào khớp với{' '}
              {query && (
                <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                  &ldquo;{query}&rdquo;
                </span>
              )}
              {filterLabel && (
                <span>
                  {' '}
                  trong bộ lọc <span className="font-semibold text-slate-700">{filterLabel}</span>
                </span>
              )}
              . Hãy thử thay đổi từ khóa hoặc đặt lại bộ lọc.
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Xóa tìm kiếm &amp; Đặt lại</span>
      </button>
    </div>
  );
};


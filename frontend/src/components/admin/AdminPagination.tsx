'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/lib/adminApi';

interface AdminPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  meta,
  onPageChange,
  disabled = false,
}) => {
  if (meta.total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="text-xs text-[#6B7280] tabular-nums">
        Trang <span className="font-semibold text-[#111111]">{meta.page}</span> /{' '}
        <span className="font-semibold text-[#111111]">{meta.last_page}</span> • Tổng{' '}
        <span className="font-semibold text-[#111111]">
          {meta.total.toLocaleString('vi-VN')}
        </span>{' '}
        mục
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={disabled || meta.page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Trước</span>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={disabled || meta.page >= meta.last_page}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <span>Sau</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

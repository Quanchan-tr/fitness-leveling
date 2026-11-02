'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const PageLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen animate-in fade-in duration-100">
      {/* Top progress bar with animated brand shimmer */}
      <div className="h-0.5 w-full bg-slate-100 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-[#FF5722] w-1/3 animate-[shimmer_1.2s_infinite]" />
      </div>

      {/* TopBar Skeleton */}
      <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-36 h-6 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-24 h-8 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </header>

      {/* Main Page Body Skeleton */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3">
          <Skeleton className="w-48 h-7 rounded-lg" />
          <Skeleton className="w-80 h-4 rounded-md" />
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="w-32 h-8 rounded-lg" />
              <Skeleton className="w-full h-3 rounded" />
            </div>
          ))}
        </div>

        {/* Content Section Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <Skeleton className="w-40 h-5 rounded" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="w-full h-14 rounded-xl" />
            <Skeleton className="w-full h-14 rounded-xl" />
            <Skeleton className="w-full h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};


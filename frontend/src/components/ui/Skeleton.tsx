import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const ExerciseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col justify-between gap-3.5 shadow-2xs">
      <div className="flex items-start gap-3">
        <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-16 h-4 rounded-md" />
            <Skeleton className="w-12 h-4 rounded-md" />
          </div>
          <Skeleton className="w-3/4 h-5 rounded-md" />
          <Skeleton className="w-1/2 h-3.5 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Skeleton className="flex-1 h-8 rounded-xl" />
        <Skeleton className="w-20 h-8 rounded-xl" />
      </div>
    </div>
  );
};

export const RoutineCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 w-3/4">
          <Skeleton className="w-2/3 h-5 rounded-md" />
          <Skeleton className="w-1/2 h-3.5 rounded-md" />
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="w-full h-10 rounded-xl" />
        <Skeleton className="w-full h-10 rounded-xl" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <Skeleton className="w-20 h-4 rounded-md" />
        <Skeleton className="w-24 h-8 rounded-xl" />
      </div>
    </div>
  );
};

export const FeedPostSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="w-32 h-4 rounded-md" />
          <Skeleton className="w-20 h-3 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-3/4 h-5 rounded-md" />
      <Skeleton className="w-full h-16 rounded-xl" />
      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
        <Skeleton className="w-16 h-6 rounded-lg" />
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
    </div>
  );
};


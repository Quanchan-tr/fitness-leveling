'use strict';
'use client';

import React, { useState } from 'react';
import { Exercise } from '@/types/workout.types';
import { Plus, Check, Dumbbell, Sparkles } from 'lucide-react';

interface ExerciseDatabaseItemProps {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
  isRecentlyAdded?: boolean;
}

export const ExerciseDatabaseItem: React.FC<ExerciseDatabaseItemProps> = ({
  exercise,
  onAdd,
  isRecentlyAdded = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const getMuscleBadgeColor = (group?: string) => {
    const g = (group || '').toLowerCase();
    if (g.includes('chest') || g.includes('ngực')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (g.includes('back') || g.includes('lưng')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (g.includes('leg') || g.includes('chân') || g.includes('đùi')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (g.includes('shoulder') || g.includes('vai')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (g.includes('arm') || g.includes('tay')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (g.includes('waist') || g.includes('core') || g.includes('bụng') || g.includes('abs')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (g.includes('cardio')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const muscleLabel = exercise.target_muscle || exercise.body_part || exercise.category || exercise.muscle_group || 'General';
  const mediaUrl = exercise.gif_url || exercise.thumbnail_url;

  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group">
      {/* Thumbnail GIF / Fallback Icon */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
        {mediaUrl && !imgError ? (
          <img
            src={mediaUrl}
            alt={exercise.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Dumbbell className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#FF5722] transition-colors truncate capitalize">
            {exercise.name}
          </h4>

          {/* AI Pose Check Badge */}
          {exercise.has_ai_check && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Pose Check</span>
            </span>
          )}

          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${getMuscleBadgeColor(
              muscleLabel
            )}`}
          >
            {muscleLabel}
          </span>

          {exercise.category && exercise.category !== muscleLabel && (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 capitalize">
              {exercise.category}
            </span>
          )}
        </div>

        {exercise.nameVi && (
          <p className="text-[11px] font-medium text-slate-500 mb-0.5 truncate">
            {exercise.nameVi}
          </p>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
          {exercise.equipment && (
            <span>
              Dụng cụ: <strong className="text-slate-600 font-semibold capitalize">{exercise.equipment}</strong>
            </span>
          )}
          {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
            <>
              <span>•</span>
              <span className="truncate">
                Cơ phụ: <strong className="text-slate-600 font-semibold">{exercise.secondary_muscles.slice(0, 2).join(', ')}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={() => onAdd(exercise)}
        className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border shadow-2xs ${
          isRecentlyAdded
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-slate-50 hover:bg-[#FF5722] text-slate-700 hover:text-white border-slate-200 hover:border-[#FF5722]'
        }`}
      >
        {isRecentlyAdded ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Đã thêm</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </>
        )}
      </button>
    </div>
  );
};

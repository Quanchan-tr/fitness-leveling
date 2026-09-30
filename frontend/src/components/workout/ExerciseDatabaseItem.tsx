'use strict';
'use client';

import React from 'react';
import { ExerciseDbItem } from '@/types/workout.types';
import { Plus, Check } from 'lucide-react';

interface ExerciseDatabaseItemProps {
  exercise: ExerciseDbItem;
  onAdd: (exercise: ExerciseDbItem) => void;
  isRecentlyAdded?: boolean;
}

export const ExerciseDatabaseItem: React.FC<ExerciseDatabaseItemProps> = ({
  exercise,
  onAdd,
  isRecentlyAdded = false,
}) => {
  const getMuscleBadgeColor = (group: string) => {
    switch (group) {
      case 'Chest':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Back':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Legs':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Shoulders':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Arms':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Core':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#FF5722] transition-colors truncate">
            {exercise.name}
          </h4>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getMuscleBadgeColor(
              exercise.muscleGroup
            )}`}
          >
            {exercise.muscleGroup}
          </span>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
            {exercise.category}
          </span>
        </div>

        {exercise.nameVi && (
          <p className="text-[11px] font-medium text-slate-500 mb-0.5 truncate">
            {exercise.nameVi}
          </p>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          {exercise.equipment && (
            <span>Dụng cụ: <strong className="text-slate-600 font-semibold">{exercise.equipment}</strong></span>
          )}
          <span>•</span>
          <span>
            Đề xuất: <strong className="text-slate-600 font-semibold">{exercise.defaultSets} sets × {exercise.defaultReps} reps</strong>
          </span>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => onAdd(exercise)}
        className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border ${
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

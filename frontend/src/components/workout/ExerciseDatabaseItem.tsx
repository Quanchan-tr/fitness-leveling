'use strict';
'use client';

import React from 'react';
import { ExerciseDbItem } from '@/types/workout.types';
import { Plus, Check, Dumbbell, ShieldCheck } from 'lucide-react';

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
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]';
      case 'Back':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#86EFAC]';
      case 'Legs':
        return 'bg-[#FAF5FF] text-[#9333EA] border-[#D8B4FE]';
      case 'Shoulders':
        return 'bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]';
      case 'Arms':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
      case 'Core':
        return 'bg-[#ECFEFF] text-[#0891B2] border-[#67E8F9]';
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  return (
    <div className="p-3.5 bg-white rounded-xl border border-[#B9A78E]/30 hover:border-[#FF6B35]/50 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <h4 className="text-xs sm:text-sm font-black text-[#1F2328] group-hover:text-[#FF6B35] transition-colors line-clamp-1">
            {exercise.name}
          </h4>
          <span
            className={`text-[9.5px] font-black px-1.5 py-0.2 rounded border ${getMuscleBadgeColor(
              exercise.muscleGroup
            )}`}
          >
            {exercise.muscleGroup}
          </span>
          <span className="text-[9.5px] font-bold text-[#76583E] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#B9A78E]/20">
            {exercise.category}
          </span>
        </div>

        <p className="text-[11px] font-semibold text-[#76583E] mb-1 line-clamp-1">
          {exercise.nameVi}
        </p>

        <div className="flex items-center gap-2 text-[10.5px] text-[#888888]">
          {exercise.equipment && (
            <span>Dụng cụ: <strong className="text-[#4A4A4A]">{exercise.equipment}</strong></span>
          )}
          <span>•</span>
          <span>
            Đề xuất: <strong className="text-[#4A4A4A]">{exercise.defaultSets} sets × {exercise.defaultReps} reps</strong>
          </span>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => onAdd(exercise)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
          isRecentlyAdded
            ? 'bg-[#22c55e] text-white shadow-xs'
            : 'bg-[#FAF8F5] hover:bg-[#FF6B35] text-[#1F2328] hover:text-white border border-[#B9A78E]/30 hover:border-[#FF6B35] shadow-2xs'
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

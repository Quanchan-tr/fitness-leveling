'use strict';
'use client';

import React from 'react';
import { SetEntry } from '@/types/workout.types';
import { Check, Trash2 } from 'lucide-react';

interface SetRowProps {
  set: SetEntry;
  onUpdate: (updatedSet: SetEntry) => void;
  onDelete?: () => void;
  onToggleComplete: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  const getRpeBgColor = (rpe: number | null) => {
    if (rpe === null || rpe === undefined) return 'bg-[#FAF8F5] text-[#888888] border-[#B9A78E]/30';
    if (rpe <= 4) return 'bg-[#22c55e]/15 text-[#16a34a] border-[#22c55e]/40 font-black';
    if (rpe <= 7) return 'bg-[#f59e0b]/15 text-[#d97706] border-[#f59e0b]/40 font-black';
    return 'bg-[#ef4444]/15 text-[#dc2626] border-[#ef4444]/40 font-black';
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value) || 0);
    onUpdate({ ...set, actualWeightKg: val });
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0);
    onUpdate({ ...set, actualReps: val });
  };

  const handleRpeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
    onUpdate({ ...set, rpe: val });
  };

  return (
    <div
      className={`group relative grid items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 border ${
        set.isCompleted
          ? 'bg-[#dcfce7]/70 border-[#22c55e]/30 shadow-2xs'
          : 'bg-white/90 hover:bg-white border-[#B9A78E]/25 hover:border-[#B9A78E]/40'
      }`}
      style={{
        gridTemplateColumns: '32px minmax(70px, 1fr) minmax(130px, 1.4fr) 68px 38px',
      }}
    >
      {/* 1. Set Number */}
      <div className="flex items-center justify-center">
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
            set.isCompleted
              ? 'bg-[#22c55e] text-white shadow-2xs'
              : 'bg-[#FAF8F5] text-[#76583E] border border-[#B9A78E]/30'
          }`}
        >
          {set.setNumber}
        </span>
      </div>

      {/* 2. Target Reps x Weight */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-[#76583E] tracking-tight">Mục tiêu</span>
        <span className="text-xs font-black text-[#1F2328]">
          {set.targetWeightKg > 0 ? `${set.targetWeightKg}kg` : 'BW'} × {set.targetReps}
        </span>
      </div>

      {/* 3. Actual Inputs (Kg & Reps) */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded-lg border border-[#B9A78E]/30 focus-within:border-[#FF6B35] focus-within:ring-1 focus-within:ring-[#FF6B35]">
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder={set.targetWeightKg.toString()}
            value={set.actualWeightKg !== null ? set.actualWeightKg : ''}
            onChange={handleWeightChange}
            className="w-full bg-transparent text-xs font-black text-[#1F2328] focus:outline-none placeholder:text-[#888888]"
          />
          <span className="text-[10px] font-bold text-[#76583E]">kg</span>
        </div>

        <div className="flex-1 flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded-lg border border-[#B9A78E]/30 focus-within:border-[#FF6B35] focus-within:ring-1 focus-within:ring-[#FF6B35]">
          <input
            type="number"
            min="0"
            placeholder={set.targetReps.toString()}
            value={set.actualReps !== null ? set.actualReps : ''}
            onChange={handleRepsChange}
            className="w-full bg-transparent text-xs font-black text-[#1F2328] focus:outline-none placeholder:text-[#888888]"
          />
          <span className="text-[10px] font-bold text-[#76583E]">rep</span>
        </div>
      </div>

      {/* 4. RPE Select */}
      <div>
        <select
          value={set.rpe !== null && set.rpe !== undefined ? set.rpe : ''}
          onChange={handleRpeChange}
          className={`w-full text-[11px] py-1 px-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#FF6B35] cursor-pointer transition-all ${getRpeBgColor(
            set.rpe
          )}`}
          title="Rate of Perceived Exertion (1 = Rất nhẹ, 10 = Hết sức)"
        >
          <option value="">RPE</option>
          <option value="4">RPE 1-4 (Nhẹ)</option>
          <option value="5">RPE 5</option>
          <option value="6">RPE 6</option>
          <option value="7">RPE 7 (Vừa)</option>
          <option value="8">RPE 8 (Nặng)</option>
          <option value="9">RPE 9 (Gần max)</option>
          <option value="10">RPE 10 (Hết sức)</option>
        </select>
      </div>

      {/* 5. Complete Button Checkbox & Delete */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={onToggleComplete}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            set.isCompleted
              ? 'bg-[#22c55e] text-white shadow-sm ring-2 ring-[#22c55e]/30 scale-105'
              : 'bg-[#FAF8F5] hover:bg-[#FF6B35] text-[#76583E] hover:text-white border border-[#B9A78E]/30'
          }`}
          title={set.isCompleted ? 'Hủy đánh dấu hoàn thành' : 'Đánh dấu xong set'}
        >
          <Check className={`w-4 h-4 ${set.isCompleted ? 'stroke-[3]' : 'stroke-[2]'}`} />
        </button>

        {onDelete && (
          <button
            onClick={onDelete}
            className="hidden group-hover:flex absolute -right-2 top-1/2 -translate-y-1/2 p-1 rounded-md bg-white text-[#ef4444] border border-[#ef4444]/30 shadow-xs hover:bg-[#ef4444] hover:text-white transition-all cursor-pointer"
            title="Xóa set này"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

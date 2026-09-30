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
    if (rpe === null || rpe === undefined) return 'bg-slate-50 text-slate-400 border-slate-200';
    if (rpe <= 4) return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    if (rpe <= 7) return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
    return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
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
      className={`group relative grid items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${
        set.isCompleted
          ? 'bg-emerald-50/60 border-emerald-200'
          : 'bg-white hover:bg-slate-50/50 border-slate-200'
      }`}
      style={{
        gridTemplateColumns: '32px minmax(70px, 1fr) minmax(130px, 1.4fr) 68px 38px',
      }}
    >
      {/* 1. Set Number */}
      <div className="flex items-center justify-center">
        <span
          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold tabular-nums ${
            set.isCompleted
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {set.setNumber}
        </span>
      </div>

      {/* 2. Target Reps x Weight */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Mục tiêu</span>
        <span className="text-xs font-bold text-slate-800 tabular-nums">
          {set.targetWeightKg > 0 ? `${set.targetWeightKg}kg` : 'BW'} × {set.targetReps}
        </span>
      </div>

      {/* 3. Actual Inputs (Kg & Reps) */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 focus-within:border-[#FF5722]">
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder={set.targetWeightKg.toString()}
            value={set.actualWeightKg !== null ? set.actualWeightKg : ''}
            onChange={handleWeightChange}
            className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 tabular-nums"
          />
          <span className="text-[10px] font-medium text-slate-400">kg</span>
        </div>

        <div className="flex-1 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 focus-within:border-[#FF5722]">
          <input
            type="number"
            min="0"
            placeholder={set.targetReps.toString()}
            value={set.actualReps !== null ? set.actualReps : ''}
            onChange={handleRepsChange}
            className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 tabular-nums"
          />
          <span className="text-[10px] font-medium text-slate-400">rep</span>
        </div>
      </div>

      {/* 4. RPE Selector */}
      <div>
        <select
          value={set.rpe ?? ''}
          onChange={handleRpeChange}
          className={`w-full text-[11px] px-1 py-1 rounded border cursor-pointer focus:outline-none ${getRpeBgColor(
            set.rpe
          )}`}
          title="Thang đo RPE (6: Dễ, 8: Chuẩn Hypertrophy, 10: Kiệt sức)"
        >
          <option value="">RPE</option>
          <option value="6">RPE 6 (Dễ)</option>
          <option value="7">RPE 7 (Vừa)</option>
          <option value="8">RPE 8 (Chuẩn)</option>
          <option value="9">RPE 9 (Nặng)</option>
          <option value="10">RPE 10 (Max)</option>
        </select>
      </div>

      {/* 5. Complete Checkbox / Action */}
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={onToggleComplete}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer border ${
            set.isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-400'
          }`}
          title={set.isCompleted ? 'Bỏ chọn hoàn thành' : 'Đánh dấu đã hoàn thành set'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
            title="Xóa set này"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

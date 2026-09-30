'use strict';
'use client';

import React from 'react';
import { WorkoutSession } from '@/types/workout.types';
import { CheckCircle2, PlayCircle, Calendar, Moon } from 'lucide-react';

interface DayCardProps {
  session: WorkoutSession;
  isSelected: boolean;
  isToday: boolean;
  onSelect: () => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  session,
  isSelected,
  isToday,
  onSelect,
}) => {
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );

  const getStatusBadge = () => {
    switch (session.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Đã xong
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
            <PlayCircle className="w-3 h-3 text-[#FF5722]" />
            Đang tập
          </span>
        );
      case 'rest':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            <Moon className="w-3 h-3 text-slate-400" />
            Nghỉ
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            <Calendar className="w-3 h-3 text-slate-400" />
            Lên lịch
          </span>
        );
    }
  };

  const dayShortMapVi: Record<string, string> = {
    Mon: 'T2',
    Tue: 'T3',
    Wed: 'T4',
    Thu: 'T5',
    Fri: 'T6',
    Sat: 'T7',
    Sun: 'CN',
  };

  const dayMapVi: Record<string, string> = {
    Mon: 'Thứ 2',
    Tue: 'Thứ 3',
    Wed: 'Thứ 4',
    Thu: 'Thứ 5',
    Fri: 'Thứ 6',
    Sat: 'Thứ 7',
    Sun: 'Chủ Nhật',
  };

  return (
    <button
      onClick={onSelect}
      className={`relative w-full min-w-0 p-2 sm:p-3 rounded-xl transition-all duration-150 text-left cursor-pointer border ${
        isSelected
          ? 'bg-orange-50/50 border-[#FF5722] ring-1 ring-[#FF5722] z-10'
          : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Today Tag */}
      {isToday && (
        <span className="absolute -top-2 right-1.5 sm:right-2 px-1.5 py-0.2 bg-[#FF5722] text-white text-[8px] sm:text-[9px] font-bold rounded uppercase tracking-wider">
          Hôm nay
        </span>
      )}

      {/* Header: Day and Date */}
      <div className="flex items-center justify-between mb-1 gap-1">
        <span
          className={`text-[11px] sm:text-xs font-black uppercase tracking-wider truncate ${
            isSelected ? 'text-[#FF5722]' : 'text-slate-900'
          }`}
        >
          <span className="sm:hidden">{dayShortMapVi[session.day] || session.day}</span>
          <span className="hidden sm:inline">{dayMapVi[session.day] || session.day}</span>
        </span>
        <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 tabular-nums shrink-0">
          {session.date}
        </span>
      </div>

      {/* Title */}
      <p
        className="text-[11px] sm:text-xs font-semibold text-slate-800 truncate mb-1.5 leading-tight"
        title={session.title}
      >
        {session.status === 'rest' ? 'Nghỉ ngơi' : session.title.split('(')[0].trim()}
      </p>

      {/* Footer Info: Badge & Sets Progress */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
        <div className="scale-90 sm:scale-100 origin-left">{getStatusBadge()}</div>
        {session.status !== 'rest' && totalSets > 0 && (
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tabular-nums hidden sm:inline">
            {completedSets}/{totalSets}s
          </span>
        )}
      </div>
    </button>
  );
};

'use strict';
'use client';

import React from 'react';
import { WorkoutSession } from '@/types/workout.types';
import { CheckCircle2, PlayCircle, Calendar, Moon, Sparkles } from 'lucide-react';

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
          <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#10B981]/20">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            Đã xong
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-[#FF6B35] bg-[#FFF3EB] px-2 py-0.5 rounded-md border border-[#FF6B35]/30 animate-pulse">
            <PlayCircle className="w-3 h-3 text-[#FF6B35]" />
            Đang tập
          </span>
        );
      case 'rest':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#888888] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
            <Moon className="w-3 h-3 text-[#888888]" />
            Nghỉ ngơi
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
            <Calendar className="w-3 h-3 text-[#6B7280]" />
            Kế hoạch
          </span>
        );
    }
  };

  const dayMapVi: Record<string, string> = {
    Mon: 'Thứ 2',
    Tue: 'Thứ 3',
    Wed: 'Thứ 4',
    Thu: 'Thứ 5',
    Fri: 'Thứ 6',
    Sat: 'Thứ 7',
    Sun: 'CN',
  };

  return (
    <button
      onClick={onSelect}
      className={`relative flex-shrink-0 w-[136px] sm:w-[150px] p-3 rounded-2xl transition-all duration-200 text-left cursor-pointer border ${
        isSelected
          ? 'bg-white border-[#FF6B35] ring-2 ring-[#FF6B35]/20 shadow-md scale-102 z-10'
          : 'bg-[#FAF8F5]/80 hover:bg-white border-[#B9A78E]/30 hover:border-[#B9A78E]/60 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Today Pill */}
      {isToday && (
        <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 bg-[#FF6B35] text-white text-[9.5px] font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          Hôm nay
        </span>
      )}

      {/* Header: Day and Date */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-xs font-black uppercase tracking-wider ${
            isSelected ? 'text-[#FF6B35]' : 'text-[#1F2328]'
          }`}
        >
          {dayMapVi[session.day] || session.day}
        </span>
        <span className="text-[11px] font-semibold text-[#76583E]">{session.date}</span>
      </div>

      {/* Title */}
      <p
        className="text-[12px] font-bold text-[#1F2328] line-clamp-1 mb-2 leading-tight"
        title={session.title}
      >
        {session.status === 'rest' ? 'Nghỉ ngơi phục hồi' : session.title.split('(')[0].trim()}
      </p>

      {/* Footer Info: Badge & Sets Progress */}
      <div className="flex items-center justify-between pt-1 border-t border-[#B9A78E]/20">
        <div>{getStatusBadge()}</div>
        {session.status !== 'rest' && totalSets > 0 && (
          <span className="text-[10px] font-bold text-[#76583E]">
            {completedSets}/{totalSets}s
          </span>
        )}
      </div>
    </button>
  );
};

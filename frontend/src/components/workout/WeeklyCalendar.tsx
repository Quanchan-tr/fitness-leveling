'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DaySchedule, WeekDayVi, ScheduleStatus, RoutineItem } from '@/types/fittrack.types';
import { useFitness } from '@/contexts/FitnessContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Bed,
  Play,
  Dumbbell,
  ArrowDownToLine,
  Flame,
  X,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface WeeklyCalendarProps {
  onSelectDay?: (day: DaySchedule) => void;
  onSelectRoutine?: (routine: RoutineItem) => void;
  selectedDayOfWeek?: WeekDayVi;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  onSelectDay,
  onSelectRoutine,
  selectedDayOfWeek = 'Chủ nhật',
}) => {
  const router = useRouter();
  const { schedule, assignRoutineToDay, removeRoutineFromDay, updateDayStatus, startWorkout, todaySchedule } = useFitness();
  const [dragOverDay, setDragOverDay] = useState<WeekDayVi | null>(null);

  const handleDragOver = (e: React.DragEvent, dayOfWeek: WeekDayVi) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverDay !== dayOfWeek) {
      setDragOverDay(dayOfWeek);
    }
  };

  const handleDragLeave = (e: React.DragEvent, dayOfWeek: WeekDayVi) => {
    if (dragOverDay === dayOfWeek) {
      setDragOverDay(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dayOfWeek: WeekDayVi) => {
    e.preventDefault();
    setDragOverDay(null);
    const routineId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/fittrack-routine');
    if (routineId) {
      assignRoutineToDay(dayOfWeek, routineId);
    }
  };

  const getStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã xong</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 animate-pulse">
            <Play className="w-3 h-3 text-[#FF5722] fill-[#FF5722]" />
            <span>Đang tập</span>
          </span>
        );
      case 'rest':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            <Bed className="w-3 h-3 text-slate-400" />
            <span>Nghỉ ngơi</span>
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            <Clock className="w-3 h-3 text-sky-500" />
            <span>Kế hoạch</span>
          </span>
        );
    }
  };

  const todayRoutines = todaySchedule.assignedRoutines && todaySchedule.assignedRoutines.length > 0
    ? todaySchedule.assignedRoutines
    : (todaySchedule.assignedRoutine ? [todaySchedule.assignedRoutine] : []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#FF5722]" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Lịch biểu luyện tập tuần
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {todayRoutines.length > 0 && (
            <button
              type="button"
              onClick={() => {
                startWorkout(todayRoutines[0]);
                router.push('/workout/live');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Bắt đầu chạy routine hôm nay liền luôn"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Bắt đầu tập hôm nay</span>
            </button>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Đã xong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722]" />
              <span>Đang tập</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Nghỉ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Grid with Drag & Drop drop zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-stretch">
        {schedule.map((day) => {
          const isSelected = selectedDayOfWeek === day.dayOfWeek;
          const isDragTarget = dragOverDay === day.dayOfWeek;
          const isToday = day.dayOfWeek === 'Chủ nhật';
          const routinesList = day.assignedRoutines && day.assignedRoutines.length > 0
            ? day.assignedRoutines
            : (day.assignedRoutine ? [day.assignedRoutine] : []);

          return (
            <div
              key={day.dayOfWeek}
              onDragOver={(e) => handleDragOver(e, day.dayOfWeek)}
              onDragLeave={(e) => handleDragLeave(e, day.dayOfWeek)}
              onDrop={(e) => handleDrop(e, day.dayOfWeek)}
              onClick={() => {
                if (routinesList.length > 0 && onSelectRoutine) {
                  onSelectRoutine(routinesList[0]);
                }
                onSelectDay?.(day);
              }}
              className={`rounded-xl p-3 border transition-all relative flex flex-col justify-between cursor-pointer min-h-[160px] select-none ${
                isDragTarget
                  ? 'border-2 border-dashed border-[#FF5722] bg-orange-50/60 scale-[1.02] shadow-md'
                  : isToday
                  ? 'border-[#FF5722]/80 bg-orange-50/20 shadow-xs'
                  : isSelected
                  ? 'border-slate-800 bg-slate-50/80 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    {day.dayOfWeek}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tabular-nums">
                    {day.dateStr}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {routinesList.length > 0 && (
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded" title="Số routine xếp trong ngày (tối đa 3)">
                      {routinesList.length}/3
                    </span>
                  )}
                  {isToday && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF5722] text-white">
                      Hôm nay
                    </span>
                  )}
                </div>
              </div>

              {/* Stacked Routines (Max 3) */}
              <div className="my-2 space-y-1.5 flex-1">
                {routinesList.length > 0 ? (
                  routinesList.map((r, rIdx) => (
                    <div
                      key={`${r.id}-${rIdx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectRoutine) {
                          onSelectRoutine(r);
                        } else {
                          onSelectDay?.(day);
                        }
                      }}
                      className="group p-1.5 rounded-lg border border-slate-200/90 bg-white hover:border-[#FF5722]/60 hover:bg-orange-50/30 transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="text-[11px] font-bold text-slate-900 line-clamp-1 leading-tight flex-1">
                          {r.title}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRoutineFromDay(day.dayOfWeek, r.id);
                          }}
                          className="p-0.5 -mr-0.5 -mt-0.5 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                          title="Xóa routine này khỏi ngày"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium mt-0.5">
                        <span>{r.exercises.length} bài tập</span>
                        {isToday && day.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startWorkout(r);
                              router.push('/workout/live');
                            }}
                            className="text-[#FF5722] hover:text-[#E64A19] font-bold inline-flex items-center gap-0.5"
                            title="Tập routine này ngay"
                          >
                            <Play className="w-2 h-2 fill-current" />
                            <span>Tập</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                    <ArrowDownToLine className="w-4 h-4 mb-0.5 text-slate-300" />
                    <span className="text-[10px] font-medium text-center">Thả routine vào đây</span>
                  </div>
                )}

                {/* Subtle hint when 1 or 2 routines stacked: drop more */}
                {routinesList.length > 0 && routinesList.length < 3 && (
                  <div className="py-0.5 text-center text-[9px] text-slate-400 border border-dashed border-slate-200/70 rounded-md">
                    + Thả thêm (tối đa 3)
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="pt-1.5 border-t border-slate-100/80 flex items-center justify-between gap-1">
                {getStatusBadge(day.status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

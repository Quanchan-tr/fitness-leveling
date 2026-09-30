'use strict';
'use client';

import React from 'react';
import { WorkoutSession, WeekDay } from '@/types/workout.types';
import { DayCard } from './DayCard';
import { CalendarDays } from 'lucide-react';

interface WeeklyScheduleRibbonProps {
  sessions: WorkoutSession[];
  selectedDay: WeekDay;
  todayDay: WeekDay;
  onSelectDay: (day: WeekDay) => void;
}

export const WeeklyScheduleRibbon: React.FC<WeeklyScheduleRibbonProps> = ({
  sessions,
  selectedDay,
  todayDay,
  onSelectDay,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 space-y-3">
      <div className="flex items-center gap-2.5 px-1">
        <CalendarDays className="w-5 h-5 text-[#FF5722]" />
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Lịch tập tuần này
        </h2>
      </div>

      {/* 7 Days Grid Container */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full">
        {sessions.map((session) => (
          <DayCard
            key={session.id}
            session={session}
            isSelected={session.day === selectedDay}
            isToday={session.day === todayDay}
            onSelect={() => onSelectDay(session.day)}
          />
        ))}
      </div>
    </div>
  );
};

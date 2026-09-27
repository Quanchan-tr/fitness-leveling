'use strict';
'use client';

import React, { useRef } from 'react';
import { WorkoutSession, WeekDay } from '@/types/workout.types';
import { DayCard } from './DayCard';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#B9A78E]/30 p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[#FF6B35]" />
          <span className="text-xs font-black uppercase tracking-wider text-[#1F2328]">
            Lịch tập tuần này (Tháng 9/2026)
          </span>
        </div>

        {/* Scroll Controls (Desktop & Mobile) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#76583E] transition-colors border border-[#B9A78E]/20"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#76583E] transition-colors border border-[#B9A78E]/20"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7 Days Ribbon Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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

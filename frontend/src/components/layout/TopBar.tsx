'use strict';
'use client';

import React from 'react';
import { Bell, Flame, Calendar, UserCheck } from 'lucide-react';
import { FitnessUser } from '@/lib/fitnessData';

interface TopBarProps {
  user: FitnessUser;
  streak: number;
}

export const TopBar: React.FC<TopBarProps> = ({ user, streak }) => {
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="h-16 px-6 bg-[#F7F3EA] border-b border-[#B9A78E]/30 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-[#F7F3EA]/90">
      {/* Date & Greeting */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#76583E] font-medium bg-[#E8E1D5] px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span>{todayDate}</span>
        </div>
        <div className="hidden sm:block text-xs font-medium text-[#1F2328]/70">
          Welcome back, <span className="font-bold text-[#1F2328]">{user.name}</span>!
        </div>
      </div>

      {/* Right Controls: Streak, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 bg-[#FF6B35]/10 border border-[#FF6B35]/20 px-3 py-1.5 rounded-xl text-[#FF6B35] font-bold text-xs">
          <Flame className="w-4 h-4 fill-[#FF6B35]" />
          <span>{streak} Days Streak</span>
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl text-[#1F2328]/70 hover:bg-[#E8E1D5] hover:text-[#1F2328] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B35] rounded-full ring-2 ring-[#F7F3EA]" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#B9A78E]/40">
          <div className="w-8 h-8 rounded-xl bg-[#303238] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-[#1F2328] leading-tight flex items-center gap-1">
              <span>{user.name}</span>
              <UserCheck className="w-3 h-3 text-[#7FB069]" />
            </div>
            <div className="text-[10px] text-[#76583E] font-semibold">
              Lv. {user.level} Fitizen
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

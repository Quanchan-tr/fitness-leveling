'use strict';
'use client';

import React from 'react';
import { UserProfile } from '@/types/dashboard.types';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Flame, Dumbbell, HeartPulse, Zap, Trophy, Shirt } from 'lucide-react';

interface HUDOverlayProps {
  user: UserProfile;
  streak?: number;
  onOpenOutfit?: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  user,
  streak = 17,
  onOpenOutfit,
}) => {
  const { name, level, exp, stats } = user;

  return (
    <div className="hud-overlay w-full max-w-[340px] px-3">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 p-3 space-y-2 shadow-lg text-[#1A1A1A]">
        {/* Top Row: Level + Name + Streak */}
        <div className="flex items-center justify-between border-b border-stone-200/60 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E8551F] text-white flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-sm">
              <span className="text-[7px] text-[#FDE047] uppercase leading-none font-bold">LV</span>
              <span className="text-xs leading-none font-black">{level}</span>
            </div>
            <div className="text-left">
              <span className="font-bold text-sm text-[#1A1A1A] block leading-tight">
                {name}
              </span>
              <span className="text-[9.5px] font-semibold text-[#888888] flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5 text-[#F59E0B]" /> Fitizen Cấp {level}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#FFF5ED] border border-[#FF6B35]/30 px-2 py-1 rounded-xl text-[#E8551F] font-black text-xs shrink-0">
            <Flame className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35] animate-pulse" />
            <span>{streak} Ngày</span>
          </div>
        </div>

        {/* Middle: Horizontal EXP Progress Bar */}
        <div className="space-y-0.5">
          <LinearProgress
            label="Kinh Nghiệm"
            valueLabel={`${exp.current}/${exp.max} EXP`}
            value={exp.current}
            max={exp.max}
            height={6}
            fillColor="#FF6B35"
          />
        </div>

        {/* Bottom: 3 RPG Stats (STR, END, AGI) */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          <div className="bg-[#FAF8F5] rounded-xl py-1 px-1.5 flex items-center justify-between border border-stone-200/60">
            <div className="flex items-center gap-1 text-[9px] font-bold text-[#E8551F]">
              <Dumbbell className="w-2.5 h-2.5" /> STR
            </div>
            <span className="text-xs font-black text-[#1A1A1A]">{stats.STR}</span>
          </div>

          <div className="bg-[#FAF8F5] rounded-xl py-1 px-1.5 flex items-center justify-between border border-stone-200/60">
            <div className="flex items-center gap-1 text-[9px] font-bold text-[#22C55E]">
              <HeartPulse className="w-2.5 h-2.5" /> END
            </div>
            <span className="text-xs font-black text-[#1A1A1A]">{stats.END}</span>
          </div>

          <div className="bg-[#FAF8F5] rounded-xl py-1 px-1.5 flex items-center justify-between border border-stone-200/60">
            <div className="flex items-center gap-1 text-[9px] font-bold text-[#3B82F6]">
              <Zap className="w-2.5 h-2.5" /> AGI
            </div>
            <span className="text-xs font-black text-[#1A1A1A]">{stats.AGI}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

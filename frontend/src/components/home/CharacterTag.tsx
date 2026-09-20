'use strict';
'use client';

import React from 'react';
import { Zap, Shield, HeartPulse, Sparkles } from 'lucide-react';
import { FitnessUser } from '@/lib/fitnessData';

interface CharacterTagProps {
  user: FitnessUser;
}

export const CharacterTag: React.FC<CharacterTagProps> = ({ user }) => {
  const xpPercent = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100));

  return (
    <div className="bg-[#F7F3EA]/95 backdrop-blur-md rounded-2xl border border-[#B9A78E]/40 p-3.5 shadow-md max-w-xs text-xs">
      {/* Header Level & Name */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#303238] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user.level}
          </div>
          <div>
            <div className="font-bold text-[#1F2328] text-xs flex items-center gap-1">
              <span>{user.name}</span>
              <Sparkles className="w-3 h-3 text-[#FF6B35]" />
            </div>
            <div className="text-[10px] text-[#76583E] font-medium uppercase">
              Fitness Explorer
            </div>
          </div>
        </div>
        <div className="text-[10px] font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-md">
          {user.xp} / {user.nextLevelXp} XP
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="w-full bg-[#E8E1D5] h-1.5 rounded-full mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#FF6B35] to-[#F4C95D] h-full rounded-full transition-all duration-500"
          style={{ width: `${xpPercent}%` }}
        />
      </div>

      {/* Attributes: STR / END / MOB */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="bg-white/80 p-1.5 rounded-lg border border-[#B9A78E]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#FF6B35]">
            <Zap className="w-3 h-3" /> STR
          </div>
          <div className="font-extrabold text-[#1F2328] text-xs mt-0.5">{user.str}</div>
        </div>

        <div className="bg-white/80 p-1.5 rounded-lg border border-[#B9A78E]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#7FB069]">
            <HeartPulse className="w-3 h-3" /> END
          </div>
          <div className="font-extrabold text-[#1F2328] text-xs mt-0.5">{user.end}</div>
        </div>

        <div className="bg-white/80 p-1.5 rounded-lg border border-[#B9A78E]/20">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#4D96FF]">
            <Shield className="w-3 h-3" /> MOB
          </div>
          <div className="font-extrabold text-[#1F2328] text-xs mt-0.5">{user.mob}</div>
        </div>
      </div>
    </div>
  );
};

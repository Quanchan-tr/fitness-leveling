'use strict';
'use client';

import React, { useState } from 'react';
import { FitnessUser } from '@/lib/fitnessData';
import { Flame, Sparkles, Pencil, Check, X, Trophy, Dumbbell, HeartPulse, Zap, Shield, ChevronUp } from 'lucide-react';

interface CharacterOverlayProps {
  user: FitnessUser;
  streak?: number;
  onUpdateName?: (newName: string) => void;
  onLevelChange?: (newLevel: number) => void;
  outfit?: any;
  onOpenOutfit?: () => void;
  isHidden?: boolean;
}

export const CharacterOverlay: React.FC<CharacterOverlayProps> = ({
  user,
  streak = 17,
  onUpdateName,
  onLevelChange,
  onOpenOutfit,
  isHidden = false,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  if (isHidden) return null;

  const xpPercent = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100));

  const handleSaveName = () => {
    if (tempName.trim() && onUpdateName) {
      onUpdateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setTempName(user.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="w-full select-none pointer-events-auto bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 p-3.5 space-y-2.5 text-[#1F2328] shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* 1. Header Row: Level Badge + Name + Streak */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Level Badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E65100] text-white flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-sm shadow-[#FF6B35]/30">
            <span className="text-[7.5px] text-[#FDE047] uppercase leading-none font-black tracking-wider">LV</span>
            <span className="text-sm leading-none font-black">{user.level}</span>
          </div>

          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  maxLength={16}
                  className="w-24 px-2 py-0.5 text-xs font-black bg-white border-2 border-[#FF6B35] rounded-md text-[#1F2328] focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded-md bg-[#10B981] text-white hover:bg-[#059669] cursor-pointer shadow-xs"
                  title="Lưu"
                >
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => {
                    setTempName(user.name);
                    setIsEditingName(false);
                  }}
                  className="p-1 rounded-md bg-stone-200 text-stone-600 hover:bg-stone-300 cursor-pointer"
                  title="Hủy"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempName(user.name);
                  setIsEditingName(true);
                }}
                className="group flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                title="Bấm để đổi tên"
              >
                <span className="font-black text-sm text-[#1F2328] leading-tight truncate max-w-[120px]">
                  {user.name}
                </span>
                <Pencil className="w-3 h-3 text-[#FF6B35] group-hover:scale-110 transition-transform" />
              </div>
            )}
            <div className="text-[10px] font-bold text-[#76583E] flex items-center gap-1 leading-none mt-0.5">
              <Trophy className="w-2.5 h-2.5 text-[#F59E0B]" />
              <span>Fitizen Cao Cấp (Vàng)</span>
            </div>
          </div>
        </div>

        {/* Streak Flame Badge */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-[#FFF5ED] to-[#FFEAD9] border border-[#FF6B35]/40 px-2.5 py-1 rounded-xl text-[#E65100] font-black text-xs shrink-0 shadow-2xs">
          <Flame className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35] animate-pulse" />
          <span>{streak} Ngày</span>
        </div>
      </div>

      {/* 2. EXP Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="font-bold text-[#76583E] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF6B35]" />
            Tiến Trình Cấp Độ
          </span>
          <span className="font-black text-[#FF6B35]">
            {user.xp.toLocaleString()} <span className="text-[#8C7662] font-semibold text-[9.5px]">/ {user.nextLevelXp.toLocaleString()} EXP</span>
          </span>
        </div>
        <div className="w-full bg-[#EFE9DF] h-2 rounded-full overflow-hidden p-0.5 border border-[#B9A78E]/20">
          <div
            className="bg-gradient-to-r from-[#FF6B35] via-[#FB923C] to-[#FBBF24] h-full rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* 3. RPG Attributes (STR / END / MOB) */}
      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
        {/* STR - Sức mạnh */}
        <div className="bg-white/80 rounded-xl py-1.5 px-2 flex flex-col items-center justify-center border border-[#FF6B35]/20 shadow-2xs hover:border-[#FF6B35]/40 transition-colors">
          <div className="text-[9.5px] font-black text-[#E65100] uppercase flex items-center gap-1">
            <Dumbbell className="w-2.5 h-2.5" />
            <span>STR</span>
          </div>
          <span className="text-sm font-black text-[#1F2328] leading-tight mt-0.5">{user.str}</span>
          <span className="text-[8px] font-bold text-[#76583E]">Sức mạnh</span>
        </div>

        {/* END - Sức bền */}
        <div className="bg-white/80 rounded-xl py-1.5 px-2 flex flex-col items-center justify-center border border-[#10B981]/20 shadow-2xs hover:border-[#10B981]/40 transition-colors">
          <div className="text-[9.5px] font-black text-[#059669] uppercase flex items-center gap-1">
            <HeartPulse className="w-2.5 h-2.5" />
            <span>END</span>
          </div>
          <span className="text-sm font-black text-[#1F2328] leading-tight mt-0.5">{user.end}</span>
          <span className="text-[8px] font-bold text-[#76583E]">Sức bền</span>
        </div>

        {/* MOB - Độ linh hoạt */}
        <div className="bg-white/80 rounded-xl py-1.5 px-2 flex flex-col items-center justify-center border border-[#2563EB]/20 shadow-2xs hover:border-[#2563EB]/40 transition-colors">
          <div className="text-[9.5px] font-black text-[#2563EB] uppercase flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" />
            <span>MOB</span>
          </div>
          <span className="text-sm font-black text-[#1F2328] leading-tight mt-0.5">{user.mob}</span>
          <span className="text-[8px] font-bold text-[#76583E]">Linh hoạt</span>
        </div>
      </div>
    </div>
  );
};


'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { CharacterCanvas } from './3d/CharacterCanvas';
import { CharacterOutfit } from './3d/Character';
import { UserProfile } from '@/types/dashboard.types';
import {
  RotateCw,
  Shirt,
  Camera,
  Activity,
  Zap,
  Shield,
  Pencil,
  Check,
} from 'lucide-react';

interface AvatarHeroCardProps {
  user: UserProfile;
  outfit: CharacterOutfit;
  photoCount?: number;
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  onOpenOutfit: () => void;
  onOpenBodyMetrics: () => void;
  onOpenProgressPhotos: () => void;
  onUpdateName?: (newName: string) => void;
}

export const AvatarHeroCard: React.FC<AvatarHeroCardProps> = ({
  user,
  outfit,
  photoCount = 4,
  isAutoRotating,
  onToggleAutoRotate,
  onOpenOutfit,
  onOpenBodyMetrics,
  onOpenProgressPhotos,
  onUpdateName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);

  useEffect(() => {
    setNameInput(user.name);
  }, [user.name]);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== user.name) {
      onUpdateName?.(trimmed);
    } else {
      setNameInput(user.name);
    }
    setIsEditingName(false);
  };

  const xpPercentage = Math.min(
    100,
    Math.round((user.exp.current / user.exp.max) * 100)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col justify-between overflow-hidden relative">
      {/* Card Header with Editable Character Name & Level */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setNameInput(user.name);
                    setIsEditingName(false);
                  }
                }}
                onBlur={() => handleSaveName()}
                className="text-sm sm:text-base font-extrabold text-slate-900 border border-[#FF5722] rounded-md px-2 py-0.5 outline-none bg-orange-50/40 w-32 sm:w-40"
                maxLength={24}
              />
              <button
                type="submit"
                className="p-1 rounded bg-[#FF5722] text-white hover:bg-[#E64A19] transition-colors cursor-pointer"
                title="Lưu tên"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="group flex items-center gap-1.5 font-extrabold text-sm sm:text-base text-slate-900 tracking-tight hover:text-[#FF5722] transition-colors cursor-pointer text-left"
              title="Nhấn để đổi tên nhân vật"
            >
              <span>{user.name}</span>
              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-[#FF5722] transition-colors" />
            </button>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white tabular-nums">
            Lv. {user.level}
          </span>
        </div>

        {/* Auto Rotate Control */}
        <button
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            isAutoRotating
              ? 'bg-[#FF5722] text-white border-[#FF5722]'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title={isAutoRotating ? 'Dừng xoay 360°' : 'Bật tự động xoay 360°'}
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${
              isAutoRotating ? 'animate-spin text-white' : 'text-slate-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isAutoRotating ? 'Dừng' : 'Xoay'}
          </span>
        </button>
      </div>

      {/* 3D Character Viewport Container */}
      <div className="relative w-full h-[300px] sm:h-[330px] bg-slate-50/50 flex items-center justify-center overflow-hidden">
        {/* Subtle radial base shadow */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-40 h-8 bg-slate-300/30 rounded-full blur-md pointer-events-none" />

        {/* Standalone Three.js Canvas (Clicking/Dragging only rotates, does not open outfit) */}
        <CharacterCanvas
          level={user.level}
          outfit={outfit}
          autoRotate={isAutoRotating}
        />

        {/* Quick Action: Đổi Trang Phục (Sole trigger for outfit customizer) */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={onOpenOutfit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Shirt className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Trang phục</span>
          </button>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-600">Tiến trình cấp độ</span>
          <span className="font-bold text-slate-900 tabular-nums">
            {user.exp.current.toLocaleString()} / {user.exp.max.toLocaleString()} XP{' '}
            <span className="text-slate-400 font-normal">({xpPercentage}%)</span>
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#FF5722] rounded-full transition-all duration-500"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* Attribute Stats Trio (STR, END, MOB) */}
      <div className="p-4 pt-1 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-2">
          {/* STR */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              <Zap className="w-3 h-3 text-[#FF5722]" />
              <span>STR</span>
            </div>
            <div className="text-lg font-black text-slate-900 tabular-nums leading-tight mt-0.5">
              {user.stats.STR}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Sức mạnh</div>
          </div>

          {/* END */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              <Shield className="w-3 h-3 text-slate-500" />
              <span>END</span>
            </div>
            <div className="text-lg font-black text-slate-900 tabular-nums leading-tight mt-0.5">
              {user.stats.END}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Sức bền</div>
          </div>

          {/* MOB */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              <Activity className="w-3 h-3 text-slate-500" />
              <span>MOB</span>
            </div>
            <div className="text-lg font-black text-slate-900 tabular-nums leading-tight mt-0.5">
              {user.stats.AGI}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Linh hoạt</div>
          </div>
        </div>

        {/* Quick Drawer Shortcuts */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={onOpenBodyMetrics}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Bảng số đo</span>
          </button>
          <button
            onClick={onOpenProgressPhotos}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-slate-500" />
            <span>Ảnh tiến độ ({photoCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

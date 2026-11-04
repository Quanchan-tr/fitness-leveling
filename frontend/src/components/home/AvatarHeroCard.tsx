'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CharacterOutfit } from './3d/Character';
import { UserProfile } from '@/types/dashboard.types';
import { useAvatarStore } from '@/stores/useAvatarStore';
import {
  RotateCw,
  Shirt,
  Pencil,
  Check,
} from 'lucide-react';

// Lazy-load heavy 3D WebGL Canvas
const CharacterCanvas = dynamic(
  () => import('./3d/CharacterCanvas').then((mod) => mod.CharacterCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center select-none animate-pulse">
        <div className="w-12 h-12 rounded-full bg-orange-100/70 border border-orange-200 flex items-center justify-center shadow-xs">
          <div className="w-6 h-6 rounded-full border-2 border-[#FF5722] border-t-transparent animate-spin" />
        </div>
        <span className="text-[11px] font-bold text-slate-400 mt-2 tracking-wide">
          Đang nạp 3D Avatar...
        </span>
      </div>
    ),
  }
);

interface AvatarHeroCardProps {
  user: UserProfile;
  outfit?: CharacterOutfit;
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

  const { characterGender, equipped } = useAvatarStore();

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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden relative">
      {/* Card Header with Name & Level */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between z-10 bg-white">
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
              title="Nhấn để đổi tên"
            >
              <span>{user.name}</span>
              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-[#FF5722] transition-colors" />
            </button>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white tabular-nums">
            Lv. {user.level}
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-[#FF5722]">
            {characterGender === 'female' ? 'Nữ' : 'Nam'}
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
          title={isAutoRotating ? 'Dừng xoay' : 'Tự động xoay 360°'}
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

      {/* 3D Character Viewport Container - Extended height to see full body head-to-toe */}
      <div className="relative w-full h-[360px] sm:h-[400px] bg-gradient-to-b from-slate-50 via-white to-slate-100/70 flex items-center justify-center overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,87,34,0.08),transparent_70%)] pointer-events-none" />

        {/* Standalone Three.js Canvas with Full Body Voxel Character */}
        <CharacterCanvas
          level={user.level}
          gender={characterGender}
          equipped={equipped}
          outfit={outfit}
          autoRotate={isAutoRotating}
        />

        {/* Quick Action: Phòng thay đồ */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={onOpenOutfit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-sm transition-all hover:scale-105 cursor-pointer"
          >
            <Shirt className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Phòng thay đồ</span>
          </button>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-600">Tiến trình cấp độ</span>
          <span className="font-bold text-slate-900 tabular-nums">
            {user.exp.current.toLocaleString('vi-VN')} / {user.exp.max.toLocaleString('vi-VN')} XP{' '}
            <span className="text-[#FF5722] font-extrabold">({xpPercentage}%)</span>
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#FF5722] rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

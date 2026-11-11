'use strict';
'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useFitness, DEFAULT_AVATAR } from '@/contexts/FitnessContext';
import { User, Users, Check, UserPlus, Flame, Dumbbell, Camera } from 'lucide-react';

export const CommunitySidebar: React.FC = () => {
  const { profile, updateProfile, athletes, toggleFollowAthlete } = useFitness();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateProfile({ avatar: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="space-y-5 select-none">
      {/* 1. My Profile Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={profile.avatar || DEFAULT_AVATAR}
              alt={profile.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FF5722]/30 shadow-xs group-hover:opacity-85 transition-opacity bg-slate-100"
            />
            <div
              className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
              title="Nhấn để đổi ảnh đại diện"
            >
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xs border border-white">
              <Camera className="w-3 h-3" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarFile}
            accept="image/*"
            className="hidden"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-sm sm:text-base text-slate-900 truncate">
              {profile.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white tabular-nums">
                Lv. {profile.level}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#FF5722] hover:underline font-semibold truncate cursor-pointer"
              >
                Đổi ảnh đại diện
              </button>
            </div>
          </div>
        </div>

        {/* Stats Trio */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Buổi tập
            </span>
            <span className="text-sm font-black text-slate-900 tabular-nums">
              {profile.totalWorkouts}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Followers
            </span>
            <span className="text-sm font-black text-slate-900 tabular-nums">
              {profile.followersCount}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Following
            </span>
            <span className="text-sm font-black text-slate-900 tabular-nums">
              {profile.followingCount}
            </span>
          </div>
        </div>

        {/* Section 17 & 19 Button: "Xem hồ sơ của bạn" navigates to /profile */}
        <Link
          href="/profile"
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <User className="w-3.5 h-3.5" />
          <span>Xem hồ sơ của bạn</span>
        </Link>
      </div>

      {/* 2. Suggested Athletes Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF5722]" />
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Vận động viên gợi ý
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Top cộng đồng
          </span>
        </div>

        <div className="space-y-3">
          {athletes.map((ath) => (
            <div
              key={ath.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={ath.avatar}
                  alt={ath.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {ath.name}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <span className="font-bold text-orange-600">Lv. {ath.level}</span>
                    <span>•</span>
                    <span className="truncate">{ath.badge}</span>
                  </div>
                </div>
              </div>

              {/* Follow Button toggles: Theo dõi <-> Đang theo dõi */}
              <button
                type="button"
                onClick={() => toggleFollowAthlete(ath.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  ath.isFollowing
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-[#FF5722] text-white hover:bg-[#E64A19] shadow-2xs'
                }`}
              >
                {ath.isFollowing ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Đang theo dõi</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Theo dõi</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

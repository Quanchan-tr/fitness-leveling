'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Flame, Calendar, Clock, Sparkles, Camera, Activity } from 'lucide-react';
import { FitnessUser } from '@/lib/fitnessData';

interface TopBarProps {
  user: FitnessUser;
  streak?: number;
  photoCount?: number;
  onOpenBodyMetrics?: () => void;
  onOpenProgressPhotos?: () => void;
  onOpenOutfit?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  streak = 17,
  photoCount = 4,
  onOpenBodyMetrics,
  onOpenProgressPhotos,
  onOpenOutfit,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const date = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      setCurrentDateTime(`${dayName}, ${date}/${month}/${year} • ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#B9A78E]/30 flex items-center justify-between sticky top-0 z-20 shadow-xs select-none">
      {/* Date & Time (Left) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#76583E] font-bold bg-[#EFE9DF]/80 border border-[#B9A78E]/30 px-3 py-1.5 rounded-xl shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" strokeWidth={2} />
          <span>{currentDateTime || 'Đang cập nhật...'}</span>
        </div>
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-[#1F2328]/70">
          <span>Chào mừng trở lại,</span>
          <span className="text-[#FF6B35] font-black">{user.name}</span>
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
        </div>
      </div>

      {/* Right Controls: Quick Actions + Streak + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action: Album Ảnh Tiến Độ */}
        {onOpenProgressPhotos && (
          <button
            onClick={onOpenProgressPhotos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white border border-[#B9A78E]/40 text-xs font-bold text-[#1F2328] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            title="Mở Album Ảnh Tiến Độ Thể Hình"
          >
            <Camera className="w-3.5 h-3.5 text-[#3B82F6] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Ảnh Tiến Độ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#EFF6FF] text-[#2563EB] font-black">
              {photoCount}
            </span>
          </button>
        )}

        {/* Quick Action: Cập Nhật Chỉ Số Cơ Thể */}
        {onOpenBodyMetrics && (
          <button
            onClick={onOpenBodyMetrics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white border border-[#B9A78E]/40 text-xs font-bold text-[#1F2328] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            title="Mở Bảng Đo Chỉ Số Cơ Thể (InBody/BMI)"
          >
            <Activity className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Chỉ Số Cơ Thể</span>
          </button>
        )}

        {/* Streak Badge '17 Ngày' */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#FFF3EB] to-[#FFE8D6] border border-[#FF6B35]/40 px-3 py-1.5 rounded-xl text-[#E65100] font-black text-xs sm:text-sm shadow-xs hover:scale-102 transition-transform cursor-default">
          <div className="w-5 h-5 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
          </div>
          <span className="hidden sm:inline">{streak} Ngày Streak</span>
          <span className="sm:hidden">{streak}N</span>
        </div>

        {/* Notifications Bell */}
        <button
          className="p-2 sm:p-2.5 rounded-xl bg-white/70 hover:bg-white text-[#1F2328] border border-[#B9A78E]/30 transition-all shadow-2xs relative cursor-pointer group"
          title="Thông báo hệ thống"
        >
          <Bell className="w-4 h-4 text-[#76583E] group-hover:text-[#1F2328] transition-colors" strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6B35] rounded-full ring-2 ring-[#FAF8F5] animate-ping opacity-75" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6B35] rounded-full ring-2 ring-[#FAF8F5]" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#B9A78E]/40">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#303238] to-[#1F2328] text-white flex items-center justify-center font-black text-xs shadow-sm ring-1 ring-white/50">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-black text-[#1F2328] leading-tight">
              {user.name}
            </div>
            <div className="text-[10px] text-[#76583E] font-bold">
              Lv. {user.level}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


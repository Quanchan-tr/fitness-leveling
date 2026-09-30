'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Flame,
  Calendar,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { FitnessUser } from '@/lib/fitnessData';

interface TopBarProps {
  user: FitnessUser;
  streak?: number;
  photoCount?: number;
  onOpenBodyMetrics?: () => void;
  onOpenProgressPhotos?: () => void;
  onOpenOutfit?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  streak = 17,
  onToggleMobileMenu,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = [
        'Chủ Nhật',
        'Thứ Hai',
        'Thứ Ba',
        'Thứ Tư',
        'Thứ Năm',
        'Thứ Sáu',
        'Thứ Bảy',
      ];
      const dayName = days[now.getDay()];
      const date = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      setCurrentDateTime(
        `${dayName}, ${date}/${month}/${year} • ${hours}:${minutes}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile Toggle & Always-Visible Date / Time Box */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#FF5722] shrink-0" strokeWidth={2} />
          <span className="tabular-nums font-medium text-slate-800">
            {currentDateTime || 'Đang cập nhật...'}
          </span>
        </div>
      </div>

      {/* Right Controls: Streak + Notifications + Interactive Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Indicator (Flat, high-contrast) */}
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-lg text-[#E64A19] font-bold text-xs">
          <Flame className="w-3.5 h-3.5 text-[#FF5722] fill-[#FF5722]" />
          <span className="hidden sm:inline tabular-nums">{streak} ngày streak</span>
          <span className="sm:hidden tabular-nums">{streak}N</span>
        </div>

        {/* Notifications Bell */}
        <button
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors relative cursor-pointer"
          aria-label="Xem thông báo"
          title="Thông báo hệ thống"
        >
          <Bell className="w-4 h-4" strokeWidth={2} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5722] rounded-full" />
        </button>

        {/* Interactive User Profile with Dropdown Menu */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-lg hover:bg-slate-50"
            title="Tài khoản & Tùy chọn"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span>{user.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-semibold tabular-nums">
                Lv. {user.level} • {user.goal === 'gain_muscle' ? 'Tăng cơ' : 'Giảm cân'}
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500">Cấp độ {user.level} • Chiến binh thể hình</div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cài đặt ứng dụng</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

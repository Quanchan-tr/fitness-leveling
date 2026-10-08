'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LucideIcon,
  LayoutDashboard,
  Dumbbell,
  Activity,
  Utensils,
  Video,
  Users,
  Flame,
  ShieldCheck,
  X,
  User,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Luyện tập', href: '/workout', icon: Dumbbell },
  { name: 'Chỉ số cơ thể', href: '/metrics', icon: Activity },
  { name: 'Dinh dưỡng', href: '/nutrition', icon: Utensils },
  { name: 'Huấn luyện viên AI', href: '/ai-coach', icon: Video, badge: 'AI' },
  { name: 'Bảng tin', href: '/community', icon: Users },
  { name: 'Hồ sơ cá nhân', href: '/profile', icon: User },
];

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-64 h-screen flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF5722] flex items-center justify-center text-white">
                <Flame className="w-4 h-4 fill-white" strokeWidth={1.5} />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-slate-900 block leading-none">
                  Fitness<span className="text-[#FF5722]">Leveling</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                  Command Center
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="p-3">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Điều hướng
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#FF5722]' : 'text-slate-400'
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold tracking-wider ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info & System Version */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>FitnessLeveling v2.5</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              Hệ thống theo dõi thể hình &amp; AI Pose Check cục bộ
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

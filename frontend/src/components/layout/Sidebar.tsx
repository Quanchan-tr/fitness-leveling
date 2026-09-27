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
  Sparkles,
  Users,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Luyện tập', href: '/workout', icon: Dumbbell },
  { name: 'Chỉ số cơ thể', href: '/metrics', icon: Activity },
  { name: 'Dinh dưỡng', href: '/nutrition', icon: Utensils },
  { name: 'Huấn luyện viên AI', href: '/ai-coach', icon: Sparkles, badge: 'AI' },
  { name: 'Cộng đồng', href: '/community', icon: Users },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] flex-shrink-0 bg-[#EFE9DF]/80 backdrop-blur-md border-r border-[#B9A78E]/30 flex flex-col justify-between h-screen sticky top-0 select-none shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#B9A78E]/30 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white shadow-md shadow-[#FF6B35]/25 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-white" strokeWidth={1.75} />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-[#1F2328] block leading-none">
                FitTrack<span className="text-[#FF6B35]"> AI</span>
              </span>
              <span className="text-[10px] text-[#76583E] font-bold tracking-wider uppercase">
                3D Fitness Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/25 translate-x-0.5'
                    : 'text-[#1F2328]/80 hover:bg-white/70 hover:text-[#1F2328]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#76583E]'}`}
                    strokeWidth={isActive ? 2.2 : 1.75}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[#FF6B35]/15 text-[#FF6B35]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#B9A78E]/30 text-center">
        <div className="bg-white/60 backdrop-blur-xs rounded-xl p-3 border border-[#B9A78E]/30 text-left shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F2328]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" strokeWidth={1.75} />
            <span>FitTrack AI v2.4</span>
          </div>
          <p className="text-[10.5px] text-[#76583E] mt-1 leading-tight font-medium">
            Hệ thống AI thể hình thời gian thực & 3D Leveling
          </p>
        </div>
      </div>
    </aside>
  );
};


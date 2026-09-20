'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Workout', href: '/workout', icon: Dumbbell },
  { name: 'Body Metrics', href: '/metrics', icon: Activity },
  { name: 'Nutrition', href: '/nutrition', icon: Utensils },
  { name: 'AI Coach', href: '/ai-coach', icon: Sparkles, badge: 'AI' },
  { name: 'Community', href: '/community', icon: Users },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-[230px] flex-shrink-0 bg-[#E8E1D5] border-r border-[#B9A78E]/40 flex flex-col justify-between h-screen sticky top-0 select-none shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#B9A78E]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white shadow-md shadow-[#FF6B35]/20">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#1F2328] block leading-none">
                FitTrack<span className="text-[#FF6B35]">AI</span>
              </span>
              <span className="text-[10px] text-[#76583E] font-medium tracking-wide uppercase">
                3D Home Gym
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FF6B35] text-white shadow-sm shadow-[#FF6B35]/30'
                    : 'text-[#1F2328]/80 hover:bg-[#F7F3EA] hover:text-[#1F2328]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#76583E]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
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
        <div className="bg-[#F7F3EA] rounded-xl p-3 border border-[#B9A78E]/30 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1F2328]">
            <ShieldCheck className="w-4 h-4 text-[#7FB069]" />
            <span>FitTrack v2.0</span>
          </div>
          <p className="text-[11px] text-[#76583E] mt-1 leading-tight">
            Personal Asynchronous AI Engine Active
          </p>
        </div>
      </div>
    </aside>
  );
};

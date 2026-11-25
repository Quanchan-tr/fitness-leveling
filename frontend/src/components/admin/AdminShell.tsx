'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Dumbbell,
  LogOut,
  LucideIcon,
  Menu,
  MessageSquare,
  ShieldCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const adminNavItems: AdminNavItem[] = [
  { name: 'Thống kê', href: '/admin', icon: BarChart3 },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'Bài tập & Báo cáo', href: '/admin/exercises', icon: Dumbbell },
  { name: 'Kho Món ăn', href: '/admin/foods', icon: Utensils },
  { name: 'Cộng đồng', href: '/admin/community', icon: MessageSquare },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm font-medium text-[#6B7280]">
          <span className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <span>Đang kiểm tra quyền quản trị...</span>
        </div>
      </div>
    );
  }

  const activeItem =
    adminNavItems.find((item) =>
      item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
    ) || adminNavItems[0];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#111111]">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#111111]/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-64 h-screen shrink-0 bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="h-16 px-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-[#111111] leading-none">
                  FitTrack
                </div>
                <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB]">
                  Admin
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-[#F8FAFC]"
              aria-label="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <div className="p-3">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
              Quản trị hệ thống
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                        : 'text-[#6B7280] font-medium hover:bg-[#F8FAFC] hover:text-[#111111]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#6B7280]'}`}
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer switch & sign out */}
        <div className="p-3 border-t border-[#E5E7EB] space-y-1.5">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#111111] bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về giao diện User</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF]/90 backdrop-blur-sm border-b border-[#E5E7EB] sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-[#F8FAFC]"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
              {activeItem.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.05em] bg-[#EFF6FF] text-[#2563EB]">
              ADMIN
            </span>
            <div className="text-right">
              <div className="text-xs font-semibold text-[#111111] leading-tight">
                {user.displayName}
              </div>
              <div className="text-[11px] text-[#6B7280] hidden sm:block">
                {user.email}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

'use strict';
'use client';

import React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { useShell } from '@/components/layout/ShellLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Utensils } from 'lucide-react';

export default function NutritionPage() {
  const { toggleMobileNav } = useShell();
  const { user, signOut } = useAuth();

  const topBarUser = {
    ...initialFitnessData.user,
    name: user?.displayName || initialFitnessData.user.name,
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <TopBar
        user={topBarUser}
        streak={initialFitnessData.today.streak}
        onToggleMobileMenu={toggleMobileNav}
        onSignOut={signOut}
      />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="max-w-md w-full text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
            <Utensils className="w-6 h-6 text-slate-400" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Dinh dưỡng
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Khu vực đang được dọn trống để chuẩn bị thiết kế lại.
          </p>
        </div>
      </div>
    </main>
  );
}

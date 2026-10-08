'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { MainGrid } from '@/components/layout/MainGrid';
import { BodyMetricsModal } from '@/components/home/BodyMetricsModal';
import { ProgressPhotoModal } from '@/components/home/ProgressPhotoModal';
import { OutfitModal } from '@/components/home/OutfitModal';
import { CharacterOutfit } from '@/components/home/3d/Character';
import { mockDashboardData } from '@/data/mockData';
import { initialFitnessData, MetricHistoryItem, ProgressPhotoItem } from '@/lib/fitnessData';
import { useShell } from '@/components/layout/ShellLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isLoading, signOut, loginDemo } = useAuth();
  const { toggleMobileNav } = useShell();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [extraData, setExtraData] = useState(initialFitnessData);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  const [outfit, setOutfit] = useState<CharacterOutfit>({
    shirtColor: '#FF5722',
    shirtStripeColor: '#FFFFFF',
    shortsColor: '#1E293B',
    headbandColor: '#1E293B',
    shoesColor: '#FF5722',
    wristbandColor: '#1E293B',
  });

  const handleToggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
  };

  const handleSaveMetric = (newMetric: MetricHistoryItem) => {
    setDashboardData((prev) => ({
      ...prev,
      weightSleep: {
        ...prev.weightSleep,
        weightHistory: [
          ...prev.weightSleep.weightHistory.slice(1),
          { date: newMetric.date, weightKg: newMetric.weight },
        ],
      },
    }));
    setExtraData((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        weight: newMetric.weight,
        bodyFat: newMetric.bodyFat,
        muscle: newMetric.muscle,
        bmi: parseFloat((newMetric.weight / Math.pow(prev.body.height / 100, 2)).toFixed(1)),
      },
      recentMetrics: [newMetric, ...prev.recentMetrics],
    }));
  };

  const handleAddPhoto = (photo: ProgressPhotoItem) => {
    setExtraData((prev) => ({
      ...prev,
      progressPhotos: [photo, ...prev.progressPhotos],
    }));
  };

  const handleDeletePhoto = (id: string) => {
    setExtraData((prev) => ({
      ...prev,
      progressPhotos: prev.progressPhotos.filter((p) => p.id !== id),
    }));
  };

  const handleAddWater = (amount: number) => {
    setDashboardData((prev) => ({
      ...prev,
      hydration: {
        ...prev.hydration,
        water: {
          ...prev.hydration.water,
          current: parseFloat((prev.hydration.water.current + amount).toFixed(2)),
        },
      },
    }));
  };

  const handleUpdateName = (newName: string) => {
    setDashboardData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        name: newName,
      },
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  // Automatically activate demo session if user is not logged in so dashboard is immediately accessible
  useEffect(() => {
    if (!isLoading && !user) {
      loginDemo();
    }
  }, [isLoading, user, loginDemo]);

  // Restoring session or initializing demo session
  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#FF5722] rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Đang tải phòng tập…</p>
        </div>
      </div>
    );
  }

  // Logged in but not verified → prompt
  if (!user.isEmailVerified) {
    router.replace('/auth/verify');
    return null;
  }

  // Verified but hasn't done onboarding → redirect
  if (!user.hasCompletedOnboarding) {
    router.replace('/onboarding');
    return null;
  }

  // ── Full dashboard for authenticated users ──────────────────────────────────
  const topBarUser = {
    name: user.displayName || dashboardData.user.name,
    level: dashboardData.user.level,
    xp: dashboardData.user.exp.current,
    nextLevelXp: dashboardData.user.exp.max,
    str: dashboardData.user.stats.STR,
    end: dashboardData.user.stats.END,
    mob: dashboardData.user.stats.AGI,
    goal: 'gain_muscle',
  };

  return (
    <main className="dashboard-shell flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
      <TopBar
        user={topBarUser}
        streak={17}
        photoCount={extraData.progressPhotos.length}
        onToggleMobileMenu={toggleMobileNav}
        onSignOut={handleSignOut}
      />

      <MainGrid
        outfit={outfit}
        photoCount={extraData.progressPhotos.length}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={handleToggleAutoRotate}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onOpenOutfit={() => setIsOutfitModalOpen(true)}
        onUpdateName={handleUpdateName}
      />

      <BodyMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        metrics={extraData.body}
        history={extraData.recentMetrics}
        onSaveMetric={handleSaveMetric}
      />

      <ProgressPhotoModal
        isOpen={isPhotosModalOpen}
        onClose={() => setIsPhotosModalOpen(false)}
        photos={extraData.progressPhotos}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      <OutfitModal
        isOpen={isOutfitModalOpen}
        onClose={() => setIsOutfitModalOpen(false)}
        outfit={outfit}
        onSaveOutfit={setOutfit}
      />
    </main>
  );
}

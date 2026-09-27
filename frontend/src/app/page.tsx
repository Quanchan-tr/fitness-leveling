'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { MainGrid } from '@/components/layout/MainGrid';
import { BodyMetricsModal } from '@/components/home/BodyMetricsModal';
import { ProgressPhotoModal } from '@/components/home/ProgressPhotoModal';
import { OutfitModal } from '@/components/home/OutfitModal';
import { CharacterOutfit } from '@/components/home/3d/Character';
import { mockDashboardData } from '@/data/mockData';
import { initialFitnessData, MetricHistoryItem, ProgressPhotoItem } from '@/lib/fitnessData';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [extraData, setExtraData] = useState(initialFitnessData);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Avatar Outfit State
  const [outfit, setOutfit] = useState<CharacterOutfit>({
    shirtColor: '#FF6B35',
    shirtStripeColor: '#F7F3EA',
    shortsColor: '#303238',
    headbandColor: '#303238',
    shoesColor: '#FF6B35',
    wristbandColor: '#303238',
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

  // Convert UserProfile to TopBar fitnessUser format
  const topBarUser = {
    name: dashboardData.user.name,
    level: dashboardData.user.level,
    xp: dashboardData.user.exp.current,
    nextLevelXp: dashboardData.user.exp.max,
    str: dashboardData.user.stats.STR,
    end: dashboardData.user.stats.END,
    mob: dashboardData.user.stats.AGI,
    goal: 'gain_muscle',
  };

  return (
    <main className="dashboard-shell flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-[var(--color-bg)]">
      {/* Top Header Navigation */}
      <TopBar
        user={topBarUser}
        streak={17}
        photoCount={extraData.progressPhotos.length}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onOpenOutfit={() => setIsOutfitModalOpen(true)}
      />

      {/* Main Grid HUD Layout (3 Columns: Left Cards | Center 3D & HUD | Right Cards) */}
      <MainGrid
        data={dashboardData}
        outfit={outfit}
        photoCount={extraData.progressPhotos.length}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={handleToggleAutoRotate}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onOpenOutfit={() => setIsOutfitModalOpen(true)}
        onAddWater={handleAddWater}
      />

      {/* ================= INTERACTIVE MODALS ================= */}
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



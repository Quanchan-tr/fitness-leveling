'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainGrid } from '@/components/layout/MainGrid';
import { BodyMetricsModal } from '@/components/home/BodyMetricsModal';
import { ProgressPhotoModal } from '@/components/home/ProgressPhotoModal';
import { OutfitModal } from '@/components/home/OutfitModal';
import { CharacterOutfit } from '@/components/home/3d/Character';
import { initialFitnessData, MetricHistoryItem, ProgressPhotoItem } from '@/lib/fitnessData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiRequest } from '@/lib/api';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [extraData, setExtraData] = useState(() => {
    return {
      ...initialFitnessData,
      body: {
        ...initialFitnessData.body,
        weight: user?.weightKg || initialFitnessData.body.weight,
        height: user?.heightCm || initialFitnessData.body.height,
        bmi: user?.weightKg && user?.heightCm
          ? parseFloat((user.weightKg / Math.pow(user.heightCm / 100, 2)).toFixed(1))
          : initialFitnessData.body.bmi,
      },
    };
  });

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

  // Strict Auth Protection: Redirect to Login if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [isLoading, user, router]);

  // Sync Body Metrics with Backend Database
  useEffect(() => {
    if (!user) return;
    apiRequest<{ data: Array<{ id: string; log_date: string; weight_kg: number; body_fat_pct?: number; muscle_mass_kg?: number }> }>(
      '/body-metrics?per_page=14'
    )
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          const mapped: MetricHistoryItem[] = res.data.map((m) => ({
            id: m.id,
            date: m.log_date,
            weight: Number(m.weight_kg),
            bodyFat: Number(m.body_fat_pct || 14.2),
            muscle: Number(m.muscle_mass_kg || 34.5),
          }));
          const latest = mapped[0];
          setExtraData((prev) => ({
            ...prev,
            body: {
              ...prev.body,
              weight: latest.weight,
              bodyFat: latest.bodyFat,
              muscle: latest.muscle,
              bmi: parseFloat((latest.weight / Math.pow(prev.body.height / 100, 2)).toFixed(1)),
            },
            recentMetrics: mapped,
          }));
        }
      })
      .catch(() => {});
  }, [user]);

  const handleToggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
  };

  const handleSaveMetric = (newMetric: MetricHistoryItem) => {
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

    // Post to backend database
    apiRequest('/body-metrics', {
      method: 'POST',
      body: JSON.stringify({
        log_date: newMetric.date,
        weight_kg: newMetric.weight,
        body_fat_pct: newMetric.bodyFat,
        muscle_mass_kg: newMetric.muscle,
      }),
    }).catch((err) => {
      console.warn('Could not sync metric to backend database:', err);
    });
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

  // Loading skeleton while verifying authentication
  if (isLoading || !user) {
    return (
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen animate-in fade-in duration-150">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 h-[480px] p-6 flex flex-col items-center justify-center space-y-3 shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#FF5722] animate-spin" />
              </div>
              <p className="text-xs font-bold text-slate-500">Đang đồng bộ dữ liệu phòng tập...</p>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-3">
                <Skeleton className="w-32 h-4 rounded" />
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-3">
                <Skeleton className="w-40 h-4 rounded" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Logged in but not verified
  if (!user.isEmailVerified) {
    router.replace('/auth/verify');
    return null;
  }

  // Verified but hasn't done onboarding
  if (!user.hasCompletedOnboarding) {
    router.replace('/onboarding');
    return null;
  }

  return (
    <main className="dashboard-shell flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
      <MainGrid
        outfit={outfit}
        photoCount={extraData.progressPhotos.length}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={handleToggleAutoRotate}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onOpenOutfit={() => setIsOutfitModalOpen(true)}
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

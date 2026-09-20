'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { FitnessRoom } from '@/components/home/FitnessRoom';
import { CharacterTag } from '@/components/home/CharacterTag';
import { TodayPanel } from '@/components/home/TodayPanel';
import { BodyMetricsModal } from '@/components/home/BodyMetricsModal';
import { ProgressPhotoModal } from '@/components/home/ProgressPhotoModal';
import { initialFitnessData, MetricHistoryItem, ProgressPhotoItem } from '@/lib/fitnessData';

export default function DashboardPage() {
  const [data, setData] = useState(initialFitnessData);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);

  const handleSaveMetric = (newMetric: MetricHistoryItem) => {
    setData((prev) => ({
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
    setData((prev) => ({
      ...prev,
      progressPhotos: [photo, ...prev.progressPhotos],
    }));
  };

  const handleDeletePhoto = (id: string) => {
    setData((prev) => ({
      ...prev,
      progressPhotos: prev.progressPhotos.filter((p) => p.id !== id),
    }));
  };

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <TopBar user={data.user} streak={data.today.streak} />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* 3D Dashboard Room Stage */}
        <div className="relative">
          <FitnessRoom
            onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
            onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
          />

          {/* Floating Character Info Tag (Gamification overlay) */}
          <div className="absolute top-4 left-4 z-10">
            <CharacterTag user={data.user} />
          </div>
        </div>

        {/* Today's Activity Summary Panel */}
        <TodayPanel today={data.today} />
      </div>

      {/* Interactive Modals (triggered from 3D objects) */}
      <BodyMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        metrics={data.body}
        history={data.recentMetrics}
        onSaveMetric={handleSaveMetric}
      />

      <ProgressPhotoModal
        isOpen={isPhotosModalOpen}
        onClose={() => setIsPhotosModalOpen(false)}
        photos={data.progressPhotos}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
      />
    </main>
  );
}

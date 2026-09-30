'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData, MetricHistoryItem, ProgressPhotoItem } from '@/lib/fitnessData';
import { initialWeeklySchedule, exerciseDatabase } from '@/data/exerciseDatabase';
import { WorkoutSession, WeekDay, ExerciseDbItem, ExerciseBlockData, SetEntry } from '@/types/workout.types';
import { WeeklyScheduleRibbon } from '@/components/workout/WeeklyScheduleRibbon';
import { WorkoutBuilder } from '@/components/workout/WorkoutBuilder';
import { ExerciseDrawer } from '@/components/workout/ExerciseDrawer';
import { BodyMetricsModal } from '@/components/home/BodyMetricsModal';
import { ProgressPhotoModal } from '@/components/home/ProgressPhotoModal';
import { OutfitModal } from '@/components/home/OutfitModal';
import { CharacterOutfit } from '@/components/home/3d/Character';
import { Dumbbell, Sparkles } from 'lucide-react';
import { useShell } from '@/components/layout/ShellLayout';

export default function WorkoutPage() {
  const { toggleMobileNav } = useShell();
  const [weeklySessions, setWeeklySessions] = useState<WorkoutSession[]>(initialWeeklySchedule);
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Sun');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Extra state for modals synced with initialFitnessData
  const [fitnessData, setFitnessData] = useState(initialFitnessData);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);

  const [outfit, setOutfit] = useState<CharacterOutfit>({
    shirtColor: '#FF5722',
    shirtStripeColor: '#FFFFFF',
    shortsColor: '#1E293B',
    headbandColor: '#1E293B',
    shoesColor: '#FF5722',
    wristbandColor: '#1E293B',
  });

  const currentSession = weeklySessions.find((s) => s.day === selectedDay) || weeklySessions[0];

  const handleUpdateCurrentSession = (updatedSession: WorkoutSession) => {
    setWeeklySessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
  };

  const handleAddExerciseFromDatabase = (dbItem: ExerciseDbItem) => {
    const defaultSets: SetEntry[] = Array.from({ length: dbItem.defaultSets }, (_, i) => ({
      id: `set-${Date.now()}-${i + 1}`,
      setNumber: i + 1,
      targetReps: dbItem.defaultReps,
      targetWeightKg: dbItem.defaultWeightKg || 0,
      actualReps: null,
      actualWeightKg: null,
      rpe: null,
      isCompleted: false,
    }));

    const newExercise: ExerciseBlockData = {
      id: `ex-${Date.now()}`,
      name: dbItem.name,
      nameVi: dbItem.nameVi,
      muscleGroup: dbItem.muscleGroup,
      category: dbItem.category,
      sets: defaultSets,
      notes: dbItem.description,
    };

    const updatedSession: WorkoutSession = {
      ...currentSession,
      status: currentSession.status === 'rest' ? 'planned' : currentSession.status,
      exercises: [...currentSession.exercises, newExercise],
    };

    handleUpdateCurrentSession(updatedSession);
  };

  const handleSaveMetric = (newMetric: MetricHistoryItem) => {
    setFitnessData((prev) => ({
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
    setFitnessData((prev) => ({
      ...prev,
      progressPhotos: [photo, ...prev.progressPhotos],
    }));
  };

  const handleDeletePhoto = (id: string) => {
    setFitnessData((prev) => ({
      ...prev,
      progressPhotos: prev.progressPhotos.filter((p) => p.id !== id),
    }));
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      {/* Top Navigation Bar */}
      <TopBar
        user={fitnessData.user}
        streak={fitnessData.today.streak}
        photoCount={fitnessData.progressPhotos.length}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onOpenOutfit={() => setIsOutfitModalOpen(true)}
        onToggleMobileMenu={toggleMobileNav}
      />

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Page Header (Information-first, no card container, no kicker badge) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5722]" />
              <span>Luyện tập</span>
            </h1>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Ngân hàng bài tập</span>
          </button>
        </div>

        {/* 1. Weekly Schedule Ribbon */}
        <WeeklyScheduleRibbon
          sessions={weeklySessions}
          selectedDay={selectedDay}
          todayDay="Sun"
          onSelectDay={(day) => setSelectedDay(day)}
        />

        {/* 2. Workout Builder for Selected Day */}
        <WorkoutBuilder
          session={currentSession}
          onUpdateSession={handleUpdateCurrentSession}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
      </div>

      {/* Exercise Library Slide-Over Drawer */}
      <ExerciseDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddExercise={handleAddExerciseFromDatabase}
        database={exerciseDatabase}
      />

      {/* Modals */}
      <BodyMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        metrics={fitnessData.body}
        history={fitnessData.recentMetrics}
        onSaveMetric={handleSaveMetric}
      />

      <ProgressPhotoModal
        isOpen={isPhotosModalOpen}
        onClose={() => setIsPhotosModalOpen(false)}
        photos={fitnessData.progressPhotos}
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

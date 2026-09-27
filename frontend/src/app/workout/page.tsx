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

export default function WorkoutPage() {
  const [weeklySessions, setWeeklySessions] = useState<WorkoutSession[]>(initialWeeklySchedule);
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Sun');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Extra state for modals synced with initialFitnessData
  const [fitnessData, setFitnessData] = useState(initialFitnessData);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);

  const [outfit, setOutfit] = useState<CharacterOutfit>({
    shirtColor: '#FF6B35',
    shirtStripeColor: '#F7F3EA',
    shortsColor: '#303238',
    headbandColor: '#303238',
    shoesColor: '#FF6B35',
    wristbandColor: '#303238',
  });

  // Find currently selected session
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
    <main className="flex-1 flex flex-col min-w-0 bg-[#F8F6F0] min-h-screen">
      {/* Top Navigation Bar */}
      <TopBar
        user={fitnessData.user}
        streak={fitnessData.today.streak}
        photoCount={fitnessData.progressPhotos.length}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onOpenOutfit={() => setIsOutfitModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#B9A78E]/30 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF6B35] bg-[#FFF3EB] px-2.5 py-0.5 rounded-md border border-[#FF6B35]/30">
                Nhật Ký & Lập Lịch Tập
              </span>
              <span className="text-xs text-[#76583E] font-medium hidden sm:inline">
                Hệ thống theo dõi Sets, Reps, RPE và Tải trọng chuẩn thể hình
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1F2328] tracking-tight flex items-center gap-2">
              <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6B35]" />
              Workout Logger & Planner
            </h1>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-[#FF6B35] hover:bg-[#E8551F] text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-[#FF6B35]/25 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <Sparkles className="w-4 h-4" />
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

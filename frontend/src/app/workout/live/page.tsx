'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFitness } from '@/contexts/FitnessContext';
import {
  Timer,
  Pause,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Plus,
  Minus,
  FastForward,
  Award,
  Dumbbell,
  Flame,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function LiveWorkoutPlayerPage() {
  const router = useRouter();
  const {
    activeWorkout,
    completeSet,
    updateSet,
    adjustRestTimer,
    pauseRestTimer,
    resumeRestTimer,
    skipRestTimer,
    pauseWorkout,
    resumeWorkoutTimer,
    completeWorkout,
    cancelWorkout,
    startWorkout,
    routines,
    todaySchedule,
  } = useFitness();

  // Completed workout result state for modal
  const [completedSummary, setCompletedSummary] = useState<{
    durationSeconds: number;
    totalVolumeKg: number;
    totalSets: number;
    totalReps: number;
  } | null>(null);

  // Timed exercise internal stopwatch
  const [timedExerciseRunning, setTimedExerciseRunning] = useState<Record<number, boolean>>({});
  const [timedExerciseSeconds, setTimedExerciseSeconds] = useState<Record<number, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimedExerciseSeconds((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(timedExerciseRunning).forEach((key) => {
          const idx = parseInt(key, 10);
          if (timedExerciseRunning[idx]) {
            next[idx] = (next[idx] || 0) + 1;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timedExerciseRunning]);

  // Format MM:SS or HH:MM:SS
  const formatStopwatch = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      const remMins = mins % 60;
      return `${hours.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If a workout was just completed, show the full celebration screen!
  if (completedSummary) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Xuất sắc! Buổi tập đã hoàn thành
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Lịch tuần hôm nay đã được cập nhật thành trạng thái <strong className="text-emerald-700">✓ Đã xong</strong>.
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase block">
                Thời lượng
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums">
                {Math.round(completedSummary.durationSeconds / 60)} phút
              </span>
            </div>

            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase block">
                Tổng tải trọng
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums">
                {completedSummary.totalVolumeKg.toLocaleString('vi-VN')} kg
              </span>
            </div>

            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase block">
                Số hiệp xong
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums">
                {completedSummary.totalSets} sets
              </span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Sparkles className="w-4 h-4 text-[#FF5722]" />
              <span>Kinh nghiệm tích lũy:</span>
            </div>
            <span className="font-black text-[#FF5722] text-sm sm:text-base tabular-nums">
              +120 XP
            </span>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => setCompletedSummary(null)}
              className="py-2.5 px-4 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 text-[#FF5722] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Tập thêm routine
            </button>
            <button
              onClick={() => router.push('/workout')}
              className="py-2.5 px-4 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
            >
              Về Kế hoạch tập
            </button>
            <button
              onClick={() => router.push('/')}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Về Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // If no workout is active, show routine selection screen to start
  if (!activeWorkout) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-3xl w-full shadow-xl text-center space-y-6 animate-in fade-in duration-150">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center mx-auto shadow-2xs">
            <Dumbbell className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Chưa có buổi tập nào đang diễn ra
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
              Chọn một Routine từ kế hoạch của bạn để bắt đầu buổi tập trực tiếp (Live Workout Player).
            </p>
          </div>

          <div className="space-y-3 pt-2 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Routine gợi ý:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {routines.slice(0, 6).map((r) => (
                <button
                  key={r.id}
                  onClick={() => startWorkout(r)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#FF5722] hover:bg-orange-50/30 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-2xs h-full"
                >
                  <div className="space-y-1">
                    <div className="font-extrabold text-sm text-slate-900 group-hover:text-[#FF5722] line-clamp-2">
                      {r.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {r.exercises.length} bài tập • Nghỉ {r.restTimerSeconds}s
                    </div>
                  </div>
                  <div className="pt-3 flex items-center justify-between text-xs font-bold text-[#FF5722] mt-auto">
                    <span>Bắt đầu</span>
                    <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center sm:justify-end gap-3 flex-wrap">
            <Link
              href="/workout"
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Về trang Kế hoạch</span>
            </Link>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Về Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentExerciseIdx = Math.min(
    activeWorkout.currentExerciseIndex,
    activeWorkout.exercises.length - 1
  );
  const currentItem = activeWorkout.exercises[currentExerciseIdx];
  const currentExercise = currentItem?.exercise;
  const sets = currentItem?.sets || [];

  const totalExercises = activeWorkout.exercises.length;
  const completedSetsTotal = activeWorkout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSetsCount = activeWorkout.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );

  const handleFinishWorkoutClick = () => {
    const record = completeWorkout();
    if (record) {
      setCompletedSummary({
        durationSeconds: record.durationSeconds,
        totalVolumeKg: record.totalVolumeKg,
        totalSets: record.totalSets,
        totalReps: record.totalReps,
      });
    } else {
      router.push('/workout');
    }
  };

  const handleSetCompleted = (setIdx: number) => {
    const set = sets[setIdx];
    const duration = timedExerciseSeconds[setIdx];

    completeSet(currentExerciseIdx, setIdx, {
      weightKg: set.weightKg,
      reps: set.reps,
      durationSeconds: duration || set.durationSeconds,
      distanceKm: set.distanceKm,
    });

    if (timedExerciseRunning[setIdx]) {
      setTimedExerciseRunning((prev) => ({ ...prev, [setIdx]: false }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pb-16">
      {/* 1. STICKY MASTER HEADER WITH GLOBAL WORKOUT STOPWATCH */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/workout"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Quay lại danh sách (buổi tập vẫn được lưu)"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div>
              <h1 className="font-extrabold text-base sm:text-xl text-slate-100 truncate max-w-[180px] sm:max-w-md">
                {activeWorkout.routineTitle}
              </h1>
              <span className="text-xs sm:text-sm text-slate-400 font-medium">
                Bài {currentExerciseIdx + 1}/{totalExercises} • {completedSetsTotal}/{totalSetsCount} sets xong
              </span>
            </div>
          </div>

          {/* Global Stopwatch & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl">
              <Timer className="w-5 h-5 text-[#FF5722] animate-pulse" />
              <span className="font-black text-base sm:text-xl tabular-nums tracking-wide text-white">
                {formatStopwatch(activeWorkout.elapsedSeconds)}
              </span>
              <button
                type="button"
                onClick={activeWorkout.isPaused ? resumeWorkoutTimer : pauseWorkout}
                className="ml-1 p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={activeWorkout.isPaused ? 'Tiếp tục bấm giờ' : 'Tạm dừng bấm giờ'}
              >
                {activeWorkout.isPaused ? (
                  <Play className="w-4 h-4 fill-white" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              onClick={handleFinishWorkoutClick}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-sm flex items-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Hoàn thành</span>
            </button>
          </div>
        </div>

        {/* 2. AUTO REST TIMER BANNER (Persistent across exercise transitions!) */}
        {activeWorkout.restTimer && activeWorkout.restTimer.isActive && (
          <div className="bg-[#FF5722] text-white px-4 py-3 shadow-inner animate-in slide-in-from-top duration-200">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-orange-100">
                    Thời gian nghỉ ngơi
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight">
                    {formatStopwatch(activeWorkout.restTimer.remainingSeconds)}
                  </div>
                </div>
              </div>

              {/* Rest Timer Controls: -15s, +15s, Tạm dừng/Tiếp tục, Bỏ qua */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  onClick={() => adjustRestTimer(-15)}
                  className="px-3 py-1.5 sm:py-2 rounded-xl bg-orange-700/60 hover:bg-orange-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
                  title="Giảm 15 giây"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>15s</span>
                </button>
                <button
                  onClick={() => adjustRestTimer(15)}
                  className="px-3 py-1.5 sm:py-2 rounded-xl bg-orange-700/60 hover:bg-orange-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
                  title="Thêm 15 giây"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>15s</span>
                </button>
                <button
                  onClick={
                    activeWorkout.restTimer.isPaused ? resumeRestTimer : pauseRestTimer
                  }
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs sm:text-sm font-bold transition-colors cursor-pointer min-h-[36px]"
                >
                  {activeWorkout.restTimer.isPaused ? 'Tiếp tục' : 'Tạm dừng nghỉ'}
                </button>
                <button
                  onClick={skipRestTimer}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
                  title="Bỏ qua thời gian nghỉ"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Bỏ qua</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN WORKOUT CONTENT CONTAINER */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Exercise Switcher Navigation Tabs */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs">
          <button
            disabled={currentExerciseIdx === 0}
            onClick={() => {
              if (currentExerciseIdx > 0) {
                // manual switch
              }
            }}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 scrollbar-none">
            {activeWorkout.exercises.map((item, idx) => {
              const isCurrent = idx === currentExerciseIdx;
              const allDone = item.sets.every((s) => s.isCompleted);

              return (
                <div
                  key={`pill-${idx}`}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-xs'
                      : allDone
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {allDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  <span>Bài {idx + 1}</span>
                  <span className="opacity-70 font-normal">
                    ({item.sets.filter((s) => s.isCompleted).length}/{item.sets.length})
                  </span>
                </div>
              );
            })}
          </div>

          <button
            disabled={currentExerciseIdx >= totalExercises - 1}
            onClick={() => {
              if (currentExerciseIdx < totalExercises - 1) {
                // manual switch
              }
            }}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Section 12.2: Current Exercise Card */}
        {currentExercise && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
            {/* Header with Exercise Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider block">
                  Bài tập {currentExerciseIdx + 1} / {totalExercises}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {currentExercise.name}
                </h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {currentExercise.nameVi && <span>{currentExercise.nameVi}</span>}
                  <span>•</span>
                  <span>Cơ tác động: <strong className="text-slate-700 capitalize">{currentExercise.targetMuscles.join(', ')}</strong></span>
                  <span>•</span>
                  <span className="capitalize">{currentExercise.equipment}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl">
                  {sets.length} hiệp (sets)
                </span>
              </div>
            </div>

            {/* Section 12.2: GIF Animation Placeholder Banner */}
            <div className="w-full h-48 sm:h-60 rounded-2xl bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner group">
              <div className="text-center space-y-2 z-10">
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#FF5722] uppercase bg-black/50 px-3.5 py-1 rounded-full border border-orange-500/30">
                  [Mô phỏng động tác]
                </span>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto">
                  Khung hình động mô phỏng chuyển động kỹ thuật chuẩn của {currentExercise.name}
                </p>
              </div>

              {/* Background ambient pattern */}
              <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-80 pointer-events-none" />
            </div>

            {/* Technical Pinned Notes */}
            {(currentItem.pinnedNote || currentExercise.description) && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Lưu ý kỹ thuật: </span>
                  <span>{currentItem.pinnedNote || currentExercise.description}</span>
                </div>
              </div>
            )}

            {/* Section 12.3: Set Input Table with "Hoàn thành Set" button */}
            <div className="space-y-4 pt-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Ghi nhận các hiệp tập
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {sets.map((set, setIdx) => {
                  const isDone = set.isCompleted || false;
                  const isCurrentSet = !isDone && sets.slice(0, setIdx).every((s) => s.isCompleted);

                  return (
                    <div
                      key={`set-card-${setIdx}`}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isCurrentSet
                          ? 'bg-orange-50/30 border-[#FF5722] shadow-sm'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrentSet
                              ? 'bg-[#FF5722] text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : set.setNumber}
                        </div>
                        <span className="font-black text-sm sm:text-base text-slate-800">
                          Hiệp {set.setNumber}
                        </span>
                      </div>

                      {/* Inputs depending on exercise type */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {currentExercise.type === 'weight_reps' && (
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.5"
                                disabled={isDone}
                                value={set.weightKg ?? 20}
                                onChange={(e) =>
                                  updateSet(currentExerciseIdx, setIdx, {
                                    weightKg: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 sm:w-24 px-3 py-2 sm:py-2.5 rounded-xl border border-slate-300 font-black text-base sm:text-lg text-center bg-white disabled:bg-slate-100 shadow-2xs"
                              />
                              <span className="text-xs sm:text-sm font-bold text-slate-500">kg</span>
                            </div>

                            <span className="text-slate-400 font-bold">×</span>

                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                disabled={isDone}
                                value={set.reps ?? 10}
                                onChange={(e) =>
                                  updateSet(currentExerciseIdx, setIdx, {
                                    reps: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                className="w-18 sm:w-20 px-3 py-2 sm:py-2.5 rounded-xl border border-slate-300 font-black text-base sm:text-lg text-center bg-white disabled:bg-slate-100 shadow-2xs"
                              />
                              <span className="text-xs sm:text-sm font-bold text-slate-500">reps</span>
                            </div>
                          </div>
                        )}

                        {currentExercise.type === 'bodyweight_reps' && (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              disabled={isDone}
                              value={set.reps ?? 12}
                              onChange={(e) =>
                                updateSet(currentExerciseIdx, setIdx, {
                                  reps: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-20 sm:w-24 px-3 py-2 sm:py-2.5 rounded-xl border border-slate-300 font-black text-base sm:text-lg text-center bg-white disabled:bg-slate-100 shadow-2xs"
                            />
                            <span className="text-xs sm:text-sm font-bold text-slate-500">reps</span>
                          </div>
                        )}

                        {currentExercise.type === 'duration' && (
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-base sm:text-lg text-slate-900 tabular-nums">
                              {formatStopwatch(timedExerciseSeconds[setIdx] || set.durationSeconds || 45)}
                            </span>
                            {!isDone && (
                              <button
                                type="button"
                                onClick={() =>
                                  setTimedExerciseRunning((prev) => ({
                                    ...prev,
                                    [setIdx]: !prev[setIdx],
                                  }))
                                }
                                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                                  timedExerciseRunning[setIdx]
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-800 text-white'
                                }`}
                              >
                                {timedExerciseRunning[setIdx] ? 'Tạm dừng' : 'Bắt đầu'}
                              </button>
                            )}
                          </div>
                        )}

                        {currentExercise.type === 'distance_duration' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              disabled={isDone}
                              value={set.distanceKm ?? 5.0}
                              onChange={(e) =>
                                updateSet(currentExerciseIdx, setIdx, {
                                  distanceKm: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 sm:w-24 px-3 py-2 sm:py-2.5 rounded-xl border border-slate-300 font-black text-base sm:text-lg text-center bg-white disabled:bg-slate-100 shadow-2xs"
                            />
                            <span className="text-xs sm:text-sm font-bold text-slate-500">km</span>
                          </div>
                        )}

                        {/* CTA: Hoàn thành Set Button */}
                        <button
                          type="button"
                          disabled={isDone}
                          onClick={() => handleSetCompleted(setIdx)}
                          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[48px] ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 opacity-90 cursor-default'
                              : 'bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-sm active:scale-95'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>{isDone ? 'Đã xong' : 'Hoàn thành Set'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

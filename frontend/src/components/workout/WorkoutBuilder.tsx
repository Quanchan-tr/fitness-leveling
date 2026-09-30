'use strict';
'use client';

import React, { useState } from 'react';
import { WorkoutSession, ExerciseBlockData, SessionStatus } from '@/types/workout.types';
import { ExerciseBlock } from './ExerciseBlock';
import { AddExerciseButton } from './AddExerciseButton';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  Award,
  RotateCcw,
  Bed,
} from 'lucide-react';

interface WorkoutBuilderProps {
  session: WorkoutSession;
  onUpdateSession: (updatedSession: WorkoutSession) => void;
  onOpenDrawer: () => void;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  session,
  onUpdateSession,
  onOpenDrawer,
}) => {
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const totalExercises = session.exercises.length;
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );

  const totalVolumeKg = session.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((setAcc, s) => {
        if (s.isCompleted && s.actualWeightKg && s.actualReps) {
          return setAcc + s.actualWeightKg * s.actualReps;
        }
        return setAcc;
      }, 0)
    );
  }, 0);

  const handleUpdateExercise = (index: number, updatedExercise: ExerciseBlockData) => {
    const newExercises = [...session.exercises];
    newExercises[index] = updatedExercise;
    onUpdateSession({ ...session, exercises: newExercises });
  };

  const handleDeleteExercise = (index: number) => {
    const newExercises = session.exercises.filter((_, i) => i !== index);
    onUpdateSession({ ...session, exercises: newExercises });
  };

  const handleStatusChange = (newStatus: SessionStatus) => {
    if (newStatus === 'completed') {
      setShowCelebrationModal(true);
    }
    onUpdateSession({ ...session, status: newStatus });
  };

  const handleConvertToWorkout = () => {
    onUpdateSession({
      ...session,
      status: 'in_progress',
      title: 'Buổi tập tùy chỉnh mới',
      targetMuscleSummary: 'Toàn thân / Tùy chọn',
    });
    onOpenDrawer();
  };

  // Rest Day View
  if (session.status === 'rest' && session.exercises.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
          <Bed className="w-7 h-7 text-[#FF5722]" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-black text-slate-900">
            Ngày nghỉ ngơi phục hồi (Rest Day)
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Cơ bắp phát triển trong lúc nghỉ ngơi và tái tạo năng lượng. Hãy duy trì đủ nước, protein và ngủ đủ giấc.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={handleConvertToWorkout}
            className="px-4 py-2.5 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Lên lịch tập cho ngày này</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Master Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wide">
                {session.dayVi.replace(/\(.*\)/, '').trim()} • {session.date}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {session.title}
            </h2>
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {session.status === 'planned' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="px-4 py-2 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt đầu buổi tập</span>
              </button>
            )}

            {session.status === 'in_progress' && (
              <>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>45 phút</span>
                </div>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn thành buổi tập</span>
                </button>
              </>
            )}

            {session.status === 'completed' && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Buổi tập đã hoàn thành
                </span>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                  title="Mở lại buổi tập để chỉnh sửa"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Session Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Số bài tập</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">{totalExercises} bài</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Tiến độ sets</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {completedSets} / {totalSets} ({totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0}%)
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Tổng khối lượng</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {totalVolumeKg > 0 ? `${totalVolumeKg.toLocaleString()} kg` : '--'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Ước tính calo</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {completedSets * 18} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        {session.exercises.map((exercise, index) => (
          <ExerciseBlock
            key={exercise.id}
            exercise={exercise}
            exerciseIndex={index}
            onUpdateExercise={(updated) => handleUpdateExercise(index, updated)}
            onDeleteExercise={() => handleDeleteExercise(index)}
          />
        ))}
      </div>

      {/* Add Exercise CTA */}
      <AddExerciseButton onClick={onOpenDrawer} />

      {/* Completion Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Ghi nhận buổi tập hoàn thành
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Đã ghi nhận <strong>{completedSets} sets</strong> với tổng tải trọng{' '}
                <strong>{totalVolumeKg.toLocaleString()} kg</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-medium text-slate-600">
                <span>XP Tích lũy:</span>
                <span className="font-bold text-slate-900 tabular-nums">+120 XP</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Chuỗi tập liên tục:</span>
                <span className="font-bold text-emerald-600 tabular-nums">18 ngày</span>
              </div>
            </div>

            <button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full py-2.5 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Lưu &amp; Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

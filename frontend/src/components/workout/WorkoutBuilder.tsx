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
  Flame,
  Award,
  RotateCcw,
  Sparkles,
  Bed,
  Layers,
  TrendingUp,
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
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#B9A78E]/30 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] border border-[#B9A78E]/30 text-[#76583E] flex items-center justify-center mx-auto shadow-2xs">
          <Bed className="w-8 h-8 text-[#FF6B35]" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-black text-[#1F2328]">
            Ngày Nghỉ Ngơi Phục Hồi (Rest Day)
          </h3>
          <p className="text-xs text-[#76583E] mt-1.5 leading-relaxed">
            Cơ bắp phát triển trong lúc nghỉ ngơi và tái tạo năng lượng. Hãy uống đủ nước, ăn đủ đạm và ngủ từ 7-8 tiếng nhé!
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={handleConvertToWorkout}
            className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E8551F] text-white text-xs font-black shadow-md shadow-[#FF6B35]/25 transition-all flex items-center gap-2 cursor-pointer"
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
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#B9A78E]/30 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-[#FF6B35] uppercase tracking-wider">
                {session.dayVi} • {session.date}
              </span>
              <span className="text-xs text-[#76583E]">•</span>
              <span className="text-xs font-bold text-[#76583E]">
                {session.targetMuscleSummary || 'Tập luyện thể hình'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#1F2328] tracking-tight">
              {session.title}
            </h2>
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {session.status === 'planned' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#E8551F] text-white text-xs sm:text-sm font-black shadow-md shadow-[#FF6B35]/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt đầu buổi tập</span>
              </button>
            )}

            {session.status === 'in_progress' && (
              <>
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#B9A78E]/30 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1F2328]">
                  <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>45 phút</span>
                </div>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs sm:text-sm font-black shadow-md shadow-[#10B981]/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn thành buổi tập</span>
                </button>
              </>
            )}

            {session.status === 'completed' && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-[#10B981] text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã hoàn thành xuất sắc!
                </span>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#76583E] border border-[#B9A78E]/30 transition-colors"
                  title="Mở lại buổi tập để chỉnh sửa"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Session Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#B9A78E]/20">
          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#B9A78E]/20">
            <span className="text-[10.5px] font-bold text-[#76583E] block">Bài tập</span>
            <span className="text-sm font-black text-[#1F2328]">{totalExercises} bài</span>
          </div>

          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#B9A78E]/20">
            <span className="text-[10.5px] font-bold text-[#76583E] block">Tiến độ Sets</span>
            <span className="text-sm font-black text-[#FF6B35]">
              {completedSets} / {totalSets} sets ({totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0}%)
            </span>
          </div>

          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#B9A78E]/20">
            <span className="text-[10.5px] font-bold text-[#76583E] block">Tổng khối lượng</span>
            <span className="text-sm font-black text-[#10B981]">
              {totalVolumeKg > 0 ? `${totalVolumeKg.toLocaleString()} kg` : '--'}
            </span>
          </div>

          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#B9A78E]/20">
            <span className="text-[10.5px] font-bold text-[#76583E] block">Ước tính Calo</span>
            <span className="text-sm font-black text-[#EA580C]">
              {completedSets * 18} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3.5">
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

      {/* Celebration Modal when finished */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl border border-[#B9A78E]/30 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#FF6B35]/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#1F2328]">
                Hoàn thành buổi tập xuất sắc! 🎉
              </h3>
              <p className="text-xs text-[#76583E] mt-1">
                Bạn đã hoàn thành <strong>{completedSets} sets</strong> với tổng tải trọng{' '}
                <strong>{totalVolumeKg.toLocaleString()} kg</strong>.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#B9A78E]/30 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-[#76583E]">
                <span>XP Nhận được:</span>
                <span className="font-black text-[#FF6B35]">+120 XP</span>
              </div>
              <div className="flex justify-between font-semibold text-[#76583E]">
                <span>Chuỗi Streak:</span>
                <span className="font-black text-[#10B981]">18 Ngày 🔥</span>
              </div>
            </div>

            <button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#E8551F] text-white font-black text-sm shadow-md shadow-[#FF6B35]/25 transition-all cursor-pointer"
            >
              Lưu & Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

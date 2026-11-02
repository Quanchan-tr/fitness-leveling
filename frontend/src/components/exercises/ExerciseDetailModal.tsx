'use strict';
'use client';

import React from 'react';
import { Exercise } from '@/types/fitnessleveling.types';
import {
  X,
  Play,
  Plus,
  Sparkles,
  Dumbbell,
  Target,
  Layers,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  onStartQuickWorkout?: (exercise: Exercise) => void;
  onAddExerciseToRoutine?: (exercise: Exercise) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onStartQuickWorkout,
  onAddExerciseToRoutine,
}) => {
  if (!isOpen || !exercise) return null;

  const mediaUrl = exercise.gif_url || exercise.thumbnail_url || exercise.gifPlaceholderUrl;
  const targetMuscle =
    exercise.target_muscle ||
    exercise.body_part ||
    exercise.category ||
    (Array.isArray(exercise.targetMuscles) && exercise.targetMuscles[0]) ||
    'Toàn thân';

  // Format description into step-by-step instructions if possible
  const rawDesc = exercise.description || exercise.instructions || '';
  const sentences = rawDesc
    .split(/\.\s+|\.\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const getBadgeColor = (muscle: string) => {
    const m = muscle.toLowerCase();
    if (m.includes('chest') || m.includes('ngực')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (m.includes('back') || m.includes('lưng')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (m.includes('leg') || m.includes('đùi') || m.includes('mông')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (m.includes('shoulder') || m.includes('vai')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (m.includes('arm') || m.includes('tay')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (m.includes('waist') || m.includes('core') || m.includes('bụng')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF5722] flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-900 capitalize truncate">
                {exercise.name}
              </h3>
              <p className="text-xs text-slate-500 capitalize">
                ID: {exercise.id} • {exercise.equipment || 'Bodyweight'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Large GIF Preview */}
          <div className="relative w-full aspect-video sm:h-72 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            {mediaUrl ? (
              <img
                src={mediaUrl}
                alt={exercise.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                <Dumbbell className="w-12 h-12 text-slate-600" />
                <span className="text-xs">Đang cập nhật hình ảnh động</span>
              </div>
            )}

            {/* AI Pose Check Overlay Badge */}
            {exercise.has_ai_check && (
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-black backdrop-blur-xs shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Pose Check Sẵn sàng</span>
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#FF5722]" /> Cơ chính
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 capitalize mt-1">
                {targetMuscle}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-500" /> Dụng cụ
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 capitalize mt-1 truncate">
                {exercise.equipment || 'Bodyweight'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-500" /> Phân loại
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 capitalize mt-1 truncate">
                {exercise.category || exercise.body_part || 'Kháng lực'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Chấm AI
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 capitalize mt-1">
                {exercise.has_ai_check ? 'Có hỗ trợ' : 'Chưa hỗ trợ'}
              </span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#FF5722]" />
              Hướng dẫn thực hiện kỹ thuật
            </h4>

            {sentences.length > 0 ? (
              <div className="space-y-2.5">
                {sentences.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed"
                  >
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF5722] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="flex-1">{step}.</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-100">
                Chưa có hướng dẫn bằng văn bản cho bài tập này. Vui lòng quan sát chuyển động thị phạm trên ảnh GIF.
              </p>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {onAddExerciseToRoutine && (
            <button
              type="button"
              onClick={() => onAddExerciseToRoutine(exercise)}
              className="w-full sm:w-auto h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Thêm vào Routine</span>
            </button>
          )}

          {onStartQuickWorkout && (
            <button
              type="button"
              onClick={() => onStartQuickWorkout(exercise)}
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-500/20 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Tập bài này ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


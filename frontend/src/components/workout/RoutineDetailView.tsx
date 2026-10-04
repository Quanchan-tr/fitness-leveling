'use strict';
'use client';

import React, { useState } from 'react';
import { RoutineItem } from '@/types/fittrack.types';
import { MuscleHeatmapSvg } from './MuscleHeatmapSvg';
import { MuscleDetailModal } from './MuscleDetailModal';
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
  Dumbbell,
  Clock,
  Play,
  Share2,
} from 'lucide-react';

interface RoutineDetailViewProps {
  routine: RoutineItem;
  onBack: () => void;
  onEdit: (routine: RoutineItem) => void;
  onDelete: (routineId: string) => void;
  onStartLive: (routine: RoutineItem) => void;
}

export const RoutineDetailView: React.FC<RoutineDetailViewProps> = ({
  routine,
  onBack,
  onEdit,
  onDelete,
  onStartLive,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isHeatmapModalOpen, setIsHeatmapModalOpen] = useState(false);

  const totalSets = routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const estimatedDuration = 45;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/workout?routine=${routine.id}`;
      navigator.clipboard.writeText(url).catch(() => {});
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {routine.title}
            </h1>
            <p className="text-xs text-slate-500">
              Chi tiết bài tập, thông số sets và phân bổ tải trọng cơ bắp
            </p>
          </div>
        </div>

        {/* Action Controls & Three-Dot Menu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStartLive(routine)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Bắt đầu buổi tập này</span>
          </button>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Tùy chọn routine"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleCopyLink();
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sao chép liên kết</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(routine);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sửa Routine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(routine.id);
                    }}
                    className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium border-t border-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xóa Routine</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {copiedLink && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Đã sao chép liên kết Routine vào bộ nhớ tạm!</span>
        </div>
      )}

      {/* Two Column Layout: Exercises list (Left) | Creator & Heatmap Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Exercises List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Danh sách bài tập ({routine.exercises.length})
            </h3>
            {routine.notes && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                &ldquo;{routine.notes}&rdquo;
              </p>
            )}

            <div className="space-y-3 pt-2">
              {routine.exercises.map((item, idx) => {
                const ex = item.exercise;
                const setSummary = item.sets.map((s) => {
                  if (ex.type === 'weight_reps') {
                    return `${s.weightKg ? `${s.weightKg}kg` : ''} × ${s.reps || 10} reps`;
                  }
                  if (ex.type === 'bodyweight_reps') {
                    return `${s.reps || 10} reps`;
                  }
                  if (ex.type === 'duration') {
                    return `${s.durationSeconds || 45}s`;
                  }
                  return `${s.distanceKm || 1}km • ${Math.round((s.durationSeconds || 600) / 60)}p`;
                });

                return (
                  <div
                    key={`detail-ex-${idx}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            {ex.name}
                          </h4>
                          <div className="text-[11px] text-slate-400">
                            {ex.nameVi ? `${ex.nameVi} • ` : ''}
                            <span className="capitalize">{ex.equipment}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {item.sets.length} sets
                      </span>
                    </div>

                    {item.pinnedNote && (
                      <div className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-2 rounded-lg">
                        <strong>Lưu ý:</strong> {item.pinnedNote}
                      </div>
                    )}

                    {/* Sets detail */}
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {setSummary.map((str, sIdx) => (
                        <span
                          key={`set-pill-${sIdx}`}
                          className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-semibold text-slate-700 tabular-nums"
                        >
                          Set {sIdx + 1}: {str}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Creator, Summary & Heatmap (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Creator Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tác giả Routine
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={routine.createdBy.avatarUrl}
                alt={routine.createdBy.username}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h5 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {routine.createdBy.username}
                </h5>
                <span className="text-xs text-slate-400 font-medium">
                  Chiến binh thể hình FitTrack
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onEdit(routine)}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Sửa Routine</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Sao chép Link</span>
              </button>
            </div>
          </div>

          {/* Routine Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng quan Routine
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Số bài tập
                </span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {routine.exercises.length}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Tổng sets
                </span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {totalSets}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Ước tính
                </span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  ~{estimatedDuration}p
                </span>
              </div>
            </div>
          </div>

          {/* Muscle Heatmap */}
          <MuscleHeatmapSvg
            exercises={routine.exercises}
            onOpenDetailModal={() => setIsHeatmapModalOpen(true)}
          />
        </div>
      </div>

      <MuscleDetailModal
        isOpen={isHeatmapModalOpen}
        onClose={() => setIsHeatmapModalOpen(false)}
        exercises={routine.exercises}
      />
    </div>
  );
};

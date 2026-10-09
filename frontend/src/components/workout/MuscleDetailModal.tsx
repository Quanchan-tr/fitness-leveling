'use strict';
'use client';

import React from 'react';
import {
  calculateMuscleWorkload,
  getMuscleHeatmapColor,
  MUSCLE_LABELS_VI,
} from '@/lib/muscleHeatmap';
import { Exercise } from '@/types/fitnessleveling.types';
import { X, Activity } from 'lucide-react';
import { MuscleHeatmapSvg } from './MuscleHeatmapSvg';

interface MuscleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: { exercise: Exercise; sets: { isCompleted?: boolean }[] }[];
}

export const MuscleDetailModal: React.FC<MuscleDetailModalProps> = ({
  isOpen,
  onClose,
  exercises,
}) => {
  if (!isOpen) return null;

  const workload = calculateMuscleWorkload(exercises);
  const totalSets = Object.values(workload).reduce((a, b) => a + b, 0);

  // Sort muscle groups by workload descending
  const sortedMuscles = Object.entries(workload)
    .filter(([_, sets]) => sets > 0)
    .sort((a, b) => b[1] - a[1]);

  const maxSets = sortedMuscles.length > 0 ? Math.max(...sortedMuscles.map((m) => m[1])) : 1;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Chi tiết tải trọng nhóm cơ (Muscle Heatmap)
              </h3>
              <p className="text-xs text-slate-500">
                Tổng cộng {totalSets} sets kích hoạt qua các bài tập
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two columns (Enlarged SVG + Horizontal Bar Chart) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Enlarged Muscle Heatmap View */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <MuscleHeatmapSvg exercises={exercises} interactive={true} />
          </div>

          {/* Right: Horizontal Bar Chart of Sets per Muscle Group */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                Khối lượng theo nhóm cơ
              </h4>
              <p className="text-xs text-slate-400">
                Phân bổ số hiệp tập (sets) ảnh hưởng đến từng vùng cơ
              </p>
            </div>

            {sortedMuscles.length > 0 ? (
              <div className="space-y-3 pt-1">
                {sortedMuscles.map(([key, sets]) => {
                  const label = MUSCLE_LABELS_VI[key] || key;
                  const percentage = Math.round((sets / maxSets) * 100);
                  const color = getMuscleHeatmapColor(sets);

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800">{label}</span>
                        <span className="text-slate-900 font-bold tabular-nums">
                          {sets} sets ({totalSets > 0 ? Math.round((sets / totalSets) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color.fill,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                Chưa có nhóm cơ nào được kích hoạt. Hãy thêm bài tập và sets vào routine.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

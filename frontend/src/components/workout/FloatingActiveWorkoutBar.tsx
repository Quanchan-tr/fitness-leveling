'use strict';
'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFitness } from '@/contexts/FitnessContext';
import { Play, RotateCcw, Timer, X } from 'lucide-react';

export const FloatingActiveWorkoutBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { activeWorkout, cancelWorkout } = useFitness();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Do not show on the live workout player screen itself or when no session exists
  if (!activeWorkout || pathname === '/workout/live') {
    return null;
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      const remainingMins = mins % 60;
      return `${hours.toString().padStart(2, '0')}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    router.push('/workout/live');
  };

  const handleConfirmCancel = () => {
    cancelWorkout();
    setShowConfirmCancel(false);
  };

  return (
    <>
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FF5722] flex items-center justify-center text-white shrink-0 relative">
            <Timer className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
              <span>Buổi tập đang diễn ra</span>
              <span className="text-[#FF5722] font-black tabular-nums bg-orange-500/20 px-1.5 py-0.5 rounded text-[11px]">
                ({formatTime(activeWorkout.elapsedSeconds)})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {activeWorkout.routineTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            title="Đặt lại hoặc hủy buổi tập"
          >
            Đặt lại/Hủy
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tiếp tục</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset/Cancel */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">
                Hủy buổi tập hiện tại?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tiến độ các hiệp tập đã hoàn thành trong buổi này sẽ bị xóa khỏi phiên đang diễn ra.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Giữ buổi tập
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

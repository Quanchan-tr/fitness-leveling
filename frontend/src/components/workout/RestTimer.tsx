'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Timer, FastForward, Plus, X } from 'lucide-react';

interface RestTimerProps {
  initialSeconds?: number;
  onFinish?: () => void;
  onClose?: () => void;
  exerciseName?: string;
  setNumber?: number;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  onFinish,
  onClose,
  exerciseName,
  setNumber,
}) => {
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onFinish) onFinish();
      return;
    }

    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onFinish) onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onFinish]);

  const addTime = (seconds: number) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
    setTotalTime((prev) => Math.max(prev, timeLeft + seconds));
  };

  const progressPercent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative overflow-hidden bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 my-2 transition-all">
      {/* Progress Track Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-amber-200/40 transition-all duration-1000 ease-linear pointer-events-none"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="relative flex items-center justify-between gap-3 z-10">
        {/* Left: Icon and Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
            <Timer className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Thời gian nghỉ phục hồi
              </span>
              <span className="text-xs font-black text-amber-700 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
            {exerciseName && (
              <p className="text-[11px] text-slate-500 truncate">
                Sau {exerciseName} {setNumber ? `(Set ${setNumber})` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Right Controls: Adjust, Skip, Close */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => addTime(30)}
            className="px-2 py-1 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 rounded border border-slate-200 transition-colors flex items-center gap-0.5 cursor-pointer"
            title="Thêm 30 giây"
          >
            <Plus className="w-3 h-3" /> 30s
          </button>
          <button
            onClick={() => onFinish?.() || onClose?.()}
            className="px-2.5 py-1 bg-[#FF5722] hover:bg-[#E64A19] text-white text-[11px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FastForward className="w-3 h-3" />
            <span>Bỏ qua</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
              title="Đóng timer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

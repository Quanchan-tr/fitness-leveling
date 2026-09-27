'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Timer, FastForward, Plus, Minus, X } from 'lucide-react';

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
  const [isPaused, setIsPaused] = useState(false);

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
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF8F3] to-[#FEF3EB] border border-[#FF6B35]/30 rounded-xl p-3 shadow-sm my-2 transition-all">
      {/* Progress Track Bar */}
      <div className="absolute left-0 top-0 bottom-0 bg-[#FF6B35]/15 transition-all duration-1000 ease-linear pointer-events-none"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="relative flex items-center justify-between gap-3 z-10">
        {/* Left: Icon and Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Timer className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#1F2328]">
                Thời gian nghỉ phục hồi
              </span>
              <span className="text-sm font-black text-[#FF6B35] font-mono tracking-tight">
                {formatTime(timeLeft)}
              </span>
            </div>
            {exerciseName && (
              <p className="text-[11px] text-[#76583E] truncate">
                Sau {exerciseName} {setNumber ? `(Set ${setNumber})` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Right Controls: Adjust, Skip, Close */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => addTime(30)}
            className="px-2 py-1 bg-white/90 hover:bg-white text-[11px] font-bold text-[#76583E] hover:text-[#1F2328] rounded-lg border border-[#B9A78E]/30 shadow-2xs transition-all flex items-center gap-0.5"
            title="Thêm 30 giây"
          >
            <Plus className="w-3 h-3" /> 30s
          </button>
          <button
            onClick={() => onFinish?.() || onClose?.()}
            className="px-3 py-1 bg-[#FF6B35] hover:bg-[#E8551F] text-white text-[11px] font-black rounded-lg shadow-xs transition-all flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" />
            <span>Xong nghỉ</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#76583E] hover:text-[#1F2328] rounded-lg hover:bg-black/5 transition-colors"
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

'use strict';

import React from 'react';

interface WebStudioMockupProps {
  className?: string;
  activeFeature?: 'pose' | 'avatar' | 'biometrics';
}

export const WebStudioMockup: React.FC<WebStudioMockupProps> = ({
  className = '',
  activeFeature = 'pose',
}) => {
  return (
    <div
      className={`relative mx-auto w-full max-w-[620px] select-none rounded-2xl bg-white shadow-[0_20px_50px_rgba(255,87,34,0.12),0_4px_16px_rgba(15,23,42,0.06)] border border-slate-200 overflow-hidden font-sans ${className}`}
    >
      {/* Web Browser Frame Window Header */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        {/* Window controls */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
        </div>

        {/* Browser URL Pill */}
        <div className="bg-white px-4 py-1 rounded-full border border-slate-200 text-[11px] font-mono text-slate-500 flex items-center gap-2 shadow-2xs max-w-[280px] w-full justify-center">
          <span className="text-emerald-500 font-bold">🔒</span>
          <span className="truncate">fitness-leveling.app/workout/live</span>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF5722] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-ping" />
          <span>WEB AI READY</span>
        </div>
      </div>

      {/* Main Web App Viewport */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white min-h-[380px] sm:min-h-[420px] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle orange atmospheric ambient light */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Web Dashboard Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FF5722] text-white flex items-center justify-center font-black text-xs">
              FL
            </div>
            <div>
              <span className="text-xs font-black tracking-tight text-white block leading-none">
                Fitness-Leveling <span className="text-[#FF5722]">Studio</span>
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Session: Barbell Squat • High Intensity</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-800/90 border border-slate-700 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
              FPS: 60.0
            </span>
            <span className="bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FORM 98%
            </span>
          </div>
        </div>

        {/* Dual Pane Workout Canvas (AI Pose Webcam View + 3D Avatar Leveling) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-3 flex-1 z-10">
          {/* Left Pane: AI Pose Camera Canvas (MediaPipe 33 Joint Tracking) */}
          <div className="sm:col-span-7 bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                WEBCAM POSE SKELETON
              </span>
              <span className="text-emerald-400 font-bold">Knee Angle: 92° ✓</span>
            </div>

            {/* AI Vector Skeleton Joint Illustration */}
            <div className="relative flex-1 flex items-center justify-center my-2">
              <svg
                className="w-full h-36 text-orange-400 filter drop-shadow-[0_0_8px_rgba(255,87,34,0.7)]"
                viewBox="0 0 200 240"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Head */}
                <circle cx="100" cy="35" r="14" fill="#FF5722" fillOpacity="0.25" />
                {/* Spine */}
                <line x1="100" y1="50" x2="100" y2="120" stroke="#10B981" />
                {/* Shoulders */}
                <line x1="68" y1="72" x2="132" y2="72" />
                {/* Arms */}
                <line x1="68" y1="72" x2="52" y2="108" />
                <line x1="52" y1="108" x2="48" y2="140" />
                <line x1="132" y1="72" x2="148" y2="108" />
                <line x1="148" y1="108" x2="152" y2="140" />
                {/* Hips */}
                <line x1="80" y1="120" x2="120" y2="120" stroke="#10B981" />
                {/* Squat depth lines */}
                <line x1="80" y1="120" x2="65" y2="168" stroke="#10B981" />
                <line x1="65" y1="168" x2="68" y2="218" stroke="#10B981" />
                <line x1="120" y1="120" x2="135" y2="168" stroke="#10B981" />
                <line x1="135" y1="168" x2="132" y2="218" stroke="#10B981" />
                {/* Joint Trackers */}
                <circle cx="100" cy="72" r="3" fill="#FFFFFF" />
                <circle cx="65" cy="168" r="4.5" fill="#10B981" />
                <circle cx="135" cy="168" r="4.5" fill="#10B981" />
              </svg>

              <div className="absolute bottom-1 left-1 bg-slate-900/90 text-emerald-300 px-2 py-0.5 rounded text-[9px] font-mono border border-emerald-500/50">
                Parallel Depth Reached
              </div>
            </div>

            {/* Rep Counter Banner */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="text-slate-300 text-[11px]">Đã đếm:</span>
              <span className="font-black text-[#FF5722] text-sm tabular-nums">
                8 <span className="text-slate-400 text-xs font-normal">/ 10 reps</span>
              </span>
            </div>
          </div>

          {/* Right Pane: 3D WebGL Avatar Leveling & Realtime Stats */}
          <div className="sm:col-span-5 bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#FF5722] font-black uppercase tracking-wider">
                VĐV LEVEL 17
              </span>
              <span className="text-amber-400 font-bold">🔥 17 Ngày</span>
            </div>

            {/* 3D Character Silhouette */}
            <div className="flex-1 flex flex-col items-center justify-center my-2">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center relative">
                <span className="text-2xl">🏃‍♂️</span>
                <div className="absolute -bottom-1 bg-[#FF5722] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  3D Live
                </div>
              </div>
              <div className="text-[10px] text-slate-300 mt-2 font-mono">
                XP: 4,280 / 5,000
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#FF5722] h-full w-[85%] rounded-full" />
              </div>
            </div>

            {/* Stats Radar Strip */}
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-slate-900 p-1 rounded border border-slate-800">
                <div className="text-[8px] text-slate-400">STR</div>
                <div className="text-[11px] font-black text-white tabular-nums">88</div>
              </div>
              <div className="bg-slate-900 p-1 rounded border border-slate-800">
                <div className="text-[8px] text-slate-400">END</div>
                <div className="text-[11px] font-black text-white tabular-nums">82</div>
              </div>
              <div className="bg-slate-900 p-1 rounded border border-slate-800">
                <div className="text-[8px] text-slate-400">AGI</div>
                <div className="text-[11px] font-black text-white tabular-nums">91</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 z-10">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">●</span> Chuẩn Deurenberg: 13.8% Body Fat
          </span>
          <span className="text-slate-300 font-semibold">Tự động lưu vào hồ sơ cá nhân</span>
        </div>
      </div>
    </div>
  );
};

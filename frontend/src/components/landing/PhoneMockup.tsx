'use strict';

import React from 'react';

export type ScreenType = 'pose' | 'avatar' | 'biometrics';

interface PhoneMockupProps {
  screenType?: ScreenType;
  className?: string;
  isFloating?: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  screenType = 'pose',
  className = '',
  isFloating = false,
}) => {
  return (
    <div
      className={`relative mx-auto w-full max-w-[310px] sm:max-w-[330px] select-none ${
        isFloating ? 'transition-transform duration-300 hover:-translate-y-1' : ''
      } ${className}`}
    >
      {/* Outer Smartphone Frame */}
      <div className="relative rounded-[48px] p-[10px] bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 shadow-[0_25px_60px_-15px_rgba(255,87,34,0.15),0_10px_20px_-10px_rgba(15,23,42,0.1)] border border-slate-300/80">
        {/* Inner Glass Border */}
        <div className="relative rounded-[38px] overflow-hidden bg-white border border-slate-900/10 shadow-inner">
          {/* Dynamic Island Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-slate-950 rounded-full flex items-center justify-between px-2.5 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
          </div>

          {/* Screen Content */}
          <div className="h-[620px] w-full flex flex-col justify-between pt-9 pb-5 px-4 bg-white text-slate-900 overflow-hidden font-sans">
            {screenType === 'pose' && <PoseCheckScreen />}
            {screenType === 'avatar' && <AvatarLevelingScreen />}
            {screenType === 'biometrics' && <BiometricsScreen />}

            {/* iOS / Mobile Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-900/30 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Screen 1: Realtime AI Pose Check & Web Camera Form Correction */
const PoseCheckScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-tight text-slate-900">
            Web AI Pose (Live 60 FPS)
          </span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          MediaPipe WebGL
        </span>
      </div>

      {/* Camera Preview Simulator */}
      <div className="relative my-2.5 flex-1 rounded-2xl bg-slate-950 overflow-hidden flex flex-col justify-between p-3 border border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
          <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            BARBELL SQUAT
          </span>
          <span className="text-emerald-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            FORM 98%
          </span>
        </div>

        {/* AI Skeleton Overlay Graphics */}
        <div className="relative flex-1 flex items-center justify-center my-1">
          <svg
            className="w-full h-44 text-orange-400 filter drop-shadow-[0_0_8px_rgba(255,87,34,0.8)]"
            viewBox="0 0 200 240"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="100" cy="35" r="14" fill="#FF5722" fillOpacity="0.25" />
            <line x1="100" y1="50" x2="100" y2="120" stroke="#10B981" />
            <line x1="68" y1="72" x2="132" y2="72" />
            <line x1="68" y1="72" x2="52" y2="108" />
            <line x1="52" y1="108" x2="48" y2="140" />
            <line x1="132" y1="72" x2="148" y2="108" />
            <line x1="148" y1="108" x2="152" y2="140" />
            <line x1="80" y1="120" x2="120" y2="120" stroke="#10B981" />
            <line x1="80" y1="120" x2="65" y2="168" stroke="#10B981" />
            <line x1="65" y1="168" x2="68" y2="218" stroke="#10B981" />
            <line x1="120" y1="120" x2="135" y2="168" stroke="#10B981" />
            <line x1="135" y1="168" x2="132" y2="218" stroke="#10B981" />
            <circle cx="100" cy="72" r="3" fill="#FFFFFF" />
            <circle cx="65" cy="168" r="4.5" fill="#10B981" />
            <circle cx="135" cy="168" r="4.5" fill="#10B981" />
          </svg>

          <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md border border-emerald-500/60 text-emerald-300 px-2.5 py-1 rounded-lg text-[9px] font-mono shadow-lg">
            Knee Angle: <strong className="text-white">92° (Target 90°)</strong> ✓
          </div>
        </div>

        <div className="bg-emerald-950/70 border border-emerald-700/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-emerald-200 text-[10px]">
          <span>Biên độ đạt chuẩn (Parallel)</span>
          <span className="font-bold text-white">REPS +1</span>
        </div>
      </div>

      {/* Workout Progress Metrics Card */}
      <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Hiệp hiện tại
            </span>
            <div className="text-lg font-black text-[#0F172A] tabular-nums">
              8 <span className="text-xs font-normal text-slate-500">/ 10 reps</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Mức tạ & RPE
            </span>
            <div className="text-sm font-bold text-[#FF5722] tabular-nums">
              100 kg • RPE 8.0
            </div>
          </div>
        </div>

        <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-[#FF5722] h-full rounded-full w-4/5" />
        </div>
      </div>
    </div>
  );
};

/** Screen 2: 3D Athletic Avatar & Leveling Gamification */
const AvatarLevelingScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[#FF5722] tracking-wider uppercase">
            Fitness-Leveling 3D
          </span>
          <span className="text-sm font-black text-[#0F172A]">VĐV Level 17</span>
        </div>
        <span className="text-[10px] font-bold bg-orange-50 text-[#FF5722] px-2.5 py-1 rounded-full border border-orange-200">
          Rank: Elite
        </span>
      </div>

      {/* 3D Character Presentation Card */}
      <div className="my-2.5 flex-1 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-3.5 flex flex-col justify-between relative overflow-hidden border border-slate-800 text-white">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF5722]/20 rounded-full blur-2xl" />

        <div className="flex items-center justify-between text-[10px] z-10">
          <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300 font-mono">
            EXP: 4,280 / 5,000
          </span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            🔥 17 Ngày Streak
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center my-2 relative">
          <div className="w-24 h-24 rounded-full bg-orange-500/10 border border-orange-400/30 flex items-center justify-center">
            <span className="text-4xl">🏃‍♂️</span>
          </div>
          <div className="absolute bottom-0 bg-[#FF5722] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
            3D WebGL Active
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center z-10">
          <div className="bg-slate-800/70 rounded-lg p-1 border border-slate-700">
            <div className="text-[9px] text-slate-400 font-medium">STR</div>
            <div className="text-xs font-bold text-white tabular-nums">88</div>
          </div>
          <div className="bg-slate-800/70 rounded-lg p-1 border border-slate-700">
            <div className="text-[9px] text-slate-400 font-medium">END</div>
            <div className="text-xs font-bold text-white tabular-nums">82</div>
          </div>
          <div className="bg-slate-800/70 rounded-lg p-1 border border-slate-700">
            <div className="text-[9px] text-slate-400 font-medium">AGI</div>
            <div className="text-xs font-bold text-white tabular-nums">91</div>
          </div>
        </div>
      </div>

      <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5722] flex items-center justify-center font-bold text-xs">
            🎽
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#0F172A]">
              Áo đấu: Athletic Orange
            </div>
            <div className="text-[9px] text-slate-500">Đã trang bị cho nhân vật 3D</div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#FF5722]">Tùy chỉnh</span>
      </div>
    </div>
  );
};

/** Screen 3: Bio-Metrics & Deurenberg Composition */
const BiometricsScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <span className="text-[10px] font-bold text-[#FF5722] tracking-wider uppercase">
            Y Học Thể Thao
          </span>
          <span className="text-sm font-black text-[#0F172A] block">
            Chỉ số Deurenberg
          </span>
        </div>
        <span className="text-[10px] font-bold bg-orange-50 text-[#FF5722] px-2.5 py-1 rounded-full border border-orange-200">
          WHO Standard
        </span>
      </div>

      <div className="my-2.5 space-y-2 flex-1">
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Tỷ lệ mỡ (% Body Fat)
            </span>
            <div className="text-xl font-black text-[#0F172A] tabular-nums">
              13.8%
            </div>
            <span className="text-[9px] text-emerald-600 font-bold">
              Phân loại: Thể thao (Athletic)
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-[#FF5722] border-t-slate-200 flex items-center justify-center text-[10px] font-bold text-[#FF5722]">
            13%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-2.5">
            <span className="text-[9px] text-slate-500 font-semibold uppercase block">
              Chỉ số BMI
            </span>
            <span className="text-base font-black text-[#0F172A] tabular-nums">
              22.4
            </span>
            <span className="text-[9px] text-emerald-600 font-semibold block">
              Chuẩn bình thường
            </span>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-2.5">
            <span className="text-[9px] text-slate-500 font-semibold uppercase block">
              Khối lượng cơ nạc
            </span>
            <span className="text-base font-black text-[#0F172A] tabular-nums">
              64.2 kg
            </span>
            <span className="text-[9px] text-[#FF5722] font-semibold block">
              +1.2 kg tháng này
            </span>
          </div>
        </div>

        <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">💧</span>
            <div>
              <div className="text-[10px] font-bold text-[#0F172A]">
                Nước uống: 2.4L / 3.0L
              </div>
              <div className="text-[9px] text-slate-500">Mục tiêu trao đổi chất</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#FF5722] bg-white px-2 py-0.5 rounded border border-orange-200">
            80%
          </span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-2 text-[9px] text-slate-500 text-center border border-slate-200">
        Phương trình Deurenberg et al. (British Journal of Nutrition)
      </div>
    </div>
  );
};

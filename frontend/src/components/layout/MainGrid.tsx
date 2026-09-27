'use strict';
'use client';

import React from 'react';
import { DashboardData } from '@/types/dashboard.types';
import { CalorieCard } from '@/components/cards/CalorieCard';
import { HydrationStepsCard } from '@/components/cards/HydrationStepsCard';
import { WeightSleepCard } from '@/components/cards/WeightSleepCard';
import { WorkoutCard } from '@/components/cards/WorkoutCard';
import { HUDOverlay } from '@/components/character/HUDOverlay';
import { FitnessRoom } from '@/components/home/FitnessRoom';
import { CharacterOutfit } from '@/components/home/3d/Character';
import { RotateCw, Shirt, Sparkles, Camera, Activity } from 'lucide-react';

interface MainGridProps {
  data: DashboardData;
  outfit: CharacterOutfit;
  photoCount?: number;
  isAutoRotating?: boolean;
  onToggleAutoRotate?: () => void;
  onOpenBodyMetrics: () => void;
  onOpenProgressPhotos: () => void;
  onOpenOutfit: () => void;
  onAddWater: (amount: number) => void;
}

export const MainGrid: React.FC<MainGridProps> = ({
  data,
  outfit,
  photoCount = 4,
  isAutoRotating = false,
  onToggleAutoRotate,
  onOpenBodyMetrics,
  onOpenProgressPhotos,
  onOpenOutfit,
  onAddWater,
}) => {
  const { user, nutrition, hydration, weightSleep, workout } = data;

  return (
    <div className="relative flex-1 w-full h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden p-3 sm:p-4">
      {/* 3D Background Room & Canvas Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <FitnessRoom
          level={user.level}
          autoRotate={isAutoRotating}
          outfit={outfit}
          onOpenBodyMetrics={onOpenBodyMetrics}
          onOpenProgressPhotos={onOpenProgressPhotos}
          onOpenOutfit={onOpenOutfit}
        />
      </div>

      {/* Main 3-Column HUD Grid Overlay */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[320px_1fr_320px] gap-3 sm:gap-4 items-center pointer-events-none">
        
        {/* ================= LEFT COLUMN (~320px width) ================= */}
        <div className="left-column flex flex-col gap-3 justify-center pointer-events-auto order-2 lg:order-1 max-w-[340px] lg:max-w-none mx-auto lg:mx-0 w-full">
          <CalorieCard nutrition={nutrition} />
          <HydrationStepsCard hydration={hydration} onAddWater={onAddWater} />
        </div>

        {/* ================= CENTER COLUMN (1fr: 3D Character + HUD Overlay + Quick Action Dock) ================= */}
        <div className="center-column relative w-full h-[360px] lg:h-full flex flex-col items-center justify-between pointer-events-none order-1 lg:order-2 py-2">
          
          {/* Top: Floating HUD Overlay on top of character */}
          <div className="pointer-events-auto w-full flex justify-center">
            <HUDOverlay user={user} streak={17} onOpenOutfit={onOpenOutfit} />
          </div>

          {/* Bottom: PROMINENT QUICK ACTIONS DOCK (Đem toàn bộ tính năng ra giao diện trực quan) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto self-center mb-1 max-w-[95%]">
            
            {/* 1. Nút Mở Album Ảnh Tiến Độ */}
            <button
              onClick={onOpenProgressPhotos}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-md border border-stone-200/80 text-xs font-black text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
              title="Xem và quản lý Album ảnh thay đổi vóc dáng"
            >
              <div className="w-5 h-5 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <span>Album Ảnh</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] font-black">
                {photoCount}
              </span>
            </button>

            {/* 2. Nút Cập Nhật Chỉ Số Cơ Thể */}
            <button
              onClick={onOpenBodyMetrics}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-md border border-stone-200/80 text-xs font-black text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
              title="Cập nhật cân nặng, mỡ, cơ bắp và BMI"
            >
              <div className="w-5 h-5 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span>Chỉ Số Cơ Thể</span>
            </button>

            {/* 3. Nút Đổi Trang Phục */}
            <button
              onClick={onOpenOutfit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-md border border-stone-200/80 text-xs font-black text-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
              title="Tùy chỉnh màu sắc trang phục nhân vật"
            >
              <div className="w-5 h-5 rounded-lg bg-[#FFF5ED] text-[#FF6B35] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shirt className="w-3.5 h-3.5" />
              </div>
              <span>Trang Phục</span>
            </button>

            {/* 4. Nút Bật/Tắt Tự Động Xoay 360° */}
            <button
              onClick={onToggleAutoRotate}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl backdrop-blur-md border text-xs font-black transition-all cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-0.5 ${
                isAutoRotating
                  ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-[#FF6B35]/25'
                  : 'bg-white/95 hover:bg-white text-[#1A1A1A] border-stone-200/80'
              }`}
              title={isAutoRotating ? 'Bấm để dừng xoay góc nhìn' : 'Bấm để tự động xoay nhân vật 360°'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin text-white' : 'text-[#FF6B35]'}`} />
              <span>{isAutoRotating ? 'Tắt xoay 360°' : 'Bật xoay 360°'}</span>
            </button>

          </div>
        </div>

        {/* ================= RIGHT COLUMN (~320px width) ================= */}
        <div className="right-column flex flex-col gap-3 justify-center pointer-events-auto order-3 max-w-[340px] lg:max-w-none mx-auto lg:mx-0 w-full">
          <WeightSleepCard weightSleep={weightSleep} onOpenBodyMetrics={onOpenBodyMetrics} />
          <WorkoutCard workout={workout} />
        </div>

      </div>
    </div>
  );
};

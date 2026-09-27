'use strict';
'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoomLighting } from './3d/RoomLighting';
import { CityBackground } from './3d/CityBackground';
import { RoomStructure } from './3d/RoomStructure';
import { BedArea } from './3d/BedArea';
import { CozyRugWithCat } from './3d/CozyRugWithCat';
import { AvatarPedestal3D } from './3d/AvatarPedestal3D';
import { ProgressPhotoAlbum } from './3d/ProgressPhotoAlbum';
import { CameraController, CameraMode } from './3d/CameraController';
import { CharacterOutfit } from './3d/Character';
import { Info, Activity, Camera } from 'lucide-react';
import { TodayStats } from '@/lib/fitnessData';

interface FitnessRoomProps {
  level?: number;
  autoRotate?: boolean;
  today?: Partial<TodayStats>;
  outfit?: CharacterOutfit;
  onOpenBodyMetrics: () => void;
  onOpenProgressPhotos: () => void;
  onOpenOutfit?: () => void;
  onFocusChange?: (isFocused: boolean) => void;
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#D8CEBF] text-[#76583E] text-xs font-semibold gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin" />
      <span>Đang tải không gian phòng tập 3D...</span>
    </div>
  );
}

export const FitnessRoom: React.FC<FitnessRoomProps> = ({
  level = 17,
  autoRotate = false,
  outfit,
  onOpenBodyMetrics,
  onOpenProgressPhotos,
  onOpenOutfit,
  onFocusChange,
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [webGlAvailable, setWebGlAvailable] = useState(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('normal');

  useEffect(() => {
    setHasMounted(true);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlAvailable(false);
    } catch {
      setWebGlAvailable(false);
    }
  }, []);

  const handleTransitionEnd = useCallback(
    (target: CameraMode) => {
      setCameraMode(target);
    },
    []
  );

  if (!hasMounted) {
    return <SceneFallback />;
  }

  if (!webGlAvailable) {
    return (
      <div className="w-full h-full min-h-[500px] bg-[#E8E1D5] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Info className="w-10 h-10 text-[#FF6B35]" />
        <div>
          <h3 className="text-base font-bold text-[#1F2328]">WebGL Không Khả Dụng</h3>
          <p className="text-xs text-[#76583E] mt-1 max-w-sm">
            Trình duyệt của bạn chưa bật tăng tốc 3D. Bạn vẫn có thể tương tác đầy đủ với các panel dữ liệu bên cạnh.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onOpenBodyMetrics}
            className="bg-white border border-[#B9A78E]/40 px-4 py-2 rounded-xl text-xs font-bold text-[#1F2328] hover:bg-[#F7F3EA] flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#FF6B35]" />
            Chỉ số cơ thể
          </button>
          <button
            onClick={onOpenProgressPhotos}
            className="bg-white border border-[#B9A78E]/40 px-4 py-2 rounded-xl text-xs font-bold text-[#1F2328] hover:bg-[#F7F3EA] flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#4D96FF]" />
            Album ảnh tiến độ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden bg-[#6B5949] select-none">
      {/* 3D Canvas with 1-Point Perspective Camera */}
      <Canvas
        shadows
        camera={{
          position: [0, 1.62, 4.85],
          fov: 50,
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 1.32, -3.8);
        }}
      >
        <color attach="background" args={['#675545']} />
        <Suspense fallback={null}>
          <CameraController
            mode={cameraMode}
            onTransitionEnd={handleTransitionEnd}
          />
          <RoomLighting />
          <CityBackground />
          <RoomStructure onOpenBodyMetrics={onOpenBodyMetrics} />
          <BedArea />
          <CozyRugWithCat />
          <AvatarPedestal3D
            level={level}
            autoRotate={autoRotate}
            outfit={outfit}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};


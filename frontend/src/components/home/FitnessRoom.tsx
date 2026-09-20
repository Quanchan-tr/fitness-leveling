'use strict';
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoomLighting } from './3d/RoomLighting';
import { RoomStructure } from './3d/RoomStructure';
import { GymMat } from './3d/GymMat';
import { WeightRack } from './3d/WeightRack';
import { BedArea } from './3d/BedArea';
import { Character } from './3d/Character';
import { WallNote } from './3d/WallNote';
import { ProgressPhotoAlbum } from './3d/ProgressPhotoAlbum';
import { Info, Sparkles, Activity, Camera } from 'lucide-react';

interface FitnessRoomProps {
  onOpenBodyMetrics: () => void;
  onOpenProgressPhotos: () => void;
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#E8E1D5] text-[#76583E] text-xs font-semibold gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin" />
      <span>Rendering 3D Home Gym...</span>
    </div>
  );
}

export const FitnessRoom: React.FC<FitnessRoomProps> = ({
  onOpenBodyMetrics,
  onOpenProgressPhotos,
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [webGlAvailable, setWebGlAvailable] = useState(true);

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

  if (!hasMounted) {
    return <SceneFallback />;
  }

  if (!webGlAvailable) {
    return (
      <div className="w-full h-full min-h-[460px] bg-[#E8E1D5] rounded-3xl border border-[#B9A78E]/40 flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-inner">
        <Info className="w-10 h-10 text-[#FF6B35]" />
        <div>
          <h3 className="text-base font-bold text-[#1F2328]">WebGL Not Detected</h3>
          <p className="text-xs text-[#76583E] mt-1 max-w-sm">
            Interactive 3D acceleration is unavailable. You can still access all features via direct shortcuts below.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onOpenBodyMetrics}
            className="bg-white border border-[#B9A78E]/40 px-4 py-2 rounded-xl text-xs font-bold text-[#1F2328] hover:bg-[#F7F3EA] flex items-center gap-2 shadow-xs"
          >
            <Activity className="w-4 h-4 text-[#FF6B35]" />
            Open Body Metrics
          </button>
          <button
            onClick={onOpenProgressPhotos}
            className="bg-white border border-[#B9A78E]/40 px-4 py-2 rounded-xl text-xs font-bold text-[#1F2328] hover:bg-[#F7F3EA] flex items-center gap-2 shadow-xs"
          >
            <Camera className="w-4 h-4 text-[#4D96FF]" />
            Open Photo Album
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] lg:h-[560px] relative rounded-3xl overflow-hidden border border-[#B9A78E]/40 bg-[#E8E1D5] shadow-lg shadow-black/5">
      {/* 3D Canvas with Fixed Isometric Camera (No OrbitControls, Fixed 3/4 view) */}
      <Canvas
        shadows
        camera={{
          position: [7.2, 6.2, 7.2],
          fov: 34,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.9, 0);
        }}
      >
        <color attach="background" args={['#E8E1D5']} />
        <Suspense fallback={null}>
          <RoomLighting />
          <RoomStructure />
          <GymMat />
          <WeightRack />
          <BedArea />
          <Character />
          {/* Interactive triggers */}
          <WallNote onOpen={onOpenBodyMetrics} />
          <ProgressPhotoAlbum onOpen={onOpenProgressPhotos} />
        </Suspense>
      </Canvas>

      {/* Floating Interactive Hints Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
        <div className="bg-[#F7F3EA]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#B9A78E]/40 text-[11px] font-semibold text-[#1F2328] flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
          <span>Click <strong>Wall Note</strong> for Body Metrics</span>
        </div>
        <div className="bg-[#F7F3EA]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#B9A78E]/40 text-[11px] font-semibold text-[#1F2328] flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#4D96FF] animate-pulse" />
          <span>Click <strong>Photo Album</strong> for Timeline</span>
        </div>
      </div>

      {/* Camera Mode Indicator */}
      <div className="absolute top-4 right-4 z-10 bg-[#303238]/80 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 pointer-events-none">
        <Sparkles className="w-3 h-3 text-[#F4C95D]" />
        <span>3/4 Isometric View</span>
      </div>
    </div>
  );
};

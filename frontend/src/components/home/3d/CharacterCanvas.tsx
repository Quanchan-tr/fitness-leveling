'use client';

import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterOutfit } from './Character';
import { ModularVoxelCharacter } from '@/components/character/ModularVoxelCharacter';
import { CharacterGender, EquippedMap } from '@/types/avatar.types';

interface CharacterCanvasProps {
  level?: number;
  gender?: CharacterGender;
  equipped?: EquippedMap;
  outfit?: CharacterOutfit;
  autoRotate?: boolean;
  onClickCharacter?: () => void;
}

function InteractiveCharacter({
  level = 17,
  gender = 'male',
  equipped,
  autoRotate = false,
  onClickCharacter,
}: {
  level?: number;
  gender?: CharacterGender;
  equipped?: EquippedMap;
  autoRotate?: boolean;
  onClickCharacter?: () => void;
}) {
  const [rotationY, setRotationY] = useState(0.20);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Auto-rotation when not dragging
  useFrame((_, delta) => {
    if (autoRotate && !isDraggingRef.current) {
      setRotationY((prev) => prev + delta * 0.65);
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    lastXRef.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const deltaX = clientX - lastXRef.current;
    dragDistanceRef.current += Math.abs(deltaX);
    lastXRef.current = clientX;
    setRotationY((prev) => prev + deltaX * 0.018);
  };

  const handlePointerUp = (e: any) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignored
    }
    if (dragDistanceRef.current < 5 && onClickCharacter) {
      onClickCharacter();
    }
  };

  return (
    <group
      ref={groupRef}
      /* Shifted down slightly per user request: [0, -0.16, 0] */
      position={[0, -0.16, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Invisible hit cylinder for effortless 360 drag rotation */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 2.0, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Modern Voxel Character with Modular Equipment */}
      <ModularVoxelCharacter
        gender={gender}
        equipped={equipped || {}}
        level={level}
        position={[0, 0, 0]}
        rotation={[0, rotationY, 0]}
      />
    </group>
  );
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  level = 17,
  gender = 'male',
  equipped = {},
  autoRotate = false,
  onClickCharacter,
}) => {
  return (
    <div className="w-full h-full relative select-none cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, -0.04, 2.75], fov: 38, near: 0.1, far: 20 }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Studio Lighting */}
        <ambientLight intensity={1.15} color="#FFFFFF" />

        {/* Key Light */}
        <directionalLight position={[2.5, 4.0, 3.2]} intensity={1.4} color="#FFF8F0" castShadow />

        {/* Soft Cool Fill Light */}
        <directionalLight position={[-2.5, 2.5, 2.0]} intensity={0.65} color="#E0F2FE" />

        {/* Silhouette Edge Rim Light */}
        <directionalLight position={[0, 3.0, -2.8]} intensity={1.5} color="#FFA07A" />

        <Suspense fallback={null}>
          <InteractiveCharacter
            level={level}
            gender={gender}
            equipped={equipped}
            autoRotate={autoRotate}
            onClickCharacter={onClickCharacter}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

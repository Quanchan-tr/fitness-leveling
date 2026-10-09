'use strict';
'use client';

import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Character, CharacterOutfit } from './Character';
import * as THREE from 'three';

interface CharacterCanvasProps {
  level?: number;
  outfit?: CharacterOutfit;
  autoRotate?: boolean;
  onClickCharacter?: () => void;
}

function InteractiveCharacter({
  level = 17,
  outfit,
  autoRotate = false,
  onClickCharacter,
}: {
  level?: number;
  outfit?: CharacterOutfit;
  autoRotate?: boolean;
  onClickCharacter?: () => void;
}) {
  const [rotationY, setRotationY] = useState(0.22);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  // Subtle floating levitation & optional auto-rotation & ring pulse
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = -0.74 + Math.sin(t * 1.8) * 0.012;
    }
    if (autoRotate && !isDraggingRef.current) {
      setRotationY((prev) => prev + delta * 0.65);
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = t * 0.35;
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
      position={[0, -0.74, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Invisible hit cylinder for effortless 360 drag rotation */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 2.3, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ================= PEDESTAL (HIGH-TECH TRAINING PODIUM) ================= */}
      {/* Base Beveled Tier */}
      <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.72, 0.04, 36]} />
        <meshStandardMaterial color="#0F172A" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Main Brushed Titanium Platform */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.65, 0.035, 36]} />
        <meshStandardMaterial color="#1E293B" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Futuristic Leveling Neon Disc */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.005, 36]} />
        <meshStandardMaterial
          color="#FF5722"
          emissive="#FF5722"
          emissiveIntensity={0.65}
          roughness={0.2}
        />
      </mesh>

      {/* Core Carbon-Fiber Grip Inset */}
      <mesh position={[0, 0.035, 0]} receiveShadow>
        <cylinderGeometry args={[0.47, 0.47, 0.004, 36]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Rotating Accent Ring on Flat XZ Plane */}
      <group ref={ringGroupRef} position={[0, 0.038, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.485, 0.505, 36]} />
          <meshBasicMaterial color="#FF9800" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Level Tier Status Ring */}
      <mesh position={[0, 0.039, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.35, 32]} />
        <meshBasicMaterial color="#FF5722" side={THREE.DoubleSide} />
      </mesh>

      {/* 3D Stylized Athletic Character */}
      <group position={[0, 0.625, 0]}>
        <Character
          level={level}
          outfit={outfit}
          position={[0, 0, 0]}
          rotation={[0, rotationY, 0]}
        />
      </group>
    </group>
  );
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  level = 17,
  outfit,
  autoRotate = false,
  onClickCharacter,
}) => {
  return (
    <div className="w-full h-full relative select-none cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.28, 2.75], fov: 40, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Balanced Three-Point Studio Lighting */}
        <ambientLight intensity={1.15} color="#FFFFFF" />

        {/* Key Light (Warm frontal-right sun) */}
        <directionalLight position={[2.5, 4.2, 3.2]} intensity={1.5} color="#FFF8F0" castShadow />

        {/* Fill Light (Soft cool diffuse from left) */}
        <directionalLight position={[-2.8, 2.6, 2.2]} intensity={0.65} color="#E0F2FE" />

        {/* Hero Rim Light (Vibrant edge definition on shoulders, arms and hair silhouette) */}
        <directionalLight position={[0, 3.4, -3.0]} intensity={1.8} color="#FFA07A" />

        {/* Pedestal Underglow Accent */}
        <pointLight position={[0, -0.45, 0.8]} intensity={0.9} color="#FF5722" distance={3.5} />

        <Suspense fallback={null}>
          <InteractiveCharacter
            level={level}
            outfit={outfit}
            autoRotate={autoRotate}
            onClickCharacter={onClickCharacter}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

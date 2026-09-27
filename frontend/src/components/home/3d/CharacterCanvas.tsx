'use strict';
'use client';

import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Character, CharacterOutfit } from './Character';
import * as THREE from 'three';

interface CharacterCanvasProps {
  outfit?: CharacterOutfit;
  onClickCharacter?: () => void;
}

function InteractiveCharacter({
  outfit,
  onClickCharacter,
}: {
  outfit?: CharacterOutfit;
  onClickCharacter?: () => void;
}) {
  const [rotationY, setRotationY] = useState(0.25);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Subtle floating levitation
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = -0.75 + Math.sin(t * 1.8) * 0.02;
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
      position={[0, -0.75, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Invisible full-height hit cylinder for effortless 360 rotation */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 2.2, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Sleek Titanium Pedestal */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.68, 0.04, 32]} />
        <meshStandardMaterial color="#22252A" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Inner Accent Ring */}
      <mesh position={[0, 0.022, 0]} receiveShadow>
        <cylinderGeometry args={[0.56, 0.56, 0.005, 32]} />
        <meshStandardMaterial color="#FF6B35" emissive="#EA580C" emissiveIntensity={0.6} />
      </mesh>

      {/* 3D Character */}
      <group position={[0, 0.65, 0]}>
        <Character outfit={outfit} position={[0, 0, 0]} rotation={[0, rotationY, 0]} />
      </group>
    </group>
  );
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  outfit,
  onClickCharacter,
}) => {
  return (
    <div className="w-full h-full relative select-none cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.35, 3.2], fov: 42, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 4, 3]} intensity={1.4} castShadow />
        <directionalLight position={[-2, 2, -1]} intensity={0.5} color="#FF6B35" />
        <pointLight position={[0, -0.4, 0.8]} intensity={0.8} color="#FF6B35" />
        <Suspense fallback={null}>
          <InteractiveCharacter
            outfit={outfit}
            onClickCharacter={onClickCharacter}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

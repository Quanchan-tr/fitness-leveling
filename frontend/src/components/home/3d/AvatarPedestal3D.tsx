'use strict';
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Character, CharacterOutfit } from './Character';

interface AvatarPedestal3DProps {
  level?: number;
  outfit?: CharacterOutfit;
  position?: [number, number, number];
  rotationY?: number;
  autoRotate?: boolean;
  onRotate?: (newRotation: number) => void;
}

export const AvatarPedestal3D: React.FC<AvatarPedestal3DProps> = ({
  level = 17,
  outfit = {},
  position = [0, 0.48, 1.35],
  rotationY = 0.25,
  autoRotate = false,
  onRotate,
}) => {
  const [internalRotation, setInternalRotation] = useState(rotationY);
  const [hovered, setHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const pedestalRef = useRef<THREE.Group>(null);

  // Smooth floating levitation motion & auto-rotation
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (pedestalRef.current) {
      pedestalRef.current.position.y = position[1] + Math.sin(t * 1.8) * 0.012;
    }

    // Auto-rotate character if enabled and user is not manually dragging
    if (autoRotate && !isDraggingRef.current) {
      setInternalRotation((prev) => {
        const next = prev + delta * 0.85;
        if (onRotate) onRotate(next);
        return next;
      });
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    lastXRef.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const deltaX = clientX - lastXRef.current;
    lastXRef.current = clientX;
    const newRot = internalRotation + deltaX * 0.018;
    setInternalRotation(newRot);
    if (onRotate) onRotate(newRot);
  };

  const handlePointerUp = (e: any) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignored
    }
  };

  return (
    <group
      ref={pedestalRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Invisible Expanded Interaction Hit Zone for smooth rotating */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 1.8, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ================= CLEAN SLEEK FLOATING DISC PEDESTAL ================= */}
      {/* Sleek Floating Titanium Disc */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.58, 0.02, 32]} />
        <meshStandardMaterial
          color="#22252A"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Sleek Dark Accent Top Plate */}
      <mesh position={[0, 0.011, 0]} receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.002, 32]} />
        <meshStandardMaterial
          color="#181A1F"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* ================= 3D CHARACTER STANDING ON TOP ================= */}
      {/* Offset y = 0.61 aligns the bottom of character's shoes directly on the pedestal top */}
      <group position={[0, 0.61, 0]}>
        <Character
          level={level}
          outfit={outfit}
          position={[0, 0, 0]}
          rotation={[0, internalRotation, 0]}
        />
      </group>
    </group>
  );
};


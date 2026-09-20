'use strict';
'use client';

import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WallNoteProps {
  onOpen: () => void;
}

export const WallNote: React.FC<WallNoteProps> = ({ onOpen }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = React.useRef<THREE.Group>(null);

  // Subtle breathing animation when hovered
  useFrame((state) => {
    if (meshRef.current) {
      if (hovered) {
        meshRef.current.position.x = -3.24 + Math.sin(state.clock.elapsedTime * 4) * 0.01;
      } else {
        meshRef.current.position.x = -3.27;
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={[-3.27, 2.2, -1.0]}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Wooden / Cork Board Background */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[0.04, 1.3, 1.1]} />
        <meshStandardMaterial
          color={hovered ? '#F4C95D' : '#76583E'}
          roughness={0.8}
          emissive={hovered ? '#F4C95D' : '#000000'}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>

      {/* Main Metric Paper Note */}
      <mesh position={[0.025, 0.05, 0]}>
        <boxGeometry args={[0.01, 1.1, 0.9]} />
        <meshStandardMaterial color="#F7F3EA" roughness={0.9} />
      </mesh>

      {/* Header Bar on Note */}
      <mesh position={[0.032, 0.45, 0]}>
        <boxGeometry args={[0.005, 0.12, 0.75]} />
        <meshStandardMaterial color="#FF6B35" />
      </mesh>

      {/* Data Lines Graphic representation */}
      <mesh position={[0.032, 0.25, -0.1]}>
        <boxGeometry args={[0.005, 0.06, 0.55]} />
        <meshStandardMaterial color="#303238" />
      </mesh>
      <mesh position={[0.032, 0.1, -0.1]}>
        <boxGeometry args={[0.005, 0.06, 0.55]} />
        <meshStandardMaterial color="#7FB069" />
      </mesh>
      <mesh position={[0.032, -0.05, -0.1]}>
        <boxGeometry args={[0.005, 0.06, 0.55]} />
        <meshStandardMaterial color="#4D96FF" />
      </mesh>
      <mesh position={[0.032, -0.25, 0]}>
        <boxGeometry args={[0.005, 0.15, 0.7]} />
        <meshStandardMaterial color="#B9A78E" />
      </mesh>

      {/* Push Pin */}
      <mesh position={[0.04, 0.55, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Interactive Floating Hint Ring */}
      {hovered && (
        <mesh position={[0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.65, 0.7, 32]} />
          <meshBasicMaterial color="#FF6B35" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

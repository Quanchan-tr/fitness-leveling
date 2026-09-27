'use strict';
'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WallNoteProps {
  onOpen: () => void;
}

export const WallNote: React.FC<WallNoteProps> = ({ onOpen }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  // Subtle breathing animation when hovered
  useFrame((state) => {
    if (meshRef.current) {
      if (hovered) {
        meshRef.current.position.x = 3.44 + Math.sin(state.clock.elapsedTime * 4) * 0.01;
      } else {
        meshRef.current.position.x = 3.48;
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={[3.48, 2.15, 0.45]}
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
      {/* Wooden / Cork Board Background on Right Wall */}
      <mesh position={[-0.02, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.03, 1.0, 0.8]} />
        <meshStandardMaterial
          color={hovered ? '#F4C95D' : '#6B4E38'}
          roughness={0.8}
          emissive={hovered ? '#F4C95D' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Main Metric Paper Note */}
      <mesh position={[-0.038, 0.02, 0]}>
        <boxGeometry args={[0.005, 0.86, 0.68]} />
        <meshStandardMaterial color="#F7F3EA" roughness={0.9} />
      </mesh>

      {/* Header Bar on Note */}
      <mesh position={[-0.043, 0.32, 0]}>
        <boxGeometry args={[0.002, 0.09, 0.56]} />
        <meshStandardMaterial color="#FF6B35" />
      </mesh>

      {/* Metric Data Lines Representation */}
      <mesh position={[-0.043, 0.16, -0.06]}>
        <boxGeometry args={[0.002, 0.04, 0.42]} />
        <meshStandardMaterial color="#303238" />
      </mesh>
      <mesh position={[-0.043, 0.05, -0.06]}>
        <boxGeometry args={[0.002, 0.04, 0.42]} />
        <meshStandardMaterial color="#7FB069" />
      </mesh>
      <mesh position={[-0.043, -0.06, -0.06]}>
        <boxGeometry args={[0.002, 0.04, 0.42]} />
        <meshStandardMaterial color="#4D96FF" />
      </mesh>
      <mesh position={[-0.043, -0.2, 0]}>
        <boxGeometry args={[0.002, 0.1, 0.52]} />
        <meshStandardMaterial color="#B9A78E" />
      </mesh>

      {/* Push Pin */}
      <mesh position={[-0.05, 0.39, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Interactive Hover Ring */}
      {hovered && (
        <mesh position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <ringGeometry args={[0.52, 0.58, 32]} />
          <meshBasicMaterial color="#FF6B35" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

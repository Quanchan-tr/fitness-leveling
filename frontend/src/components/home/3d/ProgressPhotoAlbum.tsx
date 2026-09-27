'use strict';
'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProgressPhotoAlbumProps {
  onOpen: () => void;
}

export const ProgressPhotoAlbum: React.FC<ProgressPhotoAlbumProps> = ({ onOpen }) => {
  const [hovered, setHovered] = useState(false);
  const albumRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (albumRef.current) {
      if (hovered) {
        albumRef.current.position.x = 3.44 + Math.sin(state.clock.elapsedTime * 4) * 0.01;
      } else {
        albumRef.current.position.x = 3.48;
      }
    }
  });

  return (
    <group
      ref={albumRef}
      position={[3.48, 1.92, -2.7]}
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
      {/* ================= CLEAN WALL-MOUNTED PROGRESS PHOTO ALBUM FRAME ================= */}
      {/* Outer Premium Wood Frame */}
      <mesh position={[-0.02, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 1.15, 0.92]} />
        <meshStandardMaterial
          color={hovered ? '#FF6B35' : '#4E3321'}
          roughness={0.6}
          emissive={hovered ? '#FF6B35' : '#000000'}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>

      {/* Linen / Cork Backing */}
      <mesh position={[-0.038, 0, 0]}>
        <boxGeometry args={[0.006, 1.05, 0.82]} />
        <meshStandardMaterial color="#EAE0D0" roughness={0.9} />
      </mesh>

      {/* Header Tag: "PROGRESS ALBUM" */}
      <group position={[-0.045, 0.44, 0]}>
        <mesh>
          <boxGeometry args={[0.002, 0.09, 0.62]} />
          <meshStandardMaterial color="#FF6B35" emissive="#FF6B35" emissiveIntensity={0.2} />
        </mesh>
        {/* Decorative mini pin */}
        <mesh position={[-0.005, 0, 0]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#2B2D31" metalness={0.8} />
        </mesh>
      </group>

      {/* Polaroid 1: Top-Left (Before) */}
      <group position={[-0.045, 0.16, -0.18]} rotation={[0, 0, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.004, 0.38, 0.32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Photo Image Area */}
        <mesh position={[-0.002, 0.03, 0]}>
          <boxGeometry args={[0.002, 0.28, 0.28]} />
          <meshStandardMaterial color="#64748B" roughness={0.5} />
        </mesh>
        {/* Red Pin */}
        <mesh position={[-0.008, 0.16, 0]}>
          <sphereGeometry args={[0.015, 10, 10]} />
          <meshStandardMaterial color="#EF4444" roughness={0.2} metalness={0.4} />
        </mesh>
      </group>

      {/* Polaroid 2: Center-Right (After / Current) */}
      <group position={[-0.046, -0.05, 0.16]} rotation={[0, 0, -0.06]}>
        <mesh castShadow>
          <boxGeometry args={[0.004, 0.42, 0.34]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Photo Image Area */}
        <mesh position={[-0.002, 0.03, 0]}>
          <boxGeometry args={[0.002, 0.32, 0.3]} />
          <meshStandardMaterial color="#3B82F6" roughness={0.5} emissive="#2563EB" emissiveIntensity={0.2} />
        </mesh>
        {/* Gold Star / Pin on current photo */}
        <mesh position={[-0.008, 0.18, 0]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshStandardMaterial color="#EAB308" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* Polaroid 3: Bottom-Left (Achievement/Transformation) */}
      <group position={[-0.044, -0.32, -0.16]} rotation={[0, 0, 0.03]}>
        <mesh castShadow>
          <boxGeometry args={[0.004, 0.3, 0.28]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[-0.002, 0.02, 0]}>
          <boxGeometry args={[0.002, 0.22, 0.24]} />
          <meshStandardMaterial color="#10B981" roughness={0.5} />
        </mesh>
      </group>

      {/* Interactive Hover Indicator Ring */}
      {hovered && (
        <mesh position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <ringGeometry args={[0.54, 0.6, 32]} />
          <meshBasicMaterial color="#FF6B35" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};

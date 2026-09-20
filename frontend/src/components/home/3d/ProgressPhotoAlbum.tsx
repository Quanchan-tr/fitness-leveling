'use strict';
'use client';

import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProgressPhotoAlbumProps {
  onOpen: () => void;
}

export const ProgressPhotoAlbum: React.FC<ProgressPhotoAlbumProps> = ({ onOpen }) => {
  const [hovered, setHovered] = useState(false);
  const albumRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (albumRef.current) {
      if (hovered) {
        albumRef.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 5) * 0.03;
        albumRef.current.rotation.y = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else {
        albumRef.current.position.y = 0.85;
        albumRef.current.rotation.y = 0.2;
      }
    }
  });

  return (
    <group position={[2.2, 0, -2.0]}>
      {/* Wooden Side Table / Pedestal */}
      <group position={[0, 0, 0]}>
        {/* Table Top */}
        <mesh position={[0, 0.78, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.1, 0.08, 1.1]} />
          <meshStandardMaterial color="#76583E" roughness={0.5} />
        </mesh>
        {/* 4 Table Legs */}
        <mesh position={[-0.45, 0.38, -0.45]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.76, 8]} />
          <meshStandardMaterial color="#303238" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0.45, 0.38, -0.45]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.76, 8]} />
          <meshStandardMaterial color="#303238" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[-0.45, 0.38, 0.45]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.76, 8]} />
          <meshStandardMaterial color="#303238" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0.45, 0.38, 0.45]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.76, 8]} />
          <meshStandardMaterial color="#303238" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Interactive Photo Album on Table Top */}
      <group
        ref={albumRef}
        position={[0, 0.85, 0]}
        rotation={[0, 0.2, 0]}
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
        {/* Album Book Cover */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.08, 0.45]} />
          <meshStandardMaterial
            color={hovered ? '#FF6B35' : '#303238'}
            roughness={0.4}
            metalness={0.1}
            emissive={hovered ? '#FF6B35' : '#000000'}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>

        {/* Paper Pages Inside */}
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.55, 0.06, 0.42]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.9} />
        </mesh>

        {/* Photo Polaroids Resting on Cover */}
        <group position={[0.05, 0.05, 0]} rotation={[0, 0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.01, 0.26]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Photo Image Placeholder */}
          <mesh position={[0, 0.007, -0.02]}>
            <boxGeometry args={[0.26, 0.005, 0.18]} />
            <meshStandardMaterial color="#4D96FF" roughness={0.5} />
          </mesh>
        </group>

        {/* Gold Ribbon / Bookmark */}
        <mesh position={[-0.1, 0.045, 0.24]}>
          <boxGeometry args={[0.06, 0.01, 0.1]} />
          <meshStandardMaterial color="#F4C95D" metalness={0.4} />
        </mesh>

        {/* Interactive Floating Hint Ring */}
        {hovered && (
          <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.38, 0.42, 32]} />
            <meshBasicMaterial color="#FF6B35" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        )}
      </group>
    </group>
  );
};

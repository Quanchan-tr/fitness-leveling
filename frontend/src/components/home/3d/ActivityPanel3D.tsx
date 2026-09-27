'use strict';
'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TodayStats } from '@/lib/fitnessData';

interface ActivityPanel3DProps {
  today?: Partial<TodayStats>;
  onFocus: () => void;
  isFocused?: boolean;
}

export const ActivityPanel3D: React.FC<ActivityPanel3DProps> = ({
  today,
  onFocus,
  isFocused = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  // Subtle breathing / micro float effect when hovered
  useFrame((state) => {
    if (groupRef.current && !isFocused) {
      if (hovered) {
        groupRef.current.position.z = -3.85 + Math.sin(state.clock.elapsedTime * 4) * 0.01;
      } else {
        groupRef.current.position.z = -3.88;
      }
    }
  });

  // Calculate percentage safe values
  const calPercent = today?.calories && today?.calorieGoal ? Math.min(1, today.calories / today.calorieGoal) : 0.75;
  const hydPercent = today?.water && today?.waterGoal ? Math.min(1, today.water / today.waterGoal) : 0.72;

  return (
    <group
      ref={groupRef}
      position={[-2.2, 1.85, -3.88]}
      onClick={(e) => {
        e.stopPropagation();
        onFocus();
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
      {/* Wooden Backing Frame / Wall Mount Base */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1.3, 1.6, 0.04]} />
        <meshStandardMaterial
          color={hovered ? '#FF6B35' : '#2B2D31'}
          roughness={0.4}
          metalness={0.2}
          emissive={hovered ? '#FF6B35' : '#000000'}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>

      {/* Board Surface - Stylized Slate / Dark Gym Tech Surface */}
      <mesh position={[0, 0, 0.024]}>
        <boxGeometry args={[1.2, 1.5, 0.01]} />
        <meshStandardMaterial color="#1E2024" roughness={0.7} />
      </mesh>

      {/* Header Bar */}
      <group position={[0, 0.62, 0.032]}>
        <mesh>
          <boxGeometry args={[1.08, 0.12, 0.005]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
        {/* Header LED Accent Dot */}
        <mesh position={[-0.45, 0, 0.004]}>
          <circleGeometry args={[0.025, 12]} />
          <meshBasicMaterial color="#FF6B35" />
        </mesh>
        {/* Header Title Indicator Bar */}
        <mesh position={[0.05, 0, 0.004]}>
          <boxGeometry args={[0.7, 0.03, 0.002]} />
          <meshStandardMaterial color="#F7F3EA" />
        </mesh>
      </group>

      {/* Metric Section 1: Calories Bar Graphic */}
      <group position={[0, 0.38, 0.032]}>
        {/* Label Bar */}
        <mesh position={[-0.2, 0.05, 0]}>
          <boxGeometry args={[0.65, 0.04, 0.002]} />
          <meshStandardMaterial color="#FF6B35" />
        </mesh>
        {/* Progress Background */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[1.05, 0.05, 0.002]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
        {/* Progress Filled */}
        <mesh position={[-0.525 + (1.05 * calPercent) / 2, -0.04, 0.002]}>
          <boxGeometry args={[1.05 * calPercent, 0.05, 0.002]} />
          <meshStandardMaterial color="#FF6B35" />
        </mesh>
      </group>

      {/* Metric Section 2: Workout Duration Graphic */}
      <group position={[0, 0.14, 0.032]}>
        <mesh position={[-0.2, 0.05, 0]}>
          <boxGeometry args={[0.65, 0.04, 0.002]} />
          <meshStandardMaterial color="#4D96FF" />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[1.05, 0.05, 0.002]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
        <mesh position={[-0.1, -0.04, 0.002]}>
          <boxGeometry args={[0.85, 0.05, 0.002]} />
          <meshStandardMaterial color="#4D96FF" />
        </mesh>
      </group>

      {/* Metric Section 3: Steps Graphic */}
      <group position={[0, -0.1, 0.032]}>
        <mesh position={[-0.2, 0.05, 0]}>
          <boxGeometry args={[0.65, 0.04, 0.002]} />
          <meshStandardMaterial color="#7FB069" />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[1.05, 0.05, 0.002]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
        <mesh position={[-0.08, -0.04, 0.002]}>
          <boxGeometry args={[0.88, 0.05, 0.002]} />
          <meshStandardMaterial color="#7FB069" />
        </mesh>
      </group>

      {/* Metric Section 4: Hydration Graphic */}
      <group position={[0, -0.34, 0.032]}>
        <mesh position={[-0.2, 0.05, 0]}>
          <boxGeometry args={[0.65, 0.04, 0.002]} />
          <meshStandardMaterial color="#4D96FF" />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[1.05, 0.05, 0.002]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
        <mesh position={[-0.525 + (1.05 * hydPercent) / 2, -0.04, 0.002]}>
          <boxGeometry args={[1.05 * hydPercent, 0.05, 0.002]} />
          <meshStandardMaterial color="#4D96FF" />
        </mesh>
      </group>

      {/* Bottom Button Pill Graphic ("CLICK TO INSPECT") */}
      <group position={[0, -0.58, 0.032]}>
        <mesh>
          <boxGeometry args={[0.9, 0.09, 0.005]} />
          <meshStandardMaterial
            color={hovered ? '#FF6B35' : '#303238'}
            emissive={hovered ? '#FF6B35' : '#000000'}
            emissiveIntensity={hovered ? 0.4 : 0}
          />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <boxGeometry args={[0.6, 0.02, 0.002]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Interactive Ring / Pulse Ring on Hover */}
      {hovered && !isFocused && (
        <mesh position={[0, 0, 0.08]}>
          <ringGeometry args={[0.82, 0.88, 32]} />
          <meshBasicMaterial color="#FF6B35" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

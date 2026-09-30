'use strict';
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface CharacterOutfit {
  shirtColor?: string;
  shirtStripeColor?: string;
  shortsColor?: string;
  headbandColor?: string;
  shoesColor?: string;
  wristbandColor?: string;
}

interface CharacterProps {
  level?: number;
  outfit?: CharacterOutfit;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const Character: React.FC<CharacterProps> = ({
  level = 17,
  outfit = {},
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const shirtColor = outfit.shirtColor || '#FF6B35';
  const shirtStripeColor = outfit.shirtStripeColor || '#F7F3EA';
  const shortsColor = outfit.shortsColor || '#303238';
  const headbandColor = outfit.headbandColor || '#303238';
  const shoesColor = outfit.shoesColor || '#FF6B35';
  const wristbandColor = outfit.wristbandColor || '#303238';

  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Muscle growth multiplier based on Level (Level 1 = 0 growth, Level 17 = moderate growth, Level 50 = max growth)
  const growthFactor = Math.min(1.0, Math.max(0, (level - 1) / 35)); // 0 to 1
  
  // Dynamic Muscle Dimensions
  const chestWidth = 0.44 + growthFactor * 0.10;     // 0.44 -> 0.54
  const chestDepth = 0.25 + growthFactor * 0.08;     // 0.25 -> 0.33
  const armRadius = 0.062 + growthFactor * 0.024;    // 0.062 -> 0.086
  const shoulderRadius = 0.075 + growthFactor * 0.028; // 0.075 -> 0.103
  const armOffsetX = chestWidth / 2 + armRadius + 0.01;
  const legRadius = 0.072 + growthFactor * 0.022;    // 0.072 -> 0.094

  // Subtle idle breathing & athletic stance motion
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.012;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 2) * 0.015;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 2 + 0.5) * 0.025;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -Math.sin(t * 2 + 0.5) * 0.025;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* ================= 1. TORSO / CHEST & CORE (SCALED BY LEVEL) ================= */}
      {/* Main Upper Torso (Traps / Chest) */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[chestWidth, 0.52, chestDepth]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* Voxel Pectoral Muscle Definition (Shows muscle development at higher levels) */}
      {growthFactor > 0.05 && (
        <group position={[0, 0.50, chestDepth / 2 + 0.01]}>
          {/* Left Pec block */}
          <mesh position={[-chestWidth * 0.22, 0, 0]} castShadow>
            <boxGeometry args={[chestWidth * 0.42, 0.16 + growthFactor * 0.06, 0.035 + growthFactor * 0.03]} />
            <meshStandardMaterial color={shirtColor} roughness={0.55} />
          </mesh>
          {/* Right Pec block */}
          <mesh position={[chestWidth * 0.22, 0, 0]} castShadow>
            <boxGeometry args={[chestWidth * 0.42, 0.16 + growthFactor * 0.06, 0.035 + growthFactor * 0.03]} />
            <meshStandardMaterial color={shirtColor} roughness={0.55} />
          </mesh>
        </group>
      )}

      {/* Sport Shirt Accent Stripe */}
      <mesh position={[0, 0.38, chestDepth / 2 + 0.005]}>
        <boxGeometry args={[chestWidth * 0.85, 0.06, 0.01]} />
        <meshStandardMaterial color={shirtStripeColor} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.08 + growthFactor * 0.015, 0.09 + growthFactor * 0.015, 0.1, 12]} />
        <meshStandardMaterial color="#DDBB98" roughness={0.6} />
      </mesh>

      {/* ================= 2. HEAD & ATHLETIC CAP ================= */}
      <group ref={headRef} position={[0, 0.92, 0]}>
        {/* Head Mesh */}
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.5} />
        </mesh>
        {/* Eyes (Voxel details) */}
        <mesh position={[-0.07, 0.02, 0.152]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#1F2328" />
        </mesh>
        <mesh position={[0.07, 0.02, 0.152]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#1F2328" />
        </mesh>
        {/* Cap / Hair Crown */}
        <mesh position={[0, 0.14, 0.02]}>
          <boxGeometry args={[0.32, 0.08, 0.32]} />
          <meshStandardMaterial color={headbandColor} roughness={0.7} />
        </mesh>
        {/* Cap Visor / Brim */}
        <mesh position={[0, 0.12, 0.2]}>
          <boxGeometry args={[0.32, 0.03, 0.12]} />
          <meshStandardMaterial color={headbandColor} roughness={0.7} />
        </mesh>
      </group>

      {/* ================= 3. SHOULDERS & MUSCULAR ARMS (SCALED BY LEVEL) ================= */}
      {/* Left Shoulder Deltoid */}
      <mesh position={[-chestWidth / 2 - shoulderRadius * 0.4, 0.62, 0]} castShadow>
        <sphereGeometry args={[shoulderRadius, 12, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* Left Arm (Standing Athletic Pose) */}
      <group ref={leftArmRef} position={[-armOffsetX, 0.60, 0]}>
        {/* Upper Arm / Biceps */}
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[armRadius, armRadius * 0.95, 0.24, 10]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
        {/* Bicep Muscle Bump */}
        {growthFactor > 0.05 && (
          <mesh position={[-0.01, -0.11, 0.02]} castShadow>
            <sphereGeometry args={[armRadius * 0.95, 10, 10]} />
            <meshStandardMaterial color="#DDBB98" roughness={0.6} />
          </mesh>
        )}
        {/* Forearm */}
        <mesh position={[0, -0.28, 0]} castShadow>
          <cylinderGeometry args={[armRadius * 0.9, armRadius * 0.8, 0.22, 10]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
        {/* Wristband */}
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[armRadius * 0.95, armRadius * 0.95, 0.05, 10]} />
          <meshStandardMaterial color={wristbandColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.44, 0]} castShadow>
          <boxGeometry args={[armRadius * 1.5, 0.08, armRadius * 1.5]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Shoulder Deltoid */}
      <mesh position={[chestWidth / 2 + shoulderRadius * 0.4, 0.62, 0]} castShadow>
        <sphereGeometry args={[shoulderRadius, 12, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[armOffsetX, 0.60, 0]}>
        {/* Upper Arm / Biceps */}
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[armRadius, armRadius * 0.95, 0.24, 10]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
        {/* Bicep Muscle Bump */}
        {growthFactor > 0.05 && (
          <mesh position={[0.01, -0.11, 0.02]} castShadow>
            <sphereGeometry args={[armRadius * 0.95, 10, 10]} />
            <meshStandardMaterial color="#DDBB98" roughness={0.6} />
          </mesh>
        )}
        {/* Forearm */}
        <mesh position={[0, -0.28, 0]} castShadow>
          <cylinderGeometry args={[armRadius * 0.9, armRadius * 0.8, 0.22, 10]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
        {/* Wristband */}
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[armRadius * 0.95, armRadius * 0.95, 0.05, 10]} />
          <meshStandardMaterial color={wristbandColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.44, 0]} castShadow>
          <boxGeometry args={[armRadius * 1.5, 0.08, armRadius * 1.5]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
      </group>

      {/* ================= 4. SHORTS / WAIST ================= */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[chestWidth * 0.95, 0.22, chestDepth * 1.02]} />
        <meshStandardMaterial color={shortsColor} roughness={0.7} />
      </mesh>

      {/* ================= 5. LEGS & ATHLETIC SHOES ================= */}
      {/* Left Leg */}
      <group position={[-chestWidth * 0.26, -0.04, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[legRadius, legRadius * 0.88, 0.46, 10]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
        {/* Left Shoe */}
        <group position={[0, -0.5, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.14 + growthFactor * 0.02, 0.1, 0.26]} />
            <meshStandardMaterial color={shoesColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.145 + growthFactor * 0.02, 0.03, 0.27]} />
            <meshStandardMaterial color="#F7F3EA" />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group position={[chestWidth * 0.26, -0.04, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[legRadius, legRadius * 0.88, 0.46, 10]} />
          <meshStandardMaterial color="#DDBB98" roughness={0.6} />
        </mesh>
        {/* Right Shoe */}
        <group position={[0, -0.5, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.14 + growthFactor * 0.02, 0.1, 0.26]} />
            <meshStandardMaterial color={shoesColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.145 + growthFactor * 0.02, 0.03, 0.27]} />
            <meshStandardMaterial color="#F7F3EA" />
          </mesh>
        </group>
      </group>
    </group>
  );
};


'use strict';
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Character: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Subtle idle breathing motion
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = 0.95 + Math.sin(t * 2) * 0.015;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 2) * 0.02;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 2 + 0.5) * 0.05;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -Math.sin(t * 2 + 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[-0.4, 0.95, 0.5]} rotation={[0, 0.4, 0]}>
      {/* Torso / Sport Shirt */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.42, 0.5, 0.24]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.6} />
      </mesh>
      {/* Sport Shirt Accent Stripe */}
      <mesh position={[0, 0.35, 0.125]}>
        <boxGeometry args={[0.36, 0.06, 0.01]} />
        <meshStandardMaterial color="#F7F3EA" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 12]} />
        <meshStandardMaterial color="#B9A78E" roughness={0.6} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.82, 0]}>
        {/* Head Mesh */}
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#B9A78E" roughness={0.5} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.13, 0.02]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial color="#1F2328" roughness={0.8} />
        </mesh>
        {/* Athletic Headband */}
        <mesh position={[0, 0.04, 0.01]}>
          <boxGeometry args={[0.29, 0.06, 0.29]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
      </group>

      {/* Left Arm (Standing Athletic Pose) */}
      <group ref={leftArmRef} position={[-0.27, 0.52, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.42, 8]} />
          <meshStandardMaterial color="#B9A78E" roughness={0.6} />
        </mesh>
        {/* Wristband */}
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 8]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.27, 0.52, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.42, 8]} />
          <meshStandardMaterial color="#B9A78E" roughness={0.6} />
        </mesh>
        {/* Wristband */}
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 8]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
      </group>

      {/* Shorts / Waist */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.25]} />
        <meshStandardMaterial color="#303238" roughness={0.7} />
      </mesh>

      {/* Left Leg */}
      <group position={[-0.12, -0.08, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.46, 8]} />
          <meshStandardMaterial color="#B9A78E" roughness={0.6} />
        </mesh>
        {/* Left Shoe */}
        <mesh position={[0, -0.5, 0.05]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.24]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.5} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.12, -0.08, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.46, 8]} />
          <meshStandardMaterial color="#B9A78E" roughness={0.6} />
        </mesh>
        {/* Right Shoe */}
        <mesh position={[0, -0.5, 0.05]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.24]} />
          <meshStandardMaterial color="#FF6B35" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

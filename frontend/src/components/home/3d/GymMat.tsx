'use strict';
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GymMatProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const GymMat: React.FC<GymMatProps> = ({
  position = [0.35, 0.005, 0.1],
  rotation = [0, -Math.PI / 2 + 0.15, 0],
}) => {
  const bodyPlankRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  // Smooth realistic pushup repetition animation
  useFrame((state) => {
    const t = state.clock.elapsedTime * 2.4;
    // pushFactor: 1 = top of pushup (arms extended), 0 = bottom of pushup (chest close to mat)
    const pushFactor = (Math.sin(t) + 1) / 2;

    // Body plank pivots realistically around the planted feet/toes
    if (bodyPlankRef.current) {
      // At bottom (pushFactor=0), plank angle is flatter (~ -0.04 rad), chest is lower
      // At top (pushFactor=1), plank angle tilts up (~ 0.18 rad), chest is high
      bodyPlankRef.current.rotation.x = -0.04 + pushFactor * 0.20;
    }

    // Arm kinematics (arms bend naturally as chest descends)
    if (leftUpperArmRef.current && rightUpperArmRef.current) {
      leftUpperArmRef.current.rotation.x = -0.25 + (1 - pushFactor) * 0.55;
      leftUpperArmRef.current.rotation.z = 0.3 + (1 - pushFactor) * 0.45;

      rightUpperArmRef.current.rotation.x = -0.25 + (1 - pushFactor) * 0.55;
      rightUpperArmRef.current.rotation.z = -0.3 - (1 - pushFactor) * 0.45;
    }

    // Forearms bend at elbow to keep hands anchored towards floor
    if (leftForearmRef.current && rightForearmRef.current) {
      leftForearmRef.current.rotation.x = 0.35 - (1 - pushFactor) * 0.75;
      rightForearmRef.current.rotation.x = 0.35 - (1 - pushFactor) * 0.75;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ================= WORKOUT MAT ================= */}
      <mesh receiveShadow>
        <boxGeometry args={[1.5, 0.015, 2.4]} />
        <meshStandardMaterial color="#E86E46" roughness={0.9} />
      </mesh>

      {/* Mat Trim / Accent Line */}
      <mesh position={[0, 0.008, 0]}>
        <boxGeometry args={[1.42, 0.002, 2.32]} />
        <meshStandardMaterial color="#D35400" roughness={0.9} />
      </mesh>

      {/* ================= UNIFIED ANATOMICAL BODY PLANK ================= */}
      {/* Pivots around feet/toes anchor position */}
      <group ref={bodyPlankRef} position={[0, 0.08, 0.75]}>
        {/* Planted Feet / Athletic Shoes (Anchor point) */}
        <group position={[0, 0, 0]}>
          {/* Left Shoe */}
          <mesh position={[-0.1, 0.02, 0.04]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.2]} />
            <meshStandardMaterial color="#1E2024" roughness={0.6} />
          </mesh>
          <mesh position={[-0.1, -0.02, 0.04]}>
            <boxGeometry args={[0.105, 0.025, 0.21]} />
            <meshStandardMaterial color="#FF6B35" />
          </mesh>

          {/* Right Shoe */}
          <mesh position={[0.1, 0.02, 0.04]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.2]} />
            <meshStandardMaterial color="#1E2024" roughness={0.6} />
          </mesh>
          <mesh position={[0.1, -0.02, 0.04]}>
            <boxGeometry args={[0.105, 0.025, 0.21]} />
            <meshStandardMaterial color="#FF6B35" />
          </mesh>
        </group>

        {/* Lower Legs / Calves & Knees */}
        <group position={[0, 0.08, -0.28]}>
          {/* Left Leg */}
          <mesh position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.042, 0.42, 10]} />
            <meshStandardMaterial color="#B9A78E" roughness={0.6} />
          </mesh>
          {/* Right Leg */}
          <mesh position={[0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.042, 0.42, 10]} />
            <meshStandardMaterial color="#B9A78E" roughness={0.6} />
          </mesh>
        </group>

        {/* Thighs / Quads */}
        <group position={[0, 0.1, -0.66]}>
          <mesh position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.052, 0.4, 10]} />
            <meshStandardMaterial color="#B9A78E" roughness={0.6} />
          </mesh>
          <mesh position={[0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.052, 0.4, 10]} />
            <meshStandardMaterial color="#B9A78E" roughness={0.6} />
          </mesh>
        </group>

        {/* Hips & Athletic Shorts (Seamlessly enclosing pelvis & thighs) */}
        <mesh position={[0, 0.12, -0.82]}>
          <boxGeometry args={[0.38, 0.2, 0.32]} />
          <meshStandardMaterial color="#22252A" roughness={0.7} />
        </mesh>

        {/* Torso / Sport Shirt & Core (Connected directly to hips) */}
        <group position={[0, 0.14, -1.14]}>
          {/* Main Torso Block */}
          <mesh>
            <boxGeometry args={[0.42, 0.22, 0.42]} />
            <meshStandardMaterial color="#FF6B35" roughness={0.6} />
          </mesh>
          {/* Sport Stripe Accent on Shirt */}
          <mesh position={[0, 0.112, 0]}>
            <boxGeometry args={[0.38, 0.01, 0.08]} />
            <meshStandardMaterial color="#F7F3EA" />
          </mesh>

          {/* Connected Neck & Head */}
          <group position={[0, 0.04, -0.32]}>
            {/* Neck */}
            <mesh position={[0, -0.02, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.065, 0.12, 10]} />
              <meshStandardMaterial color="#B9A78E" roughness={0.6} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.02, -0.06]}>
              <boxGeometry args={[0.22, 0.2, 0.22]} />
              <meshStandardMaterial color="#B9A78E" roughness={0.5} />
            </mesh>
            {/* Hair / Cap */}
            <mesh position={[0, 0.09, -0.04]}>
              <boxGeometry args={[0.24, 0.08, 0.24]} />
              <meshStandardMaterial color="#1F2328" roughness={0.8} />
            </mesh>
            {/* Athletic Headband */}
            <mesh position={[0, 0.02, -0.06]}>
              <boxGeometry args={[0.23, 0.045, 0.23]} />
              <meshStandardMaterial color="#303238" />
            </mesh>
          </group>

          {/* ================= CONNECTED ARMS WITH INTEGRATED HANDS ================= */}
          {/* --- Left Arm Hierarchy --- */}
          <group position={[-0.24, 0.02, -0.1]}>
            {/* Shoulder Ball Joint */}
            <mesh>
              <sphereGeometry args={[0.065, 12, 12]} />
              <meshStandardMaterial color="#FF6B35" roughness={0.6} />
            </mesh>
            {/* Left Upper Arm */}
            <group ref={leftUpperArmRef}>
              <mesh position={[-0.04, -0.12, 0]}>
                <cylinderGeometry args={[0.05, 0.045, 0.24, 10]} />
                <meshStandardMaterial color="#B9A78E" roughness={0.6} />
              </mesh>
              {/* Elbow Ball Joint */}
              <mesh position={[-0.04, -0.24, 0]}>
                <sphereGeometry args={[0.048, 10, 10]} />
                <meshStandardMaterial color="#B9A78E" roughness={0.6} />
              </mesh>
              {/* Left Forearm & Hand */}
              <group ref={leftForearmRef} position={[-0.04, -0.24, 0]}>
                <mesh position={[0, -0.1, 0.04]} rotation={[0.3, 0, 0]}>
                  <cylinderGeometry args={[0.042, 0.038, 0.22, 10]} />
                  <meshStandardMaterial color="#B9A78E" roughness={0.6} />
                </mesh>
                {/* Integrated Hand Palm */}
                <mesh position={[0, -0.22, 0.07]}>
                  <boxGeometry args={[0.08, 0.025, 0.1]} />
                  <meshStandardMaterial color="#B9A78E" roughness={0.6} />
                </mesh>
              </group>
            </group>
          </group>

          {/* --- Right Arm Hierarchy --- */}
          <group position={[0.24, 0.02, -0.1]}>
            {/* Shoulder Ball Joint */}
            <mesh>
              <sphereGeometry args={[0.065, 12, 12]} />
              <meshStandardMaterial color="#FF6B35" roughness={0.6} />
            </mesh>
            {/* Right Upper Arm */}
            <group ref={rightUpperArmRef}>
              <mesh position={[0.04, -0.12, 0]}>
                <cylinderGeometry args={[0.05, 0.045, 0.24, 10]} />
                <meshStandardMaterial color="#B9A78E" roughness={0.6} />
              </mesh>
              {/* Elbow Ball Joint */}
              <mesh position={[0.04, -0.24, 0]}>
                <sphereGeometry args={[0.048, 10, 10]} />
                <meshStandardMaterial color="#B9A78E" roughness={0.6} />
              </mesh>
              {/* Right Forearm & Hand */}
              <group ref={rightForearmRef} position={[0.04, -0.24, 0]}>
                <mesh position={[0, -0.1, 0.04]} rotation={[0.3, 0, 0]}>
                  <cylinderGeometry args={[0.042, 0.038, 0.22, 10]} />
                  <meshStandardMaterial color="#B9A78E" roughness={0.6} />
                </mesh>
                {/* Integrated Hand Palm */}
                <mesh position={[0, -0.22, 0.07]}>
                  <boxGeometry args={[0.08, 0.025, 0.1]} />
                  <meshStandardMaterial color="#B9A78E" roughness={0.6} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

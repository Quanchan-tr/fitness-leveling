'use strict';
'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BodyMetricBoardProps {
  onOpen: () => void;
}

export const BodyMetricBoard: React.FC<BodyMetricBoardProps> = ({ onOpen }) => {
  const [hovered, setHovered] = useState(false);
  const boardRef = useRef<THREE.Group>(null);

  // Subtle pulsing/glow effect
  useFrame((state) => {
    if (boardRef.current) {
      if (hovered) {
        boardRef.current.position.z = -3.64 + Math.sin(state.clock.elapsedTime * 4) * 0.008;
      } else {
        boardRef.current.position.z = -3.68;
      }
    }
  });

  return (
    <group
      ref={boardRef}
      position={[1.85, 2.22, -3.68]}
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
      {/* Outer Sleek Metallic / Carbon Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.08, 1.28, 0.035]} />
        <meshStandardMaterial
          color={hovered ? '#38BDF8' : '#181A20'}
          metalness={0.8}
          roughness={0.2}
          emissive={hovered ? '#0284C7' : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>

      {/* Dark High-Tech Screen Surface */}
      <mesh position={[0, 0, 0.018]}>
        <boxGeometry args={[0.98, 1.18, 0.005]} />
        <meshStandardMaterial color="#0E131F" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Header Bar */}
      <group position={[0, 0.46, 0.022]}>
        {/* Title plate */}
        <mesh position={[-0.14, 0, 0]}>
          <boxGeometry args={[0.58, 0.08, 0.002]} />
          <meshStandardMaterial color="#0284C7" emissive="#0369A1" emissiveIntensity={0.6} />
        </mesh>
        {/* Live status dot */}
        <mesh position={[0.34, 0, 0]}>
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial color="#22C55E" emissive="#4ADE80" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* 1. Body Weight Trend Graph (Pixel / Segmented Line) */}
      <group position={[0, 0.22, 0.022]}>
        {/* Graph background box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.88, 0.26, 0.001]} />
          <meshStandardMaterial color="#161F30" roughness={0.9} />
        </mesh>
        {/* Grid lines */}
        {[-0.08, 0, 0.08].map((y, i) => (
          <mesh key={`grid-y-${i}`} position={[0, y, 0.001]}>
            <boxGeometry args={[0.84, 0.004, 0.001]} />
            <meshBasicMaterial color="#22354E" />
          </mesh>
        ))}
        {/* Trend Line (Decreasing Weight Progress Segments) */}
        {[
          [-0.35, 0.06, 0.08, 0.015, -0.2],
          [-0.22, 0.04, 0.12, 0.015, -0.1],
          [-0.08, 0.02, 0.12, 0.015, 0.15],
          [0.06, 0.03, 0.11, 0.015, -0.3],
          [0.2, -0.01, 0.12, 0.015, -0.25],
          [0.34, -0.05, 0.1, 0.015, -0.15],
        ].map(([x, y, w, h, rot], i) => (
          <mesh key={`trend-${i}`} position={[x as number, y as number, 0.003]} rotation={[0, 0, rot as number]}>
            <boxGeometry args={[w as number, h as number, 0.001]} />
            <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={1.0} />
          </mesh>
        ))}
        {/* Current Weight Data Point Glow Node */}
        <mesh position={[0.38, -0.06, 0.004]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial color="#F43F5E" emissive="#FB7185" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* 2. Body Metrics Progress Bars (Muscle Mass, Body Fat, Calorie Goal) */}
      <group position={[0, -0.14, 0.022]}>
        {/* Metric 1: Muscle Mass (Green) */}
        <group position={[0, 0.14, 0]}>
          {/* Label block */}
          <mesh position={[-0.32, 0, 0]}>
            <boxGeometry args={[0.22, 0.045, 0.001]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Track background */}
          <mesh position={[0.12, 0, 0]}>
            <boxGeometry args={[0.58, 0.04, 0.001]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Filled bar (82%) */}
          <mesh position={[-0.04, 0, 0.002]}>
            <boxGeometry args={[0.46, 0.034, 0.001]} />
            <meshStandardMaterial color="#22C55E" emissive="#16A34A" emissiveIntensity={0.9} />
          </mesh>
        </group>

        {/* Metric 2: Body Fat Reduction (Orange/Red) */}
        <group position={[0, 0.04, 0]}>
          <mesh position={[-0.32, 0, 0]}>
            <boxGeometry args={[0.22, 0.045, 0.001]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <boxGeometry args={[0.58, 0.04, 0.001]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Filled bar (65%) */}
          <mesh position={[-0.09, 0, 0.002]}>
            <boxGeometry args={[0.36, 0.034, 0.001]} />
            <meshStandardMaterial color="#F97316" emissive="#EA580C" emissiveIntensity={0.9} />
          </mesh>
        </group>

        {/* Metric 3: Weekly Calorie Burn Target (Purple/Cyan) */}
        <group position={[0, -0.06, 0]}>
          <mesh position={[-0.32, 0, 0]}>
            <boxGeometry args={[0.22, 0.045, 0.001]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <boxGeometry args={[0.58, 0.04, 0.001]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Filled bar (90%) */}
          <mesh position={[-0.02, 0, 0.002]}>
            <boxGeometry args={[0.5, 0.034, 0.001]} />
            <meshStandardMaterial color="#818CF8" emissive="#6366F1" emissiveIntensity={0.9} />
          </mesh>
        </group>
      </group>

      {/* 3. Bottom Quick Stat Blocks */}
      <group position={[0, -0.42, 0.022]}>
        {[-0.28, 0, 0.28].map((x, i) => {
          const colors = ['#38BDF8', '#22C55E', '#F43F5E'];
          return (
            <group key={`stat-box-${i}`} position={[x, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.24, 0.12, 0.002]} />
                <meshStandardMaterial color="#131B2A" />
              </mesh>
              {/* Stat indicator dot */}
              <mesh position={[0, 0.025, 0.002]}>
                <boxGeometry args={[0.16, 0.03, 0.001]} />
                <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.8} />
              </mesh>
              <mesh position={[0, -0.025, 0.002]}>
                <boxGeometry args={[0.12, 0.018, 0.001]} />
                <meshStandardMaterial color="#94A3B8" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Interactive Click Indicator when hovered */}
      {hovered && (
        <group position={[0, 0, 0.04]}>
          <mesh>
            <planeGeometry args={[0.96, 1.16]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.12} side={THREE.DoubleSide} />
          </mesh>
          {/* Glowing border ring */}
          <mesh position={[0, 0, 0.005]}>
            <ringGeometry args={[0.42, 0.46, 32]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};

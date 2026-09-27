'use strict';
'use client';

import React from 'react';

interface WeightRackProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const WeightRack: React.FC<WeightRackProps> = ({
  position = [3.18, 0, 0.4],
  rotation = [0, -Math.PI / 2, 0],
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* ================= HIGH-VISIBILITY COMMERCIAL GYM RED & CHROME 3-TIER RACK ================= */}
      {/* Left Heavy Steel Stanchion (Bold Gym Racing Red) */}
      <mesh position={[-0.7, 0.52, 0]} castShadow>
        <boxGeometry args={[0.065, 1.04, 0.46]} />
        <meshStandardMaterial color="#E11D48" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* Left Base Foot */}
      <mesh position={[-0.7, 0.03, 0]} castShadow>
        <boxGeometry args={[0.085, 0.06, 0.6]} />
        <meshStandardMaterial color="#BE123C" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Right Heavy Steel Stanchion (Bold Gym Racing Red) */}
      <mesh position={[0.7, 0.52, 0]} castShadow>
        <boxGeometry args={[0.065, 1.04, 0.46]} />
        <meshStandardMaterial color="#E11D48" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* Right Base Foot */}
      <mesh position={[0.7, 0.03, 0]} castShadow>
        <boxGeometry args={[0.085, 0.06, 0.6]} />
        <meshStandardMaterial color="#BE123C" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Bottom Cross Bar (Satin Black Steel) */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.4, 0.05, 0.08]} />
        <meshStandardMaterial color="#1E2024" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* --- TOP TIER RAIL (Light Dumbbells: 5kg - 12.5kg) --- */}
      <mesh position={[0, 0.88, -0.08]} rotation={[0.22, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.04, 0.26]} />
        <meshStandardMaterial color="#27272A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Chrome Rail Edge Trim */}
      <mesh position={[0, 0.9, -0.21]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.42, 0.015, 0.015]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Top Tier Dumbbells */}
      {[-0.52, -0.17, 0.17, 0.52].map((x, i) => {
        const radius = 0.052 + i * 0.007;
        const width = 0.042 + i * 0.004;
        return (
          <group key={`db-top-${i}`} position={[x, 0.94, -0.08]} rotation={[0.22, 0, 0]}>
            {/* Chrome Handle with Knurling */}
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 0.22, 10]} />
              <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Left Weight Head */}
            <mesh position={[-0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius, radius, width, 14]} />
              <meshStandardMaterial color="#18181B" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Left Color Ring Accent */}
            <mesh position={[-0.112, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.005, 14]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.4} />
            </mesh>
            {/* Right Weight Head */}
            <mesh position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius, radius, width, 14]} />
              <meshStandardMaterial color="#18181B" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Right Color Ring Accent */}
            <mesh position={[0.112, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.005, 14]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* --- MIDDLE TIER RAIL (Medium Dumbbells: 15kg - 22.5kg) --- */}
      <mesh position={[0, 0.54, 0.02]} rotation={[0.22, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.04, 0.28]} />
        <meshStandardMaterial color="#27272A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Chrome Rail Edge Trim */}
      <mesh position={[0, 0.56, -0.11]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.42, 0.015, 0.015]} />
        <meshStandardMaterial color="#0284C7" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Middle Tier Dumbbells */}
      {[-0.52, -0.17, 0.17, 0.52].map((x, i) => {
        const radius = 0.076 + i * 0.006;
        const width = 0.055 + i * 0.005;
        return (
          <group key={`db-mid-${i}`} position={[x, 0.6, 0.02]} rotation={[0.22, 0, 0]}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.24, 10]} />
              <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Left Weight Head */}
            <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius, radius, width, 14]} />
              <meshStandardMaterial color="#18181B" roughness={0.5} metalness={0.2} />
            </mesh>
            <mesh position={[-0.128, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.88, radius * 0.88, 0.005, 14]} />
              <meshStandardMaterial color="#0284C7" roughness={0.4} />
            </mesh>
            {/* Right Weight Head */}
            <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius, radius, width, 14]} />
              <meshStandardMaterial color="#18181B" roughness={0.5} metalness={0.2} />
            </mesh>
            <mesh position={[0.128, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.88, radius * 0.88, 0.005, 14]} />
              <meshStandardMaterial color="#0284C7" roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* --- BOTTOM TIER RAIL (Heavy Hex Dumbbells: 25kg - 35kg) --- */}
      <mesh position={[0, 0.2, 0.12]} rotation={[0.22, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.04, 0.3]} />
        <meshStandardMaterial color="#27272A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Chrome Rail Edge Trim */}
      <mesh position={[0, 0.22, -0.01]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.42, 0.015, 0.015]} />
        <meshStandardMaterial color="#EF4444" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Bottom Tier Heavy Hex Dumbbells */}
      {[-0.46, 0, 0.46].map((x, i) => {
        const radius = 0.096 + i * 0.008;
        const width = 0.07 + i * 0.006;
        return (
          <group key={`db-btm-${i}`} position={[x, 0.27, 0.12]} rotation={[0.22, 0, 0]}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.26, 10]} />
              <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Hex shape via 6-sided cylinder */}
            <mesh position={[-0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius, radius, width, 6]} />
              <meshStandardMaterial color="#111827" roughness={0.45} metalness={0.2} />
            </mesh>
            <mesh position={[-0.146, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.75, radius * 0.75, 0.005, 6]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} />
            </mesh>
            <mesh position={[0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[radius, radius, width, 6]} />
              <meshStandardMaterial color="#111827" roughness={0.45} metalness={0.2} />
            </mesh>
            <mesh position={[0.146, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 0.75, radius * 0.75, 0.005, 6]} />
              <meshStandardMaterial color="#EF4444" roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* --- SIDE ACCESSORIES: VIBRANT KETTLEBELLS & OLYMPIC BUMPER PLATES --- */}
      {/* 24kg Heavy Competition Kettlebell (Matte Black with Green Ring) */}
      <group position={[-0.98, 0.14, 0.18]}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <torusGeometry args={[0.075, 0.022, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#10B981" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* 16kg Kettlebell (Bright Orange Red Body) */}
      <group position={[-0.94, 0.11, -0.15]}>
        <mesh castShadow>
          <sphereGeometry args={[0.105, 16, 16]} />
          <meshStandardMaterial color="#F97316" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <torusGeometry args={[0.065, 0.018, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1F2937" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Stacked Olympic Bumper Weight Plates beside the rack */}
      <group position={[0.95, 0, 0.15]}>
        {/* 25kg Red Bumper Plate */}
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>
        {/* 20kg Blue Bumper Plate */}
        <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.21, 0.21, 0.045, 24]} />
          <meshStandardMaterial color="#2563EB" roughness={0.4} />
        </mesh>
        {/* 15kg Yellow Bumper Plate */}
        <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 24]} />
          <meshStandardMaterial color="#EAB308" roughness={0.4} />
        </mesh>
        {/* 10kg Green Bumper Plate */}
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.035, 24]} />
          <meshStandardMaterial color="#16A34A" roughness={0.4} />
        </mesh>
        {/* Center Metal Ring Collar */}
        <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.19, 16]} />
          <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

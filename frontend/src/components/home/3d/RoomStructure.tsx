'use strict';
'use client';

import React from 'react';
import * as THREE from 'three';
import { WeightRack } from './WeightRack';

interface RoomStructureProps {
  onOpenBodyMetrics?: () => void;
}

export const RoomStructure: React.FC<RoomStructureProps> = () => {
  return (
    <group>
      {/* ================= FLOOR ================= */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.1, 7.6]} />
        <meshStandardMaterial color="#B08355" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* ================= CEILING ================= */}
      <mesh position={[0, 3.45, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.1, 7.6]} />
        <meshStandardMaterial color="#DDD3C4" roughness={0.88} />
      </mesh>

      {/* 4 Recessed Circular Ceiling Downlights */}
      {[
        [-1.6, 0.8],
        [1.6, 0.8],
        [-1.6, -2.0],
        [1.6, -2.0],
      ].map(([x, z], i) => (
        <group key={`downlight-${i}`} position={[x, 3.395, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.16, 24]} />
            <meshStandardMaterial color="#F5EFE6" roughness={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 24]} />
            <meshStandardMaterial
              color="#FFF9E6"
              emissive="#FFEAB8"
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* ================= LEFT WALL (x = -3.6) ================= */}
      <mesh position={[-3.6, 1.7, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.4, 7.6]} />
        <meshStandardMaterial color="#C5B5A2" roughness={0.85} />
      </mesh>
      <mesh position={[-3.48, 0.08, 0]}>
        <boxGeometry args={[0.04, 0.16, 7.5]} />
        <meshStandardMaterial color="#543A26" roughness={0.6} />
      </mesh>
      <mesh position={[-3.48, 3.34, 0]}>
        <boxGeometry args={[0.04, 0.12, 7.5]} />
        <meshStandardMaterial color="#543A26" roughness={0.6} />
      </mesh>

      {/* ================= RIGHT WALL (x = 3.6) ================= */}
      <mesh position={[3.6, 1.7, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.4, 7.6]} />
        <meshStandardMaterial color="#C5B5A2" roughness={0.85} />
      </mesh>
      <mesh position={[3.48, 0.08, 0]}>
        <boxGeometry args={[0.04, 0.16, 7.5]} />
        <meshStandardMaterial color="#543A26" roughness={0.6} />
      </mesh>
      <mesh position={[3.48, 3.34, 0]}>
        <boxGeometry args={[0.04, 0.12, 7.5]} />
        <meshStandardMaterial color="#543A26" roughness={0.6} />
      </mesh>

      {/* ================= BACK WALL (z = -3.8) ================= */}
      <mesh position={[-2.35, 1.7, -3.8]} receiveShadow>
        <boxGeometry args={[2.3, 3.4, 0.2]} />
        <meshStandardMaterial color="#C4B39F" roughness={0.85} />
      </mesh>
      <mesh position={[2.35, 1.7, -3.8]} receiveShadow>
        <boxGeometry args={[2.3, 3.4, 0.2]} />
        <meshStandardMaterial color="#C4B39F" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.95, -3.8]} receiveShadow>
        <boxGeometry args={[2.4, 0.9, 0.2]} />
        <meshStandardMaterial color="#C4B39F" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.45, -3.8]} receiveShadow>
        <boxGeometry args={[2.4, 0.9, 0.2]} />
        <meshStandardMaterial color="#C4B39F" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.08, -3.68]}>
        <boxGeometry args={[7.0, 0.16, 0.04]} />
        <meshStandardMaterial color="#543A26" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.34, -3.68]}>
        <boxGeometry args={[7.0, 0.12, 0.04]} />
        <meshStandardMaterial color="#543A26" roughness={0.6} />
      </mesh>

      {/* ================= BACK WALL WINDOW & WINDOW SILL ================= */}
      <group position={[0, 1.7, -3.8]}>
        {/* Outer Window Frame */}
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[2.44, 0.08, 0.24]} />
          <meshStandardMaterial color="#EDE5D8" roughness={0.5} />
        </mesh>
        {/* Lower Window Sill Shelf */}
        <mesh position={[0, -0.82, 0.05]} receiveShadow>
          <boxGeometry args={[2.6, 0.1, 0.36]} />
          <meshStandardMaterial color="#543A26" roughness={0.6} />
        </mesh>
        <mesh position={[-1.16, 0, 0]}>
          <boxGeometry args={[0.08, 1.64, 0.24]} />
          <meshStandardMaterial color="#EDE5D8" roughness={0.5} />
        </mesh>
        <mesh position={[1.16, 0, 0]}>
          <boxGeometry args={[0.08, 1.64, 0.24]} />
          <meshStandardMaterial color="#EDE5D8" roughness={0.5} />
        </mesh>

        {/* Center Mullions */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.06, 1.64, 0.2]} />
          <meshStandardMaterial color="#EDE5D8" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[2.34, 0.05, 0.2]} />
          <meshStandardMaterial color="#EDE5D8" roughness={0.5} />
        </mesh>

        {/* Glass Window Pane */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.3, 1.56]} />
          <meshStandardMaterial
            color="#DCEBF8"
            transparent
            opacity={0.15}
            roughness={0.05}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* ================= WINDOW SILL PLANTS (CHẬU CÂY BÊN PHÍA CỬA SỔ) ================= */}
        {/* Plant 1: Ceramic Pot with Green Foliage on Right Side of Window Sill */}
        <group position={[0.78, -0.66, 0.12]}>
          {/* Ceramic Planter Pot */}
          <mesh>
            <cylinderGeometry args={[0.09, 0.07, 0.16, 16]} />
            <meshStandardMaterial color="#FAF5EE" roughness={0.3} />
          </mesh>
          {/* Dark Soil */}
          <mesh position={[0, 0.075, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.015, 16]} />
            <meshStandardMaterial color="#3E2723" roughness={0.9} />
          </mesh>
          {/* Lush Green Leaf Cluster */}
          {[-0.03, 0.03].map((lx, i) =>
            [-0.03, 0.03].map((lz, j) => (
              <mesh
                key={`leaf-cluster-${i}-${j}`}
                position={[lx, 0.14 + (i + j) * 0.03, lz]}
                rotation={[(i - 0.5) * 0.4, 0, (j - 0.5) * 0.4]}
              >
                <sphereGeometry args={[0.065, 10, 10]} />
                <meshStandardMaterial color={i === 0 ? '#43A047' : '#2E7D32'} roughness={0.7} />
              </mesh>
            ))
          )}
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#66BB6A" roughness={0.7} />
          </mesh>
        </group>

        {/* Plant 2: Mini Succulent Pot on Left Side of Window Sill */}
        <group position={[-0.82, -0.7, 0.12]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.05, 0.1, 14]} />
            <meshStandardMaterial color="#D7CCC8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 14]} />
            <meshStandardMaterial color="#3E2723" roughness={0.9} />
          </mesh>
          {/* Succulent Petals */}
          {[0, 1, 2, 3, 4, 5].map((angle, idx) => (
            <mesh
              key={`succulent-petal-${idx}`}
              position={[
                Math.sin((angle * Math.PI) / 3) * 0.035,
                0.08,
                Math.cos((angle * Math.PI) / 3) * 0.035,
              ]}
              rotation={[0.3, (angle * Math.PI) / 3, 0]}
            >
              <boxGeometry args={[0.035, 0.05, 0.02]} />
              <meshStandardMaterial color="#4DB6AC" roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 0.11, 0]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color="#80CBC4" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* ================= 1. PIXEL ART GYM / BODYBUILDING POSTER (LEFT OF WINDOW) ================= */}
      <group position={[-2.3, 2.25, -3.68]}>
        {/* Frame Outer Border */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.08, 1.28, 0.035]} />
          <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Poster Canvas Background (Dark Arcade Aesthetic) */}
        <mesh position={[0, 0, 0.018]}>
          <boxGeometry args={[0.98, 1.18, 0.005]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.9} />
        </mesh>

        {/* Pixel Art Gym Lifter Graphic (Built with precise pixel blocks) */}
        <group position={[0, 0.06, 0.022]}>
          {/* Barbell Weight Plates (Left & Right Hex/Pixel Plates) */}
          {[-0.34, -0.3, 0.3, 0.34].map((px, i) => (
            <mesh key={`bar-plate-${i}`} position={[px, 0.28, 0]}>
              <boxGeometry args={[0.035, 0.22, 0.002]} />
              <meshStandardMaterial color="#EF4444" emissive="#DC2626" emissiveIntensity={0.6} />
            </mesh>
          ))}
          {/* Barbell Bar (Cyan glowing steel) */}
          <mesh position={[0, 0.28, 0.001]}>
            <boxGeometry args={[0.72, 0.03, 0.002]} />
            <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.8} />
          </mesh>

          {/* Lifter Head / Cap */}
          <mesh position={[0, 0.22, 0.002]}>
            <boxGeometry args={[0.1, 0.09, 0.002]} />
            <meshStandardMaterial color="#FBBF24" emissive="#D97706" emissiveIntensity={0.3} />
          </mesh>

          {/* Powerful Traps / Shoulders & Chest */}
          <mesh position={[0, 0.11, 0.002]}>
            <boxGeometry args={[0.3, 0.11, 0.002]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.4} />
          </mesh>

          {/* Biceps Flexing Upwards towards Barbell */}
          <mesh position={[-0.18, 0.21, 0.002]}>
            <boxGeometry args={[0.08, 0.12, 0.002]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.18, 0.21, 0.002]}>
            <boxGeometry args={[0.08, 0.12, 0.002]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.4} />
          </mesh>

          {/* V-Taper Abs / Core */}
          <mesh position={[0, -0.01, 0.002]}>
            <boxGeometry args={[0.2, 0.11, 0.002]} />
            <meshStandardMaterial color="#D97706" />
          </mesh>
          {/* 6-pack Pixel Grid Lines */}
          <mesh position={[0, -0.01, 0.004]}>
            <boxGeometry args={[0.015, 0.09, 0.001]} />
            <meshBasicMaterial color="#92400E" />
          </mesh>
          <mesh position={[0, -0.01, 0.004]}>
            <boxGeometry args={[0.14, 0.015, 0.001]} />
            <meshBasicMaterial color="#92400E" />
          </mesh>

          {/* Athletic Gym Shorts (Cyan Pixel) */}
          <mesh position={[0, -0.12, 0.002]}>
            <boxGeometry args={[0.22, 0.09, 0.002]} />
            <meshStandardMaterial color="#06B6D4" emissive="#0891B2" emissiveIntensity={0.5} />
          </mesh>

          {/* Muscular Quads / Legs */}
          <mesh position={[-0.065, -0.23, 0.002]}>
            <boxGeometry args={[0.08, 0.12, 0.002]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
          <mesh position={[0.065, -0.23, 0.002]}>
            <boxGeometry args={[0.08, 0.12, 0.002]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>

          {/* Gym Shoes */}
          <mesh position={[-0.075, -0.31, 0.002]}>
            <boxGeometry args={[0.1, 0.04, 0.002]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <mesh position={[0.075, -0.31, 0.002]}>
            <boxGeometry args={[0.1, 0.04, 0.002]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
        </group>

        {/* Retro Pixel Gym Typography Banner: "NO PAIN NO GAIN / LEVEL UP" */}
        <group position={[0, -0.42, 0.022]}>
          <mesh>
            <boxGeometry args={[0.82, 0.09, 0.002]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Pixel block letters representation */}
          {[-0.32, -0.22, -0.12, -0.02, 0.08, 0.18, 0.28].map((lx, i) => (
            <mesh key={`text-pixel-${i}`} position={[lx, 0, 0.002]}>
              <boxGeometry args={[0.05, 0.045, 0.001]} />
              <meshStandardMaterial color="#22C55E" emissive="#16A34A" emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ================= 2. MOTIVATIONAL GYM LED WALL ART (RIGHT OF WINDOW) ================= */}
      <group position={[1.85, 2.22, -3.68]}>
        {/* Sleek Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.08, 1.28, 0.035]} />
          <meshStandardMaterial color="#181A20" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Dark Obsidian Inset Canvas */}
        <mesh position={[0, 0, 0.018]}>
          <boxGeometry args={[0.98, 1.18, 0.005]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.8} />
        </mesh>
        {/* Geometric Glowing Hexagon / Fitness Wings Artwork */}
        <group position={[0, 0.08, 0.022]}>
          <mesh>
            <ringGeometry args={[0.26, 0.28, 6]} />
            <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[0.12, 6]} />
            <meshStandardMaterial color="#FF6B35" emissive="#EA580C" emissiveIntensity={1.0} />
          </mesh>
          {/* Futuristic Speed Lines */}
          {[-0.32, -0.22, 0.22, 0.32].map((x, i) => (
            <mesh key={`art-line-${i}`} position={[x, -0.2, 0.002]}>
              <boxGeometry args={[0.06, 0.015, 0.001]} />
              <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>
        {/* Typography Badge "FITNESS LEVELING" */}
        <group position={[0, -0.42, 0.022]}>
          <mesh>
            <boxGeometry args={[0.76, 0.08, 0.002]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <boxGeometry args={[0.62, 0.025, 0.001]} />
            <meshStandardMaterial color="#F4C95D" emissive="#EAB308" emissiveIntensity={0.9} />
          </mesh>
        </group>
      </group>

      {/* ================= 3. ENLARGED RGB GAMING PC & DESK SETUP ================= */}
      <group position={[1.85, 0, -2.75]}>
        {/* Large Gaming Desk Tabletop (Ergonomic Carbon Texture) */}
        <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.045, 0.76]} />
          <meshStandardMaterial color="#1A1C20" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Desk Front Chamfer Edge / Accent */}
        <mesh position={[0, 0.725, 0.38]}>
          <boxGeometry args={[1.48, 0.02, 0.015]} />
          <meshStandardMaterial color="#FF6B35" emissive="#EA580C" emissiveIntensity={0.6} />
        </mesh>

        {/* Heavy Duty Z-Frame Steel Legs */}
        {[-0.64, 0.64].map((lx, i) => (
          <group key={`desk-z-leg-${i}`} position={[lx, 0.36, 0]}>
            {/* Top mounting plate */}
            <mesh position={[0, 0.34, 0]} castShadow>
              <boxGeometry args={[0.05, 0.03, 0.66]} />
              <meshStandardMaterial color="#141518" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Angled main Z-pillar */}
            <mesh position={[0, 0, 0]} rotation={[0.25 * (i === 0 ? 1 : 1), 0, 0]} castShadow>
              <boxGeometry args={[0.05, 0.7, 0.06]} />
              <meshStandardMaterial color="#1F2228" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Bottom floor foot */}
            <mesh position={[0, -0.34, 0]} castShadow>
              <boxGeometry args={[0.06, 0.04, 0.7]} />
              <meshStandardMaterial color="#141518" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Desk Back Reinforcement Cable Channel */}
        <mesh position={[0, 0.52, -0.3]}>
          <boxGeometry args={[1.25, 0.12, 0.03]} />
          <meshStandardMaterial color="#141518" metalness={0.8} />
        </mesh>

        {/* Ambient Subtle LED Strip Backglow */}
        <mesh position={[0, 0.71, -0.37]}>
          <boxGeometry args={[1.44, 0.015, 0.02]} />
          <meshStandardMaterial
            color="#0284C7"
            emissive="#38BDF8"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
        <pointLight position={[0, 0.75, -0.39]} color="#38BDF8" intensity={0.3} distance={1.2} />

        {/* Extended XXL RGB Gaming Desk Mat / Mousepad */}
        <mesh position={[-0.14, 0.755, 0.04]} receiveShadow>
          <boxGeometry args={[0.92, 0.005, 0.44]} />
          <meshStandardMaterial color="#111317" roughness={0.85} />
        </mesh>
        {/* Subtle Glowing border on mousepad */}
        <mesh position={[-0.14, 0.754, 0.04]}>
          <boxGeometry args={[0.935, 0.003, 0.455]} />
          <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.6} />
        </mesh>

        {/* --- CURVED ULTRAWIDE GAMING MONITOR & LIGHT BAR --- */}
        <group position={[-0.14, 1.06, -0.15]}>
          {/* Heavy Duty Monitor Stand & Articulated Arm */}
          <mesh position={[0, -0.16, -0.06]} castShadow>
            <cylinderGeometry args={[0.02, 0.025, 0.32, 12]} />
            <meshStandardMaterial color="#2B2D33" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.22, 0.015, 0.18]} />
            <meshStandardMaterial color="#1E2024" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Curved Ultrawide Display Center Panel */}
          <mesh castShadow>
            <boxGeometry args={[0.68, 0.28, 0.02]} />
            <meshStandardMaterial color="#15171C" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Left curved wing */}
          <mesh position={[-0.34, 0, 0.025]} rotation={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[0.18, 0.28, 0.018]} />
            <meshStandardMaterial color="#15171C" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Right curved wing */}
          <mesh position={[0.34, 0, 0.025]} rotation={[0, -0.16, 0]} castShadow>
            <boxGeometry args={[0.18, 0.28, 0.018]} />
            <meshStandardMaterial color="#15171C" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Glowing Ultrawide Screen Display */}
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.66, 0.26]} />
            <meshStandardMaterial
              color="#0B132B"
              emissive="#0284C7"
              emissiveIntensity={0.5}
              roughness={0.2}
            />
          </mesh>
          {/* In-Screen Game / Fitness UI Elements */}
          <mesh position={[-0.14, 0.02, 0.014]}>
            <planeGeometry args={[0.3, 0.18]} />
            <meshStandardMaterial color="#38BDF8" emissive="#0EA5E9" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.16, 0.02, 0.014]}>
            <planeGeometry args={[0.24, 0.18]} />
            <meshStandardMaterial color="#818CF8" emissive="#6366F1" emissiveIntensity={0.5} />
          </mesh>

          {/* --- MODERN MONITOR SCREEN LIGHT BAR --- */}
          <group position={[0, 0.16, 0.02]}>
            {/* Monitor Mount Clip */}
            <mesh position={[0, -0.02, -0.03]} castShadow>
              <boxGeometry args={[0.08, 0.04, 0.06]} />
              <meshStandardMaterial color="#1E2024" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Aluminum Light Bar Tubular Body */}
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 0.52, 16]} />
              <meshStandardMaterial color="#181A20" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Downward Warm LED Diffuser Strip */}
            <mesh position={[0, -0.009, 0.005]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.48, 0.004, 0.008]} />
              <meshStandardMaterial
                color="#FFF6E0"
                emissive="#FFF2CC"
                emissiveIntensity={1.8}
                roughness={0.1}
              />
            </mesh>
            {/* Downward Desk Task Light */}
            <pointLight
              position={[0, -0.04, 0.06]}
              color="#FFF6E6"
              intensity={0.45}
              distance={0.85}
              decay={2}
            />
          </group>
        </group>

        {/* --- MECHANICAL RGB GAMING KEYBOARD --- */}
        <group position={[-0.22, 0.765, 0.08]} rotation={[-0.04, 0.02, 0]}>
          {/* Keyboard Base Case */}
          <mesh castShadow>
            <boxGeometry args={[0.36, 0.015, 0.14]} />
            <meshStandardMaterial color="#181A20" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Backlit Keycaps Matrix */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.34, 0.008, 0.12]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#00F0FF"
              emissiveIntensity={0.9}
              roughness={0.3}
            />
          </mesh>
        </group>

        {/* --- ERGONOMIC GAMING MOUSE --- */}
        <group position={[0.14, 0.765, 0.08]} rotation={[0, -0.08, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.065, 0.024, 0.1]} />
            <meshStandardMaterial color="#1E2026" roughness={0.4} metalness={0.4} />
          </mesh>
          {/* Glowing RGB Scroll Wheel & Logo */}
          <mesh position={[0, 0.014, -0.02]}>
            <boxGeometry args={[0.012, 0.01, 0.028]} />
            <meshStandardMaterial color="#F43F5E" emissive="#FB7185" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* --- HIGH-END RGB GAMING PC TOWER CASE --- */}
        <group position={[0.54, 0.98, -0.04]}>
          {/* PC Case Chassis (Matte Obsidian Black) */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.44, 0.44]} />
            <meshStandardMaterial color="#121316" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Tempered Glass Side Panel (Facing User/Left) */}
          <mesh position={[-0.122, 0, 0]}>
            <boxGeometry args={[0.005, 0.4, 0.4]} />
            <meshStandardMaterial
              color="#1E293B"
              transparent
              opacity={0.3}
              roughness={0.1}
              metalness={0.5}
            />
          </mesh>

          {/* Glowing RGB Dual Front Intake Fans */}
          <mesh position={[0, 0.1, 0.222]}>
            <circleGeometry args={[0.06, 16]} />
            <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={1.6} />
          </mesh>
          <mesh position={[0, -0.1, 0.222]}>
            <circleGeometry args={[0.06, 16]} />
            <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={1.6} />
          </mesh>

          {/* Internal Glowing RGB Components (Graphics Card & CPU Cooler inside) */}
          <mesh position={[-0.04, -0.04, 0]}>
            <boxGeometry args={[0.06, 0.05, 0.26]} />
            <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[-0.04, 0.08, -0.04]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
            <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={1.8} />
          </mesh>
        </group>

        {/* --- GAMING HEADSET ON SLEEK STAND --- */}
        <group position={[-0.6, 0.9, -0.15]}>
          {/* Aluminum Stand Base & Pole */}
          <mesh position={[0, -0.14, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.015, 16]} />
            <meshStandardMaterial color="#2B2D33" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.28, 10]} />
            <meshStandardMaterial color="#2B2D33" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Headband Arc */}
          <mesh position={[0, 0.12, 0]}>
            <torusGeometry args={[0.06, 0.014, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#FF6B35" roughness={0.5} />
          </mesh>
          {/* Ear Cups */}
          <mesh position={[-0.055, 0.06, 0]} castShadow>
            <boxGeometry args={[0.03, 0.06, 0.05]} />
            <meshStandardMaterial color="#181A20" roughness={0.4} />
          </mesh>
          <mesh position={[0.055, 0.06, 0]} castShadow>
            <boxGeometry args={[0.03, 0.06, 0.05]} />
            <meshStandardMaterial color="#181A20" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ================= 4. CORNER BOOKSHELF BESIDE PC DESK ================= */}
      {/* Sleek Modern Multi-Tier Bookcase against right wall next to PC desk */}
      <group position={[3.25, 0, -2.7]}>
        {/* Bookshelf Outer Wooden Frame */}
        <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 1.08, 0.88]} />
          <meshStandardMaterial color="#4A3425" roughness={0.7} />
        </mesh>
        {/* Inner Hollow Inset Backboard */}
        <mesh position={[-0.015, 0.54, 0]}>
          <boxGeometry args={[0.35, 1.0, 0.82]} />
          <meshStandardMaterial color="#2B1E16" roughness={0.8} />
        </mesh>

        {/* 3 Shelf Dividers (Top, Middle, Bottom) */}
        {[-0.28, 0.04, 0.36].map((sy, i) => (
          <mesh key={`shelf-div-${i}`} position={[-0.01, 0.54 + sy, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.36, 0.03, 0.82]} />
            <meshStandardMaterial color="#5C402B" roughness={0.6} />
          </mesh>
        ))}

        {/* --- BOTTOM TIER: Row of Hardcover Books --- */}
        <group position={[-0.01, 0.4, 0]}>
          {[
            { color: '#1E88E5', width: 0.045, height: 0.23, rot: 0, z: -0.32 },
            { color: '#E53935', width: 0.04, height: 0.25, rot: 0, z: -0.27 },
            { color: '#43A047', width: 0.045, height: 0.22, rot: 0, z: -0.22 },
            { color: '#FB8C00', width: 0.05, height: 0.24, rot: 0, z: -0.17 },
            { color: '#8E24AA', width: 0.04, height: 0.26, rot: 0, z: -0.12 },
            { color: '#00ACC1', width: 0.045, height: 0.22, rot: 0, z: -0.07 },
            { color: '#3949AB', width: 0.05, height: 0.25, rot: 0, z: -0.02 },
            { color: '#D81B60', width: 0.04, height: 0.23, rot: 0, z: 0.03 },
            { color: '#00897B', width: 0.045, height: 0.24, rot: 0, z: 0.08 },
            { color: '#FDD835', width: 0.04, height: 0.21, rot: 0, z: 0.13 },
            { color: '#5E35B1', width: 0.045, height: 0.25, rot: 0, z: 0.18 },
            { color: '#6D4C41', width: 0.05, height: 0.22, rot: 0.15, z: 0.24 },
            { color: '#1E88E5', width: 0.045, height: 0.21, rot: 0.2, z: 0.30 },
          ].map((b, bi) => (
            <mesh
              key={`book-btm-${bi}`}
              position={[0, 0, b.z]}
              rotation={[0, 0, b.rot]}
              castShadow
            >
              <boxGeometry args={[0.24, b.height, b.width]} />
              <meshStandardMaterial color={b.color} roughness={0.4} />
            </mesh>
          ))}
        </group>

        {/* --- MIDDLE TIER: Stacked Journals & Upright Books --- */}
        <group position={[-0.01, 0.72, 0]}>
          {/* Stacked Horizontal Books on Left */}
          <group position={[0, -0.08, -0.24]}>
            <mesh position={[0, 0.02, 0]} castShadow>
              <boxGeometry args={[0.22, 0.035, 0.2]} />
              <meshStandardMaterial color="#0284C7" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.06, 0]} castShadow>
              <boxGeometry args={[0.2, 0.035, 0.18]} />
              <meshStandardMaterial color="#D97706" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.095, 0]} castShadow>
              <boxGeometry args={[0.18, 0.03, 0.16]} />
              <meshStandardMaterial color="#10B981" roughness={0.4} />
            </mesh>
          </group>

          {/* Upright Books in Center of Middle Tier */}
          <group position={[0, 0.02, 0.04]}>
            {[
              { color: '#E11D48', width: 0.04, height: 0.22, z: -0.08 },
              { color: '#4F46E5', width: 0.045, height: 0.24, z: -0.03 },
              { color: '#059669', width: 0.04, height: 0.21, z: 0.02 },
              { color: '#EA580C', width: 0.045, height: 0.23, z: 0.07 },
              { color: '#D97706', width: 0.04, height: 0.22, z: 0.12 },
              { color: '#0284C7', width: 0.045, height: 0.24, z: 0.17 },
            ].map((b, bi) => (
              <mesh key={`book-mid-${bi}`} position={[0, 0, b.z]} castShadow>
                <boxGeometry args={[0.23, b.height, b.width]} />
                <meshStandardMaterial color={b.color} roughness={0.4} />
              </mesh>
            ))}
          </group>
        </group>

        {/* --- TOP TIER: Row of Study Books & Hourglass --- */}
        <group position={[-0.01, 1.04, 0]}>
          {/* Row of Top Shelf Books */}
          <group position={[0, 0.02, -0.12]}>
            {[
              { color: '#0284C7', width: 0.04, height: 0.21, z: -0.18 },
              { color: '#16A34A', width: 0.045, height: 0.23, z: -0.13 },
              { color: '#9333EA', width: 0.04, height: 0.2, z: -0.08 },
              { color: '#F59E0B', width: 0.045, height: 0.22, z: -0.03 },
              { color: '#DC2626', width: 0.04, height: 0.24, z: 0.02 },
              { color: '#0D9488', width: 0.045, height: 0.21, z: 0.07 },
            ].map((b, bi) => (
              <mesh key={`book-top-${bi}`} position={[0, 0, b.z]} castShadow>
                <boxGeometry args={[0.22, b.height, b.width]} />
                <meshStandardMaterial color={b.color} roughness={0.4} />
              </mesh>
            ))}
          </group>

          {/* Mini Wood Hourglass Stand on Right */}
          <group position={[0, 0.04, 0.24]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
              <meshStandardMaterial color="#E0F2FE" transparent opacity={0.6} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.01, 12]} />
              <meshStandardMaterial color="#78350F" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.045, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.01, 12]} />
              <meshStandardMaterial color="#78350F" roughness={0.7} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ================= 5. EXPANDED GYM WEIGHT RACK ================= */}
      {/* Large commercial gym dumbbell rack with many weights */}
      <WeightRack />
    </group>
  );
};

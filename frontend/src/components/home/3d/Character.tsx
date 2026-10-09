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

// Athletic stylized palette
const SKIN_TONE = '#F5CBA7';
const SKIN_WARM = '#E8B993';
const HAIR_DARK = '#1C2028';
const HAIR_MID = '#2D3442';
const HAIR_HIGHLIGHT = '#3D4658';
const SOCKS_WHITE = '#FFFFFF';
const OUTSOLE_RUBBER = '#0F172A';

export const Character: React.FC<CharacterProps> = ({
  level = 17,
  outfit = {},
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const shirtColor = outfit.shirtColor || '#FF5722';
  const shirtStripeColor = outfit.shirtStripeColor || '#FFFFFF';
  const shortsColor = outfit.shortsColor || '#1E293B';
  const headbandColor = outfit.headbandColor || '#1E293B';
  const shoesColor = outfit.shoesColor || '#FF5722';
  const wristbandColor = outfit.wristbandColor || '#1E293B';

  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Level muscle development factor (0 to 1)
  const growthFactor = Math.min(1.0, Math.max(0, (level - 1) / 35));

  // Dynamic proportions scaling with leveling
  const shoulderSpan = 0.25 + growthFactor * 0.035;
  const bicepRadius = 0.052 + growthFactor * 0.015;
  const thighRadius = 0.066 + growthFactor * 0.015;

  // Natural living breathing & athletic idle animation
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Organic whole-body micro-levitation
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.8) * 0.012;
    }

    // Chest breathing expansion
    if (chestRef.current) {
      const breath = Math.sin(t * 2.2);
      chestRef.current.scale.set(
        1 + breath * 0.018,
        1 + breath * 0.012,
        1 + breath * 0.024
      );
    }

    // Gentle head sway & confident tilt
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 2.2) * 0.014;
      headRef.current.rotation.y = Math.sin(t * 1.1) * 0.02;
    }

    // Natural arm movement: subtle relaxed flex & breathing sway
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.06 + Math.sin(t * 2.0 + 0.4) * 0.02;
      leftArmRef.current.rotation.z = 0.10 + Math.cos(t * 1.6) * 0.015;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.06 - Math.sin(t * 2.0 + 0.4) * 0.02;
      rightArmRef.current.rotation.z = -0.10 - Math.cos(t * 1.6) * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* =========================================================================
          1. TORSO & V-TAPER ATHLETIC GYM TOP
         ========================================================================= */}
      <group ref={chestRef} position={[0, 0.40, 0]}>
        {/* Upper Torso / Pectorals (V-Taper athletic shape) */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.20 + growthFactor * 0.025, 0.16, 0.28, 24]} />
          <meshStandardMaterial color={shirtColor} roughness={0.42} />
        </mesh>

        {/* Sculpted Left Pectoral Muscle Contour */}
        <mesh position={[-0.075, 0.09, 0.10]} rotation={[0.08, 0.05, -0.04]} castShadow>
          <capsuleGeometry args={[0.058 + growthFactor * 0.01, 0.06, 10, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>

        {/* Sculpted Right Pectoral Muscle Contour */}
        <mesh position={[0.075, 0.09, 0.10]} rotation={[0.08, -0.05, 0.04]} castShadow>
          <capsuleGeometry args={[0.058 + growthFactor * 0.01, 0.06, 10, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>

        {/* Athletic Tapered Abdominal Core / Waist */}
        <mesh position={[0, -0.10, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.145, 0.16, 24]} />
          <meshStandardMaterial color={shirtColor} roughness={0.48} />
        </mesh>

        {/* High-Tech Leveling Chevron / Aerodynamic Chest Badge */}
        <group position={[0, 0.08, 0.165]}>
          {/* Main Chevron Accent */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.042, 0.042, 0.008]} />
            <meshStandardMaterial
              color={shirtStripeColor}
              emissive={shirtStripeColor}
              emissiveIntensity={0.35}
              roughness={0.2}
            />
          </mesh>
          {/* Horizontal Speed Accent Line */}
          <mesh position={[0, -0.038, 0]}>
            <boxGeometry args={[0.18, 0.014, 0.006]} />
            <meshStandardMaterial color={shirtStripeColor} roughness={0.3} />
          </mesh>
        </group>

        {/* Ergonomic Dark Side Panels */}
        <mesh position={[-0.165, -0.01, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.022, 0.28, 0.16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
        <mesh position={[0.165, -0.01, 0]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.022, 0.28, 0.16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>

        {/* Crew-Neck Sport Collar Trim */}
        <mesh position={[0, 0.21, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.092, 0.014, 12, 32]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>
      </group>

      {/* Trapezius Slope & Athletic Neck */}
      <group position={[0, 0.62, 0]}>
        {/* Trapezius connecting to shoulders */}
        <mesh position={[0, -0.03, -0.01]}>
          <cylinderGeometry args={[0.082, 0.155, 0.07, 20]} />
          <meshStandardMaterial color={shirtColor} roughness={0.45} />
        </mesh>
        {/* Muscular Neck */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.082, 0.10, 20]} />
          <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
        </mesh>
      </group>

      {/* =========================================================================
          2. HANDSOME & STYLISH ATHLETIC HEAD, FACE & HAIR
         ========================================================================= */}
      <group ref={headRef} position={[0, 0.80, 0.01]}>
        {/* Smooth Stylized Head / Jawline */}
        <mesh position={[0, 0.01, 0]} scale={[0.96, 1.04, 0.98]} castShadow>
          <sphereGeometry args={[0.145, 24, 24]} />
          <meshStandardMaterial color={SKIN_TONE} roughness={0.48} />
        </mesh>

        {/* Athletic Chin Definition */}
        <mesh position={[0, -0.085, 0.065]} scale={[1, 0.8, 1]} castShadow>
          <sphereGeometry args={[0.058, 16, 16]} />
          <meshStandardMaterial color={SKIN_TONE} roughness={0.48} />
        </mesh>

        {/* Sculpted Athletic Ears */}
        <mesh position={[-0.142, 0.01, -0.01]} rotation={[0, -0.15, 0.1]}>
          <capsuleGeometry args={[0.022, 0.042, 8, 12]} />
          <meshStandardMaterial color={SKIN_WARM} roughness={0.55} />
        </mesh>
        <mesh position={[0.142, 0.01, -0.01]} rotation={[0, 0.15, -0.1]}>
          <capsuleGeometry args={[0.022, 0.042, 8, 12]} />
          <meshStandardMaterial color={SKIN_WARM} roughness={0.55} />
        </mesh>

        {/* Subtle Athletic Nose */}
        <mesh position={[0, -0.01, 0.145]} castShadow>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color={SKIN_WARM} roughness={0.5} />
        </mesh>

        {/* Confident Friendly Smile Line */}
        <mesh position={[0, -0.052, 0.134]}>
          <boxGeometry args={[0.044, 0.007, 0.008]} />
          <meshStandardMaterial color="#A86252" roughness={0.5} />
        </mesh>

        {/* --- Expressive Confident Anime/Hero Eyes --- */}
        {/* Left Eye */}
        <group position={[-0.050, 0.020, 0.135]} rotation={[0, -0.14, 0]}>
          {/* Sclera / Whites of Eye (Almond curved shape) */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.038, 0.028]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
          {/* Deep Navy/Espresso Iris (Large, charismatic) */}
          <mesh position={[0, 0, 0.002]}>
            <circleGeometry args={[0.014, 18]} />
            <meshBasicMaterial color="#1E293B" depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
          {/* Deep Pupil Core */}
          <mesh position={[0, 0, 0.003]}>
            <circleGeometry args={[0.008, 14]} />
            <meshBasicMaterial color="#0A0E17" depthWrite={false} polygonOffset polygonOffsetFactor={-3} />
          </mesh>
          {/* Primary Catchlight Sparkle */}
          <mesh position={[0.005, 0.005, 0.004]}>
            <circleGeometry args={[0.004, 10]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
          </mesh>
          {/* Secondary Sub-Sparkle */}
          <mesh position={[-0.004, -0.003, 0.004]}>
            <circleGeometry args={[0.002, 8]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
          </mesh>
          {/* Sharp Upper Eyelash / Lid Line (Adds intense heroic focus) */}
          <mesh position={[0, 0.015, 0.005]} rotation={[0, 0, 0.04]}>
            <boxGeometry args={[0.042, 0.005, 0.004]} />
            <meshBasicMaterial color="#141820" />
          </mesh>
          {/* Confident Athletic Eyebrow */}
          <mesh position={[0.002, 0.032, 0.004]} rotation={[0, 0, 0.14]}>
            <boxGeometry args={[0.052, 0.010, 0.008]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.7} />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.050, 0.020, 0.135]} rotation={[0, 0.14, 0]}>
          {/* Sclera / Whites of Eye */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.038, 0.028]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
          {/* Iris */}
          <mesh position={[0, 0, 0.002]}>
            <circleGeometry args={[0.014, 18]} />
            <meshBasicMaterial color="#1E293B" depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.003]}>
            <circleGeometry args={[0.008, 14]} />
            <meshBasicMaterial color="#0A0E17" depthWrite={false} polygonOffset polygonOffsetFactor={-3} />
          </mesh>
          {/* Primary Catchlight Sparkle */}
          <mesh position={[0.005, 0.005, 0.004]}>
            <circleGeometry args={[0.004, 10]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
          </mesh>
          {/* Secondary Sub-Sparkle */}
          <mesh position={[-0.004, -0.003, 0.004]}>
            <circleGeometry args={[0.002, 8]} />
            <meshBasicMaterial color="#FFFFFF" depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
          </mesh>
          {/* Sharp Upper Eyelash / Lid Line */}
          <mesh position={[0, 0.015, 0.005]} rotation={[0, 0, -0.04]}>
            <boxGeometry args={[0.042, 0.005, 0.004]} />
            <meshBasicMaterial color="#141820" />
          </mesh>
          {/* Confident Athletic Eyebrow */}
          <mesh position={[-0.002, 0.032, 0.004]} rotation={[0, 0, -0.14]}>
            <boxGeometry args={[0.052, 0.010, 0.008]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.7} />
          </mesh>
        </group>

        {/* --- Athletic Performance Headband (Snug fit) --- */}
        <group position={[0, 0.052, 0.01]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.145, 0.018, 12, 32]} />
            <meshStandardMaterial color={headbandColor} roughness={0.4} />
          </mesh>
          {/* Central Athletic Badge */}
          <mesh position={[0, 0.005, 0.148]}>
            <boxGeometry args={[0.028, 0.014, 0.006]} />
            <meshStandardMaterial
              color="#FF5722"
              emissive="#FF5722"
              emissiveIntensity={0.65}
            />
          </mesh>
        </group>

        {/* --- Modern Athletic Haircut (Layered Low-Fade Quiff with Front Bangs) --- */}
        <group position={[0, 0.05, -0.01]}>
          {/* Skull Hugging Hair Cap */}
          <mesh position={[0, 0.04, -0.03]} scale={[1, 0.95, 1.05]} castShadow>
            <sphereGeometry args={[0.150, 22, 22]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.65} />
          </mesh>
          {/* Crown Hair Texture Volume */}
          <mesh position={[0, 0.11, -0.01]} rotation={[-0.15, 0, 0]} castShadow>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color={HAIR_MID} roughness={0.55} />
          </mesh>
          {/* Textured Front Quiff (Sweeps stylishly over the forehead) */}
          <mesh position={[0.02, 0.09, 0.07]} rotation={[-0.45, 0.2, -0.25]} castShadow>
            <capsuleGeometry args={[0.045, 0.12, 10, 16]} />
            <meshStandardMaterial color={HAIR_HIGHLIGHT} roughness={0.5} />
          </mesh>
          {/* Left Hair Lock Layer */}
          <mesh position={[-0.065, 0.075, 0.06]} rotation={[-0.35, 0.25, -0.32]} castShadow>
            <capsuleGeometry args={[0.038, 0.10, 8, 14]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.6} />
          </mesh>
          {/* Right Hair Lock Layer */}
          <mesh position={[0.072, 0.07, 0.05]} rotation={[-0.28, -0.22, 0.28]} castShadow>
            <capsuleGeometry args={[0.036, 0.10, 8, 14]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.6} />
          </mesh>
          {/* Crisp Sideburn Tapers */}
          <mesh position={[-0.140, -0.03, -0.01]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.014, 0.06, 0.05]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.7} />
          </mesh>
          <mesh position={[0.140, -0.03, -0.01]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.014, 0.06, 0.05]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* =========================================================================
          3. SHOULDERS, SLEEVES & ARMS (ATHLETIC FLEX & SMARTWATCH)
         ========================================================================= */}
      {/* --- LEFT ARM (ATHLETIC STANCE) --- */}
      <group position={[-shoulderSpan, 0.53, 0]}>
        {/* Deltoid / Jersey Sleeve Cap */}
        <mesh castShadow>
          <sphereGeometry args={[0.075 + growthFactor * 0.016, 16, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>
        {/* Sleeve Cuff */}
        <mesh position={[-0.012, -0.06, 0]} rotation={[0, 0, 0.14]}>
          <cylinderGeometry args={[0.062, 0.060, 0.06, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>

        {/* Articulated Arm */}
        <group ref={leftArmRef} position={[-0.012, -0.06, 0]}>
          {/* Upper Arm (Biceps / Triceps) */}
          <mesh position={[-0.01, -0.10, 0.01]} rotation={[0, 0, 0.15]} castShadow>
            <capsuleGeometry args={[bicepRadius, 0.17, 10, 16]} />
            <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
          </mesh>
          {/* Bicep Peak Definition (Level-scaled) */}
          {growthFactor > 0.08 && (
            <mesh position={[-0.005, -0.09, 0.028]} castShadow>
              <sphereGeometry args={[bicepRadius * 0.88, 12, 12]} />
              <meshStandardMaterial color={SKIN_TONE} roughness={0.48} />
            </mesh>
          )}

          {/* Forearm (Flexed naturally at elbow ~24° in ready hero pose) */}
          <group position={[-0.025, -0.21, 0.015]} rotation={[-0.30, 0.12, -0.1]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[bicepRadius * 0.88, 0.16, 10, 16]} />
              <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
            </mesh>
            {/* Smart Fitness Watch on Left Wrist */}
            <group position={[0, -0.20, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[bicepRadius * 0.95, bicepRadius * 0.95, 0.045, 18]} />
                <meshStandardMaterial color="#0F172A" roughness={0.25} metalness={0.7} />
              </mesh>
              {/* OLED Watch Screen */}
              <mesh position={[0, 0, bicepRadius * 0.96]}>
                <boxGeometry args={[0.03, 0.035, 0.006]} />
                <meshStandardMaterial
                  color="#00F0FF"
                  emissive="#00F0FF"
                  emissiveIntensity={0.85}
                />
              </mesh>
            </group>
            {/* Sculpted Left Hand (Relaxed athletic fist) */}
            <group position={[0, -0.27, 0.01]}>
              <mesh castShadow>
                <boxGeometry args={[bicepRadius * 1.25, 0.07, bicepRadius * 1.1]} />
                <meshStandardMaterial color={SKIN_TONE} roughness={0.52} />
              </mesh>
              {/* Curled Fingers */}
              <mesh position={[0, -0.036, 0.014]} rotation={[0.3, 0, 0]} castShadow>
                <capsuleGeometry args={[0.018, 0.044, 8, 12]} />
                <meshStandardMaterial color={SKIN_WARM} roughness={0.52} />
              </mesh>
              {/* Thumb */}
              <mesh position={[bicepRadius * 0.55, -0.01, 0.022]} rotation={[0.35, 0.25, -0.35]}>
                <capsuleGeometry args={[0.014, 0.030, 6, 10]} />
                <meshStandardMaterial color={SKIN_TONE} roughness={0.52} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* --- RIGHT ARM (ATHLETIC STANCE) --- */}
      <group position={[shoulderSpan, 0.53, 0]}>
        {/* Deltoid / Jersey Sleeve Cap */}
        <mesh castShadow>
          <sphereGeometry args={[0.075 + growthFactor * 0.016, 16, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>
        {/* Sleeve Cuff */}
        <mesh position={[0.012, -0.06, 0]} rotation={[0, 0, -0.14]}>
          <cylinderGeometry args={[0.062, 0.060, 0.06, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>

        {/* Articulated Arm */}
        <group ref={rightArmRef} position={[0.012, -0.06, 0]}>
          {/* Upper Arm (Biceps / Triceps) */}
          <mesh position={[0.01, -0.10, 0.01]} rotation={[0, 0, -0.15]} castShadow>
            <capsuleGeometry args={[bicepRadius, 0.17, 10, 16]} />
            <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
          </mesh>
          {/* Bicep Peak */}
          {growthFactor > 0.08 && (
            <mesh position={[0.005, -0.09, 0.028]} castShadow>
              <sphereGeometry args={[bicepRadius * 0.88, 12, 12]} />
              <meshStandardMaterial color={SKIN_TONE} roughness={0.48} />
            </mesh>
          )}

          {/* Forearm */}
          <group position={[0.025, -0.21, 0.015]} rotation={[-0.30, -0.12, 0.1]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[bicepRadius * 0.88, 0.16, 10, 16]} />
              <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
            </mesh>
            {/* Terrycloth Wristband on Right Wrist */}
            <mesh position={[0, -0.20, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[bicepRadius * 0.98, bicepRadius * 0.98, 0.05, 18]} />
              <meshStandardMaterial color={wristbandColor} roughness={0.65} />
            </mesh>
            {/* Sculpted Right Hand (Relaxed athletic fist) */}
            <group position={[0, -0.27, 0.01]}>
              <mesh castShadow>
                <boxGeometry args={[bicepRadius * 1.25, 0.07, bicepRadius * 1.1]} />
                <meshStandardMaterial color={SKIN_TONE} roughness={0.52} />
              </mesh>
              {/* Curled Fingers */}
              <mesh position={[0, -0.036, 0.014]} rotation={[0.3, 0, 0]} castShadow>
                <capsuleGeometry args={[0.018, 0.044, 8, 12]} />
                <meshStandardMaterial color={SKIN_WARM} roughness={0.52} />
              </mesh>
              {/* Thumb */}
              <mesh position={[-bicepRadius * 0.55, -0.01, 0.022]} rotation={[0.35, -0.25, 0.35]}>
                <capsuleGeometry args={[0.014, 0.030, 6, 10]} />
                <meshStandardMaterial color={SKIN_TONE} roughness={0.52} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* =========================================================================
          4. ATHLETIC SHORTS & WAISTBAND (PRO RUNNING SHORTS)
         ========================================================================= */}
      <group position={[0, 0.15, 0]}>
        {/* Ribbed Elastic Waistband */}
        <mesh position={[0, 0.065, 0]} castShadow>
          <cylinderGeometry args={[0.152, 0.152, 0.042, 24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} />
        </mesh>
        {/* Front Drawstring Ties */}
        <mesh position={[0, 0.06, 0.155]}>
          <boxGeometry args={[0.024, 0.018, 0.01]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>

        {/* Pelvic Base */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.152, 0.168, 0.14, 24]} />
          <meshStandardMaterial color={shortsColor} roughness={0.5} />
        </mesh>

        {/* Left Shorts Leg */}
        <group position={[-0.082, -0.10, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.098, 0.106, 0.13, 20]} />
            <meshStandardMaterial color={shortsColor} roughness={0.5} />
          </mesh>
          {/* Side Performance Stripe */}
          <mesh position={[-0.100, 0, 0]} rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.012, 0.126, 0.028]} />
            <meshStandardMaterial color="#FF5722" roughness={0.3} />
          </mesh>
          {/* Compression Under-layer */}
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.090, 0.088, 0.038, 20]} />
            <meshStandardMaterial color="#0F172A" roughness={0.6} />
          </mesh>
        </group>

        {/* Right Shorts Leg */}
        <group position={[0.082, -0.10, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.098, 0.106, 0.13, 20]} />
            <meshStandardMaterial color={shortsColor} roughness={0.5} />
          </mesh>
          {/* Side Performance Stripe */}
          <mesh position={[0.100, 0, 0]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.012, 0.126, 0.028]} />
            <meshStandardMaterial color="#FF5722" roughness={0.3} />
          </mesh>
          {/* Compression Under-layer */}
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.090, 0.088, 0.038, 20]} />
            <meshStandardMaterial color="#0F172A" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* =========================================================================
          5. LEGS, CALVES & PRO ATHLETIC TRAINERS (STABLE STANCE)
         ========================================================================= */}
      {/* --- LEFT LEG --- */}
      <group position={[-0.090, -0.04, 0]}>
        {/* Muscular Thigh */}
        <mesh position={[-0.01, -0.08, 0.01]} rotation={[0.03, 0, 0.05]} castShadow>
          <capsuleGeometry args={[thighRadius, 0.17, 10, 18]} />
          <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
        </mesh>
        {/* Defined Knee Joint (Patella) */}
        <mesh position={[-0.01, -0.20, 0.03]} castShadow>
          <sphereGeometry args={[thighRadius * 0.76, 12, 12]} />
          <meshStandardMaterial color={SKIN_WARM} roughness={0.52} />
        </mesh>
        {/* Athletic Calf */}
        <mesh position={[-0.01, -0.31, 0.01]} rotation={[-0.02, 0, 0.03]} castShadow>
          <capsuleGeometry args={[thighRadius * 0.74, 0.17, 10, 18]} />
          <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
        </mesh>

        {/* Athletic Crew Socks */}
        <group position={[-0.01, -0.41, 0.01]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.056, 0.060, 0.11, 18]} />
            <meshStandardMaterial color={SOCKS_WHITE} roughness={0.7} />
          </mesh>
          {/* Sport Striping */}
          <mesh position={[0, 0.032, 0]}>
            <cylinderGeometry args={[0.057, 0.057, 0.012, 18]} />
            <meshStandardMaterial color="#FF5722" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.014, 0]}>
            <cylinderGeometry args={[0.057, 0.057, 0.01, 18]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} />
          </mesh>
        </group>

        {/* Pro Athletic Trainer (Left Sneaker) */}
        <group position={[-0.012, -0.51, 0.035]} rotation={[0, 0.12, 0]}>
          {/* Main Sneaker Body */}
          <mesh position={[0, 0.045, 0.02]} castShadow>
            <boxGeometry args={[0.120, 0.076, 0.25]} />
            <meshStandardMaterial color={shoesColor} roughness={0.42} />
          </mesh>
          {/* Curved Toe Spring Box */}
          <mesh position={[0, 0.032, 0.125]} rotation={[0.22, 0, 0]} castShadow>
            <capsuleGeometry args={[0.052, 0.038, 10, 14]} />
            <meshStandardMaterial color={shoesColor} roughness={0.42} />
          </mesh>
          {/* Tongue & Lacing System */}
          <mesh position={[0, 0.074, 0.038]} rotation={[-0.32, 0, 0]}>
            <boxGeometry args={[0.060, 0.084, 0.018]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          {/* Clean White Shoelace Accent */}
          <mesh position={[0, 0.08, 0.048]} rotation={[-0.32, 0, 0]}>
            <boxGeometry args={[0.066, 0.036, 0.008]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>
          {/* Dynamic Speed Swoosh Line */}
          <mesh position={[-0.062, 0.04, 0.02]} rotation={[0, 0, 0.08]}>
            <boxGeometry args={[0.006, 0.022, 0.11]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Chunky Aerodynamic Cushion Midsole */}
          <mesh position={[0, -0.01, 0.02]} castShadow>
            <boxGeometry args={[0.130, 0.038, 0.27]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Grippy Black Outsole */}
          <mesh position={[0, -0.032, 0.02]} receiveShadow>
            <boxGeometry args={[0.132, 0.01, 0.272]} />
            <meshStandardMaterial color={OUTSOLE_RUBBER} roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* --- RIGHT LEG --- */}
      <group position={[0.090, -0.04, 0]}>
        {/* Muscular Thigh */}
        <mesh position={[0.01, -0.08, 0.01]} rotation={[0.03, 0, -0.05]} castShadow>
          <capsuleGeometry args={[thighRadius, 0.17, 10, 18]} />
          <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
        </mesh>
        {/* Defined Knee Joint (Patella) */}
        <mesh position={[0.01, -0.20, 0.03]} castShadow>
          <sphereGeometry args={[thighRadius * 0.76, 12, 12]} />
          <meshStandardMaterial color={SKIN_WARM} roughness={0.52} />
        </mesh>
        {/* Athletic Calf */}
        <mesh position={[0.01, -0.31, 0.01]} rotation={[-0.02, 0, -0.03]} castShadow>
          <capsuleGeometry args={[thighRadius * 0.74, 0.17, 10, 18]} />
          <meshStandardMaterial color={SKIN_TONE} roughness={0.5} />
        </mesh>

        {/* Athletic Crew Socks */}
        <group position={[0.01, -0.41, 0.01]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.056, 0.060, 0.11, 18]} />
            <meshStandardMaterial color={SOCKS_WHITE} roughness={0.7} />
          </mesh>
          {/* Sport Striping */}
          <mesh position={[0, 0.032, 0]}>
            <cylinderGeometry args={[0.057, 0.057, 0.012, 18]} />
            <meshStandardMaterial color="#FF5722" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.014, 0]}>
            <cylinderGeometry args={[0.057, 0.057, 0.01, 18]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} />
          </mesh>
        </group>

        {/* Pro Athletic Trainer (Right Sneaker) */}
        <group position={[0.012, -0.51, 0.035]} rotation={[0, -0.12, 0]}>
          {/* Main Sneaker Body */}
          <mesh position={[0, 0.045, 0.02]} castShadow>
            <boxGeometry args={[0.120, 0.076, 0.25]} />
            <meshStandardMaterial color={shoesColor} roughness={0.42} />
          </mesh>
          {/* Curved Toe Spring Box */}
          <mesh position={[0, 0.032, 0.125]} rotation={[0.22, 0, 0]} castShadow>
            <capsuleGeometry args={[0.052, 0.038, 10, 14]} />
            <meshStandardMaterial color={shoesColor} roughness={0.42} />
          </mesh>
          {/* Tongue & Lacing System */}
          <mesh position={[0, 0.074, 0.038]} rotation={[-0.32, 0, 0]}>
            <boxGeometry args={[0.060, 0.084, 0.018]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          {/* Clean White Shoelace Accent */}
          <mesh position={[0, 0.08, 0.048]} rotation={[-0.32, 0, 0]}>
            <boxGeometry args={[0.066, 0.036, 0.008]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>
          {/* Dynamic Speed Swoosh Line */}
          <mesh position={[0.062, 0.04, 0.02]} rotation={[0, 0, -0.08]}>
            <boxGeometry args={[0.006, 0.022, 0.11]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Chunky Aerodynamic Cushion Midsole */}
          <mesh position={[0, -0.01, 0.02]} castShadow>
            <boxGeometry args={[0.130, 0.038, 0.27]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Grippy Black Outsole */}
          <mesh position={[0, -0.032, 0.02]} receiveShadow>
            <boxGeometry args={[0.132, 0.01, 0.272]} />
            <meshStandardMaterial color={OUTSOLE_RUBBER} roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

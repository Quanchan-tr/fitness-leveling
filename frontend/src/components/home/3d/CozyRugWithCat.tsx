'use strict';
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CozyRugWithCatProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const CozyRugWithCat: React.FC<CozyRugWithCatProps> = ({
  position = [0.25, 0.005, 0.45],
  rotation = [0, 0, 0],
}) => {
  const catBodyRef = useRef<THREE.Group>(null);
  const catTailRef = useRef<THREE.Group>(null);

  // Subtle rhythmic sleeping breathing & tail twitch animation
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Slow, peaceful breathing
    if (catBodyRef.current) {
      const breath = Math.sin(t * 2.2);
      catBodyRef.current.scale.y = 1 + breath * 0.035;
      catBodyRef.current.scale.x = 1 - breath * 0.015;
      catBodyRef.current.position.y = 0.06 + breath * 0.003;
    }
    // Very subtle occasional tail tip twitch
    if (catTailRef.current) {
      catTailRef.current.rotation.z = Math.sin(t * 1.1) * 0.04;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ================= 1. CIRCULAR PATTERNED BOHO / NORDIC RUG ================= */}
      <group position={[0, 0, 0]}>
        {/* Base Thick Rug Disc */}
        <mesh position={[0, 0.003, 0]} receiveShadow>
          <cylinderGeometry args={[1.08, 1.08, 0.006, 48]} />
          <meshStandardMaterial color="#E8DEC8" roughness={0.92} />
        </mesh>

        {/* Outer Fringe Rim */}
        <mesh position={[0, 0.0065, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[1.0, 1.075, 48]} />
          <meshStandardMaterial color="#CBBBA0" roughness={0.95} />
        </mesh>

        {/* Outer Terracotta / Bohemian Pattern Ring */}
        <mesh position={[0, 0.0068, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.82, 0.96, 48]} />
          <meshStandardMaterial color="#C96B48" roughness={0.9} />
        </mesh>

        {/* Outer Ring Geometric Dashes (Boho Radial Motifs) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 16;
          return (
            <mesh
              key={`rug-outer-dot-${i}`}
              position={[Math.cos(angle) * 0.89, 0.0072, Math.sin(angle) * 0.89]}
              rotation={[-Math.PI / 2, 0, angle]}
            >
              <planeGeometry args={[0.045, 0.045]} />
              <meshStandardMaterial color="#FFF8EE" roughness={0.9} />
            </mesh>
          );
        })}

        {/* Middle Soft Sage / Teal Accent Ring */}
        <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.62, 0.76, 48]} />
          <meshStandardMaterial color="#3E5C65" roughness={0.9} />
        </mesh>

        {/* Middle Ring Diamond Accents */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 12 + Math.PI / 12;
          return (
            <mesh
              key={`rug-mid-diamond-${i}`}
              position={[Math.cos(angle) * 0.69, 0.0074, Math.sin(angle) * 0.69]}
              rotation={[-Math.PI / 2, 0, angle + Math.PI / 4]}
            >
              <planeGeometry args={[0.04, 0.04]} />
              <meshStandardMaterial color="#E8DEC8" roughness={0.9} />
            </mesh>
          );
        })}

        {/* Inner Warm Amber Ring */}
        <mesh position={[0, 0.0075, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.42, 0.54, 48]} />
          <meshStandardMaterial color="#D98A4E" roughness={0.9} />
        </mesh>

        {/* Center Medallion Inner Circle */}
        <mesh position={[0, 0.0078, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.36, 48]} />
          <meshStandardMaterial color="#F5EFE4" roughness={0.92} />
        </mesh>

        {/* Center Star / Mandala Accent */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          return (
            <mesh
              key={`center-petal-${i}`}
              position={[Math.cos(angle) * 0.16, 0.0082, Math.sin(angle) * 0.16]}
              rotation={[-Math.PI / 2, 0, angle]}
            >
              <planeGeometry args={[0.07, 0.03]} />
              <meshStandardMaterial color="#C96B48" roughness={0.9} />
            </mesh>
          );
        })}
      </group>

      {/* ================= 2. CUTE SLEEPING CURLED-UP CAT ================= */}
      <group position={[0.06, 0, -0.04]} rotation={[0, -0.4, 0]}>
        {/* Sleeping Cat Body (Curled Oval, breathing) */}
        <group ref={catBodyRef} position={[0, 0.06, 0]}>
          {/* Main Rounded Fur Body (Warm Ginger Orange Tabby) */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.15, 20, 20]} />
            <meshStandardMaterial color="#E67E22" roughness={0.8} />
          </mesh>

          {/* White Belly / Chest Patch */}
          <mesh position={[-0.04, -0.03, 0.02]} rotation={[0.4, 0.2, 0]}>
            <sphereGeometry args={[0.1, 14, 14]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.85} />
          </mesh>

          {/* Darker Caramel Tabby Stripes along Spine */}
          {[-0.04, 0, 0.04].map((sz, i) => (
            <mesh key={`cat-stripe-${i}`} position={[0.02, 0.08, sz]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.18, 0.015, 0.022]} />
              <meshStandardMaterial color="#A04000" roughness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Sleeping Cat Head Nestled in Front */}
        <group position={[0.13, 0.065, 0.06]} rotation={[-0.1, 0.5, 0.15]}>
          {/* Head Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#E67E22" roughness={0.75} />
          </mesh>

          {/* White Muzzle / Cheeks */}
          <mesh position={[0.04, -0.025, 0.03]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.85} />
          </mesh>

          {/* Cute Tiny Pink Nose */}
          <mesh position={[0.075, -0.015, 0.03]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.01, 0.012, 3]} />
            <meshStandardMaterial color="#F1948A" roughness={0.6} />
          </mesh>

          {/* Closed Sleeping Eyes (Cute Happy Curved Slits ^ _ ^) */}
          <mesh position={[0.065, 0.012, 0.05]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.02, 0.004, 0.008]} />
            <meshStandardMaterial color="#4A2810" />
          </mesh>
          <mesh position={[0.065, 0.012, 0.01]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.02, 0.004, 0.008]} />
            <meshStandardMaterial color="#4A2810" />
          </mesh>

          {/* Left Cat Ear */}
          <group position={[-0.01, 0.07, 0.045]} rotation={[-0.2, 0.1, 0.3]}>
            <mesh castShadow>
              <coneGeometry args={[0.03, 0.05, 4]} />
              <meshStandardMaterial color="#E67E22" roughness={0.75} />
            </mesh>
            {/* Pink Inner Ear */}
            <mesh position={[0, 0, 0.006]}>
              <coneGeometry args={[0.018, 0.032, 3]} />
              <meshStandardMaterial color="#F5B7B1" roughness={0.8} />
            </mesh>
          </group>

          {/* Right Cat Ear */}
          <group position={[-0.01, 0.07, -0.045]} rotation={[0.2, -0.1, 0.3]}>
            <mesh castShadow>
              <coneGeometry args={[0.03, 0.05, 4]} />
              <meshStandardMaterial color="#E67E22" roughness={0.75} />
            </mesh>
            {/* Pink Inner Ear */}
            <mesh position={[0, 0, -0.006]}>
              <coneGeometry args={[0.018, 0.032, 3]} />
              <meshStandardMaterial color="#F5B7B1" roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* Curled Tail Wrapped Around Body */}
        <group ref={catTailRef} position={[-0.06, 0.02, -0.06]}>
          {/* Main Orange Tail Arc */}
          <mesh rotation={[Math.PI / 2, 0, 0.4]} castShadow>
            <torusGeometry args={[0.13, 0.024, 8, 20, Math.PI * 1.05]} />
            <meshStandardMaterial color="#E67E22" roughness={0.8} />
          </mesh>
          {/* Cute White Tail Tip */}
          <mesh position={[0.07, 0.008, 0.11]} castShadow>
            <sphereGeometry args={[0.026, 10, 10]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.85} />
          </mesh>
        </group>

        {/* Tucked Cute Front Paws */}
        <mesh position={[0.09, 0.014, 0.03]} castShadow>
          <sphereGeometry args={[0.024, 10, 10]} />
          <meshStandardMaterial color="#FFFDF7" roughness={0.85} />
        </mesh>
        <mesh position={[0.06, 0.014, 0.07]} castShadow>
          <sphereGeometry args={[0.024, 10, 10]} />
          <meshStandardMaterial color="#FFFDF7" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
};

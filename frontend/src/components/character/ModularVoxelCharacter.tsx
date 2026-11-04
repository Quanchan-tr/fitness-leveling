'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterGender, EquippedMap } from '@/types/avatar.types';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { getVoxelFaceTexture } from './voxelFaceTexture';
import {
  HeadwearRenderer,
  HairRenderer,
  TopRenderer,
  TopSleeveRenderer,
  BottomRenderer,
  ShoesRenderer,
  AccessoryRenderer,
  SpecialRenderer,
} from './SlotRenderers';

interface ModularVoxelCharacterProps {
  gender?: CharacterGender;
  equipped: EquippedMap;
  level?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Modern Voxel Hybrid Humanoid Character matching the Stylized RPG Reference:
 * - 5.5 - 6 heads tall balanced athletic proportions
 * - Ultra-crisp 256x256 pixel-art expressive anime face with 3D nose & ears
 * - Modular Paper-doll equipment architecture
 * - Zero Z-fighting: No overlapping interior geometry & GPU polygonOffset
 * - Dynamic arm-attached sleeves that move synchronously with arm swinging
 * - Volumetric layered voxel anime hair (never bald, never "1 chỏm")
 * - Dynamic idle breathing animation
 */
export const ModularVoxelCharacter: React.FC<ModularVoxelCharacterProps> = ({
  gender = 'male',
  equipped,
  level = 50,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const customHairColor = useAvatarStore((s) => s.customHairColor);

  const isFemale = gender === 'female';
  const skinTone = isFemale ? '#FCE3D2' : '#F5C8A8';
  const underwearColor = '#1E293B';

  // Ultra-crisp 256x256 pixel-art face texture
  const faceTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getVoxelFaceTexture(gender);
  }, [gender]);

  // Subtle living breathing idle motion
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Torso breathing & subtle sway
    if (chestRef.current) {
      chestRef.current.position.y = 0.20 + Math.sin(t * 1.8) * 0.012;
      chestRef.current.scale.set(
        1 + Math.sin(t * 1.8) * 0.012,
        1 + Math.sin(t * 1.8) * 0.010,
        1 + Math.sin(t * 1.8) * 0.012
      );
    }

    // Head subtle micro-bobbing
    if (headRef.current) {
      headRef.current.position.y = 0.44 + Math.sin(t * 1.8) * 0.012;
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.018;
    }

    // Arm natural synchronous sway
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.04 + Math.sin(t * 1.8 + 0.3) * 0.015;
      leftArmRef.current.rotation.z = 0.06 + Math.cos(t * 1.5) * 0.010;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.04 - Math.sin(t * 1.8 + 0.3) * 0.015;
      rightArmRef.current.rotation.z = -0.06 - Math.cos(t * 1.5) * 0.010;
    }
  });

  const armSpan = isFemale ? 0.27 : 0.31;
  const armWidth = isFemale ? 0.105 : 0.125;
  const legSpan = isFemale ? 0.085 : 0.105;
  const legWidth = isFemale ? 0.125 : 0.145;

  const hasTop = Boolean(equipped.TOP);
  const hasBottom = Boolean(equipped.BOTTOM);
  const hasShoes = Boolean(equipped.SHOES);

  // Clothing type categorization for zero-overlap rendering
  const topCode = equipped.TOP?.itemCode;
  const isLongSleeve = Boolean(
    topCode && [
      'leather_coat',
      'techwear_jacket',
      'cyber_grid_hoodie',
      'shinobi_tunic',
      'glitch_void_suit',
      'solar_armor',
    ].includes(topCode)
  );
  const isShortSleeve = Boolean(
    topCode && [
      'orange_plaid',
      'teal_shirt',
      'female_tunic',
    ].includes(topCode)
  );

  const bottomCode = equipped.BOTTOM?.itemCode;
  const isLongPants = Boolean(
    bottomCode && [
      'blue_jeans',
      'brown_cargo',
      'female_leggings',
      'techwear_pants',
      'cargo_tactical',
      'track_pants',
      'cyber_glitch_pants',
    ].includes(bottomCode)
  );
  const isShorts = Boolean(
    bottomCode && [
      'calisthenics_shorts',
      'denim_shorts',
      'blue_skirt',
    ].includes(bottomCode)
  );

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* =========================================================================
          1. HEAD & PIXEL FACE (256x256 Crisp Face + 3D Nose & Ears)
         ========================================================================= */}
      <group ref={headRef} position={[0, 0.44, 0]}>
        {/* Head Base Box (Skin Tone) */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.38, 0.38, 0.38]} />
          <meshStandardMaterial color={skinTone} roughness={0.7} />
        </mesh>

        {/* Dedicated Front Face Decal Plane (Pixel Art Eyes, Eyebrows, Smile, Blush) */}
        {faceTexture && (
          <mesh position={[0, 0.22, 0.191]}>
            <planeGeometry args={[0.38, 0.38]} />
            <meshStandardMaterial
              map={faceTexture}
              transparent={false}
              roughness={0.65}
              polygonOffset={true}
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        )}

        {/* 3D Stylized Voxel Nose Protrusion */}
        <mesh position={[0, 0.205, 0.198]} castShadow>
          <boxGeometry args={[0.045, 0.05, 0.025]} />
          <meshStandardMaterial
            color={isFemale ? '#F5BCA0' : '#EAA885'}
            roughness={0.7}
            polygonOffset={true}
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
          />
        </mesh>

        {/* 3D Stylized Voxel Ears on Sides */}
        <mesh position={[-0.193, 0.22, -0.01]} castShadow>
          <boxGeometry args={[0.025, 0.08, 0.06]} />
          <meshStandardMaterial color={skinTone} roughness={0.7} />
        </mesh>
        <mesh position={[0.193, 0.22, -0.01]} castShadow>
          <boxGeometry args={[0.025, 0.08, 0.06]} />
          <meshStandardMaterial color={skinTone} roughness={0.7} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.16]} />
          <meshStandardMaterial color={skinTone} roughness={0.7} />
        </mesh>

        {/* Headwear Slot (Beanie, Straw Hat, Fur Cap, etc.) */}
        <HeadwearRenderer item={equipped.HEADWEAR || null} />

        {/* Modular Hair Slot */}
        <HairRenderer
          item={equipped.HAIR || null}
          gender={gender}
          coversCrown={Boolean(equipped.HEADWEAR?.coversCrown)}
          isHairHidden={equipped.HEADWEAR?.hidesHair}
          customColor={customHairColor || undefined}
        />

        {/* Head Accessory Slot (Glasses, Oni Mask, Visor) */}
        <AccessoryRenderer item={equipped.ACCESSORIES || null} location="head" />
      </group>

      {/* =========================================================================
          2. TORSO & CHEST (Bare Athletic Body + Optional Top Slot)
         ========================================================================= */}
      <group ref={chestRef} position={[0, 0.20, 0]}>
        {/* Base Athletic Skin Torso:
            When hasTop is equipped, torso is slimmed slightly so outer clothing has guaranteed
            0.03 clearance, completely preventing coplanar Z-fighting. */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry
            args={[
              hasTop ? (isFemale ? 0.31 : 0.37) : (isFemale ? 0.34 : 0.42),
              hasTop ? 0.38 : 0.40,
              hasTop ? (isFemale ? 0.18 : 0.21) : (isFemale ? 0.20 : 0.24),
            ]}
          />
          <meshStandardMaterial color={skinTone} roughness={0.65} />
        </mesh>

        {/* Female Athletic Sports Top if no outer top is equipped */}
        {isFemale && !hasTop && (
          <mesh position={[0, 0.04, 0.005]}>
            <boxGeometry args={[0.345, 0.20, 0.205]} />
            <meshStandardMaterial color={underwearColor} roughness={0.6} />
          </mesh>
        )}

        {/* 3D Modular Top Clothing Layer (when equipped) */}
        <TopRenderer item={equipped.TOP || null} gender={gender} />

        {/* Torso Accessory Slot (Scarf, Necklace, Belt, Backpack) */}
        <AccessoryRenderer item={equipped.ACCESSORIES || null} location="torso" />
      </group>

      {/* =========================================================================
          3. ARMS & HANDS (Synchronized Sleeve Movement + Zero Clipping)
         ========================================================================= */}
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-armSpan, 0.32, 0]}>
        {/* Arm Sleeve Renderer (moves with arm!) */}
        <TopSleeveRenderer item={equipped.TOP || null} side="left" gender={gender} />

        {/* Arm Skin Geometry:
            - If long sleeve: only render hand (no interior arm skin = 0 flicker)
            - If short sleeve: render exposed forearm only (y = -0.24)
            - If sleeveless/bare: render full bare skin arm */}
        {!isLongSleeve && (
          <mesh
            position={[0, isShortSleeve ? -0.24 : -0.16, 0]}
            castShadow
          >
            <boxGeometry
              args={[
                armWidth,
                isShortSleeve ? 0.20 : 0.38,
                armWidth,
              ]}
            />
            <meshStandardMaterial color={skinTone} roughness={0.65} />
          </mesh>
        )}

        {/* Left Hand with Thumb Block */}
        <mesh position={[0, -0.38, 0]} castShadow>
          <boxGeometry args={[armWidth - 0.01, 0.09, armWidth - 0.01]} />
          <meshStandardMaterial color={skinTone} roughness={0.65} />
        </mesh>
        <mesh position={[armWidth / 2 - 0.01, -0.36, 0.02]} castShadow>
          <boxGeometry args={[0.03, 0.05, 0.03]} />
          <meshStandardMaterial color={skinTone} roughness={0.65} />
        </mesh>

        {/* Arm Accessory (Wrist wraps / Smartwatch on Left Arm) */}
        <AccessoryRenderer item={equipped.ACCESSORIES || null} location="arm" side="left" />
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[armSpan, 0.32, 0]}>
        {/* Arm Sleeve Renderer (moves with arm!) */}
        <TopSleeveRenderer item={equipped.TOP || null} side="right" gender={gender} />

        {/* Arm Skin Geometry */}
        {!isLongSleeve && (
          <mesh
            position={[0, isShortSleeve ? -0.24 : -0.16, 0]}
            castShadow
          >
            <boxGeometry
              args={[
                armWidth,
                isShortSleeve ? 0.20 : 0.38,
                armWidth,
              ]}
            />
            <meshStandardMaterial color={skinTone} roughness={0.65} />
          </mesh>
        )}

        {/* Right Hand with Thumb Block */}
        <mesh position={[0, -0.38, 0]} castShadow>
          <boxGeometry args={[armWidth - 0.01, 0.09, armWidth - 0.01]} />
          <meshStandardMaterial color={skinTone} roughness={0.65} />
        </mesh>
        <mesh position={[-armWidth / 2 + 0.01, -0.36, 0.02]} castShadow>
          <boxGeometry args={[0.03, 0.05, 0.03]} />
          <meshStandardMaterial color={skinTone} roughness={0.65} />
        </mesh>

        {/* Arm Accessory on Right Arm */}
        <AccessoryRenderer item={equipped.ACCESSORIES || null} location="arm" side="right" />
      </group>

      {/* =========================================================================
          4. LEGS & LOWER BODY (Pelvis + Smart Leg Skin + Optional Pants / Shoes)
         ========================================================================= */}
      <group position={[0, -0.04, 0]}>
        {/* Base Athletic Boxers / Pelvis (Only when not wearing long pants) */}
        {!isLongPants && (
          <mesh position={[0, -0.02, 0]} castShadow>
            <boxGeometry args={[isFemale ? 0.34 : 0.40, 0.16, 0.22]} />
            <meshStandardMaterial color={underwearColor} roughness={0.7} />
          </mesh>
        )}

        {/* Bare Skin Legs:
            - If long pants: DO NOT render duplicate skin legs inside pants = 0 Z-fighting!
            - If shorts: render exposed lower legs only (y = -0.32)
            - If unequipped: render full bare legs */}
        {!isLongPants && (
          <>
            {/* Left Leg Skin */}
            <mesh
              position={[-legSpan, isShorts ? -0.32 : -0.28, 0]}
              castShadow
            >
              <boxGeometry
                args={[
                  legWidth,
                  isShorts ? 0.26 : 0.44,
                  0.19,
                ]}
              />
              <meshStandardMaterial color={skinTone} roughness={0.65} />
            </mesh>

            {/* Right Leg Skin */}
            <mesh
              position={[legSpan, isShorts ? -0.32 : -0.28, 0]}
              castShadow
            >
              <boxGeometry
                args={[
                  legWidth,
                  isShorts ? 0.26 : 0.44,
                  0.19,
                ]}
              />
              <meshStandardMaterial color={skinTone} roughness={0.65} />
            </mesh>
          </>
        )}

        {/* 3D Modular Bottom Layer (Pants, Shorts, Skirt) */}
        <BottomRenderer item={equipped.BOTTOM || null} gender={gender} />

        {/* Bare Feet (Rendered only when SHOES slot is unequipped) */}
        {!hasShoes && (
          <group position={[0, -0.52, 0]}>
            {[-legSpan, legSpan].map((x, i) => (
              <mesh key={i} position={[x, 0, 0.04]} castShadow>
                <boxGeometry args={[legWidth - 0.01, 0.06, 0.20]} />
                <meshStandardMaterial color={skinTone} roughness={0.65} />
              </mesh>
            ))}
          </group>
        )}

        {/* 3D Modular Shoes Layer */}
        <ShoesRenderer item={equipped.SHOES || null} gender={gender} />
      </group>

      {/* =========================================================================
          5. SPECIAL EFFECTS SLOT (Cánh Pixel & Hạt Aura Lơ Lửng - KHÔNG VÒNG ĐẾ)
         ========================================================================= */}
      <SpecialRenderer item={equipped.SPECIAL || null} />
    </group>
  );
};

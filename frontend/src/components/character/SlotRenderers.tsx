'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarItem } from '@/types/avatar.types';
import { useEquipmentMesh } from './useEquipmentMesh';

/**
 * Creates standard voxel material with guaranteed GPU hardware polygonOffset
 * to completely eliminate coplanar Z-fighting and flickering.
 */
export function createVoxelMat(
  color: string,
  roughness = 0.65,
  metalness = 0.1,
  offsetFactor = -1
) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      polygonOffset={true}
      polygonOffsetFactor={offsetFactor}
      polygonOffsetUnits={offsetFactor}
    />
  );
}

// =========================================================================
// 1. HEADWEAR RENDERER
// =========================================================================
export const HeadwearRenderer: React.FC<{ item: AvatarItem | null }> = ({ item }) => {
  const { scene, hasGlb } = useEquipmentMesh(item?.meshUrl);
  if (!item) return null;
  if (hasGlb && scene) return <primitive object={scene} />;

  const code = item.itemCode;
  const pColor = item.colors?.primary || '#B91C1C';
  const sColor = item.colors?.secondary || '#F59E0B';

  // RED BEANIE (Mũ Beanie Len Đỏ - Gân sọc len + Phù hiệu vàng kim)
  if (code === 'red_beanie') {
    return (
      <group position={[0, 0.28, 0]}>
        {/* Main Beanie Dome */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.43, 0.24, 0.43]} />
          {createVoxelMat(pColor, 0.85, 0.05, -1)}
        </mesh>
        {/* Ribbed Fold-over Brim with 3D texture ridges */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <boxGeometry args={[0.45, 0.12, 0.45]} />
          {createVoxelMat('#991B1B', 0.9, 0.05, -1)}
        </mesh>
        {/* Knitted Rib Ridges */}
        {[-0.14, -0.07, 0, 0.07, 0.14].map((x, i) => (
          <mesh key={i} position={[x, -0.02, 0.228]}>
            <boxGeometry args={[0.02, 0.11, 0.01]} />
            {createVoxelMat('#7F1D1D', 0.9, 0.05, -2)}
          </mesh>
        ))}
        {/* Center Metal Gold Badge / FitTrack Leather Tag */}
        <mesh position={[0, -0.02, 0.232]}>
          <boxGeometry args={[0.08, 0.055, 0.015]} />
          {createVoxelMat(sColor, 0.25, 0.8, -3)}
        </mesh>
        <mesh position={[0, -0.02, 0.241]}>
          <boxGeometry args={[0.04, 0.025, 0.005]} />
          {createVoxelMat('#18181B', 0.2, 0.5, -4)}
        </mesh>
      </group>
    );
  }

  // STRAW HAT (Mũ Rơm Phiêu Lưu - Vải đan + Dải nơ đỏ)
  if (code === 'straw_hat') {
    return (
      <group position={[0, 0.26, 0]}>
        {/* Wide Brim */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.66, 0.035, 0.66]} />
          {createVoxelMat(pColor, 0.9, 0.05, -1)}
        </mesh>
        {/* Hat Crown */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.42, 0.16, 0.42]} />
          {createVoxelMat(pColor, 0.9, 0.05, -1)}
        </mesh>
        {/* Woven Cross Texture Stripes */}
        {[-0.12, 0, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0.09, 0]}>
            <boxGeometry args={[0.02, 0.15, 0.425]} />
            {createVoxelMat('#EAB308', 0.95, 0.05, -2)}
          </mesh>
        ))}
        {/* Red Ribbon Band */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.43, 0.04, 0.43]} />
          {createVoxelMat(sColor, 0.6, 0.1, -2)}
        </mesh>
      </group>
    );
  }

  // WITCH HAT (Mũ Phù Thủy Ma Thuật - Khóa đồng + Vành nhọn góc cạnh)
  if (code === 'witch_hat') {
    return (
      <group position={[0, 0.26, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.72, 0.04, 0.72]} />
          {createVoxelMat(pColor, 0.7, 0.1, -1)}
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.42, 0.18, 0.42]} />
          {createVoxelMat(pColor, 0.7, 0.1, -1)}
        </mesh>
        <mesh position={[-0.02, 0.26, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.14, 0.28]} />
          {createVoxelMat(pColor, 0.7, 0.1, -1)}
        </mesh>
        <mesh position={[-0.05, 0.38, -0.05]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.16]} />
          {createVoxelMat(pColor, 0.7, 0.1, -1)}
        </mesh>
        {/* Crimson Belt & Golden Buckle */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.43, 0.045, 0.43]} />
          {createVoxelMat('#991B1B', 0.6, 0.1, -2)}
        </mesh>
        <mesh position={[0, 0.05, 0.22]}>
          <boxGeometry args={[0.09, 0.07, 0.02]} />
          {createVoxelMat(sColor, 0.2, 0.8, -3)}
        </mesh>
        <mesh position={[0, 0.05, 0.228]}>
          <boxGeometry args={[0.04, 0.035, 0.01]} />
          {createVoxelMat('#1E1B4B', 0.2, 0.5, -4)}
        </mesh>
      </group>
    );
  }

  // FUR CAP (Mũ Lông Thợ Săn - Lông cừu viền quanh + Tai cụp)
  if (code === 'fur_cap') {
    return (
      <group position={[0, 0.28, 0]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.43, 0.20, 0.43]} />
          {createVoxelMat(pColor, 0.75, 0.05, -1)}
        </mesh>
        {/* Fluffy Front Fur Brim */}
        <mesh position={[0, 0.05, 0.225]}>
          <boxGeometry args={[0.34, 0.14, 0.04]} />
          {createVoxelMat(sColor, 0.95, 0.05, -2)}
        </mesh>
        {/* Side Ear Flaps */}
        <mesh position={[-0.225, -0.05, 0]}>
          <boxGeometry args={[0.04, 0.19, 0.28]} />
          {createVoxelMat(sColor, 0.95, 0.05, -2)}
        </mesh>
        <mesh position={[0.225, -0.05, 0]}>
          <boxGeometry args={[0.04, 0.19, 0.28]} />
          {createVoxelMat(sColor, 0.95, 0.05, -2)}
        </mesh>
      </group>
    );
  }

  // ATHLETIC CAP (Nón Kết Gymer Pro - Lưỡi trai sandwich + Logo Gym)
  if (code === 'athletic_cap') {
    return (
      <group position={[0, 0.27, 0]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.42, 0.18, 0.42]} />
          {createVoxelMat(pColor, 0.7, 0.1, -1)}
        </mesh>
        {/* Front Crown Panel with Embroidered Patch */}
        <mesh position={[0, 0.06, 0.215]}>
          <boxGeometry args={[0.16, 0.10, 0.015]} />
          {createVoxelMat('#F8FAFC', 0.5, 0.2, -2)}
        </mesh>
        <mesh position={[0, 0.06, 0.225]}>
          <boxGeometry args={[0.08, 0.04, 0.01]} />
          {createVoxelMat(sColor, 0.4, 0.4, -3)}
        </mesh>
        {/* Curved Curved Visor / Brim */}
        <mesh position={[0, -0.02, 0.28]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.40, 0.025, 0.18]} />
          {createVoxelMat(pColor, 0.7, 0.1, -1)}
        </mesh>
        {/* Sandwich Visor Edge (Orange Accent) */}
        <mesh position={[0, -0.02, 0.365]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.38, 0.012, 0.015]} />
          {createVoxelMat(sColor, 0.4, 0.3, -2)}
        </mesh>
      </group>
    );
  }

  // RETRO 80s HEADBAND (Băng Đô Neon 3 Sọc - Hở đỉnh tóc)
  if (code === 'retro_headband') {
    return (
      <group position={[0, 0.24, 0]}>
        {/* Pink Base Band */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.41, 0.08, 0.41]} />
          {createVoxelMat('#EC4899', 0.8, 0.05, -1)}
        </mesh>
        {/* Cyan Neon Center Stripe */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.416, 0.028, 0.416]} />
          {createVoxelMat('#06B6D4', 0.8, 0.05, -2)}
        </mesh>
        {/* White Accent Pin */}
        <mesh position={[0, 0, 0.21]}>
          <boxGeometry args={[0.06, 0.06, 0.01]} />
          {createVoxelMat('#FFFFFF', 0.5, 0.3, -3)}
        </mesh>
      </group>
    );
  }

  // CYBER GRID B-BOY HEADPHONES (Tai Nghe Over-ear Phát Sáng Cyan)
  if (code === 'cyber_headphones') {
    return (
      <group position={[0, 0.26, 0]}>
        {/* Headband Arc */}
        <mesh position={[0, 0.17, 0]} castShadow>
          <boxGeometry args={[0.42, 0.035, 0.08]} />
          {createVoxelMat('#18181B', 0.4, 0.6, -1)}
        </mesh>
        {/* Left Earcup */}
        <mesh position={[-0.22, -0.02, 0]} castShadow>
          <boxGeometry args={[0.055, 0.17, 0.17]} />
          {createVoxelMat('#09090B', 0.3, 0.7, -1)}
        </mesh>
        {/* Glowing Neon Equalizer Disc */}
        <mesh position={[-0.25, -0.02, 0]}>
          <boxGeometry args={[0.015, 0.10, 0.10]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={1.0} roughness={0.2} />
        </mesh>
        {/* Right Earcup */}
        <mesh position={[0.22, -0.02, 0]} castShadow>
          <boxGeometry args={[0.055, 0.17, 0.17]} />
          {createVoxelMat('#09090B', 0.3, 0.7, -1)}
        </mesh>
        <mesh position={[0.25, -0.02, 0]}>
          <boxGeometry args={[0.015, 0.10, 0.10]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={1.0} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // SOLAR CROWN (Vương Miện Thái Dương Titan Hoàng Kim)
  if (code === 'solar_crown') {
    return (
      <group position={[0, 0.30, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.045, 0.42]} />
          <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.4} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Crown Radiant Spikes */}
        {[-0.14, -0.07, 0, 0.07, 0.14].map((x, i) => {
          const h = i === 2 ? 0.15 : i === 1 || i === 3 ? 0.11 : 0.08;
          return (
            <mesh key={i} position={[x, h / 2, 0.215]}>
              <boxGeometry args={[0.03, h, 0.015]} />
              <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
          );
        })}
        {/* Sun Crystal Gem */}
        <mesh position={[0, 0.04, 0.225]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  return null;
};

// =========================================================================
// 2. HAIR RENDERER (Full 3D Volumetric Anime Voxel Hair)
// =========================================================================
export const HairRenderer: React.FC<{
  item: AvatarItem | null;
  gender: 'male' | 'female';
  coversCrown?: boolean;
  isHairHidden?: boolean;
  customColor?: string;
}> = ({ item, gender, coversCrown = false, isHairHidden = false, customColor }) => {
  if (isHairHidden) return null;

  const defaultColor = gender === 'female' ? '#592D14' : '#78350F';
  const hairColor = customColor || item?.colors?.primary || defaultColor;
  const isFemale = gender === 'female';
  const code = item?.itemCode || (isFemale ? 'female_braids' : 'male_spiky');

  // MALE HAIRSTYLES
  if (!isFemale) {
    if (code === 'male_spiky') {
      return (
        <group position={[0, 0.20, 0]}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.42, 0.20, 0.42]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          <mesh position={[0, 0.04, -0.19]} castShadow>
            <boxGeometry args={[0.42, 0.26, 0.08]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          <mesh position={[-0.20, 0.06, 0.04]} castShadow>
            <boxGeometry args={[0.045, 0.22, 0.26]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          <mesh position={[0.20, 0.06, 0.04]} castShadow>
            <boxGeometry args={[0.045, 0.22, 0.26]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          {/* Layered Front Anime Bangs */}
          <mesh position={[-0.10, 0.17, 0.20]} castShadow>
            <boxGeometry args={[0.12, 0.09, 0.05]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -2)}
          </mesh>
          <mesh position={[0.06, 0.18, 0.20]} castShadow>
            <boxGeometry args={[0.15, 0.08, 0.05]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -2)}
          </mesh>
          {!coversCrown && (
            <mesh position={[-0.04, 0.28, 0.08]} rotation={[-0.15, 0, 0.1]} castShadow>
              <boxGeometry args={[0.18, 0.15, 0.22]} />
              {createVoxelMat(hairColor, 0.85, 0.05, -2)}
            </mesh>
          )}
        </group>
      );
    }

    if (code === 'male_undercut') {
      return (
        <group position={[0, 0.20, 0]}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.40, 0.14, 0.40]} />
            {createVoxelMat('#27272A', 0.9, 0.05, -1)}
          </mesh>
          <mesh position={[0, 0.04, -0.19]} castShadow>
            <boxGeometry args={[0.40, 0.22, 0.06]} />
            {createVoxelMat('#27272A', 0.9, 0.05, -1)}
          </mesh>
          <mesh position={[-0.02, 0.20, 0.20]} castShadow>
            <boxGeometry args={[0.24, 0.08, 0.04]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -2)}
          </mesh>
          {!coversCrown && (
            <mesh position={[-0.03, 0.26, 0.02]} rotation={[0, 0, -0.12]} castShadow>
              <boxGeometry args={[0.28, 0.14, 0.36]} />
              {createVoxelMat(hairColor, 0.85, 0.05, -2)}
            </mesh>
          )}
        </group>
      );
    }

    if (code === 'male_messy_curls') {
      return (
        <group position={[0, 0.20, 0]}>
          <mesh position={[0, 0.17, 0]} castShadow>
            <boxGeometry args={[0.42, 0.20, 0.42]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          <mesh position={[0, 0.04, -0.19]} castShadow>
            <boxGeometry args={[0.42, 0.26, 0.08]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          <mesh position={[-0.08, 0.18, 0.21]} rotation={[0.1, 0, 0.1]} castShadow>
            <boxGeometry args={[0.13, 0.13, 0.07]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -2)}
          </mesh>
          <mesh position={[0.06, 0.19, 0.20]} rotation={[0.1, 0, -0.1]} castShadow>
            <boxGeometry args={[0.14, 0.12, 0.07]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -2)}
          </mesh>
          {!coversCrown && (
            <mesh position={[-0.02, 0.28, 0.04]} castShadow>
              <boxGeometry args={[0.24, 0.12, 0.24]} />
              {createVoxelMat(hairColor, 0.85, 0.05, -2)}
            </mesh>
          )}
        </group>
      );
    }

    if (code === 'male_samurai_bun') {
      return (
        <group position={[0, 0.20, 0]}>
          <mesh position={[0, 0.16, -0.01]} castShadow>
            <boxGeometry args={[0.41, 0.18, 0.41]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          <mesh position={[0, 0.04, -0.19]} castShadow>
            <boxGeometry args={[0.41, 0.24, 0.06]} />
            {createVoxelMat(hairColor, 0.85, 0.05, -1)}
          </mesh>
          {!coversCrown && (
            <group position={[0, 0.28, -0.08]}>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.12, 0.12, 0.12]} />
                {createVoxelMat(hairColor, 0.85, 0.05, -2)}
              </mesh>
              <mesh position={[0, -0.04, 0]}>
                <boxGeometry args={[0.135, 0.04, 0.135]} />
                {createVoxelMat('#F59E0B', 0.3, 0.7, -3)}
              </mesh>
            </group>
          )}
        </group>
      );
    }

    // Default Buzz cut
    return (
      <group position={[0, 0.20, 0]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <boxGeometry args={[0.395, 0.18, 0.395]} />
          {createVoxelMat(hairColor, 0.9, 0.05, -1)}
        </mesh>
        <mesh position={[0, 0.04, -0.19]} castShadow>
          <boxGeometry args={[0.395, 0.24, 0.05]} />
          {createVoxelMat(hairColor, 0.9, 0.05, -1)}
        </mesh>
        <mesh position={[0, 0.18, 0.195]} castShadow>
          <boxGeometry args={[0.32, 0.04, 0.02]} />
          {createVoxelMat(hairColor, 0.9, 0.05, -2)}
        </mesh>
      </group>
    );
  }

  // FEMALE HAIRSTYLES
  if (code === 'female_braids') {
    return (
      <group position={[0, 0.20, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.42, 0.20, 0.42]} />
          {createVoxelMat(hairColor, 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[0, 0.04, -0.19]} castShadow>
          <boxGeometry args={[0.42, 0.28, 0.08]} />
          {createVoxelMat(hairColor, 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[-0.08, 0.17, 0.20]} castShadow>
          <boxGeometry args={[0.14, 0.10, 0.04]} />
          {createVoxelMat(hairColor, 0.8, 0.05, -2)}
        </mesh>
        {/* Left Braid */}
        <mesh position={[-0.18, -0.16, 0.12]} castShadow>
          <boxGeometry args={[0.07, 0.36, 0.07]} />
          {createVoxelMat(hairColor, 0.8, 0.05, -2)}
        </mesh>
        <mesh position={[-0.18, -0.32, 0.12]}>
          <boxGeometry args={[0.085, 0.04, 0.085]} />
          {createVoxelMat('#FBBF24', 0.4, 0.6, -3)}
        </mesh>
        {/* Right Braid */}
        <mesh position={[0.18, -0.16, 0.12]} castShadow>
          <boxGeometry args={[0.07, 0.36, 0.07]} />
          {createVoxelMat(hairColor, 0.8, 0.05, -2)}
        </mesh>
        <mesh position={[0.18, -0.32, 0.12]}>
          <boxGeometry args={[0.085, 0.04, 0.085]} />
          {createVoxelMat('#FBBF24', 0.4, 0.6, -3)}
        </mesh>
      </group>
    );
  }

  if (code === 'female_ponytail') {
    return (
      <group position={[0, 0.20, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.42, 0.20, 0.42]} />
          {createVoxelMat(hairColor, 0.8, 0.05, -1)}
        </mesh>
        {!coversCrown && (
          <group position={[0, 0.26, -0.18]}>
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.13, 0.13, 0.13]} />
              {createVoxelMat(hairColor, 0.8, 0.05, -2)}
            </mesh>
            <mesh position={[0, -0.08, -0.06]} rotation={[0.3, 0, 0]} castShadow>
              <boxGeometry args={[0.10, 0.24, 0.08]} />
              {createVoxelMat(hairColor, 0.8, 0.05, -2)}
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.04, 0.15]} />
              {createVoxelMat('#FF5722', 0.4, 0.4, -3)}
            </mesh>
          </group>
        )}
      </group>
    );
  }

  // Default Female Hair
  return (
    <group position={[0, 0.20, 0]}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.42, 0.20, 0.42]} />
        {createVoxelMat(hairColor, 0.8, 0.05, -1)}
      </mesh>
      <mesh position={[0, 0.04, -0.19]} castShadow>
        <boxGeometry args={[0.42, 0.26, 0.08]} />
        {createVoxelMat(hairColor, 0.8, 0.05, -1)}
      </mesh>
    </group>
  );
};

// =========================================================================
// 3. TOP SLEEVE RENDERER (Rendered directly on leftArmRef & rightArmRef)
// =========================================================================
export const TopSleeveRenderer: React.FC<{
  item: AvatarItem | null;
  side: 'left' | 'right';
  gender: 'male' | 'female';
}> = ({ item, side, gender }) => {
  if (!item) return null;

  const code = item.itemCode;
  const isFemale = gender === 'female';
  const armWidth = isFemale ? 0.115 : 0.135;

  // 1. ORANGE PLAID OVERSHIRT (Short Plaid Sleeve + Cuffed Hem)
  if (code === 'orange_plaid') {
    return (
      <group position={[0, -0.08, 0]}>
        {/* Main Orange Plaid Upper Sleeve */}
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.025, 0.18, armWidth + 0.025]} />
          {createVoxelMat('#EA580C', 0.8, 0.05, -1)}
        </mesh>
        {/* Plaid Grid Voxels */}
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.015 : armWidth / 2 + 0.015, 0.02, 0]}>
          <boxGeometry args={[0.01, 0.06, armWidth + 0.02]} />
          {createVoxelMat('#9A3412', 0.8, 0.05, -2)}
        </mesh>
        {/* Folded Orange Cuff Band */}
        <mesh position={[0, -0.09, 0]} castShadow>
          <boxGeometry args={[armWidth + 0.035, 0.04, armWidth + 0.035]} />
          {createVoxelMat('#F97316', 0.85, 0.05, -2)}
        </mesh>
        {/* Pearlescent Sleeve Button */}
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.02 : armWidth / 2 + 0.02, -0.09, 0]}>
          <boxGeometry args={[0.01, 0.02, 0.02]} />
          {createVoxelMat('#FFFFFF', 0.3, 0.5, -3)}
        </mesh>
      </group>
    );
  }

  // 2. TEAL SHIRT (Short Athletic Gym Sleeve)
  if (code === 'teal_shirt') {
    return (
      <group position={[0, -0.07, 0]}>
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.02, 0.16, armWidth + 0.02]} />
          {createVoxelMat('#0D9488', 0.6, 0.1, -1)}
        </mesh>
        {/* Sleeve Contrast Hem Band */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[armWidth + 0.025, 0.03, armWidth + 0.025]} />
          {createVoxelMat('#115E59', 0.7, 0.1, -2)}
        </mesh>
      </group>
    );
  }

  // 3. LEATHER COAT (Full Long Leather Sleeve + Buckled Wrist Straps)
  if (code === 'leather_coat') {
    return (
      <group position={[0, -0.17, 0]}>
        {/* Full Long Coat Sleeve */}
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.03, 0.36, armWidth + 0.03]} />
          {createVoxelMat('#451A03', 0.65, 0.15, -1)}
        </mesh>
        {/* Leather Wrist Cuff */}
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[armWidth + 0.045, 0.06, armWidth + 0.045]} />
          {createVoxelMat('#292524', 0.6, 0.2, -2)}
        </mesh>
        {/* Brass Buckle on Wrist */}
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.025 : armWidth / 2 + 0.025, -0.14, 0]}>
          <boxGeometry args={[0.015, 0.035, 0.04]} />
          {createVoxelMat('#F59E0B', 0.2, 0.8, -3)}
        </mesh>
      </group>
    );
  }

  // 4. TECHWEAR NOMAD JACKET (Full Tactical Waterproof Sleeve + Arm Pocket)
  if (code === 'techwear_jacket') {
    return (
      <group position={[0, -0.17, 0]}>
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.03, 0.36, armWidth + 0.03]} />
          {createVoxelMat('#18181B', 0.7, 0.2, -1)}
        </mesh>
        {/* Tactical Arm Pocket with Cyber Yellow Pull */}
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.02 : armWidth / 2 + 0.02, 0.06, 0]} castShadow>
          <boxGeometry args={[0.025, 0.10, 0.09]} />
          {createVoxelMat('#27272A', 0.8, 0.1, -2)}
        </mesh>
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.035 : armWidth / 2 + 0.035, 0.06, 0]}>
          <boxGeometry args={[0.01, 0.02, 0.04]} />
          {createVoxelMat('#FBBF24', 0.3, 0.5, -3)}
        </mesh>
      </group>
    );
  }

  // 5. CYBER GRID B-BOY HOODIE (Boxy Oversized Sleeve + Neon Audio Bars)
  if (code === 'cyber_grid_hoodie') {
    return (
      <group position={[0, -0.17, 0]}>
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.045, 0.36, armWidth + 0.045]} />
          {createVoxelMat('#09090B', 0.7, 0.1, -1)}
        </mesh>
        {/* Glowing Equalizer Bar Stripes */}
        {[-0.04, 0, 0.04].map((y, i) => (
          <mesh
            key={i}
            position={[side === 'left' ? -armWidth / 2 - 0.025 : armWidth / 2 + 0.025, y, 0]}
          >
            <boxGeometry args={[0.01, 0.02, armWidth + 0.02]} />
            <meshStandardMaterial
              color={i === 0 ? '#06B6D4' : i === 1 ? '#EC4899' : '#A855F7'}
              emissive={i === 0 ? '#06B6D4' : i === 1 ? '#EC4899' : '#A855F7'}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
    );
  }

  // 6. SHADOW SHINOBI TUNIC (Ninja Forearm Bandage Wraps)
  if (code === 'shinobi_tunic') {
    return (
      <group position={[0, -0.17, 0]}>
        {/* Upper Kimono Gi Sleeve */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[armWidth + 0.03, 0.16, armWidth + 0.03]} />
          {createVoxelMat('#18022B', 0.8, 0.1, -1)}
        </mesh>
        {/* Forearm Hand Bandage Wraps */}
        <mesh position={[0, -0.10, 0]} castShadow>
          <boxGeometry args={[armWidth + 0.015, 0.18, armWidth + 0.015]} />
          {createVoxelMat('#7C3AED', 0.6, 0.1, -1)}
        </mesh>
      </group>
    );
  }

  // 7. GLITCH SINGULARITY VOID SUIT (Floating Matrix Glitch Shards)
  if (code === 'glitch_void_suit') {
    return (
      <group position={[0, -0.17, 0]}>
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.025, 0.36, armWidth + 0.025]} />
          {createVoxelMat('#020617', 0.8, 0.2, -1)}
        </mesh>
        {/* Floating Matrix Glitch Shards */}
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.02 : armWidth / 2 + 0.02, 0.04, 0.02]}>
          <boxGeometry args={[0.03, 0.04, 0.03]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.02 : armWidth / 2 + 0.02, -0.08, -0.02]}>
          <boxGeometry args={[0.03, 0.05, 0.03]} />
          <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.9} />
        </mesh>
      </group>
    );
  }

  // 8. SOLAR SOVEREIGN TITAN ARMOR (Golden Segmented Gauntlets)
  if (code === 'solar_armor') {
    return (
      <group position={[0, -0.17, 0]}>
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.03, 0.36, armWidth + 0.03]} />
          <meshStandardMaterial color="#F59E0B" emissive="#B45309" emissiveIntensity={0.25} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Winged Forearm Ridge */}
        <mesh position={[side === 'left' ? -armWidth / 2 - 0.02 : armWidth / 2 + 0.02, -0.08, 0]}>
          <boxGeometry args={[0.03, 0.14, armWidth + 0.04]} />
          <meshStandardMaterial color="#FEF08A" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  // 9. FEMALE TUNIC (Short Blue Adventurer Sleeve)
  if (code === 'female_tunic') {
    return (
      <group position={[0, -0.07, 0]}>
        <mesh castShadow>
          <boxGeometry args={[armWidth + 0.02, 0.15, armWidth + 0.02]} />
          {createVoxelMat('#1E3A5F', 0.7, 0.1, -1)}
        </mesh>
        {/* White Edge Piping */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[armWidth + 0.025, 0.025, armWidth + 0.025]} />
          {createVoxelMat('#F8FAFC', 0.6, 0.1, -2)}
        </mesh>
      </group>
    );
  }

  return null;
};

// =========================================================================
// 4. TOP RENDERER (Torso & Chest Equipment - Hoa Văn & Họa Tiết Đậm Chất RPG)
// =========================================================================
export const TopRenderer: React.FC<{
  item: AvatarItem | null;
  gender: 'male' | 'female';
}> = ({ item, gender }) => {
  const { scene, hasGlb } = useEquipmentMesh(item?.meshUrl);
  if (!item) return null;
  if (hasGlb && scene) return <primitive object={scene} />;

  const code = item.itemCode;
  const isFemale = gender === 'female';
  const width = isFemale ? 0.36 : 0.44;
  const depth = isFemale ? 0.22 : 0.26;

  // 1. ORANGE PLAID OVERSHIRT (Sơ Mi Caro Cam + Thun Trong Graphic Cyan)
  if (code === 'orange_plaid') {
    return (
      <group position={[0, 0, 0]}>
        {/* Inner Graphic Dark T-Shirt */}
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[width - 0.01, 0.41, depth + 0.015]} />
          {createVoxelMat('#09090B', 0.6, 0.1, -1)}
        </mesh>
        {/* 8-Bit Pixel Graphic Creeper/Skull Logo on Inner Chest */}
        <mesh position={[0, 0.08, depth / 2 + 0.01]}>
          <boxGeometry args={[0.11, 0.11, 0.01]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.08, depth / 2 + 0.016]}>
          <boxGeometry args={[0.05, 0.05, 0.005]} />
          {createVoxelMat('#09090B', 0.2, 0.5, -3)}
        </mesh>

        {/* Left Plaid Overshirt Flap */}
        <mesh position={[-width / 4, 0, 0.01]} castShadow>
          <boxGeometry args={[width / 2, 0.43, depth + 0.028]} />
          {createVoxelMat('#EA580C', 0.8, 0.05, -1)}
        </mesh>
        {/* Right Plaid Overshirt Flap */}
        <mesh position={[width / 4, 0, 0.01]} castShadow>
          <boxGeometry args={[width / 2, 0.43, depth + 0.028]} />
          {createVoxelMat('#EA580C', 0.8, 0.05, -1)}
        </mesh>

        {/* Checkered Plaid Grid Patterns (Dark Orange & Amber Stripes) */}
        {[-0.14, 0.14].map((x, i) => (
          <mesh key={i} position={[x, 0, depth / 2 + 0.018]}>
            <boxGeometry args={[0.03, 0.42, 0.008]} />
            {createVoxelMat('#9A3412', 0.85, 0.05, -2)}
          </mesh>
        ))}
        {[-0.08, 0.08].map((y, i) => (
          <mesh key={i} position={[0, y, depth / 2 + 0.018]}>
            <boxGeometry args={[width + 0.01, 0.03, 0.008]} />
            {createVoxelMat('#F59E0B', 0.85, 0.05, -2)}
          </mesh>
        ))}

        {/* Dual Flapped Chest Pockets */}
        <mesh position={[-0.12, 0.06, depth / 2 + 0.022]} castShadow>
          <boxGeometry args={[0.09, 0.08, 0.012]} />
          {createVoxelMat('#C2410C', 0.8, 0.05, -3)}
        </mesh>
        <mesh position={[0.12, 0.06, depth / 2 + 0.022]} castShadow>
          <boxGeometry args={[0.09, 0.08, 0.012]} />
          {createVoxelMat('#C2410C', 0.8, 0.05, -3)}
        </mesh>

        {/* Row of White Buttons down Placket */}
        {[-0.10, -0.02, 0.06, 0.14].map((y, i) => (
          <mesh key={i} position={[-0.03, y, depth / 2 + 0.025]}>
            <boxGeometry args={[0.022, 0.022, 0.01]} />
            {createVoxelMat('#FFFFFF', 0.3, 0.6, -4)}
          </mesh>
        ))}

        {/* Folded Shirt Collar Lapels */}
        <mesh position={[-0.11, 0.20, 0.04]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.05, 0.10]} />
          {createVoxelMat('#C2410C', 0.8, 0.05, -2)}
        </mesh>
        <mesh position={[0.11, 0.20, 0.04]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.08, 0.05, 0.10]} />
          {createVoxelMat('#C2410C', 0.8, 0.05, -2)}
        </mesh>
      </group>
    );
  }

  // 2. TEAL SHIRT (Áo Thun Body Xanh Cổ Vịt - Logo FitTrack + Mảng Phối Lưng)
  if (code === 'teal_shirt') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[width + 0.015, 0.42, depth + 0.015]} />
          {createVoxelMat('#0D9488', 0.6, 0.1, -1)}
        </mesh>
        {/* FitTrack Geometric Shield Logo on Chest */}
        <mesh position={[0, 0.08, depth / 2 + 0.01]}>
          <boxGeometry args={[0.09, 0.09, 0.01]} />
          {createVoxelMat('#FFFFFF', 0.4, 0.5, -2)}
        </mesh>
        <mesh position={[0, 0.08, depth / 2 + 0.016]}>
          <boxGeometry args={[0.05, 0.05, 0.005]} />
          {createVoxelMat('#0D9488', 0.6, 0.1, -3)}
        </mesh>
        {/* Contrast Dark Charcoal Side Contouring Panels */}
        <mesh position={[-width / 2 - 0.008, 0, 0]}>
          <boxGeometry args={[0.015, 0.38, depth - 0.02]} />
          {createVoxelMat('#115E59', 0.7, 0.1, -2)}
        </mesh>
        <mesh position={[width / 2 + 0.008, 0, 0]}>
          <boxGeometry args={[0.015, 0.38, depth - 0.02]} />
          {createVoxelMat('#115E59', 0.7, 0.1, -2)}
        </mesh>
      </group>
    );
  }

  // 3. LEATHER COAT (Áo Khoác Duster Da Thợ Săn - Khóa Vàng Kim + Cầu Vai)
  if (code === 'leather_coat') {
    return (
      <group position={[0, -0.06, 0]}>
        {/* Main Leather Body */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[width + 0.04, 0.46, depth + 0.04]} />
          {createVoxelMat('#451A03', 0.65, 0.15, -1)}
        </mesh>
        {/* Wide Folded Lapels */}
        <mesh position={[-0.10, 0.16, depth / 2 + 0.025]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.10, 0.18, 0.02]} />
          {createVoxelMat('#78350F', 0.6, 0.15, -2)}
        </mesh>
        <mesh position={[0.10, 0.16, depth / 2 + 0.025]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.10, 0.18, 0.02]} />
          {createVoxelMat('#78350F', 0.6, 0.15, -2)}
        </mesh>
        {/* Wide Leather Waist Belt */}
        <mesh position={[0, -0.06, 0.01]}>
          <boxGeometry args={[width + 0.055, 0.07, depth + 0.055]} />
          {createVoxelMat('#18181B', 0.5, 0.3, -2)}
        </mesh>
        {/* Prominent Gold Metallic Waist Buckle */}
        <mesh position={[0, -0.06, depth / 2 + 0.04]}>
          <boxGeometry args={[0.09, 0.08, 0.02]} />
          {createVoxelMat('#F59E0B', 0.2, 0.8, -3)}
        </mesh>
        <mesh position={[0, -0.06, depth / 2 + 0.046]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          {createVoxelMat('#18181B', 0.5, 0.3, -4)}
        </mesh>
        {/* Double-breasted Metal Rivet Studs */}
        {[-0.08, 0.02, 0.12].map((y, i) => (
          <React.Fragment key={i}>
            <mesh position={[-0.11, y, depth / 2 + 0.028]}>
              <boxGeometry args={[0.018, 0.018, 0.01]} />
              {createVoxelMat('#D4AF37', 0.2, 0.8, -3)}
            </mesh>
            <mesh position={[0.11, y, depth / 2 + 0.028]}>
              <boxGeometry args={[0.018, 0.018, 0.01]} />
              {createVoxelMat('#D4AF37', 0.2, 0.8, -3)}
            </mesh>
          </React.Fragment>
        ))}
        {/* Long Duster Coat Split Tails */}
        <mesh position={[0, -0.28, -0.02]} castShadow>
          <boxGeometry args={[width + 0.05, 0.38, depth + 0.05]} />
          {createVoxelMat('#451A03', 0.65, 0.15, -1)}
        </mesh>
      </group>
    );
  }

  // 4. FEMALE TUNIC (Áo Tunic Chiến Binh Cổ Điển - Corset Thắt Dây Trắng + Khăn Đỏ)
  if (code === 'female_tunic') {
    return (
      <group position={[0, 0, 0]}>
        {/* Blue Tunic Base */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[width + 0.015, 0.36, depth + 0.015]} />
          {createVoxelMat('#1E3A5F', 0.7, 0.1, -1)}
        </mesh>
        {/* Brown Leather Corset Vest */}
        <mesh position={[0, -0.06, 0.01]} castShadow>
          <boxGeometry args={[width - 0.01, 0.18, depth + 0.022]} />
          {createVoxelMat('#451A03', 0.6, 0.2, -2)}
        </mesh>
        {/* White Cross-lacing Detail on Corset */}
        {[-0.10, -0.05, 0].map((y, i) => (
          <mesh key={i} position={[0, y, depth / 2 + 0.024]}>
            <boxGeometry args={[0.06, 0.015, 0.005]} />
            {createVoxelMat('#FFFFFF', 0.4, 0.2, -3)}
          </mesh>
        ))}
        {/* Crimson Draped Scarf / Cowl around Neck */}
        <mesh position={[0, 0.19, 0.02]}>
          <boxGeometry args={[width + 0.03, 0.06, depth + 0.04]} />
          {createVoxelMat('#DC2626', 0.7, 0.1, -2)}
        </mesh>
        <mesh position={[-0.08, 0.12, depth / 2 + 0.03]}>
          <boxGeometry args={[0.06, 0.12, 0.02]} />
          {createVoxelMat('#DC2626', 0.7, 0.1, -3)}
        </mesh>
      </group>
    );
  }

  // 5. GOTHIC CROP-TOP (Áo Crop-Top Dạ Hội Đen Viền Đỏ + Mặt Dây Thập Tự Bạc)
  if (code === 'gothic_top') {
    return (
      <group position={[0, 0.04, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[width + 0.02, 0.28, depth + 0.02]} />
          {createVoxelMat('#18181B', 0.75, 0.1, -1)}
        </mesh>
        {/* Crimson Edge Hem Border */}
        <mesh position={[0, -0.10, 0]}>
          <boxGeometry args={[width + 0.025, 0.025, depth + 0.025]} />
          {createVoxelMat('#DC2626', 0.6, 0.2, -2)}
        </mesh>
        {/* Silver Gothic Pendant in Center */}
        <mesh position={[0, 0.06, depth / 2 + 0.015]}>
          <boxGeometry args={[0.035, 0.07, 0.01]} />
          {createVoxelMat('#E2E8F0', 0.2, 0.9, -3)}
        </mesh>
      </group>
    );
  }

  // 6. MAGE ROBE (Giáp Áo Băng Pháp Sư - Tinh Thể Lam Ngọc + Cầu Vai Bạc)
  if (code === 'mage_robe') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[width + 0.03, 0.42, depth + 0.03]} />
          {createVoxelMat('#1E3A8A', 0.5, 0.2, -1)}
        </mesh>
        {/* Silver Breastplate Core */}
        <mesh position={[0, 0.08, depth / 2 + 0.02]}>
          <boxGeometry args={[0.20, 0.18, 0.02]} />
          {createVoxelMat('#E2E8F0', 0.2, 0.8, -2)}
        </mesh>
        {/* Glowing Blue Sapphire Heart Gemstone */}
        <mesh position={[0, 0.08, depth / 2 + 0.032]}>
          <boxGeometry args={[0.07, 0.07, 0.015]} />
          <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.9} roughness={0.1} />
        </mesh>
        {/* Tiered Silver Pauldrons on Shoulders */}
        <mesh position={[-width / 2 - 0.03, 0.18, 0]} castShadow>
          <boxGeometry args={[0.10, 0.06, depth + 0.04]} />
          {createVoxelMat('#E2E8F0', 0.2, 0.8, -2)}
        </mesh>
        <mesh position={[width / 2 + 0.03, 0.18, 0]} castShadow>
          <boxGeometry args={[0.10, 0.06, depth + 0.04]} />
          {createVoxelMat('#E2E8F0', 0.2, 0.8, -2)}
        </mesh>
      </group>
    );
  }

  // 7. MINIMALIST CALISTHENICS TANK TOP (Chữ "CALI" + Viền Trắng)
  if (code === 'calisthenics_top') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[width + 0.015, 0.41, depth + 0.015]} />
          {createVoxelMat('#27272A', 0.8, 0.05, -1)}
        </mesh>
        {/* Crisp White Neck & Armhole Piping */}
        <mesh position={[0, 0.20, 0]}>
          <boxGeometry args={[width + 0.02, 0.025, depth + 0.02]} />
          {createVoxelMat('#F4F4F5', 0.5, 0.2, -2)}
        </mesh>
        {/* "CALI" White Pixel Graphic Print on Chest */}
        <mesh position={[0, 0.08, depth / 2 + 0.01]}>
          <boxGeometry args={[0.16, 0.04, 0.008]} />
          {createVoxelMat('#F4F4F5', 0.4, 0.2, -2)}
        </mesh>
      </group>
    );
  }

  // 8. TECHWEAR NOMAD JACKET (Túi Hộp 3D + Dây Đai Hazard Vàng Đen)
  if (code === 'techwear_jacket') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[width + 0.03, 0.44, depth + 0.03]} />
          {createVoxelMat('#18181B', 0.7, 0.2, -1)}
        </mesh>
        {/* Waterproof Center Zipper Line */}
        <mesh position={[0, 0, depth / 2 + 0.018]}>
          <boxGeometry args={[0.025, 0.44, 0.008]} />
          {createVoxelMat('#52525B', 0.3, 0.7, -2)}
        </mesh>
        {/* 3D Asymmetric Cargo Chest Pockets */}
        <mesh position={[-0.10, 0.06, depth / 2 + 0.025]} castShadow>
          <boxGeometry args={[0.11, 0.11, 0.03]} />
          {createVoxelMat('#27272A', 0.8, 0.1, -2)}
        </mesh>
        <mesh position={[0.10, 0.06, depth / 2 + 0.025]} castShadow>
          <boxGeometry args={[0.11, 0.11, 0.03]} />
          {createVoxelMat('#27272A', 0.8, 0.1, -2)}
        </mesh>
        {/* Hazard Caution Stripes Tape (Yellow/Black) */}
        <mesh position={[-0.10, 0.06, depth / 2 + 0.042]}>
          <boxGeometry args={[0.08, 0.025, 0.005]} />
          {createVoxelMat('#FBBF24', 0.3, 0.4, -3)}
        </mesh>
        {/* Hanging Molle Nylon Straps */}
        <mesh position={[-0.10, -0.09, depth / 2 + 0.025]}>
          <boxGeometry args={[0.025, 0.14, 0.01]} />
          {createVoxelMat('#52525B', 0.9, 0.1, -3)}
        </mesh>
        <mesh position={[0.10, -0.09, depth / 2 + 0.025]}>
          <boxGeometry args={[0.025, 0.14, 0.01]} />
          {createVoxelMat('#52525B', 0.9, 0.1, -3)}
        </mesh>
      </group>
    );
  }

  // 9. CYBER GRID B-BOY HOODIE (Lưới Grid 8-Bit Phát Quang + Túi Kangaroo)
  if (code === 'cyber_grid_hoodie') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, -0.01, 0]} castShadow>
          <boxGeometry args={[width + 0.04, 0.44, depth + 0.04]} />
          {createVoxelMat('#09090B', 0.7, 0.1, -1)}
        </mesh>
        {/* Glowing Cyan 8-bit Grid Chest Pattern */}
        <mesh position={[0, 0.06, depth / 2 + 0.025]}>
          <boxGeometry args={[0.22, 0.16, 0.008]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.7} wireframe />
        </mesh>
        {/* Front Kangaroo Pocket with Cyan Trim */}
        <mesh position={[0, -0.12, depth / 2 + 0.028]} castShadow>
          <boxGeometry args={[0.24, 0.12, 0.025]} />
          {createVoxelMat('#18181B', 0.8, 0.1, -2)}
        </mesh>
        <mesh position={[0, -0.06, depth / 2 + 0.042]}>
          <boxGeometry args={[0.22, 0.015, 0.005]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.6} />
        </mesh>
        {/* Rear Resting Hoodie */}
        <mesh position={[0, 0.20, -depth / 2 - 0.03]} castShadow>
          <boxGeometry args={[width - 0.04, 0.11, 0.10]} />
          {createVoxelMat('#09090B', 0.7, 0.1, -1)}
        </mesh>
      </group>
    );
  }

  // 10. SHADOW SHINOBI TUNIC (Vạt Kimono Gi + Phù Hiệu Rồng Vàng)
  if (code === 'shinobi_tunic') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[width + 0.025, 0.42, depth + 0.025]} />
          {createVoxelMat('#18022B', 0.8, 0.1, -1)}
        </mesh>
        {/* Cross-wrap Kimono Lapels */}
        <mesh position={[-0.04, 0.08, depth / 2 + 0.015]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.06, 0.30, 0.01]} />
          {createVoxelMat('#2E1065', 0.7, 0.1, -2)}
        </mesh>
        <mesh position={[0.04, 0.08, depth / 2 + 0.015]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.06, 0.30, 0.01]} />
          {createVoxelMat('#2E1065', 0.7, 0.1, -2)}
        </mesh>
        {/* Golden Dragon Crest Badge */}
        <mesh position={[-0.10, 0.10, depth / 2 + 0.022]}>
          <boxGeometry args={[0.06, 0.06, 0.008]} />
          {createVoxelMat('#F59E0B', 0.2, 0.8, -3)}
        </mesh>
        {/* Crimson Rope Obi Sash with Hanging Tassels */}
        <mesh position={[0, -0.06, 0.01]}>
          <boxGeometry args={[width + 0.035, 0.07, depth + 0.035]} />
          {createVoxelMat('#7C3AED', 0.6, 0.2, -2)}
        </mesh>
        <mesh position={[0.08, -0.16, depth / 2 + 0.03]}>
          <boxGeometry args={[0.03, 0.14, 0.015]} />
          {createVoxelMat('#DC2626', 0.6, 0.2, -3)}
        </mesh>
      </group>
    );
  }

  // 11. MECHA EXOSKELETON RIG (Khung Cơ Khí + Lõi Phản Ứng Reactor Xanh Lục)
  if (code === 'mecha_exorig') {
    return (
      <group position={[0, 0, 0]}>
        {/* Rear Spine Hydraulic Column */}
        <mesh position={[0, 0.04, -depth / 2 - 0.03]} castShadow>
          <boxGeometry args={[0.12, 0.38, 0.04]} />
          {createVoxelMat('#18181B', 0.3, 0.8, -1)}
        </mesh>
        {/* Hydraulic Piston Cylinders */}
        {[-0.10, 0.10].map((x, i) => (
          <group key={i} position={[x, 0.08, -depth / 2 - 0.02]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
              {createVoxelMat('#EAB308', 0.3, 0.7, -2)}
            </mesh>
          </group>
        ))}
        {/* Glowing Arc Reactor Power Core on Chest */}
        <mesh position={[0, 0.08, depth / 2 + 0.018]}>
          <boxGeometry args={[0.09, 0.09, 0.02]} />
          {createVoxelMat('#18181B', 0.2, 0.9, -2)}
        </mesh>
        <mesh position={[0, 0.08, depth / 2 + 0.03]}>
          <boxGeometry args={[0.05, 0.05, 0.01]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.0} />
        </mesh>
        {/* Heavy Shoulder Rig Brackets */}
        <mesh position={[-width / 2 - 0.02, 0.20, 0]} castShadow>
          <boxGeometry args={[0.07, 0.045, depth + 0.04]} />
          {createVoxelMat('#EAB308', 0.4, 0.7, -2)}
        </mesh>
        <mesh position={[width / 2 + 0.02, 0.20, 0]} castShadow>
          <boxGeometry args={[0.07, 0.045, depth + 0.04]} />
          {createVoxelMat('#EAB308', 0.4, 0.7, -2)}
        </mesh>
      </group>
    );
  }

  // 12. GLITCH SINGULARITY VOID SUIT (Khối Hư Không Ma Trận Số Hóa)
  if (code === 'glitch_void_suit') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[width + 0.025, 0.42, depth + 0.025]} />
          {createVoxelMat('#020617', 0.8, 0.2, -1)}
        </mesh>
        {/* Matrix Neon Circuit Lines */}
        <mesh position={[-0.08, 0.06, depth / 2 + 0.016]}>
          <boxGeometry args={[0.015, 0.24, 0.005]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.08, -0.04, depth / 2 + 0.016]}>
          <boxGeometry args={[0.015, 0.24, 0.005]} />
          <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.8} />
        </mesh>
        {/* Floating Digital Glitch Blocks */}
        <mesh position={[-0.14, 0.12, depth / 2 + 0.028]}>
          <boxGeometry args={[0.05, 0.05, 0.03]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={1.0} />
        </mesh>
        <mesh position={[0.12, -0.08, depth / 2 + 0.028]}>
          <boxGeometry args={[0.06, 0.04, 0.03]} />
          <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={1.0} />
        </mesh>
      </group>
    );
  }

  // 13. SOLAR SOVEREIGN TITAN ARMOR (Chiến Giáp Thái Dương Hoàng Kim)
  if (code === 'solar_armor') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[width + 0.035, 0.43, depth + 0.035]} />
          <meshStandardMaterial color="#F59E0B" emissive="#B45309" emissiveIntensity={0.25} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Radiant Solar Sun Crest on Chest */}
        <mesh position={[0, 0.10, depth / 2 + 0.025]}>
          <boxGeometry args={[0.16, 0.16, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FEF08A" emissiveIntensity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.10, depth / 2 + 0.038]}>
          <boxGeometry args={[0.07, 0.07, 0.015]} />
          <meshStandardMaterial color="#EF4444" emissive="#DC2626" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>
        {/* Tiered Winged Pauldrons */}
        <mesh position={[-width / 2 - 0.04, 0.21, 0]} castShadow>
          <boxGeometry args={[0.14, 0.09, depth + 0.04]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[width / 2 + 0.04, 0.21, 0]} castShadow>
          <boxGeometry args={[0.14, 0.09, depth + 0.04]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>
    );
  }

  // Fallback Top
  return (
    <mesh position={[0, 0, 0]} castShadow>
      <boxGeometry args={[width + 0.02, 0.41, depth + 0.02]} />
      {createVoxelMat(item.colors?.primary || '#3B82F6', 0.6, 0.1, -1)}
    </mesh>
  );
};

// =========================================================================
// 5. BOTTOM RENDERER (Quần & Váy - Đường Chỉ, Túi Hộp, Phù Hiệu)
// =========================================================================
export const BottomRenderer: React.FC<{
  item: AvatarItem | null;
  gender: 'male' | 'female';
}> = ({ item, gender }) => {
  const { scene, hasGlb } = useEquipmentMesh(item?.meshUrl);
  if (!item) return null;
  if (hasGlb && scene) return <primitive object={scene} />;

  const code = item.itemCode;
  const isFemale = gender === 'female';
  const legSpan = isFemale ? 0.085 : 0.105;
  const legWidth = isFemale ? 0.135 : 0.155;

  // 1. BLUE JEANS (Quần Jean Xanh Bụi - Chỉ Vàng, Đinh Tán Đồng & Nhãn Da)
  if (code === 'blue_jeans') {
    return (
      <group position={[0, -0.20, 0]}>
        {/* Waistband & Hips */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.12, 0.24]} />
          {createVoxelMat('#1E293B', 0.8, 0.05, -1)}
        </mesh>
        {/* Brown Leather Waistband Patch (Back Right) */}
        <mesh position={[0.12, 0.10, -0.125]}>
          <boxGeometry args={[0.07, 0.04, 0.01]} />
          {createVoxelMat('#78350F', 0.6, 0.1, -2)}
        </mesh>
        {/* Metal Fly Button */}
        <mesh position={[0, 0.10, 0.124]}>
          <boxGeometry args={[0.02, 0.02, 0.01]} />
          {createVoxelMat('#E2E8F0', 0.2, 0.8, -3)}
        </mesh>
        {/* Left Leg */}
        <mesh position={[-legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#1E293B', 0.8, 0.05, -1)}
        </mesh>
        {/* Right Leg */}
        <mesh position={[legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#1E293B', 0.8, 0.05, -1)}
        </mesh>
        {/* Faded Wash Knee Highlights */}
        <mesh position={[-legSpan, -0.14, 0.113]}>
          <boxGeometry args={[0.08, 0.10, 0.005]} />
          {createVoxelMat('#334155', 0.85, 0.05, -2)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0.113]}>
          <boxGeometry args={[0.08, 0.10, 0.005]} />
          {createVoxelMat('#334155', 0.85, 0.05, -2)}
        </mesh>
        {/* Yellow Contrast Stitching Lines */}
        <mesh position={[-legSpan - legWidth / 2 - 0.005, -0.14, 0]}>
          <boxGeometry args={[0.008, 0.36, 0.02]} />
          {createVoxelMat('#F59E0B', 0.9, 0.05, -3)}
        </mesh>
        <mesh position={[legSpan + legWidth / 2 + 0.005, -0.14, 0]}>
          <boxGeometry args={[0.008, 0.36, 0.02]} />
          {createVoxelMat('#F59E0B', 0.9, 0.05, -3)}
        </mesh>
      </group>
    );
  }

  // 2. BROWN CARGO (Quần Kaki Nâu Túi Hộp - Đai Nịt + Khóa Kim Loại)
  if (code === 'brown_cargo') {
    return (
      <group position={[0, -0.20, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.12, 0.24]} />
          {createVoxelMat('#3E2723', 0.8, 0.05, -1)}
        </mesh>
        {/* Heavy Olive Web Belt with Brass Buckle */}
        <mesh position={[0, 0.11, 0.01]}>
          <boxGeometry args={[isFemale ? 0.37 : 0.43, 0.035, 0.25]} />
          {createVoxelMat('#1A2E05', 0.7, 0.2, -2)}
        </mesh>
        <mesh position={[0, 0.11, 0.13]}>
          <boxGeometry args={[0.06, 0.045, 0.015]} />
          {createVoxelMat('#F59E0B', 0.2, 0.8, -3)}
        </mesh>
        {/* Legs */}
        <mesh position={[-legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#3E2723', 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#3E2723', 0.8, 0.05, -1)}
        </mesh>
        {/* 3D Cargo Side Flap Pockets */}
        <mesh position={[-legSpan - 0.07, -0.14, 0]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.14]} />
          {createVoxelMat('#2E1C14', 0.85, 0.05, -2)}
        </mesh>
        <mesh position={[legSpan + 0.07, -0.14, 0]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.14]} />
          {createVoxelMat('#2E1C14', 0.85, 0.05, -2)}
        </mesh>
      </group>
    );
  }

  // 3. BLUE SKIRT (Váy Xẻ Tà Chiến Binh - Viền Thêu Hoàng Kim)
  if (code === 'blue_skirt') {
    return (
      <group position={[0, -0.18, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.26, 0.28]} />
          {createVoxelMat('#1E3A5F', 0.75, 0.1, -1)}
        </mesh>
        {/* Golden Embroidered Hem Border */}
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.43, 0.035, 0.29]} />
          {createVoxelMat('#F59E0B', 0.3, 0.7, -2)}
        </mesh>
      </group>
    );
  }

  // 4. FEMALE LEGGINGS (Quần Legging Gym Nâng Mông Tôn Dáng)
  if (code === 'female_leggings') {
    return (
      <group position={[0, -0.20, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.35, 0.12, 0.23]} />
          {createVoxelMat('#09090B', 0.6, 0.2, -1)}
        </mesh>
        <mesh position={[-legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.21]} />
          {createVoxelMat('#09090B', 0.6, 0.2, -1)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.21]} />
          {createVoxelMat('#09090B', 0.6, 0.2, -1)}
        </mesh>
        {/* Neon Orange Athletic Contour Curves */}
        <mesh position={[-legSpan - legWidth / 2 - 0.005, -0.14, 0]}>
          <boxGeometry args={[0.008, 0.36, 0.03]} />
          {createVoxelMat('#FF5722', 0.4, 0.3, -2)}
        </mesh>
        <mesh position={[legSpan + legWidth / 2 + 0.005, -0.14, 0]}>
          <boxGeometry args={[0.008, 0.36, 0.03]} />
          {createVoxelMat('#FF5722', 0.4, 0.3, -2)}
        </mesh>
      </group>
    );
  }

  // 5. CALISTHENICS SHORTS (Quần Đùi Xẻ Tà Viền Trắng)
  if (code === 'calisthenics_shorts') {
    return (
      <group position={[0, -0.12, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.16, 0.24]} />
          {createVoxelMat('#18181B', 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[-legSpan, -0.06, 0]} castShadow>
          <boxGeometry args={[legWidth + 0.015, 0.16, 0.22]} />
          {createVoxelMat('#18181B', 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[legSpan, -0.06, 0]} castShadow>
          <boxGeometry args={[legWidth + 0.015, 0.16, 0.22]} />
          {createVoxelMat('#18181B', 0.8, 0.05, -1)}
        </mesh>
        {/* White Curved Athletic Hem Piping */}
        <mesh position={[-legSpan, -0.14, 0]}>
          <boxGeometry args={[legWidth + 0.02, 0.02, 0.225]} />
          {createVoxelMat('#F4F4F5', 0.5, 0.2, -2)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0]}>
          <boxGeometry args={[legWidth + 0.02, 0.02, 0.225]} />
          {createVoxelMat('#F4F4F5', 0.5, 0.2, -2)}
        </mesh>
      </group>
    );
  }

  // 6. TECHWEAR JOGGERS (Đai Chéo D-Ring + Túi Hộp)
  if (code === 'techwear_pants') {
    return (
      <group position={[0, -0.20, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.10, 0.24]} />
          {createVoxelMat('#18181B', 0.85, 0.1, -1)}
        </mesh>
        <mesh position={[-legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#18181B', 0.85, 0.1, -1)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#18181B', 0.85, 0.1, -1)}
        </mesh>
        {/* Criss-Cross Hanging Straps */}
        <mesh position={[-legSpan, -0.16, 0.115]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.16, 0.025, 0.01]} />
          {createVoxelMat('#52525B', 0.9, 0.1, -2)}
        </mesh>
        <mesh position={[legSpan, -0.16, 0.115]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.16, 0.025, 0.01]} />
          {createVoxelMat('#52525B', 0.9, 0.1, -2)}
        </mesh>
      </group>
    );
  }

  // 7. TRACK PANTS (Quần Thể Thao 3 Sọc Retro Trắng)
  if (code === 'track_pants') {
    return (
      <group position={[0, -0.20, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.10, 0.24]} />
          {createVoxelMat('#1E293B', 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[-legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#1E293B', 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#1E293B', 0.8, 0.05, -1)}
        </mesh>
        {/* Triple White Stripes Down Sides */}
        {[-0.015, 0, 0.015].map((z, i) => (
          <React.Fragment key={i}>
            <mesh position={[-legSpan - legWidth / 2 - 0.005, -0.14, z]}>
              <boxGeometry args={[0.008, 0.36, 0.01]} />
              {createVoxelMat('#FFFFFF', 0.4, 0.2, -2)}
            </mesh>
            <mesh position={[legSpan + legWidth / 2 + 0.005, -0.14, z]}>
              <boxGeometry args={[0.008, 0.36, 0.01]} />
              {createVoxelMat('#FFFFFF', 0.4, 0.2, -2)}
            </mesh>
          </React.Fragment>
        ))}
      </group>
    );
  }

  // 8. TACTICAL CAMO CARGO (Quần Rằn Ri Rừng Rậm 3 Tông)
  if (code === 'cargo_tactical') {
    return (
      <group position={[0, -0.20, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.10, 0.24]} />
          {createVoxelMat('#365314', 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[-legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#365314', 0.8, 0.05, -1)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#365314', 0.8, 0.05, -1)}
        </mesh>
        {/* Digital Camo Pixel Blocks */}
        <mesh position={[-legSpan, -0.10, 0.113]}>
          <boxGeometry args={[0.06, 0.06, 0.005]} />
          {createVoxelMat('#1A2E05', 0.85, 0.05, -2)}
        </mesh>
        <mesh position={[legSpan, -0.18, 0.113]}>
          <boxGeometry args={[0.06, 0.06, 0.005]} />
          {createVoxelMat('#1A2E05', 0.85, 0.05, -2)}
        </mesh>
      </group>
    );
  }

  // 9. CYBER GLITCH PANTS (Quần Ma Trận Hư Không Neon Cyan)
  if (code === 'cyber_glitch_pants') {
    return (
      <group position={[0, -0.20, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.10, 0.24]} />
          {createVoxelMat('#020617', 0.8, 0.2, -1)}
        </mesh>
        <mesh position={[-legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#020617', 0.8, 0.2, -1)}
        </mesh>
        <mesh position={[legSpan, -0.14, 0]} castShadow>
          <boxGeometry args={[legWidth, 0.36, 0.22]} />
          {createVoxelMat('#020617', 0.8, 0.2, -1)}
        </mesh>
        {/* Glowing Matrix Circuit Stripes */}
        <mesh position={[-legSpan, -0.14, 0.113]}>
          <boxGeometry args={[0.015, 0.30, 0.005]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[legSpan, -0.14, 0.113]}>
          <boxGeometry args={[0.015, 0.30, 0.005]} />
          <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  }

  // Default Bottom
  return (
    <group position={[0, -0.20, 0]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[isFemale ? 0.36 : 0.42, 0.10, 0.24]} />
        {createVoxelMat(item.colors?.primary || '#1E293B', 0.8, 0.05, -1)}
      </mesh>
      <mesh position={[-legSpan, -0.14, 0]} castShadow>
        <boxGeometry args={[legWidth, 0.36, 0.22]} />
        {createVoxelMat(item.colors?.primary || '#1E293B', 0.8, 0.05, -1)}
      </mesh>
      <mesh position={[legSpan, -0.14, 0]} castShadow>
        <boxGeometry args={[legWidth, 0.36, 0.22]} />
        {createVoxelMat(item.colors?.primary || '#1E293B', 0.8, 0.05, -1)}
      </mesh>
    </group>
  );
};

// =========================================================================
// 6. SHOES RENDERER (Giày, Ủng - Gai Đế, Dây Giày, Khóa Đồng)
// =========================================================================
export const ShoesRenderer: React.FC<{
  item: AvatarItem | null;
  gender: 'male' | 'female';
}> = ({ item, gender }) => {
  const { scene, hasGlb } = useEquipmentMesh(item?.meshUrl);
  if (!item) return null;
  if (hasGlb && scene) return <primitive object={scene} />;

  const code = item.itemCode;
  const isFemale = gender === 'female';
  const legSpan = isFemale ? 0.085 : 0.105;
  const shoeWidth = isFemale ? 0.13 : 0.15;

  // 1. COMBAT BOOTS (Ủng Da Chiến Đấu Đen - Gai Đế Hầm Hố + Dây Buộc)
  if (code === 'combat_boots') {
    return (
      <group position={[0, -0.46, 0]}>
        {[-legSpan, legSpan].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            {/* Ankle Collar */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <boxGeometry args={[shoeWidth + 0.015, 0.14, 0.21]} />
              {createVoxelMat('#18181B', 0.7, 0.2, -1)}
            </mesh>
            {/* Foot Body */}
            <mesh position={[0, -0.04, 0.04]} castShadow>
              <boxGeometry args={[shoeWidth + 0.015, 0.10, 0.24]} />
              {createVoxelMat('#09090B', 0.7, 0.2, -1)}
            </mesh>
            {/* Chunky Tread Lug Sole */}
            <mesh position={[0, -0.10, 0.04]}>
              <boxGeometry args={[shoeWidth + 0.025, 0.04, 0.25]} />
              {createVoxelMat('#713F12', 0.9, 0.05, -2)}
            </mesh>
            {/* Lacing Lines & Silver Eyelets */}
            {[-0.02, 0.03, 0.08].map((y, j) => (
              <mesh key={j} position={[0, y, 0.11]}>
                <boxGeometry args={[0.07, 0.015, 0.005]} />
                {createVoxelMat('#713F12', 0.8, 0.1, -3)}
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }

  // 2. RED SNEAKERS (Sneaker Cổ Cao Đỏ Trắng - Logo Ngôi Sao + Viền Đế Lưu Hóa)
  if (code === 'red_sneakers') {
    return (
      <group position={[0, -0.46, 0]}>
        {[-legSpan, legSpan].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            {/* Red Canvas Upper */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <boxGeometry args={[shoeWidth + 0.01, 0.12, 0.21]} />
              {createVoxelMat('#DC2626', 0.75, 0.05, -1)}
            </mesh>
            <mesh position={[0, -0.04, 0.04]} castShadow>
              <boxGeometry args={[shoeWidth + 0.01, 0.08, 0.24]} />
              {createVoxelMat('#DC2626', 0.75, 0.05, -1)}
            </mesh>
            {/* White Vulcanized Rubber Midsole */}
            <mesh position={[0, -0.09, 0.04]}>
              <boxGeometry args={[shoeWidth + 0.02, 0.035, 0.25]} />
              {createVoxelMat('#FFFFFF', 0.4, 0.1, -2)}
            </mesh>
            {/* Thin Red Foxing Pinstripe */}
            <mesh position={[0, -0.085, 0.04]}>
              <boxGeometry args={[shoeWidth + 0.025, 0.008, 0.255]} />
              {createVoxelMat('#DC2626', 0.5, 0.1, -3)}
            </mesh>
            {/* White Rubber Toe Cap */}
            <mesh position={[0, -0.035, 0.145]}>
              <boxGeometry args={[shoeWidth - 0.01, 0.05, 0.04]} />
              {createVoxelMat('#FFFFFF', 0.4, 0.1, -3)}
            </mesh>
            {/* White Star Ankle Patch */}
            <mesh position={[i === 0 ? -shoeWidth / 2 - 0.008 : shoeWidth / 2 + 0.008, 0.04, 0]}>
              <boxGeometry args={[0.005, 0.05, 0.05]} />
              {createVoxelMat('#FFFFFF', 0.3, 0.5, -3)}
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // 3. LEATHER BOOTS (Ủng Da Nâu - Cổ Gập Viền Vàng Kim)
  if (code === 'leather_boots') {
    return (
      <group position={[0, -0.46, 0]}>
        {[-legSpan, legSpan].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <boxGeometry args={[shoeWidth + 0.02, 0.14, 0.22]} />
              {createVoxelMat('#451A03', 0.65, 0.1, -1)}
            </mesh>
            <mesh position={[0, -0.04, 0.04]} castShadow>
              <boxGeometry args={[shoeWidth + 0.02, 0.09, 0.24]} />
              {createVoxelMat('#451A03', 0.65, 0.1, -1)}
            </mesh>
            {/* Folded Top Cuff */}
            <mesh position={[0, 0.10, 0]}>
              <boxGeometry args={[shoeWidth + 0.035, 0.04, 0.235]} />
              {createVoxelMat('#78350F', 0.7, 0.1, -2)}
            </mesh>
            {/* Golden Wrap Buckle */}
            <mesh position={[0, 0.03, 0.115]}>
              <boxGeometry args={[0.06, 0.03, 0.015]} />
              {createVoxelMat('#EAB308', 0.2, 0.8, -3)}
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // 4. RETRO RUNNERS 80s (Giày Chạy Chunky Arcade 80s)
  if (code === 'retro_runners') {
    return (
      <group position={[0, -0.46, 0]}>
        {[-legSpan, legSpan].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, -0.02, 0.03]} castShadow>
              <boxGeometry args={[shoeWidth + 0.02, 0.10, 0.24]} />
              {createVoxelMat('#F43F5E', 0.7, 0.1, -1)}
            </mesh>
            {/* 3-Tier Chunky Wedge Sole (Cyan & Pink) */}
            <mesh position={[0, -0.08, 0.03]}>
              <boxGeometry args={[shoeWidth + 0.03, 0.03, 0.26]} />
              {createVoxelMat('#06B6D4', 0.5, 0.2, -2)}
            </mesh>
            <mesh position={[0, -0.11, 0.03]}>
              <boxGeometry args={[shoeWidth + 0.035, 0.03, 0.27]} />
              {createVoxelMat('#FFFFFF', 0.4, 0.1, -3)}
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // 5. PRO POWERLIFTERS (Giày Cử Tạ Powerlifting Pro - Đai Metatarsal)
  if (code === 'pro_powerlifters') {
    return (
      <group position={[0, -0.46, 0]}>
        {[-legSpan, legSpan].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, -0.03, 0.04]} castShadow>
              <boxGeometry args={[shoeWidth + 0.015, 0.09, 0.24]} />
              {createVoxelMat('#18181B', 0.7, 0.2, -1)}
            </mesh>
            {/* Metatarsal Power Strap with Steel Buckle */}
            <mesh position={[0, 0.01, 0.06]}>
              <boxGeometry args={[shoeWidth + 0.025, 0.035, 0.06]} />
              {createVoxelMat('#DC2626', 0.6, 0.3, -2)}
            </mesh>
            {/* Dense Wooden Heel Wedge */}
            <mesh position={[0, -0.08, -0.04]}>
              <boxGeometry args={[shoeWidth + 0.02, 0.04, 0.10]} />
              {createVoxelMat('#78350F', 0.9, 0.05, -2)}
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // 6. CYBER HIGH TOPS (Sneaker LED Neon Phát Sáng Xanh Băng)
  if (code === 'cyber_high_tops') {
    return (
      <group position={[0, -0.46, 0]}>
        {[-legSpan, legSpan].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0.04, 0]} castShadow>
              <boxGeometry args={[shoeWidth + 0.02, 0.13, 0.22]} />
              {createVoxelMat('#09090B', 0.4, 0.6, -1)}
            </mesh>
            <mesh position={[0, -0.04, 0.04]} castShadow>
              <boxGeometry args={[shoeWidth + 0.02, 0.09, 0.24]} />
              {createVoxelMat('#09090B', 0.4, 0.6, -1)}
            </mesh>
            {/* Glowing Cyan LED Light Bar Sole */}
            <mesh position={[0, -0.09, 0.04]}>
              <boxGeometry args={[shoeWidth + 0.03, 0.035, 0.26]} />
              <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={1.0} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // 7. GOLDEN TITAN BOOTS (Ủng Đấu Sĩ Hoàng Kim Titan)
  if (code === 'golden_titan_boots') {
    return (
      <group position={[0, -0.46, 0]}>
        {[-legSpan, legSpan].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0.06, 0]} castShadow>
              <boxGeometry args={[shoeWidth + 0.03, 0.16, 0.23]} />
              <meshStandardMaterial color="#F59E0B" emissive="#B45309" emissiveIntensity={0.2} metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, -0.04, 0.04]} castShadow>
              <boxGeometry args={[shoeWidth + 0.03, 0.10, 0.25]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Winged Ankle Guards */}
            <mesh position={[i === 0 ? -shoeWidth / 2 - 0.02 : shoeWidth / 2 + 0.02, 0.08, -0.02]}>
              <boxGeometry args={[0.02, 0.12, 0.10]} />
              <meshStandardMaterial color="#FEF08A" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // Default Shoes
  return (
    <group position={[0, -0.46, 0]}>
      {[-legSpan, legSpan].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0, 0.04]} castShadow>
            <boxGeometry args={[shoeWidth + 0.01, 0.10, 0.24]} />
            {createVoxelMat(item.colors?.primary || '#09090B', 0.7, 0.1, -1)}
          </mesh>
        </group>
      ))}
    </group>
  );
};

// =========================================================================
// 7. ACCESSORY RENDERER (Multi-location: Head, Torso, Arm)
// =========================================================================
export const AccessoryRenderer: React.FC<{
  item: AvatarItem | null;
  location: 'head' | 'torso' | 'arm';
  side?: 'left' | 'right';
}> = ({ item, location, side = 'left' }) => {
  if (!item) return null;
  const code = item.itemCode;

  // HEAD ACCESSORIES
  if (location === 'head') {
    if (code === 'retro_glasses') {
      return (
        <group position={[0, 0.22, 0.20]}>
          <mesh position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.08, 0.07, 0.02]} />
            {createVoxelMat('#1E293B', 0.3, 0.7, -2)}
          </mesh>
          <mesh position={[0.09, 0, 0]}>
            <boxGeometry args={[0.08, 0.07, 0.02]} />
            {createVoxelMat('#1E293B', 0.3, 0.7, -2)}
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.015, 0.015]} />
            {createVoxelMat('#1E293B', 0.3, 0.7, -2)}
          </mesh>
        </group>
      );
    }

    if (code === 'oni_mask') {
      return (
        <group position={[0, 0.15, 0.205]}>
          <mesh castShadow>
            <boxGeometry args={[0.30, 0.14, 0.04]} />
            {createVoxelMat('#991B1B', 0.6, 0.2, -2)}
          </mesh>
          {/* White Oni Fangs */}
          <mesh position={[-0.06, -0.06, 0.025]}>
            <boxGeometry args={[0.02, 0.04, 0.01]} />
            {createVoxelMat('#FFFFFF', 0.2, 0.4, -3)}
          </mesh>
          <mesh position={[0.06, -0.06, 0.025]}>
            <boxGeometry args={[0.02, 0.04, 0.01]} />
            {createVoxelMat('#FFFFFF', 0.2, 0.4, -3)}
          </mesh>
        </group>
      );
    }

    if (code === 'cyber_visor') {
      return (
        <group position={[0, 0.23, 0.21]}>
          <mesh>
            <boxGeometry args={[0.36, 0.06, 0.03]} />
            <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} transparent opacity={0.85} />
          </mesh>
        </group>
      );
    }
  }

  // TORSO ACCESSORIES
  if (location === 'torso') {
    if (code === 'lifting_belt') {
      return (
        <group position={[0, -0.10, 0]}>
          <mesh>
            <boxGeometry args={[0.46, 0.10, 0.28]} />
            {createVoxelMat('#18181B', 0.7, 0.2, -2)}
          </mesh>
          {/* Steel Lever Latch Buckle */}
          <mesh position={[0, 0, 0.145]}>
            <boxGeometry args={[0.08, 0.06, 0.02]} />
            {createVoxelMat('#E2E8F0', 0.2, 0.9, -3)}
          </mesh>
        </group>
      );
    }

    if (code === 'gold_necklace') {
      return (
        <group position={[0, 0.12, 0.135]}>
          <mesh>
            <boxGeometry args={[0.16, 0.015, 0.015]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Dumbbell Pendant */}
          <mesh position={[0, -0.04, 0.005]}>
            <boxGeometry args={[0.05, 0.025, 0.02]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    }

    if (code === 'tactical_backpack') {
      return (
        <group position={[0, 0, -0.16]}>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.34, 0.14]} />
            {createVoxelMat('#27272A', 0.8, 0.1, -2)}
          </mesh>
          {/* Top Bedroll */}
          <mesh position={[0, 0.20, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.34, 8]} />
            {createVoxelMat('#84CC16', 0.8, 0.05, -2)}
          </mesh>
        </group>
      );
    }
  }

  // ARM ACCESSORIES (Wrist wraps, Smart watch)
  if (location === 'arm' && side === 'left') {
    if (code === 'wrist_wraps') {
      return (
        <group position={[0, -0.32, 0]}>
          <mesh>
            <boxGeometry args={[0.135, 0.06, 0.135]} />
            {createVoxelMat('#FF5722', 0.6, 0.2, -2)}
          </mesh>
        </group>
      );
    }

    if (code === 'smart_watch') {
      return (
        <group position={[0, -0.32, 0]}>
          <mesh>
            <boxGeometry args={[0.135, 0.04, 0.135]} />
            {createVoxelMat('#09090B', 0.4, 0.6, -2)}
          </mesh>
          {/* Biometric Green Glowing Screen */}
          <mesh position={[-0.07, 0, 0]}>
            <boxGeometry args={[0.01, 0.035, 0.035]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.0} />
          </mesh>
        </group>
      );
    }
  }

  return null;
};

// =========================================================================
// 8. SPECIAL EFFECTS RENDERER (Cánh Pixel & Aura - KHÔNG VÒNG ĐẾ)
// =========================================================================
export const SpecialRenderer: React.FC<{ item: AvatarItem | null }> = ({ item }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.y = -0.15 + Math.sin(t * 3.0) * 0.20;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.y = 0.15 - Math.sin(t * 3.0) * 0.20;
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2.0) * 0.02;
    }
  });

  if (!item) return null;
  const code = item.itemCode;

  if (code === 'angel_wings') {
    return (
      <group ref={groupRef} position={[0, 0.28, -0.18]}>
        <group ref={leftWingRef} position={[-0.08, 0, 0]}>
          <mesh position={[-0.24, 0.12, 0]}>
            <boxGeometry args={[0.34, 0.24, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FEF08A" emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
        </group>
        <group ref={rightWingRef} position={[0.08, 0, 0]}>
          <mesh position={[0.24, 0.12, 0]}>
            <boxGeometry args={[0.34, 0.24, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FEF08A" emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
        </group>
      </group>
    );
  }

  if (code === 'shadow_wings') {
    return (
      <group ref={groupRef} position={[0, 0.28, -0.18]}>
        <group ref={leftWingRef} position={[-0.08, 0, 0]}>
          <mesh position={[-0.28, 0.14, 0]}>
            <boxGeometry args={[0.38, 0.28, 0.02]} />
            <meshStandardMaterial color="#4C1D95" emissive="#A855F7" emissiveIntensity={0.7} roughness={0.2} />
          </mesh>
        </group>
        <group ref={rightWingRef} position={[0.08, 0, 0]}>
          <mesh position={[0.28, 0.14, 0]}>
            <boxGeometry args={[0.38, 0.28, 0.02]} />
            <meshStandardMaterial color="#4C1D95" emissive="#A855F7" emissiveIntensity={0.7} roughness={0.2} />
          </mesh>
        </group>
      </group>
    );
  }

  if (code === 'sparkles_aura' || code === 'solar_flame_aura') {
    return (
      <group ref={groupRef} position={[0, 0.20, 0]}>
        {[-0.32, -0.18, 0.18, 0.32].map((x, i) => (
          <mesh key={i} position={[x, (i % 2) * 0.25 - 0.10, ((i % 3) - 1) * 0.15]}>
            <boxGeometry args={[0.035, 0.035, 0.035]} />
            <meshStandardMaterial
              color={code === 'solar_flame_aura' ? '#F59E0B' : '#38BDF8'}
              emissive={code === 'solar_flame_aura' ? '#EF4444' : '#FBBF24'}
              emissiveIntensity={1.0}
            />
          </mesh>
        ))}
      </group>
    );
  }

  return null;
};

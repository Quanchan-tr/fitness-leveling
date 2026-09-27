'use strict';
'use client';

import React, { Suspense } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

interface CityBackgroundProps {
  position?: [number, number, number];
}

// Background Image Plane loading the generated panoramic skyline from public/images/window_skyline.jpg
const SkylineImagePlane: React.FC = () => {
  const texture = useTexture('/images/window_skyline.jpg');
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return (
    <group position={[0, 0.45, -0.6]}>
      {/* High-Definition Panoramic City Skyline Backdrop */}
      <mesh>
        <planeGeometry args={[11.5, 6.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

// Procedural Fallback while image texture loads
const ProceduralSkylineFallback: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Daylight Sky */}
      <mesh position={[0, 1.8, -4.5]}>
        <planeGeometry args={[20, 14]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
      {/* Glowing Sun */}
      <mesh position={[2.4, 2.6, -4.2]}>
        <boxGeometry args={[1.3, 1.3, 0.05]} />
        <meshBasicMaterial color="#FEF08A" />
      </mesh>
    </group>
  );
};

export const CityBackground: React.FC<CityBackgroundProps> = ({
  position = [0, 1.7, -4.8],
}) => {
  return (
    <group position={position}>
      <Suspense fallback={<ProceduralSkylineFallback />}>
        <SkylineImagePlane />
      </Suspense>
    </group>
  );
};

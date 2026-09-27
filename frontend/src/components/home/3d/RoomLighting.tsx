'use strict';
'use client';

import React from 'react';

export const RoomLighting: React.FC = () => {
  return (
    <>
      {/* Warm Ambient Room Light (Softer, realistic shadow contrast) */}
      <ambientLight intensity={0.82} color="#FFF5EA" />

      {/* Natural Warm Sunlight coming directly through the window */}
      <directionalLight
        position={[0.2, 4.4, -4.5]}
        intensity={1.15}
        color="#FFF8E7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-bias={-0.0002}
        shadow-radius={3.5}
      />

      {/* Front Soft Fill Light to illuminate front room details */}
      <directionalLight
        position={[0, 3.2, 5.2]}
        target-position={[0, 1.0, 0]}
        intensity={0.42}
        color="#FFF8F0"
      />

      {/* 4 Recessed Ceiling Warm Spotlights */}
      {/* Front Left */}
      <pointLight
        position={[-1.6, 3.25, 0.8]}
        intensity={0.5}
        color="#FFE8C6"
        distance={5.5}
        decay={2}
      />
      {/* Front Right */}
      <pointLight
        position={[1.6, 3.25, 0.8]}
        intensity={0.5}
        color="#FFE8C6"
        distance={5.5}
        decay={2}
      />
      {/* Back Left */}
      <pointLight
        position={[-1.6, 3.25, -2.0]}
        intensity={0.45}
        color="#FFE8C6"
        distance={5.5}
        decay={2}
      />
      {/* Back Right */}
      <pointLight
        position={[1.6, 3.25, -2.0]}
        intensity={0.45}
        color="#FFE8C6"
        distance={5.5}
        decay={2}
      />

      {/* Gaming Desk Soft Warm Task Light */}
      <pointLight
        position={[1.72, 1.25, -2.65]}
        intensity={0.42}
        color="#FFF4E0"
        distance={2.0}
        decay={2}
      />
    </>
  );
};

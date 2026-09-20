'use strict';
'use client';

import React from 'react';

export const RoomLighting: React.FC = () => {
  return (
    <>
      {/* Soft warm ambient light */}
      <ambientLight intensity={0.8} color="#FFF5EA" />

      {/* Primary directional sun/window light casting soft shadows */}
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.2}
        color="#FFF9E6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Secondary fill light for contrasting room corners */}
      <directionalLight position={[-4, 5, -3]} intensity={0.4} color="#DCEBFF" />

      {/* Subtle point light near the desk / album area */}
      <pointLight position={[2, 2.5, -2]} intensity={0.3} color="#FFE6B3" distance={5} />
    </>
  );
};

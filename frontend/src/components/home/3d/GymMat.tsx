'use strict';
'use client';

import React from 'react';

export const GymMat: React.FC = () => {
  return (
    <group position={[-0.4, 0.01, 0.5]} rotation={[0, 0.25, 0]}>
      {/* Rubber Exercise Mat */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2.4, 0.02, 1.2]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.9} />
      </mesh>
      {/* Grip Lines on Mat */}
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[2.2, 0.002, 0.04]} />
        <meshStandardMaterial color="#E8E1D5" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.012, 0.3]}>
        <boxGeometry args={[2.2, 0.002, 0.04]} />
        <meshStandardMaterial color="#E8E1D5" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.012, -0.3]}>
        <boxGeometry args={[2.2, 0.002, 0.04]} />
        <meshStandardMaterial color="#E8E1D5" roughness={0.9} />
      </mesh>
    </group>
  );
};

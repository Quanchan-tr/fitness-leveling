'use strict';
'use client';

import React from 'react';

export const BedArea: React.FC = () => {
  return (
    <group position={[-2.1, 0, -1.8]}>
      {/* Wooden Bed Platform Frame */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.38, 2.2]} />
        <meshStandardMaterial color="#5C3F2B" roughness={0.65} />
      </mesh>

      {/* Headboard against back wall */}
      <mesh position={[0, 0.65, -1.05]} castShadow>
        <boxGeometry args={[1.7, 0.75, 0.1]} />
        <meshStandardMaterial color="#4E3321" roughness={0.65} />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.44, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.56, 0.22, 2.05]} />
        <meshStandardMaterial color="#30343C" roughness={0.8} />
      </mesh>

      {/* 2 White Pillows */}
      <mesh position={[-0.38, 0.58, -0.7]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.36]} />
        <meshStandardMaterial color="#F5EFE6" roughness={0.9} />
      </mesh>
      <mesh position={[0.38, 0.58, -0.7]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.36]} />
        <meshStandardMaterial color="#F5EFE6" roughness={0.9} />
      </mesh>

      {/* Red / Terracotta Accent Rug in Front of Bed */}
      <mesh position={[0, 0.003, 1.45]} receiveShadow>
        <boxGeometry args={[1.5, 0.005, 0.7]} />
        <meshStandardMaterial color="#C23E2E" roughness={0.95} />
      </mesh>
    </group>
  );
};

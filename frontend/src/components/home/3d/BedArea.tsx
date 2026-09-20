'use strict';
'use client';

import React from 'react';

export const BedArea: React.FC = () => {
  return (
    <group position={[1.4, 0, 1.8]}>
      {/* Wooden Bed Frame */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.35, 2.2]} />
        <meshStandardMaterial color="#76583E" roughness={0.6} />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, 0.6, 1.05]} castShadow>
        <boxGeometry args={[1.8, 0.7, 0.1]} />
        <meshStandardMaterial color="#76583E" roughness={0.6} />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.45, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.25, 2.0]} />
        <meshStandardMaterial color="#F7F3EA" roughness={0.8} />
      </mesh>

      {/* Duvet / Blanket */}
      <mesh position={[0, 0.52, -0.25]} castShadow receiveShadow>
        <boxGeometry args={[1.68, 0.15, 1.4]} />
        <meshStandardMaterial color="#303238" roughness={0.7} />
      </mesh>

      {/* Pillows */}
      <mesh position={[-0.4, 0.6, 0.7]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.12, 0.4]} />
        <meshStandardMaterial color="#E8E1D5" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.6, 0.7]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.12, 0.4]} />
        <meshStandardMaterial color="#E8E1D5" roughness={0.9} />
      </mesh>
    </group>
  );
};

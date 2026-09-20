'use strict';
'use client';

import React from 'react';

export const RoomStructure: React.FC = () => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[7, 0.2, 7]} />
        <meshStandardMaterial color="#B9A78E" roughness={0.6} />
      </mesh>

      {/* Back Left Wall (facing +X) */}
      <mesh position={[-3.4, 1.9, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4, 7]} />
        <meshStandardMaterial color="#E8E1D5" roughness={0.7} />
      </mesh>

      {/* Back Right Wall (facing +Z) */}
      <mesh position={[0, 1.9, -3.4]} receiveShadow>
        <boxGeometry args={[7, 4, 0.2]} />
        <meshStandardMaterial color="#E8E1D5" roughness={0.7} />
      </mesh>

      {/* Wooden Baseboards */}
      <mesh position={[-3.29, 0.1, 0]}>
        <boxGeometry args={[0.04, 0.2, 6.8]} />
        <meshStandardMaterial color="#76583E" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, -3.29]}>
        <boxGeometry args={[6.8, 0.2, 0.04]} />
        <meshStandardMaterial color="#76583E" roughness={0.5} />
      </mesh>

      {/* Motivational Poster on Back Wall */}
      <group position={[-1.2, 2.3, -3.28]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[1.2, 1.5, 0.03]} />
          <meshStandardMaterial color="#303238" roughness={0.4} />
        </mesh>
        {/* Poster Paper */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.1, 1.4, 0.01]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.9} />
        </mesh>
        {/* Poster Graphic Bar */}
        <mesh position={[0, 0.2, 0.03]}>
          <boxGeometry args={[0.7, 0.15, 0.01]} />
          <meshStandardMaterial color="#FF6B35" />
        </mesh>
        <mesh position={[0, -0.1, 0.03]}>
          <boxGeometry args={[0.8, 0.08, 0.01]} />
          <meshStandardMaterial color="#7FB069" />
        </mesh>
      </group>

      {/* Wall Shelf (holding decor) */}
      <group position={[-3.28, 2.5, 1.2]}>
        <mesh>
          <boxGeometry args={[0.04, 0.06, 1.8]} />
          <meshStandardMaterial color="#76583E" roughness={0.5} />
        </mesh>
        {/* Plant Pot on Shelf */}
        <mesh position={[0.1, 0.15, -0.5]} castShadow>
          <cylinderGeometry args={[0.1, 0.07, 0.2, 12]} />
          <meshStandardMaterial color="#E8E1D5" />
        </mesh>
        {/* Plant Foliage */}
        <mesh position={[0.1, 0.32, -0.5]} castShadow>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#7FB069" roughness={0.8} />
        </mesh>
      </group>

      {/* Water Bottle on Floor Corner */}
      <group position={[-2.8, 0.25, 2.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 12]} />
          <meshStandardMaterial color="#4D96FF" roughness={0.3} metalness={0.2} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.23, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
          <meshStandardMaterial color="#303238" />
        </mesh>
      </group>
    </group>
  );
};

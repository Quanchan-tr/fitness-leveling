'use strict';
'use client';

import React from 'react';

export const WeightRack: React.FC = () => {
  return (
    <group position={[-2.4, 0, 1.2]} rotation={[0, Math.PI / 2, 0]}>
      {/* Rack Metal Stand */}
      <mesh position={[-0.6, 0.45, 0]} castShadow>
        <boxGeometry args={[0.06, 0.9, 0.4]} />
        <meshStandardMaterial color="#303238" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.6, 0.45, 0]} castShadow>
        <boxGeometry args={[0.06, 0.9, 0.4]} />
        <meshStandardMaterial color="#303238" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.3, 0.06, 0.4]} />
        <meshStandardMaterial color="#303238" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Top Tier Support */}
      <mesh position={[0, 0.8, -0.05]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.2, 0.04, 0.25]} />
        <meshStandardMaterial color="#303238" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Bottom Tier Support */}
      <mesh position={[0, 0.4, 0.05]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.2, 0.04, 0.25]} />
        <meshStandardMaterial color="#303238" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Dumbbells Top Tier */}
      {[-0.35, 0, 0.35].map((x, i) => (
        <group key={`db-top-${i}`} position={[x, 0.85, -0.05]} rotation={[0.2, 0, 0]}>
          {/* Handle */}
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
            <meshStandardMaterial color="#B9A78E" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Left Weight */}
          <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
            <meshStandardMaterial color="#303238" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Right Weight */}
          <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
            <meshStandardMaterial color="#303238" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Kettlebell on floor next to rack */}
      <group position={[0.9, 0.2, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#303238" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, 0.16, 0]}>
          <torusGeometry args={[0.09, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#303238" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

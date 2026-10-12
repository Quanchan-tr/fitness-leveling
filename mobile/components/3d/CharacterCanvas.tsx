import React, { Suspense, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { Character, CharacterOutfit } from './Character';

interface CharacterCanvasProps {
  level?: number;
  outfit?: CharacterOutfit;
  autoRotate?: boolean;
}

function Scene({
  level = 17,
  outfit,
  rotationY,
}: {
  level?: number;
  outfit?: CharacterOutfit;
  rotationY: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = -0.74 + Math.sin(t * 1.8) * 0.012;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.74, 0]}>
      {/* 3D Training Podium / Pedestal */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.66, 0.72, 0.04, 28]} />
        <meshStandardMaterial color="#0F172A" metalness={0.85} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.62, 0.65, 0.035, 28]} />
        <meshStandardMaterial color="#1E293B" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Neon Disc */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.005, 28]} />
        <meshStandardMaterial
          color="#2563EB"
          emissive="#2563EB"
          emissiveIntensity={0.65}
          roughness={0.2}
        />
      </mesh>

      {/* Grip Inset */}
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.47, 0.47, 0.004, 28]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Rotating Accent Ring */}
      <group ref={ringRef} position={[0, 0.038, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.485, 0.505, 28]} />
          <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Character */}
      <group position={[0, 0.625, 0]}>
        <Character
          level={level}
          outfit={outfit}
          position={[0, 0, 0]}
          rotation={[0, rotationY, 0]}
        />
      </group>
    </group>
  );
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  level = 17,
  outfit,
  autoRotate = false,
}) => {
  const [rotationY, setRotationY] = useState(0.22);
  const rotationRef = useRef(0.22);
  rotationRef.current = rotationY;

  // Auto-rotation effect
  React.useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationY((prev) => prev + 0.02);
    }, 32);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Touch gesture for 360-degree drag rotation
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        setRotationY(rotationRef.current + gestureState.dx * 0.015);
      },
    })
  ).current;

  return (
    <View style={s.container} {...panResponder.panHandlers}>
      <Canvas
        camera={{ position: [0, 0.28, 2.75], fov: 40, near: 0.1, far: 20 }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={1.15} color="#FFFFFF" />
        <directionalLight position={[2.5, 4.2, 3.2]} intensity={1.5} color="#FFF8F0" />
        <directionalLight position={[-2.8, 2.6, 2.2]} intensity={0.65} color="#E0F2FE" />
        <directionalLight position={[0, 3.4, -3.0]} intensity={1.8} color="#93C5FD" />
        <pointLight position={[0, -0.45, 0.8]} intensity={0.9} color="#2563EB" distance={3.5} />

        <Suspense fallback={null}>
          <Scene level={level} outfit={outfit} rotationY={rotationY} />
        </Suspense>
      </Canvas>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
  },
});

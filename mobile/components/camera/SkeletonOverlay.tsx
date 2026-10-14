import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

const BONE_CONNECTIONS = [
  ['11', '12'], // shoulders
  ['11', '13'], // left arm
  ['13', '15'],
  ['12', '14'], // right arm
  ['14', '16'],
  ['11', '23'], // left torso
  ['12', '24'], // right torso
  ['23', '24'], // hips
  ['23', '25'], // left leg
  ['25', '27'],
  ['24', '26'], // right leg
  ['26', '28'],
];

interface SkeletonOverlayProps {
  keypoints: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
  isFrontCamera?: boolean;
}

export const SkeletonOverlay: React.FC<SkeletonOverlayProps> = ({
  keypoints,
  width,
  height,
  isFrontCamera = true,
}) => {
  if (!keypoints || Object.keys(keypoints).length === 0 || width <= 0 || height <= 0) {
    return null;
  }

  // Helper to map normalized (0..1) coords to pixels, with optional horizontal mirror for selfie camera
  const getCoords = (idx: string) => {
    const pt = keypoints[idx];
    if (!pt) return null;
    const x = isFrontCamera ? (1.0 - pt.x) * width : pt.x * width;
    const y = pt.y * height;
    return { x, y };
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Draw Bones */}
        {BONE_CONNECTIONS.map(([p1, p2]) => {
          const c1 = getCoords(p1);
          const c2 = getCoords(p2);
          if (!c1 || !c2) return null;
          return (
            <Line
              key={`${p1}-${p2}`}
              x1={c1.x}
              y1={c1.y}
              x2={c2.x}
              y2={c2.y}
              stroke="#38BDF8"
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}

        {/* Draw Joint Points */}
        {Object.keys(keypoints).map((idx) => {
          const c = getCoords(idx);
          if (!c) return null;
          return (
            <Circle
              key={idx}
              cx={c.x}
              cy={c.y}
              r="6"
              fill="#FFFFFF"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
          );
        })}
      </Svg>
    </View>
  );
};

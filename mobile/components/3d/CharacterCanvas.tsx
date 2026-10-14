import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { CharacterOutfit } from './Character';

interface CharacterCanvasProps {
  level?: number;
  outfit?: CharacterOutfit;
  autoRotate?: boolean;
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  level = 17,
  outfit = {},
  autoRotate = false,
}) => {
  const [rotation, setRotation] = useState(0.2); // Angle in radians (-PI to PI)
  const rotationRef = useRef(0.2);
  rotationRef.current = rotation;

  // Breathing animation value (0 -> 1 -> 0)
  const breathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathAnim]);

  // Auto-rotation when toggled on
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.04) % (Math.PI * 2));
    }, 32);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Interactive 360-degree touch drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        setRotation(rotationRef.current + gestureState.dx * 0.02);
      },
    })
  ).current;

  // Palette customization
  const shirt = outfit.shirtColor || '#2563EB';
  const headband = outfit.headbandColor || shirt;
  const wristband = outfit.wristbandColor || shirt;
  const shorts = outfit.shortsColor || '#1E293B';
  const shoes = outfit.shoesColor || '#0F172A';

  // Level scaling: upper body muscle mass expands subtly with level
  const muscleScale = Math.min(1.22, 1.0 + (level - 1) * 0.009);

  // Rotation projection calculations (-1 to 1)
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const isFacingFront = cosR >= 0;
  const eyeOffset = sinR * 7;
  const chestShift = sinR * 4;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg width="100%" height="100%" viewBox="0 0 320 320">
        <Defs>
          {/* Pedestal Metallic Gradient */}
          <LinearGradient id="pedestalBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#0B0F19" />
          </LinearGradient>

          {/* Neon Ring Glow */}
          <RadialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <Stop offset="70%" stopColor="#2563EB" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
          </RadialGradient>

          {/* Aura Gradient scaling with level */}
          <RadialGradient id="levelAura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={shirt} stopOpacity="0.45" />
            <Stop offset="80%" stopColor="#3B82F6" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Skin Gradient */}
          <LinearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FBD5B5" />
            <Stop offset="100%" stopColor="#E2A679" />
          </LinearGradient>

          {/* Muscle Shadow */}
          <LinearGradient id="muscleShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#D98A53" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#B46330" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* ================= BACKGROUND / STAGE ================= */}
        {/* Level Aura Pulse */}
        <Ellipse
          cx="160"
          cy="200"
          rx={80 * muscleScale}
          ry={105 * muscleScale}
          fill="url(#levelAura)"
        />

        {/* 3D Training Pedestal (Layer 1 - Drop Shadow) */}
        <Ellipse cx="160" cy="285" rx="100" ry="24" fill="#030712" opacity="0.6" />

        {/* 3D Pedestal Cylinder Height */}
        <Path
          d="M 68 274 C 68 274, 160 292, 252 274 L 252 284 C 252 284, 160 302, 68 284 Z"
          fill="#0F172A"
        />

        {/* 3D Pedestal Top Rim */}
        <Ellipse cx="160" cy="274" rx="92" ry="20" fill="url(#pedestalBase)" stroke="#334155" strokeWidth="2" />

        {/* Glowing Neon Disc Inside Pedestal */}
        <Ellipse cx="160" cy="274" rx="76" ry="16" fill="url(#neonGlow)" />
        <Ellipse
          cx="160"
          cy="274"
          rx="72"
          ry="15"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="1.5"
          strokeDasharray="16,8"
        />

        {/* ================= 3D ATHLETIC CHARACTER ================= */}
        <G transform={`translate(${160 + chestShift * 0.5}, 48)`}>
          {/* --- LEGS & SNEAKERS --- */}
          {/* Left Leg */}
          <Rect x="-28" y="160" width="18" height="58" rx="8" fill="url(#skinGrad)" />
          {/* Right Leg */}
          <Rect x="10" y="160" width="18" height="58" rx="8" fill="url(#skinGrad)" />

          {/* High-top Sneakers */}
          <G transform="translate(-32, 212)">
            <Rect x="0" y="0" width="26" height="18" rx="6" fill={shoes} />
            <Rect x="-2" y="12" width="30" height="7" rx="3.5" fill="#F8FAFC" />
            <Rect x="5" y="4" width="16" height="3" rx="1.5" fill="#38BDF8" />
          </G>
          <G transform="translate(6, 212)">
            <Rect x="0" y="0" width="26" height="18" rx="6" fill={shoes} />
            <Rect x="-2" y="12" width="30" height="7" rx="3.5" fill="#F8FAFC" />
            <Rect x="5" y="4" width="16" height="3" rx="1.5" fill="#38BDF8" />
          </G>

          {/* Athletic Training Shorts */}
          <Path
            d="M -35 125 L 35 125 L 32 166 L 4 166 L 0 142 L -4 166 L -32 166 Z"
            fill={shorts}
          />
          {/* Shorts Waistband & Accent Stripes */}
          <Rect x="-35" y="123" width="70" height="7" rx="3.5" fill="#0F172A" />
          <Rect x="-30" y="129" width="3" height="32" rx="1.5" fill="#F8FAFC" opacity="0.6" />
          <Rect x="27" y="129" width="3" height="32" rx="1.5" fill="#F8FAFC" opacity="0.6" />

          {/* --- MUSCULAR UPPER BODY (Scales with Level & Breathes) --- */}
          <G transform={`scale(${muscleScale}, ${muscleScale})`}>
            {/* Athletic Tank Top / Shirt */}
            <Path
              d={`M -30 65 L 30 65 L 24 125 L -24 125 Z`}
              fill={shirt}
            />

            {/* Shirt Shading & Contours */}
            <Path
              d="M -14 74 C -14 74, 0 88, 14 74 L 10 125 L -10 125 Z"
              fill="#000000"
              opacity="0.14"
            />
            {/* Athletic Racing Stripe */}
            <Rect x={-2 + chestShift} y="68" width="4" height="54" rx="2" fill="#FFFFFF" opacity="0.45" />

            {/* Muscular Shoulders (Deltoids) */}
            <Circle cx="-34" cy="68" r="14" fill="url(#skinGrad)" />
            <Circle cx="34" cy="68" r="14" fill="url(#skinGrad)" />

            {/* Left Arm & Bicep */}
            <Rect x="-44" y="66" width="16" height="52" rx="8" fill="url(#skinGrad)" />
            {/* Right Arm & Bicep */}
            <Rect x="28" y="66" width="16" height="52" rx="8" fill="url(#skinGrad)" />

            {/* Wristbands */}
            <Rect x="-44" y="102" width="16" height="10" rx="3" fill={wristband} />
            <Rect x="28" y="102" width="16" height="10" rx="3" fill={wristband} />

            {/* Hands / Fists */}
            <Circle cx="-36" cy="122" r="7.5" fill="url(#skinGrad)" />
            <Circle cx="36" cy="122" r="7.5" fill="url(#skinGrad)" />

            {/* Muscular Neck & Trapezius */}
            <Path d="M -13 46 L 13 46 L 15 65 L -15 65 Z" fill="url(#skinGrad)" />
          </G>

          {/* --- HEAD & FACE --- */}
          <G transform={`translate(${chestShift * 0.7}, 0)`}>
            {/* Jaw / Face Shape */}
            <Path
              d="M -18 20 C -18 8, 18 8, 18 20 C 18 36, 10 46, 0 49 C -10 46, -18 36, -18 20 Z"
              fill="url(#skinGrad)"
            />

            {/* Headband */}
            <Rect x="-20" y="14" width="40" height="9" rx="3" fill={headband} />
            <Rect x="-18" y="16" width="36" height="2" rx="1" fill="#FFFFFF" opacity="0.4" />

            {/* Stylized Athletic Hair */}
            <Path
              d="M -20 15 C -22 -6, 22 -6, 20 15 C 16 7, 6 5, 0 7 C -6 5, -16 7, -20 15 Z"
              fill="#1E293B"
            />
            {/* Hair highlight */}
            <Path
              d="M -12 4 C -6 -2, 6 -2, 12 4 C 5 2, -5 2, -12 4 Z"
              fill="#475569"
            />

            {/* Ears */}
            <Circle cx="-20" cy="26" r="4.5" fill="url(#skinGrad)" />
            <Circle cx="20" cy="26" r="4.5" fill="url(#skinGrad)" />

            {/* Face Features (Only render when facing front) */}
            {isFacingFront && (
              <G transform={`translate(${eyeOffset}, 0)`}>
                {/* Athletic Focused Eyebrows */}
                <Path d="M -13 22 L -4 24" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
                <Path d="M 4 24 L 13 22" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />

                {/* Eyes */}
                <Circle cx="-8" cy="27" r="2.2" fill="#0F172A" />
                <Circle cx="8" cy="27" r="2.2" fill="#0F172A" />
                {/* Eye Sparkle */}
                <Circle cx="-7.3" cy="26.3" r="0.8" fill="#FFFFFF" />
                <Circle cx="8.7" cy="26.3" r="0.8" fill="#FFFFFF" />

                {/* Nose */}
                <Path d="M 0 28 L -1.5 34 L 1.5 34 Z" fill="#D98A53" opacity="0.6" />

                {/* Confident Smile */}
                <Path
                  d="M -5 39 Q 0 43 5 39"
                  stroke="#A8572A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            )}
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

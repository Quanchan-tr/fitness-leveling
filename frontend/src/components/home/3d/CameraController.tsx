'use strict';
'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type CameraMode = 'normal' | 'zooming_in' | 'focused' | 'zooming_out';

interface CameraControllerProps {
  mode: CameraMode;
  onTransitionEnd?: (targetMode: CameraMode) => void;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  mode,
  onTransitionEnd,
}) => {
  const { camera } = useThree();

  // Wide 1-point perspective camera viewpoints (Eye-level framing with cropped ceiling)
  const normalPos = useRef(new THREE.Vector3(0, 1.62, 4.85));
  const normalTarget = useRef(new THREE.Vector3(0, 1.32, -3.8));

  // Focused viewpoint: calculated relative to back wall area
  const focusedPos = useRef(new THREE.Vector3(0, 1.65, 0.5));
  const focusedTarget = useRef(new THREE.Vector3(0, 1.5, -3.8));

  // Current interpolated lookAt target
  const currentTarget = useRef(new THREE.Vector3(0, 1.7, -3.8));

  // Track progress of transition
  const progressRef = useRef(mode === 'focused' ? 1 : 0);
  const targetProgressRef = useRef(mode === 'focused' ? 1 : 0);

  useEffect(() => {
    if (mode === 'zooming_in' || mode === 'focused') {
      targetProgressRef.current = 1;
    } else if (mode === 'zooming_out' || mode === 'normal') {
      targetProgressRef.current = 0;
    }
  }, [mode]);

  useFrame((_, delta) => {
    const speed = Math.min(delta * 4.0, 0.15);
    const prev = progressRef.current;
    const target = targetProgressRef.current;

    if (Math.abs(target - prev) > 0.001) {
      progressRef.current += (target - prev) * speed;

      // Smooth cubic ease factor
      const t = progressRef.current;
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Interpolate camera position
      camera.position.lerpVectors(normalPos.current, focusedPos.current, easeT);

      // Interpolate lookAt target
      currentTarget.current.lerpVectors(normalTarget.current, focusedTarget.current, easeT);
      camera.lookAt(currentTarget.current);
    } else {
      if (progressRef.current !== target) {
        progressRef.current = target;
        const finalT = target;
        camera.position.lerpVectors(normalPos.current, focusedPos.current, finalT);
        currentTarget.current.lerpVectors(normalTarget.current, focusedTarget.current, finalT);
        camera.lookAt(currentTarget.current);

        if (target === 1 && onTransitionEnd) {
          onTransitionEnd('focused');
        } else if (target === 0 && onTransitionEnd) {
          onTransitionEnd('normal');
        }
      }
    }
  });

  return null;
};

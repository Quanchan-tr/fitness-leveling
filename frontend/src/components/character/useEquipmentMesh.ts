'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

interface UseEquipmentMeshResult {
  scene: THREE.Object3D | null;
  hasGlb: boolean;
  isLoading: boolean;
}

const glbCache = new Map<string, THREE.Object3D>();
const failedUrls = new Set<string>();

/**
 * Safely loads external GLB modular mesh if available;
 * Falls back immediately if missing so procedural voxel geometry renders seamlessly.
 */
export function useEquipmentMesh(url?: string): UseEquipmentMeshResult {
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [hasGlb, setHasGlb] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url || failedUrls.has(url)) {
      setScene(null);
      setHasGlb(false);
      setIsLoading(false);
      return;
    }

    if (glbCache.has(url)) {
      const cached = glbCache.get(url)!;
      const clone = SkeletonUtils.clone(cached);
      setScene(clone);
      setHasGlb(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (!isMounted) return;
        // Optimize textures for pixel art
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as any;
              if (mat.map) {
                mat.map.magFilter = THREE.NearestFilter;
                mat.map.minFilter = THREE.NearestMipmapLinearFilter;
                mat.map.needsUpdate = true;
              }
            }
          }
        });

        glbCache.set(url, gltf.scene);
        const clone = SkeletonUtils.clone(gltf.scene);
        setScene(clone);
        setHasGlb(true);
        setIsLoading(false);
      },
      undefined,
      () => {
        // Mark failed to avoid repeated 404 network spam
        failedUrls.add(url);
        if (isMounted) {
          setScene(null);
          setHasGlb(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { scene, hasGlb, isLoading };
}


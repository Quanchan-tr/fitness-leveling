'use client';

import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates ultra-crisp, high-definition 256x256 pixel-art face texture matching
 * the reference stylized RPG hero image:
 * - Expressive, large anime eyes with vibrant sky-blue/cyan irises
 * - Dual catchlight glints (white sparkles)
 * - Defined upper lash line and confident eyebrows
 * - Flushed cheek blush pixels
 * - Warm smiling mouth line
 * - Sharp pixel filtering (THREE.NearestFilter)
 */
export function getVoxelFaceTexture(gender: 'male' | 'female'): THREE.CanvasTexture {
  if (textureCache.has(gender)) {
    return textureCache.get(gender)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.imageSmoothingEnabled = false;

    if (gender === 'male') {
      // 1. BASE SKIN TONE (Warm stylized RPG hero peach)
      ctx.fillStyle = '#F5C8A8';
      ctx.fillRect(0, 0, 256, 256);

      // Subtle jawline and cheek pixel contour shading
      ctx.fillStyle = '#EBB590';
      ctx.fillRect(0, 208, 256, 48);
      ctx.fillRect(0, 0, 16, 256);
      ctx.fillRect(240, 0, 16, 256);

      // Forehead ambient hair shadow
      ctx.fillStyle = '#EBB590';
      ctx.fillRect(16, 0, 224, 28);

      // 2. THICK STYLIZED BROWN EYEBROWS (Confident athletic angle)
      ctx.fillStyle = '#3F1F08';
      // Left Eyebrow (slight downward confident slant)
      ctx.fillRect(32, 64, 76, 16);
      ctx.fillRect(24, 70, 14, 12);
      ctx.fillRect(96, 60, 14, 12);
      ctx.fillStyle = '#5A2E12';
      ctx.fillRect(36, 66, 68, 6);

      // Right Eyebrow
      ctx.fillStyle = '#3F1F08';
      ctx.fillRect(148, 64, 76, 16);
      ctx.fillRect(218, 70, 14, 12);
      ctx.fillRect(146, 60, 14, 12);
      ctx.fillStyle = '#5A2E12';
      ctx.fillRect(152, 66, 68, 6);

      // 3. EYES (Exact match to reference RPG hero: wide expressive anime eyes)
      // Left Eye: x=38..102, y=92..152
      // Right Eye: x=154..218, y=92..152

      // Thick dark upper lash frame
      ctx.fillStyle = '#09090B';
      ctx.fillRect(34, 88, 72, 10);
      ctx.fillRect(150, 88, 72, 10);
      ctx.fillRect(30, 94, 8, 12);
      ctx.fillRect(218, 94, 8, 12);

      // Pure White Sclera
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(36, 96, 68, 54);
      ctx.fillRect(152, 96, 68, 54);

      // Sclera top ambient shadow
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(36, 96, 68, 8);
      ctx.fillRect(152, 96, 68, 8);

      // Vibrant Sky Blue / Cyan Multi-tone Iris
      // Deep blue outer ring
      ctx.fillStyle = '#0369A1';
      ctx.fillRect(44, 96, 48, 54);
      ctx.fillRect(160, 96, 48, 54);

      // Bright Cyan / Sky Blue Inner Iris
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(48, 100, 40, 46);
      ctx.fillRect(164, 100, 40, 46);

      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(52, 108, 32, 34);
      ctx.fillRect(168, 108, 32, 34);

      // Deep Black Pupil
      ctx.fillStyle = '#09090B';
      ctx.fillRect(60, 112, 18, 26);
      ctx.fillRect(176, 112, 18, 26);

      // Large Sparkling White Catchlight (top-left)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(48, 98, 18, 18);
      ctx.fillRect(164, 98, 18, 18);

      // Secondary Small Sparkle Catchlight (bottom-right)
      ctx.fillRect(78, 134, 8, 8);
      ctx.fillRect(194, 134, 8, 8);

      // Lower Eye Rim & Warm Shadow
      ctx.fillStyle = '#D69B73';
      ctx.fillRect(36, 150, 68, 6);
      ctx.fillRect(152, 150, 68, 6);

      // 4. CHEEKS (Sun-kissed athletic blush pixels)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.fillRect(24, 156, 44, 18);
      ctx.fillRect(188, 156, 44, 18);

      // 5. NOSE PIXEL SHADING (Bridge & nostril base)
      ctx.fillStyle = '#D69B73';
      ctx.fillRect(122, 156, 12, 18);
      ctx.fillStyle = '#BA7548';
      ctx.fillRect(116, 172, 24, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(124, 146, 8, 12); // Bridge highlight

      // 6. MOUTH & SMILE (Confident friendly hero smile)
      ctx.fillStyle = '#831843';
      ctx.fillRect(100, 198, 56, 8);
      ctx.fillRect(94, 194, 8, 6); // Left corner upturn
      ctx.fillRect(154, 194, 8, 6); // Right corner upturn

      ctx.fillStyle = '#C8785E';
      ctx.fillRect(106, 206, 44, 6); // Lower lip warm tone
    } else {
      // ==================== FEMALE HEROINE FACE ====================
      // 1. BASE SKIN TONE (Porcelain radiant peach)
      ctx.fillStyle = '#FCE3D2';
      ctx.fillRect(0, 0, 256, 256);

      // Ambient contouring
      ctx.fillStyle = '#F5CFB8';
      ctx.fillRect(0, 214, 256, 42);
      ctx.fillRect(0, 0, 12, 256);
      ctx.fillRect(244, 0, 12, 256);

      // 2. SOFT ROSY BLUSH CHEEKS
      ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
      ctx.fillRect(20, 148, 52, 24);
      ctx.fillRect(184, 148, 52, 24);

      // 3. ELEGANT ARCHED EYEBROWS
      ctx.fillStyle = '#451A03';
      ctx.fillRect(36, 68, 68, 12);
      ctx.fillRect(30, 74, 10, 10);
      ctx.fillRect(98, 64, 12, 10);

      ctx.fillRect(152, 68, 68, 12);
      ctx.fillRect(216, 74, 10, 10);
      ctx.fillRect(146, 64, 12, 10);

      // 4. SPARKLING ANIME EYES WITH EXTENDED WINGED LASHES
      // Left Eye
      ctx.fillStyle = '#09090B';
      ctx.fillRect(34, 86, 72, 12);
      ctx.fillRect(24, 82, 14, 12); // Winged cat-eye lash tip
      ctx.fillRect(102, 88, 8, 10);

      // Right Eye
      ctx.fillRect(150, 86, 72, 12);
      ctx.fillRect(218, 82, 14, 12); // Winged cat-eye lash tip
      ctx.fillRect(146, 88, 8, 10);

      // White Sclera
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(38, 96, 64, 54);
      ctx.fillRect(154, 96, 64, 54);

      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(38, 96, 64, 8);
      ctx.fillRect(154, 96, 64, 8);

      // Radiant Multi-tone Sapphire/Cyan Iris
      ctx.fillStyle = '#0369A1';
      ctx.fillRect(44, 96, 48, 54);
      ctx.fillRect(160, 96, 48, 54);

      ctx.fillStyle = '#0284C7';
      ctx.fillRect(48, 98, 42, 48);
      ctx.fillRect(164, 98, 42, 48);

      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(52, 106, 34, 36);
      ctx.fillRect(168, 106, 34, 36);

      // Black Pupil
      ctx.fillStyle = '#09090B';
      ctx.fillRect(60, 112, 18, 26);
      ctx.fillRect(176, 112, 18, 26);

      // Double Catchlight Highlights
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(48, 98, 20, 20); // Big sparkle
      ctx.fillRect(164, 98, 20, 20);

      ctx.fillRect(80, 132, 8, 8); // Little star sparkle
      ctx.fillRect(196, 132, 8, 8);

      // Lower soft lash line
      ctx.fillStyle = '#BE185D';
      ctx.fillRect(40, 150, 60, 4);
      ctx.fillRect(156, 150, 60, 4);

      // 5. NOSE
      ctx.fillStyle = '#E89E78';
      ctx.fillRect(124, 160, 8, 10);
      ctx.fillRect(120, 170, 16, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(125, 152, 6, 8); // Soft nose highlight

      // 6. DELICATE ROSE-PINK SMILE
      ctx.fillStyle = '#BE123C';
      ctx.fillRect(104, 196, 48, 8);
      ctx.fillRect(98, 192, 8, 6);
      ctx.fillRect(150, 192, 8, 6);

      ctx.fillStyle = '#FB7185';
      ctx.fillRect(110, 204, 36, 6); // Glossy lower lip
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(124, 205, 8, 3); // Lip gloss highlight
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  textureCache.set(gender, texture);

  return texture;
}

# FitTrack AI — 3D Avatar & Modular Wardrobe Blender Pipeline

This document defines the technical standards for creating, rigging, and exporting 3D Modern Voxel character models and modular equipment for FitTrack AI.

---

## 1. Scale, Origin & Coordinate System

- **Units**: Metric (1 Blender Unit = 1 Meter).
- **Character Height**: 1.75m – 1.80m (~5.8 heads tall).
- **Origin (0,0,0)**: Centered between feet on the floor (Z = 0 / Y = 0 depending on axes).
- **Forward Vector**: +Z forward (Three.js standard coordinate system).
- **T-Pose / A-Pose**: Relaxed A-Pose (Arms angled 35° downward, palms facing inward/forward).

---

## 2. Master Armature & Bone Hierarchy

All modular clothing (Tops, Bottoms, Shoes) must bind to the standard Humanoid Armature:

```text
Root
 └── Hips
      ├── Spine
      │    └── Spine1
      │         └── Spine2
      │              ├── Neck
      │              │    └── Head
      │              ├── LeftShoulder
      │              │    └── LeftArm
      │              │         └── LeftForeArm
      │              │              └── LeftHand
      │              └── RightShoulder
      │                   └── RightArm
      │                        └── RightForeArm
      │                             └── RightHand
      ├── LeftUpLeg
      │    └── LeftLeg
      │         └── LeftFoot
      │              └── LeftToeBase
      └── RightUpLeg
           └── RightLeg
                └── RightFoot
                     └── RightToeBase
```

> **Bone Naming Rule**: Keep exact bone names matching Mixamo / standard Three.js humanoid rig. Do not rename bones per garment.

---

## 3. Equipment Slots & Attachment Rules

| Slot | Mesh Type | Attachment Target | Special Handling |
|---|---|---|---|
| `HEADWEAR` | Static Mesh / SkinnedMesh | `Head` bone | Follows head rotation; may toggle `hidesHair` flag. |
| `HAIR` | Static Mesh / SkinnedMesh | `Head` bone | Modular styles; adapts when headwear is equipped. |
| `TOP` | `SkinnedMesh` | Bound to Spine, Spine1, Spine2, Shoulders, Arms | Uses bone skin weights. |
| `BOTTOM` | `SkinnedMesh` | Bound to Hips, UpLegs, Legs | Uses bone skin weights. |
| `SHOES` | `SkinnedMesh` or Static | Bound to Feet / ToeBases | Compatible with ankle and foot bones. |
| `ACCESSORIES` | Static or Skinned | `Head` (glasses), `Hands` (gloves/wraps) | Attached to parent bone. |
| `SPECIAL` | Particle / Mesh | Root node | Floating energy rings, glowing pedestal, or aura. |

---

## 4. Textures & Materials

- **Texture Type**: Pixel-art / Stylized atlas (e.g. 512x512 PNG, 24-bit RGB or 32-bit RGBA).
- **Texture Filtering**: `THREE.NearestFilter` for pixelated voxel charm without blurring.
- **Material**: `MeshStandardMaterial` with `roughness: 0.65`, `metalness: 0.15`.
- **Lighting Response**: Soft matte response, no harsh specular highlights.

---

## 5. Blender glTF 2.0 Export Settings

When exporting `.glb` files from Blender:

1. **Format**: `glTF Binary (.glb)`.
2. **Include**: Selected Objects only.
3. **Transform**:
   - `+Y Up` checked.
4. **Geometry**:
   - `Apply Modifiers`: Checked.
   - `UVs`: Checked.
   - `Normals`: Checked.
   - `Tangents`: Optional (leave off for low poly/voxel).
5. **Armature**:
   - `Export Deformation Bones Only`: Checked.
   - `Add Leaf Bones`: Unchecked.
6. **Animation**:
   - For Base Character: Include single `idle` animation clip (looping, 30fps, 60-90 frames, subtle breathing).
   - For modular equipment: No animation data needed.


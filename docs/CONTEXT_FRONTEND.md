# Session State: FitnessLeveling Frontend (Next.js 14 Web Studio)
*Last Updated: 2026-10-25 00:20*

## 1. Core Objective & Scope
- **Goal:** Modern web studio and 3D fitness leveling dashboard. Delivers gamified workout planning, calorie/macro tracking with a Vietnamese food database, body metrics analytics, AI Coach studio (with client-side MediaPipe edge pose estimation), and an interactive 3D leveling room.
- **Constraints & Environment:**
  - **Framework & Runtime:** Next.js 14.2.24 (App Router), React 18.3.1, TypeScript 5.7.3, Node.js 20+.
  - **Styling & Icons:** Tailwind CSS v3.4.17, Lucide React 0.475, custom design tokens, dark mode with Glassmorphism.
  - **3D Graphics:** Three.js 0.169.0, React Three Fiber (R3F) 8.18, `@react-three/drei` 9.122.
  - **Client Computer Vision:** `@mediapipe/tasks-vision` 1.0.1 (webcam landmark extraction directly in the browser).
  - **Production Deployment:** Multi-stage Docker build (`node:20-alpine`, `deps` -> `builder` -> `runner`) with `output: 'standalone'` running under non-root user `nextjs` on port 3000.

## 2. Key Decisions & Architecture
- **State Management & Live API Client:**
  - Centralized via React Context: `AuthContext.tsx` (Sanctum authentication & profile sync) and `FitnessContext.tsx` (exercises, workout logging, routines, nutrition, metrics, quests, and XP leveling).
  - `src/lib/api.ts`: Unified `apiRequest<T>()` client automatically attaches Bearer tokens from `localStorage` (`fitnessleveling_token`), generates UUID `Idempotency-Key` headers for mutation requests (`POST`, `PUT`, `PATCH`), and raises structured `FitnessLevelingApiException` errors.
  - Authentication (`src/lib/auth.ts`): Direct integration with Laravel `/api/v1/auth/*` endpoints (`/login`, `/register`, `/logout`, `/me`, `PUT /profile`).
- **3D Room & Isometric Canvas Constraints:**
  - Camera is strictly locked to fixed 3/4 isometric perspective (`position={[7.2, 6.2, 7.2]}`, `lookAt([0, 0.9, 0])`).
  - OrbitControls, WASD controls, and free game movement are intentionally disabled to guarantee UI layout stability.
  - Procedural Avatar (`Character.tsx`): Dynamically scales muscular proportions based on user level (`growthFactor`), customizable outfit color tokens, and subtle idle breathing animations.
  - Exactly two interactive 3D objects in the room scene:
    1. **Wall Note**: Opens Body Metrics modal (`BodyMetricsModal.tsx`).
    2. **Progress Photo Album**: Opens Progress Photo Timeline modal (`ProgressPhotoModal.tsx`).
- **Client-Side Edge AI Pose Check:**
  - Uses `@mediapipe/tasks-vision` via `usePoseDetection.ts` for zero-latency camera skeleton overlays and rep counting inside the user's browser.
  - Telemetry is aggregated on the client and submitted to backend endpoint `POST /api/v1/pose-check/realtime/result`.
- **Application Page Structure:**
  - App Router pages: `/` (Landing), `/dashboard` (3D room & widget hub), `/workout` (catalog & routines), `/workout/live` (active tracker), `/nutrition` (macros & meal log), `/metrics` (measurements & BMI), `/ai-coach` (edge pose studio & AI planner), `/community` (social feed), `/auth/*` (login, register, verify, forgot-password), `/onboarding` (initial survey), `/profile`.

## 3. Execution Log (Attempts & Results)
- [x] **[Success]** Initial Web Foundation: Scaffolding of Next.js 14 App Router, Tailwind CSS, Lucide icons, Three.js, and R3F canvas.
- [x] **[Success]** 3D Interactive Room & Character: Built stylized isometric room, procedural avatar with level-based muscular scaling, and modal trigger points.
- [x] **[Success]** Core Feature Modules: Built Workout Builder, Nutrition Tracker with Vietnamese food database, Body Metrics charts, and Community social feed.
- [x] **[Success]** Client-Side Edge Pose Detection: Integrated `@mediapipe/tasks-vision` in `/ai-coach` for live landmark tracking and rep counting.
- [x] **[Success]** Live Backend API Integration (`af5a99e`): Removed mock auth token generator (`mock_token_...`) and linked `auth.ts` and `FitnessContext.tsx` to live Laravel `/api/v1` endpoints.
- [x] **[Success]** Production Dockerfile Hardening (`1e8486d`): Replaced development server (`npm run dev`) with multi-stage standalone runner (`node server.js`) with non-root security isolation.
- [ ] **[Dead End]** Streaming 30fps Video Frames to Backend over HTTP: Caused severe network congestion and browser freezing; pivoted to in-browser edge MediaPipe with summary telemetry reporting.
- [ ] **[Dead End]** Free OrbitControls & WASD Room Navigation: Produced scene clipping and poor touch navigation on mobile web; locked scene to fixed 3/4 isometric perspective.
- [x] **[Pivot]** Shared Types Restoration: Restored `packages/shared/src/types.ts` to maintain type synchronization between Laravel backend models and Next.js TypeScript definitions.

## 4. Current State & Residual Debt
- **Active Working Set:**
  - `frontend/src/app/dashboard/page.tsx`: Primary dashboard hosting 3D room canvas and widget panels.
  - `frontend/src/contexts/FitnessContext.tsx`: Primary state store synchronizing workouts, nutrition, and XP leveling.
  - `frontend/src/lib/auth.ts` & `src/lib/api.ts`: Authentication and API client layer.
  - `frontend/src/components/home/3d/Character.tsx`: 3D avatar and room scene elements.
- **Current Blocker / State:**
  - Compiler Health: PASSED (`npm run type-check` -> 0 errors).
  - Offline Fallback Mock Data: `fitnesslevelingMockData.ts` and `vietnameseFoods.ts` retained as fallback states when offline or during backend downtime.
  - Automated Test Coverage: No unit tests (Vitest/Jest) or E2E tests (Playwright) currently configured in `package.json`.
  - Client-Side Rendering: 3D canvas requires client dynamic import (`ssr: false`) to avoid WebGL hydration mismatches during server rendering.

## 5. Next Steps (For Resuming Session)
1. Set up automated test framework in `frontend/` (Vitest + React Testing Library for components, Playwright for E2E workflows).
2. Connect optional WebSocket fallback to `ws://localhost:8001/ws/pose-stream` for devices lacking client-side WebGL/MediaPipe compute capacity.
3. Implement backend pagination and search queries for the Nutrition and Exercise databases to replace local list filtering.
4. Add Progressive Web App (PWA) manifest and caching service worker for enhanced mobile browser usage.

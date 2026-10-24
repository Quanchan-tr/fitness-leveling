# Session State: FitApp / Fitness Leveling
*Last Updated: 2026-10-25 00:06*

## 1. Core Objective & Scope
- **Goal:** Comprehensive full-stack fitness leveling platform combining gamified workout/nutrition tracking, 3D interactive avatar leveling room, biomechanic AI pose verification (realtime edge & async video), and native mobile client.
- **Constraints & Environment:**
  - **Backend:** PHP 8.3 / Laravel 11.x Monolith REST API (`/api/v1`), Laravel Sanctum 4.0 Bearer tokens, PostgreSQL 16 Alpine (UUID primary keys, `idempotency_keys`), Redis 7.2 Alpine, containerized via PHP-FPM 8.3 + Nginx + Supervisord.
  - **Frontend Web:** Next.js 14.2.24 (App Router, Node.js 20+), React 18.3.1, Tailwind CSS v3.4, Three.js 0.169 + R3F (`@react-three/drei`), client-side `@mediapipe/tasks-vision`. Multi-stage Docker build with standalone output.
  - **Pose Worker:** Python 3.11 (Docker container) / Python 3.14 (Host), FastAPI 0.115, OpenCV headless, MediaPipe Vision (33 landmarks), NumPy, Pydantic v2.
  - **Mobile:** Native Android (Kotlin 1.9+, Java 17, Target SDK 35, Jetpack Navigation 2.8.5, ViewBinding, Material 3).
  - **Shared Storage & Network:** Docker named volume `private_storage` shared internally among backend, queue worker, and pose worker.

## 2. Key Decisions & Architecture
- **API Standards & Idempotency:**
  - All endpoints strictly prefixed `/api/v1`. Uniform response format: `{ "data": ... }` on success, `{ "error": { "code": "...", "message": "...", "details": {...} } }` on failure.
  - `IdempotencyMiddleware.php` validates mutations with header `Idempotency-Key` using composite unique `{user_id}:{idempotency_key}` stored in PostgreSQL.
- **AI Gateway & Pose Pipeline:**
  - 3-Layer Fallback Architecture in `AiOrchestrationService.php`: LLM API -> Local JSON Repair -> Static Expert Plan Templates (`StaticPlanFallback.php`).
  - Edge Realtime Pose: Web client calculates landmarks via `@mediapipe/tasks-vision` and submits telemetry to `POST /api/v1/pose-check/realtime/result`.
  - Async Video Pose: Video uploaded to `private_storage` volume -> `ProcessPoseCheckJob` dispatched to queue -> queue worker calls Python worker `POST /v1/process-video` -> results stored in `pose_check_sessions` and `pose_check_results`.
  - Kinematic Rule Engine: 13 exercise rules (Squat, Pushup, Plank, Lunge, Glute Bridge, Jumping Jack, Mountain Climber, Wall Sit, Bicep Curl, Shoulder Press, Deadlift, Sit-up, Lateral Raise) inheriting `BasePoseRule` / `RepBasedRule` with EMA smoothing, Hysteresis state machines, and camera angle validation.
- **Web 3D Dashboard:** Fixed 3/4 isometric camera (`[7.2, 6.2, 7.2]`), primitive geometries, no game/WASD movement, exactly 2 interactive objects: Wall Note (Body Metrics Modal) and Progress Photo Album (Photo Timeline Modal).
- **Mobile Architecture:** 40 screens mapped from Figma to XML layouts with solid Material icons, Vietnamese localization (`strings.xml`), and Activity-based routing.

## 3. Execution Log (Attempts & Results)
- [x] **[Success]** Full-stack infrastructure & Docker orchestration: Scaffolding of Laravel 11, Next.js 14, FastAPI worker, PostgreSQL, Redis, and queue-worker in `docker-compose.yml`.
- [x] **[Success]** Database schema & migrations: 13 migration files with UUID PKs, indexes, soft deletes, and foreign keys.
- [x] **[Success]** Biomechanics Rule Engine: Implemented and modularized 13 exercise rules with angle math and hysteresis rep counters in `pose-worker/app/rules/`.
- [x] **[Success]** Dockerfile Production Standardization: Replaced dev servers (`php -S` and `npm run dev`) with PHP-FPM 8.3 + Nginx + Supervisord for backend and multi-stage standalone runner for frontend.
- [x] **[Success]** Web Frontend API Integration: Removed mock auth (`mock_token_...` / `setTimeout`) in `frontend/src/lib/auth.ts` and connected live backend endpoints (`/api/v1/auth/*`, `/exercises`, `/workout-logs`, `/nutrition-logs`, `/body-metrics`).
- [x] **[Success]** Mobile UI Overhaul: Converted 40 Figma screens into native Android layouts, replaced emoji icons with solid icons, added view transitions, and localized UI to Vietnamese (`mobile/app/src/main/res/values/strings.xml`).
- [ ] **[Dead End]** Local Windows PHP/Composer execution: Environment dependency mismatches on Windows host; pivoted strictly to containerized PHP 8.3 inside Docker.
- [ ] **[Dead End]** PHP built-in server (`php -S 0.0.0.0:8000`) in Docker: Single-threaded blocking caused worker timeouts during video uploads and concurrent polling. Replaced with PHP-FPM + Nginx.
- [x] **[Pivot]** Internal Shared Storage: Pivoted from external MinIO/S3 configuration during dev to Docker internal named volume (`private_storage`), preserving S3/Cloudflare R2 pre-signed URL interfaces for production rollout.
- [x] **[Pivot]** Documentation Consolidation: Purged obsolete design documents (`tech_design_rework.md`, `ui-ux-audit.md`, `ui-ux-redesign-spec.md`) in commit `11cfc18`, establishing `docs/PROJECT_LOGIC.md` as the unified technical baseline.

## 4. Current State & Residual Debt
- **Active Working Set:**
  - `mobile/app/src/main/java/com/fittrack/app/ui/`: Activities currently wired to layouts and navigation intents, awaiting networking layer.
  - `mobile/app/src/main/res/layout/activity_ai_pose_active_session.xml`: AI Pose camera session layout ready for CameraX preview and landmark overlay.
  - `docs/PROJECT_LOGIC.md` & `docs/production-readiness-review.md`: System logic baseline and production readiness checklist.
- **Current Blocker / State:**
  - Mobile Backend & AI Integration: Android application is currently a static UI shell without HTTP client (Retrofit/OkHttp), auth token management, or MediaPipe Android SDK camera integration.
  - Backend Security & Throttling: `APP_KEY` in `backend/.env` requires production generation, `APP_DEBUG=true` needs disabling for prod, and rate-limiting (`throttle:6,1` on auth, `throttle:30,1` on AI) is not yet active in `backend/routes/api.php`.
  - Test Suite Deficit: Backend `tests/Unit/` is empty; `pose-worker/tests/` contains 3 legacy squat test cases needing keypoint schema alignment.

## 5. Next Steps (For Resuming Session)
1. Add Retrofit/OkHttp dependencies and network client in `mobile/app/build.gradle.kts` to connect Mobile Auth and Dashboard activities with Laravel `/api/v1` endpoints.
2. Integrate CameraX and MediaPipe Tasks-Vision Android SDK into `mobile/app/src/main/java/com/fittrack/app/ui/aipose/AiPoseActiveSessionActivity.kt`.
3. Add API rate-limiting middleware (`throttle`) to sensitive auth and AI generation routes in `backend/routes/api.php`.
4. Fix schema assertions in `pose-worker/tests/` and add automated feature test coverage for `ProcessPoseCheckJob`.

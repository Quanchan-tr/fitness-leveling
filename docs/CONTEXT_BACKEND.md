# Session State: FitnessLeveling Backend (Laravel 11 REST API)
*Last Updated: 2026-10-25 00:14*

## 1. Core Objective & Scope
- **Goal:** Central monolith REST API and asynchronous processing engine for the Fitness Leveling platform. Manages user authentication, workout/nutrition logging, body metrics, AI plan generation (with multi-tier fallback), and asynchronous video pose check pipeline orchestration.
- **Constraints & Environment:**
  - **Runtime & Language:** PHP 8.3-FPM, containerized on Alpine Linux (`php:8.3-fpm-alpine`).
  - **Framework & Auth:** Laravel 11.x Monolith (`laravel/framework: ^11.0`), Laravel Sanctum 4.0 (`laravel/sanctum: ^4.0`) issuing Bearer tokens.
  - **Database & ORM:** PostgreSQL 16 Alpine, Eloquent ORM with UUID primary keys (`HasUuids`), soft deletes (`SoftDeletes`), and indexed relations.
  - **Queue & Storage:** Laravel Database Queue (`QUEUE_CONNECTION=database` using PostgreSQL `jobs` table), private disk storage via Docker named volume (`private_storage`).
  - **Production Container Stack:** PHP-FPM 8.3 + Nginx (port 8000) coordinated via Supervisord (`supervisord.conf`), OPcache enabled, 100MB upload limit.

## 2. Key Decisions & Architecture
- **API Routing & Envelopes:**
  - Strictly prefixed at `/api/v1` in `backend/routes/api.php`.
  - Standard JSON response format:
    - Success: `{ "data": ... }` (HTTP 200, 201 Created, 202 Accepted).
    - Error: `{ "error": { "code": "ERROR_CODE", "message": "...", "details": {...} } }`.
- **Database Schema & UUID Architecture:**
  - 13 migration files in `backend/database/migrations/`: `users`, `exercises`, `workout_logs`, `workout_log_sets`, `nutrition_logs`, `body_metrics`, `ai_recommendations`, `pose_check_sessions`, `exercise_ratings_and_reports`, `jobs`, `failed_jobs`, `idempotency_records`, `personal_access_tokens`.
  - All domain entities use UUID primary keys (`HasUuids`) and soft deletes.
- **PostgreSQL-Backed Idempotency:**
  - Enforced via `App\Http\Middleware\IdempotencyMiddleware` on state-mutating endpoints (`POST`, `PUT`, `PATCH`).
  - Composite key `{user_id}:{idempotency_key}` stored in `idempotency_records` table with unique constraint.
  - Status handling: Returns 409 Conflict if duplicate is `in_progress`; replays stored response body if `completed`.
- **AI Gateway & Circuit Breaker:**
  - Handled by `App\Services\Ai\AiOrchestrationService` with OpenAI (`gpt-4o-mini`).
  - Triple-Layer Fallback: Live LLM -> Local JSON Repair -> Static Expert Templates (`StaticPlanFallback.php`).
  - Unconfigured or invalid `AI_API_KEY` seamlessly returns deterministic static fallback without client failure.
- **Pose Check Pipeline:**
  - Edge Realtime: `POST /api/v1/pose-check/realtime/result` ingests lightweight summary telemetry from client-side MediaPipe.
  - Async Video Pipeline: `POST /api/v1/pose-check/upload` saves video file to `storage/app/private/pose-videos/{uid}/{sid}.mp4`, creates `PoseCheckSession` (PENDING), and dispatches `ProcessPoseCheckJob` (returns HTTP 202 Accepted).
  - Internal Pose Worker Interop: `PoseWorkerClient.php` maps backend storage paths to Docker mount path (`/app/private_storage`) and communicates over internal Docker network (`http://pose-worker:8001/v1/process-video`).

## 3. Execution Log (Attempts & Results)
- [x] **[Success]** Monolith API Scaffolding: Configured Laravel 11 directory structure, Form Requests, Sanctum token authentication, and API controllers.
- [x] **[Success]** Database Schema & 13 Migrations: Implemented PostgreSQL migrations with UUID PKs, foreign keys, cascades, soft deletes, and search indexes.
- [x] **[Success]** AI Hub & Fallback: Developed `AiOrchestrationService` and static expert templates in `StaticPlanFallback.php`.
- [x] **[Success]** Async Pose Check Pipeline: Built `ProcessPoseCheckJob` with retry backoff (`[10, 30]` seconds) and worker path translation.
- [x] **[Success]** Live Backend API Integration (`af5a99e`): Replaced mock endpoints with live Laravel `/api/v1/auth/*` and resource controllers; updated `UpdateProfileRequest.php` and `AuthController.php`.
- [x] **[Success]** Production Dockerization (`1e8486d`): Replaced dev server (`php -S`) with high-performance PHP-FPM 8.3 + Nginx managed by Supervisord, configuring opcache and 100M client max body size.
- [ ] **[Dead End]** Built-in PHP server (`php -S 0.0.0.0:8000`): Suffered single-threaded blocking during concurrent video uploads and polling requests. Replaced with PHP-FPM + Nginx.
- [ ] **[Dead End]** Host-based PHP/Composer execution: Dependency mismatches and missing extensions on Windows host; pivoted strictly to containerized PHP 8.3.
- [x] **[Pivot]** Redis to PostgreSQL Architecture: Eliminated external Redis dependency for MVP by migrating Idempotency locks to `idempotency_records` table and Queue to PostgreSQL `jobs` table.
- [x] **[Pivot]** Storage Abstraction: Switched from cloud S3/MinIO bucket requirements during dev to Docker internal named volume (`private_storage`), maintaining S3-compatible service interfaces for future cloud deployment.

## 4. Current State & Residual Debt
- **Active Working Set:**
  - `backend/routes/api.php`: Route definitions for Auth, Exercises, Workout Logs, Nutrition Logs, Body Metrics, AI Hub, and Pose Check.
  - `backend/app/Http/Controllers/Api/V1/`: 7 controllers consumed by web frontend and ready for mobile integration.
  - `backend/app/Services/`: `AiOrchestrationService.php`, `PoseWorkerClient.php`, and `PrivateVideoStorageService.php`.
- **Current Blocker / State:**
  - Rate Limiting Missing: `routes/api.php` does not have `throttle` middleware attached to sensitive authentication endpoints (`/login`, `/register`) or expensive AI endpoints (`/ai/exercise-plan`, `/ai/meal-plan`).
  - Security Configurations: `backend/.env` still contains `APP_DEBUG=true`, `APP_ENV=local`, and placeholder `APP_KEY`.
  - Incomplete Test Suite: `backend/tests/Unit/` is empty; `backend/tests/Feature/` only contains `ApiFoundationTest.php` and `ExerciseCatalogTest.php`. No automated tests for Auth, Idempotency, or PoseCheck queue flows.
  - Pruning Routine: `idempotency_records` table lacks an automated scheduled prune command to clean up records older than 24 hours.

## 5. Next Steps (For Resuming Session)
1. Attach rate limiting middleware to `backend/routes/api.php` (`throttle:6,1` on login/register; `throttle:30,1` on AI endpoints).
2. Create an Artisan command (`app:prune-idempotency-records`) and schedule it in `backend/routes/console.php` to clean expired idempotency records.
3. Harden environment settings: generate real `APP_KEY` via `php artisan key:generate`, set `APP_DEBUG=false`, and configure production secrets.
4. Add feature test suites in `backend/tests/Feature/`: test authentication flows, `IdempotencyMiddleware` duplicate prevention, and `ProcessPoseCheckJob` queue dispatching.

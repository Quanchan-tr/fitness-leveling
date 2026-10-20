# PROJECT_LOGIC.md

## 1. Tech Stack & Dependencies
- **Ngôn ngữ & Runtime**: PHP 8.3 (Backend container), TypeScript 5.7 / Node.js 20+ (Frontend Web), Python 3.11/3.14 (Pose Worker), Kotlin 1.9+ / Java 17 (Android SDK 35).
- **Framework chính**:
  - Backend: Laravel 11.x Monolith REST API (`/api/v1`), Laravel Sanctum 4.0 (Auth Bearer Token), Laravel Database Queue (`jobs` table).
  - Frontend Web: Next.js 14.2.24 (App Router), React 18.3.1.
  - CV Worker: Python FastAPI 0.115, Uvicorn, Pydantic v2.
  - Mobile: Native Android (Kotlin, Jetpack Navigation Component 2.8.5, ViewBinding, Material 3).
- **Database & ORM/ODM**:
  - PostgreSQL 16 (Alpine), Laravel Eloquent ORM (UUID primary keys, indexed migrations).
  - Storage: Docker named volume (`private_storage`) chia sẻ nội bộ giữa Backend, Queue Worker và Pose Worker (không mở public).
- **State Management / Styling / Key Libraries**:
  - Web State: React Context API (`AuthContext`, `FitnessContext`), client caching `localStorage`.
  - Web UI & 3D: Tailwind CSS v3.4, Lucide React, Three.js 0.169, React Three Fiber (R3F), `@react-three/drei`.
  - CV & AI: MediaPipe Vision (client-side edge & worker), OpenCV (`opencv-python-headless`), NumPy, AI Orchestration với 3-layer fallback.

## 2. Directory Architecture (Kiến trúc thư mục)
- `/backend`: Laravel 11 REST API Monolith
  - `app/Http/Controllers/Api/V1`: API endpoints (Auth, WorkoutLog, NutritionLog, BodyMetric, Exercise, Ai, PoseCheck).
  - `app/Http/Requests`: Form Request Validation classes kiểm soát chặt chẽ input data.
  - `app/Http/Middleware`: `IdempotencyMiddleware` (khóa duplicate qua PostgreSQL `idempotency_records`), `EnsureUserIsAdmin`.
  - `app/Models`: Eloquent Models (User, Exercise, WorkoutLog, WorkoutLogSet, NutritionLog, BodyMetric, PoseCheckSession,...).
  - `app/Services`: Business domain logic (`Ai/AiOrchestrationService`, `Pose/PoseWorkerClient`, `Pose/PrivateVideoStorageService`).
  - `app/Jobs`: Queue background jobs (`ProcessPoseCheckJob` xử lý video pose check bất đồng bộ).
  - `database/migrations`: 13 migration files (schema chuẩn hóa UUID, soft deletes, index tra cứu).
  - `routes/api.php`: Toàn bộ định tuyến API có tiền tố `/api/v1`.
- `/frontend`: Next.js 14 Web Application & 3D Studio
  - `src/app`: Page routing (`/`, `/dashboard`, `/workout`, `/nutrition`, `/metrics`, `/ai-coach`, `/community`, `/auth`, `/onboarding`).
  - `src/components`: UI components (`home/3d` chứa avatar/3D room, `cards`, `community`, `landing`, `layout`, `nutrition`, `workout`).
  - `src/contexts`: Centralized state management (`AuthContext.tsx`, `FitnessContext.tsx`).
  - `src/lib`: Core utilities (`api.ts` xử lý fetch + Idempotency UUID, `auth.ts`, `fitnessData.ts`, `muscleHeatmap.ts`).
  - `src/types`: Type definitions và data contracts TypeScript.
- `/mobile`: Native Android Application (Kotlin)
  - `app/src/main/java/com/fittrack/app/ui`: 12 module màn hình theo tính năng (aipose, auth, community, dashboard, metrics, nutrition, onboarding,...).
  - `app/src/main/res/layout`: 40 layout XML thiết kế chuẩn theo hệ thống Figma redesign.
- `/pose-worker`: Python FastAPI Computer Vision Service
  - `app/main.py`: Entrypoint service (`/health`, `/v1/process-video`, WebSocket).
  - `app/cv`: MediaPipe landmark extractor (33 keypoints), `angle_math.py` tính toán góc sinh cơ học.
  - `app/rules`: Kinematic Rule Engine phân tích form động tác (Squat, Pushup, Plank, Bodyweight, Weighted).
- `/packages`: Monorepo shared workspace (`packages/shared` dành cho shared models/types).
- `/docs`: Tài liệu kỹ thuật chi tiết (`tech_design_rework.md`, `implementation-status.md`, `ui-ux-redesign-spec.md`).
- `/docker-compose.yml`: Điều phối 5 containers: frontend (:3000), backend (:8000), queue-worker, pose-worker (:8001), postgres (:5432).

## 3. Core Architectural Patterns & Conventions (Quy chuẩn bắt buộc)
- **Phân tầng dữ liệu**:
  - Request luân chuyển đơn chiều: Client -> Route -> Form Request -> Controller -> Service -> Eloquent Model -> Database.
  - Video Pose Pipeline: Client Upload -> Backend lưu local volume -> Dispatch `ProcessPoseCheckJob` -> Queue Worker gọi HTTP nội bộ tới Python Worker -> Cập nhật kết quả vào DB.
- **Xử lý lỗi & Trả về**:
  - Chuẩn response thống nhất:
    - Success: `{ "data": ... }` hoặc `{ "data": ..., "meta": ... }`.
    - Error: `{ "error": { "code": "ERROR_CODE", "message": "...", "details": {...} } }`.
  - Frontend client (`api.ts`) bắt lỗi ném qua `FitnessLevelingApiException` mang mã lỗi và status HTTP tương ứng.
  - Cơ chế Idempotency: Header `Idempotency-Key` bắt buộc trên các mutation nhạy cảm; PostgreSQL lưu composite key `{user_id}:{idempotency_key}` chống duplicate insertion.
- **State & Data Fetching**:
  - Web: React Context API kết hợp `apiRequest<T>()`, tự động đính kèm Bearer token và sinh UUID cho `Idempotency-Key`. Hỗ trợ fallback offline mock qua `auth.ts` / `fitnessData.ts`.
  - Mobile: Activity state kết hợp ViewBinding và Navigation Intents.
- **Quy ước đặt tên & vị trí file**:
  - Backend: PascalCase cho Controller (`WorkoutLogController.php`), Model, Service, Request; camelCase cho controller method (`store`, `addSet`); snake_case cho route URL (`workout-logs`, `pose-check`) và database columns.
  - Frontend: PascalCase cho React Components (`WorkoutCard.tsx`), camelCase cho utils/services (`api.ts`), kebab-case cho directory routing (`ai-coach`).
  - Python: snake_case cho file và function (`mediapipe_extractor.py`), PascalCase cho Rule classes và Pydantic Schemas (`WorkerTaskResult`).

## 4. Current Feature Map (Bản đồ chức năng hiện tại)
- **Auth & User Profile**: Đã triển khai Sanctum Auth tại `backend/app/Http/Controllers/Api/V1/AuthController.php`, Web auth tại `frontend/src/app/auth`, Mobile tại `mobile/.../ui/auth`.
- **Workout & Exercise Catalog**: Đã triển khai danh mục bài tập (PostgreSQL) và ghi nhật ký set/rep tại `backend/.../WorkoutLogController.php` & `ExerciseController.php`, UI tại `frontend/src/app/workout`, Mobile tại `mobile/.../ui/workout`.
- **Nutrition Logging**: Đã triển khai tracking bữa ăn và macro calo tại `backend/.../NutritionLogController.php`, UI tại `frontend/src/app/nutrition`, Mobile tại `mobile/.../ui/nutrition`.
- **Body Metrics & Analytics**: Đã triển khai tính toán chỉ số Deurenberg và BMI tại `backend/.../BodyMetricController.php`, UI tại `frontend/src/app/metrics`, Mobile tại `mobile/.../ui/metrics`.
- **AI Coach & Plan Generation**: Đã triển khai 3-Layer Fallback (LLM API -> Local JSON Repair -> Static Templates) tại `backend/app/Services/Ai/AiOrchestrationService.php`, Web UI tại `frontend/src/app/ai-coach`.
- **Pose Check Engine**:
  - Edge Realtime: MediaPipe trên webcam client, gửi payload tổng hợp về `POST /api/v1/pose-check/realtime/result`.
  - Video Async: Upload video vào private volume, xử lý qua queue và Python CV Worker tại `pose-worker/app/rules`, polling qua `GET /api/v1/pose-check/sessions/{id}`.
- **3D Room Dashboard**: Đã triển khai phòng tập 3D isometric với nhân vật tùy biến trang phục và tương tác modal metrics/album ảnh tại `frontend/src/components/home/3d/Character.tsx`.
- **Mobile UI**: Đã chuyển đổi hoàn chỉnh 40 giao diện Figma sang XML layout và Kotlin Activities tại `mobile/app/src/main/res/layout`.
- **Tính năng đang dang dở/Cần làm tiếp**:
  - `packages/shared`: Module shared monorepo đang trống; cần trích xuất type definitions dùng chung giữa Web và Mobile.
  - Mobile AI Pose Integration: `AiPoseActiveSessionActivity.kt` hiện mới có khung UI, cần tích hợp MediaPipe Android SDK trực tiếp trên CameraX.
  - Cloud Object Storage: Cần chuyển đổi từ Docker local storage sang S3/Cloudflare R2 với Pre-signed URLs khi triển khai production phân tán.

## 5. Session History & Baseline
- [Session 0 - Baseline]: Khởi tạo `PROJECT_LOGIC.md`, đặt ở trong docs/. Toàn bộ cấu trúc hiện tại được chốt làm chuẩn nền tảng.

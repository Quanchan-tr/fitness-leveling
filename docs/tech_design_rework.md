# FITTRACK AI — TÀI LIỆU THIẾT KẾ KỸ THUẬT HỆ THỐNG (SYSTEM ARCHITECTURE SPECIFICATION)
### Enterprise Architecture · Database ERD · API Specification · AI Orchestration · Computer Vision Engine · Security & DevOps

**Phiên bản:** 2.0 (Refactored Architecture) — Ngày cập nhật: 18/09/2026  
**Trạng thái:** Approved Architecture Baseline  
**Kiến trúc:** Unified Laravel Monolith API + Decoupled Asynchronous Python CV Worker + Client-Side Edge Inference

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

### 1.1 Nguyên lý thiết kế cốt lõi
Hệ thống **FitTrack AI v2.0** được thiết kế theo mô hình **Service-Oriented Asynchronous Architecture** nhằm giải quyết bài toán tải cao, tính toán Computer Vision phức tạp và tích hợp LLM an toàn.
1. **Single Entry Point API:** Laravel Backend là API Gateway và Application Backend duy nhất phục vụ cả Web Client (SPA/PWA) và Mobile Client (iOS/Android). Không có client nào truy cập trực tiếp vào DB, Cache, S3 hay AI/Worker.
2. **Zero-Trust AI & Sanitization:** LLM (Large Language Model) được xem là thành phần sinh dữ liệu không tin cậy (*untrusted content generator*). Toàn bộ dữ liệu LLM phải đi qua pipeline xác thực cấu trúc (JSON Schema) và ngữ nghĩa (Semantic Validation) trước khi vào cơ sở dữ liệu hoặc trả về client.
3. **Decoupled Heavy Computation:** Phân tách hoàn toàn tác vụ I/O nhẹ (Web/Mobile REST API) khỏi tác vụ xử lý đồ họa/video nặng (Computer Vision & Pose Estimation). Video upload được xử lý bất đồng bộ qua Queue.
4. **Edge Computing for Realtime UX:** Toàn bộ tính toán Pose Check trực tiếp theo thời gian thực (Realtime Webcam/Camera) được đẩy về client (Browser / Thiết bị di động). Server không nhận từng frame video để loại bỏ độ trễ mạng và nghẽn băng thông.
5. **Private Data Isolation:** Mọi video upload được lưu trữ trong S3-compatible Object Storage ở chế độ hoàn toàn riêng tư (*Private Bucket*), chỉ truy cập thông qua Pre-signed URL tạm thời.

### 1.2 Sơ đồ kiến trúc tổng thể (Architecture Topology)

```
                       +-----------------------------------+
                       |    CLIENT APPLICATIONS LAYER      |
                       |  - Web Application (Vue/React)    |
                       |  - Mobile App (Flutter/React Nat.)|
                       +-----------------+-----------------+
                                         |
                                         | HTTPS / REST API (/api/v1)
                                         | (Shared Auth: Bearer Token)
                                         v
+-----------------------------------------------------------------------------------+
|                            LARAVEL BACKEND APPLICATION                            |
|  - Routing & Middleware (/api/v1)                                                 |
|  - Auth & Guard (Laravel Sanctum)                                                 |
|  - Request Validation & Idempotency Key Lock (Redis)                              |
|  - Business Domain Services (Workout, Nutrition, Body Metrics, Exercises)         |
|  - Storage Manager (S3 Flysystem Driver)                                          |
|  - AI Orchestrator (HTTP Client, Prompt Engine, Schema Validator, Fallback)       |
+-----------+---------------------+-------------------+---------------------+-------+
            |                     |                   |                     |
     (SQL Queries)         (Cache & Queues)     (Store Raw Video)    (Structured Prompt)
            v                     v                   v                     v
  +------------------+   +-----------------+ +-----------------+  +-------------------+
  |    PostgreSQL    |   |      Redis      | |  S3-Compatible  |  |  External LLM API |
  | (Primary RDBMS)  |   | (Queue + Cache) | | Object Storage  |  | (OpenAI / Claude) |
  +------------------+   +--------+--------+ +--------+--------+  +---------+---------+
                                  |                   ^                     |
                           (Pops Job)                 | (Fetch Video) (JSON Response)
                                  v                   |                     |
                         +-----------------+          |                     v
                         |  Laravel Queue  |          |           +-------------------+
                         |     Worker      |          |           | JSON Schema &     |
                         +--------+--------+          |           | Semantic Validator|
                                  |                   |           +---------+---------+
                (Internal Private |                   |                     |
                 RPC / HTTP Task) v                   |                     v
                         +-----------------+          |           +-------------------+
                         |   Python Pose   +----------+           | Persist Result to |
                         |  Worker (CV)    |                      | PostgreSQL / Client
                         | MediaPipe/OpenCV|                      +-------------------+
                         +-----------------+
```

### 1.3 Phân định trách nhiệm các thành phần (Component Responsibilities)

| Thành phần | Vai trò & Trách nhiệm chính | Ranh giới truy cập (Access Boundaries) |
|---|---|---|
| **Web & Mobile Clients** | Giao diện người dùng; Render biểu đồ; Chạy Pose Estimation on-device (Realtime); Gửi tóm tắt kết quả hoặc upload video file. | Chỉ gọi HTTPS tới Laravel REST API. Không có quyền truy cập DB, Redis, S3 hay Python Worker. |
| **Laravel API Backend** | Cung cấp RESTful API versioned `/api/v1`; Xác thực qua Sanctum; Kiểm soát phân quyền (Policies); Validate request; Khóa Idempotency; Điều phối LLM; Đẩy job xử lý video vào Queue. | Đọc/ghi PostgreSQL, Redis; Giao tiếp S3; Gọi Outbound LLM API; Đẩy job vào Redis. |
| **PostgreSQL 16+** | Lưu trữ toàn bộ dữ liệu nghiệp vụ, quan hệ bảng, indexes, transactions, audit logs, kết quả AI recommendations và session pose check. | Chỉ cho phép Laravel Backend truy cập nội bộ (Private Network / VPC). |
| **Redis 7.x** | Lưu trữ phiên làm việc, Cache query, Quản lý Idempotency Keys (với TTL), Backend lưu trữ hàng đợi công việc (`pose_processing_queue`). | Chỉ truy cập nội bộ bởi Laravel API và Laravel Queue Worker. |
| **S3-Compatible Storage** | Lưu trữ nhị phân video upload từ người dùng (MinIO on Premise / AWS S3). | Private 100%. Nhận video từ Laravel; Cung cấp video cho Python Worker qua Pre-signed URL; Cấp link xem video tạm thời cho Client. |
| **Laravel Queue Worker** | Tiến trình nền giám sát Redis Queue; Xử lý retries, dead-letter jobs, timeout, cleanup dữ liệu tạm; Gọi dịch vụ Python Worker để phân tích video. | Chạy nội bộ, giao tiếp với Redis, PostgreSQL và Python Worker. |
| **Python Pose Worker** | Service nội bộ chuyên trách: Giải mã video (OpenCV), trích xuất 33 landmarks từng frame (MediaPipe), chạy Kinematic Rules Engine, chấm điểm form và tính timestamp lỗi. | Không mở cổng Public. Chỉ lắng nghe yêu cầu nội bộ từ Laravel Queue Worker (qua HTTP Microservice nội bộ hoặc direct Redis task). |
| **External LLM Service** | Tiếp nhận prompt có cấu trúc từ Laravel để sinh lịch tập (Exercise Plan) và thực đơn (Meal Plan) dưới dạng JSON thuần túy. | Được gọi ra ngoài từ Laravel HTTP Client; Không có bất kỳ quyền hạn nào trên hệ thống FitTrack. |

---

## 2. TECHNOLOGY STACK

Toàn bộ hệ thống chuẩn hóa trên nền tảng PHP hiện đại, loại bỏ hoàn toàn NodeJS/NestJS và BullMQ để thống nhất hệ sinh thái Laravel Enterprise.

### 2.1 Backend Core (Laravel Ecosystem)
- **Runtime:** PHP 8.3+ (JIT enabled, strict types `declare(strict_types=1);`).
- **Framework:** Laravel 11.x (phiên bản ổn định mới nhất).
- **ORM:** Laravel Eloquent ORM kết hợp PostgreSQL JSONB queries.
- **Request Validation:** Laravel Form Request Validation kết hợp custom Rules.
- **Queue System:** Laravel Queue Worker sử dụng driver `redis`.
- **Task Scheduling:** Laravel Scheduler (`cron` chạy `php artisan schedule:run` mỗi phút).
- **HTTP Client:** Laravel HTTP Client (`Illuminate\Support\Facades\Http`, wrapper trên Guzzle) với retry middleware và connection pool.
- **Packages bên thứ ba bắt buộc và mục đích sử dụng:**
  - `laravel/sanctum`: Quản lý API Personal Access Tokens dùng chung chuẩn hóa cho Web và Mobile.
  - `league/flysystem-aws-s3-v3`: Driver kết nối S3 Object Storage cho Laravel Storage Facade.
  - `opis/json-schema`: Thư viện PHP tuân thủ chuẩn JSON Schema draft-07/2020-12 hiệu năng cao để validate đầu ra của LLM.
  - `predis/predis` hoặc extension `ext-redis`: Client giao tiếp Redis hiệu năng cao.

### 2.2 Computer Vision & AI Worker Stack
- **Runtime:** Python 3.11+.
- **Framework nội bộ:** FastAPI (đóng vai trò Internal Microservice endpoint) hoặc Headless Worker script.
- **Libraries:**
  - `mediapipe`: Trích xuất 33 3D-skeletal landmarks của cơ thể người.
  - `opencv-python-headless`: Đọc, decode, resize và duyệt từng frame video.
  - `numpy`: Tính toán vector, ma trận, tích vô hướng và góc xoay khớp hình học.
  - `pydantic v2`: Xác thực và serialize schema kết quả `feedback_json`.
  - `boto3`: Tải video từ S3 qua signed URL hoặc S3 credentials nội bộ.

### 2.3 Data & Infrastructure Layer
- **Primary Database:** PostgreSQL 16+ với các extensions: `uuid-ossp` hoặc native `gen_random_uuid()`, `pg_trgm` (tối ưu tìm kiếm văn bản bài tập).
- **Cache & Queue Broker:** Redis 7.2 Alpine.
- **Storage:** MinIO (môi trường Local/Staging) / AWS S3 (môi trường Production).
- **Reverse Proxy & Web Server:** Nginx 1.25+ hoặc FrankenPHP / PHP-FPM.

---

## 3. MÔ HÌNH DỮ LIỆU CHI TIẾT (DATABASE / ERD)

Toàn bộ ID sử dụng kiểu dữ liệu `UUID` (PostgreSQL `uuid`, sinh tự động qua `gen_random_uuid()` hoặc `Str::uuid()` ở Laravel). Thiết kế có đầy đủ Soft Deletes (`deleted_at`), Foreign Keys ràng buộc toàn vẹn, Indexes phục vụ truy vấn tải cao và audit timestamps.

### 3.1 Sơ đồ quan hệ thực thể (ERD Logical Diagram)

```
  +------------------+       1:N       +-------------------+
  |      users       +-----------------+   workout_logs    |
  +--------+---------+                 +---------+---------+
           |                                     | 1:N
           | 1:N                                 v
           |                           +---------+---------+
           |                           |  workout_log_sets |
           |                           +---------+---------+
           |                                     | N:1
           | 1:N                                 v
           +-----------------+         +---------+---------+
           |                 +-------->+     exercises     |
           | 1:N                       +----+----+----+----+
           |                                ^    ^    ^
           |                                |    |    |
           v                                |    |    |
  +--------+---------+                      |    |    |
  |  nutrition_logs  |                      |    |    |
  +------------------+                      |    |    |
                                            |    |    |
  +------------------+                      |    |    |
  |   body_metrics   |                      |    |    |
  +------------------+                      |    |    |
                                            |    |    |
  +----------------------+                  |    |    |
  |  ai_recommendations  |                  |    |    |
  +----------------------+                  |    |    |
                                            |    |    |
  +-----------------------+                 |    |    |
  |  pose_check_sessions  +-----------------+    |    |
  +-----------------------+ 1:N                  |    |
                                                 |    |
  +-----------------------+                      |    |
  |   exercise_ratings    +----------------------+    |
  +-----------------------+ 1:N                       |
                                                      |
  +-----------------------+                           |
  |   exercise_reports    +---------------------------+
  +-----------------------+ 1:N
```

### 3.2 Đặc tả chi tiết các bảng dữ liệu

#### 3.2.1 `users`
Bảng quản lý tài khoản người dùng và thông số thể chất làm ngữ cảnh cho AI.
| Cột | Kiểu dữ liệu | Thuộc tính | Mô tả & Ràng buộc |
|---|---|---|---|
| `id` | `uuid` | PK, Default `gen_random_uuid()` | Khóa chính |
| `name` | `varchar(100)` | NOT NULL | Tên hiển thị người dùng |
| `email` | `varchar(255)` | NOT NULL, UNIQUE, Index | Địa chỉ email đăng nhập |
| `password` | `varchar(255)` | NOT NULL | Mật khẩu băm (Argon2id hoặc Bcrypt) |
| `role` | `varchar(20)` | NOT NULL, Default `'user'` | Phân quyền: `'user'`, `'admin'` |
| `avatar_url` | `varchar(500)` | NULLABLE | Đường dẫn ảnh đại diện |
| `goal` | `varchar(30)` | NOT NULL, Default `'maintain'` | Mục tiêu: `'lose_weight'`, `'gain_muscle'`, `'maintain'` |
| `weight_kg` | `numeric(5,2)` | NOT NULL | Cân nặng gần nhất (kg) |
| `height_cm` | `numeric(5,2)` | NOT NULL | Chiều cao (cm) |
| `birth_date` | `date` | NOT NULL | Ngày sinh (tính tuổi phục vụ AI context) |
| `gender` | `varchar(10)` | NOT NULL | Giới tính: `'male'`, `'female'`, `'other'` |
| `activity_level`| `varchar(20)` | NOT NULL, Default `'moderate'` | `'sedentary'`, `'light'`, `'moderate'`, `'active'` |
| `email_verified_at`| `timestamp`| NULLABLE | Thời điểm xác thực email |
| `created_at` | `timestamp` | NOT NULL, Index | Thời điểm tạo |
| `updated_at` | `timestamp` | NOT NULL | Thời điểm cập nhật |
| `deleted_at` | `timestamp` | NULLABLE, Index | Soft delete |

#### 3.2.2 `exercises` (Kho bài tập chuẩn & cộng đồng đóng góp)
| Cột | Kiểu dữ liệu | Thuộc tính | Mô tả & Ràng buộc |
|---|---|---|---|
| `id` | `uuid` | PK, Default `gen_random_uuid()` | Khóa chính |
| `created_by` | `uuid` | FK → `users.id`, Index | Người tạo (NULL nếu hệ thống tạo sẵn) |
| `name` | `varchar(150)` | NOT NULL | Tên bài tập (Index Trigram tìm kiếm) |
| `description` | `text` | NOT NULL | Hướng dẫn kỹ thuật bài tập |
| `muscle_group` | `varchar(30)` | NOT NULL, Index | `'chest'`, `'back'`, `'legs'`, `'core'`, `'full_body'` |
| `equipment` | `varchar(50)` | NOT NULL | Dụng cụ: `'none'`, `'dumbbell'`, `'barbell'`,... |
| `difficulty` | `varchar(20)` | NOT NULL | Độ khó: `'beginner'`, `'intermediate'`, `'advanced'` |
| `video_url` | `varchar(500)` | NULLABLE | Video hướng dẫn chuẩn |
| `thumbnail_url`| `varchar(500)` | NULLABLE | Ảnh thumbnail bài tập |
| `has_pose_check`| `boolean` | NOT NULL, Default `false`, Index | Hỗ trợ AI chấm form hay không |
| `pose_rules_key`| `varchar(50)` | NULLABLE | Định danh bộ rule (vd: `'squat_v1'`, `'pushup_v1'`) |
| `verified` | `boolean` | NOT NULL, Default `false`, Index | Đạt chuẩn kiểm duyệt cộng đồng |
| `avg_rating` | `numeric(3,2)` | NOT NULL, Default `0.00` | Điểm đánh giá trung bình cached |
| `rating_count` | `integer` | NOT NULL, Default `0` | Tổng số lượt đánh giá cached |
| `status` | `varchar(20)` | NOT NULL, Default `'active'`, Index | `'active'`, `'under_review'`, `'rejected'`, `'removed'` |
| `created_at` | `timestamp` | NOT NULL | Thời điểm tạo |
| `updated_at` | `timestamp` | NOT NULL | Thời điểm cập nhật |
| `deleted_at` | `timestamp` | NULLABLE, Index | Soft delete |

#### 3.2.3 `exercise_ratings`
| Cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK | Khóa chính |
| `exercise_id` | `uuid` | FK → `exercises.id` ON DELETE CASCADE | Bài tập được đánh giá |
| `user_id` | `uuid` | FK → `users.id` ON DELETE CASCADE | Người đánh giá |
| `stars` | `smallint` | NOT NULL, Check (stars BETWEEN 1 AND 5) | Số sao đánh giá |
| `comment` | `text` | NULLABLE | Nội dung nhận xét |
| `created_at` | `timestamp` | NOT NULL | Thời điểm đánh giá |
| `updated_at` | `timestamp` | NOT NULL | Thời điểm sửa nhận xét |
*Constraint:* `UNIQUE (exercise_id, user_id)`.

#### 3.2.4 `exercise_reports`
| Cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK | Khóa chính |
| `exercise_id` | `uuid` | FK → `exercises.id` ON DELETE CASCADE | Bài tập bị báo cáo |
| `reporter_id` | `uuid` | FK → `users.id` ON DELETE CASCADE | Người tạo báo cáo |
| `reason` | `varchar(30)` | NOT NULL | `'unsafe_form'`, `'wrong_info'`, `'spam'`, `'other'` |
| `detail` | `text` | NULLABLE | Mô tả chi tiết lý do |
| `status` | `varchar(20)` | NOT NULL, Default `'pending'`, Index | `'pending'`, `'reviewed'`, `'dismissed'` |
| `resolved_by` | `uuid` | NULLABLE, FK → `users.id` | Admin xử lý |
| `created_at` | `timestamp` | NOT NULL | Thời điểm tạo |
| `updated_at` | `timestamp` | NOT NULL | Thời điểm xử lý |

#### 3.2.5 `workout_logs` & `workout_log_sets`
```sql
-- workout_logs: Nhật ký buổi tập
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
log_date DATE NOT NULL,
notes TEXT NULL,
idempotency_key UUID NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
deleted_at TIMESTAMP NULL;

CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, log_date DESC);
CREATE UNIQUE INDEX uq_workout_logs_idempotency ON workout_logs(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- workout_log_sets: Chi tiết từng set trong buổi tập
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
workout_log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
set_number SMALLINT NOT NULL,
reps SMALLINT NOT NULL CHECK (reps >= 0),
weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (weight_kg >= 0),
duration_sec INTEGER NOT NULL DEFAULT 0 CHECK (duration_sec >= 0),
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL;

CREATE INDEX idx_workout_log_sets_parent ON workout_log_sets(workout_log_id);
```

#### 3.2.6 `nutrition_logs`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
log_date DATE NOT NULL,
meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
food_name VARCHAR(150) NOT NULL,
calories INTEGER NOT NULL CHECK (calories >= 0),
protein_g NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
carbs_g NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
fat_g NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (fat_g >= 0),
idempotency_key UUID NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
deleted_at TIMESTAMP NULL;

CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date DESC);
CREATE UNIQUE INDEX uq_nutrition_logs_idempotency ON nutrition_logs(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
```

#### 3.2.7 `body_metrics`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
log_date DATE NOT NULL,
weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
body_fat_pct NUMERIC(4,1) NULL CHECK (body_fat_pct >= 0 AND body_fat_pct <= 100),
height_cm NUMERIC(5,2) NULL CHECK (height_cm > 0),
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL;

CREATE UNIQUE INDEX uq_body_metrics_user_date ON body_metrics(user_id, log_date);
```

#### 3.2.8 `ai_recommendations` (Tracking LLM Outputs)
| Cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK | Khóa chính định danh khuyến nghị |
| `user_id` | `uuid` | FK → `users.id` ON DELETE CASCADE, Index | Người nhận gợi ý |
| `type` | `varchar(30)` | NOT NULL, Index | `'exercise_plan'`, `'meal_plan'` |
| `input_context_json` | `jsonb` | NOT NULL | Snapshot context đã loại trừ thông tin nhạy cảm |
| `output_json` | `jsonb` | NOT NULL | Dữ liệu cấu trúc đã validate qua JSON Schema |
| `model_used` | `varchar(100)` | NOT NULL | Tên model: `gpt-4o-mini`, `claude-3-5-sonnet` |
| `prompt_tokens` | `integer` | NULLABLE | Số token đầu vào |
| `completion_tokens` | `integer`| NULLABLE | Số token đầu ra |
| `latency_ms` | `integer` | NOT NULL | Thời gian phản hồi tính bằng millisecond |
| `status` | `varchar(30)` | NOT NULL, Index | `'success'`, `'fallback_used'`, `'failed'` |
| `fallback_reason` | `text` | NULLABLE | Ghi nhận nguyên nhân chuyển sang fallback |
| `idempotency_key` | `uuid` | NULLABLE, Index | Tránh trùng lặp khi mobile retry |
| `created_at` | `timestamp` | NOT NULL, Index | Thời điểm tạo |
| `updated_at` | `timestamp` | NOT NULL | Thời điểm cập nhật |

#### 3.2.9 `pose_check_sessions` (Computer Vision Processing Sessions)
| Cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
|---|---|---|---|
| `id` | `uuid` | PK | Khóa chính phiên kiểm tra |
| `user_id` | `uuid` | FK → `users.id` ON DELETE CASCADE, Index | Người thực hiện |
| `exercise_id` | `uuid` | FK → `exercises.id`, Index | Bài tập được kiểm tra |
| `mode` | `varchar(20)` | NOT NULL, Index | `'realtime'` (client summary) hoặc `'upload'` (async video) |
| `s3_bucket` | `varchar(100)` | NULLABLE | Tên S3 bucket (chỉ có khi mode='upload') |
| `s3_object_key` | `varchar(500)` | NULLABLE | Khóa định danh file trên S3 |
| `video_mime` | `varchar(50)` | NULLABLE | Định dạng video (vd: `video/mp4`) |
| `video_size_bytes` | `bigint` | NULLABLE | Dung lượng file video |
| `video_duration_sec`| `numeric(6,2)`| NULLABLE | Độ dài video tính bằng giây |
| `status` | `varchar(20)` | NOT NULL, Default `'pending'`, Index | `'pending'`, `'processing'`, `'completed'`, `'failed'` |
| `rep_count` | `smallint` | NULLABLE | Tổng số rep hoàn thành hợp lệ |
| `score` | `numeric(5,2)` | NULLABLE | Điểm kỹ thuật tổng thể (thang điểm 0 - 100) |
| `feedback_json` | `jsonb` | NULLABLE | Chi tiết lỗi sai từng rep theo schema 5.3 |
| `worker_version` | `varchar(50)` | NULLABLE | Phiên bản Python Pose Worker xử lý session |
| `error_code` | `varchar(50)` | NULLABLE | Mã lỗi kỹ thuật khi thất bại |
| `error_message` | `text` | NULLABLE | Mô tả lỗi thân thiện với người dùng |
| `processing_started_at` | `timestamp` | NULLABLE | Thời điểm bắt đầu chạy CV |
| `completed_at` | `timestamp` | NULLABLE | Thời điểm xử lý xong |
| `created_at` | `timestamp` | NOT NULL, Index | Thời điểm tạo session |
| `updated_at` | `timestamp` | NOT NULL | Thời điểm cập nhật |

---

## 4. CHUẨN XÁC THỰC & BẢO MẬT (AUTHENTICATION & SECURITY)

Hệ thống sử dụng một chuẩn xác thực thống nhất cho cả Web và Mobile thông qua HTTP Bearer Token.

### 4.1 Cơ chế xác thực (Laravel Sanctum Bearer Token)
- **Token Type:** `PersonalAccessToken` sinh bởi Laravel Sanctum.
- **Header quy ước:** `Authorization: Bearer <plain_text_token>`.
- **Đặc tính:**
  - Token được hash SHA-256 trước khi lưu vào DB bảng `personal_access_tokens`.
  - Không sử dụng Stateful Cookie/Session cho API để đảm bảo tính thuần khiết RESTful, tránh lỗi CORS đa nền tảng và dễ dàng mở rộng Mobile.
  - **Token Expiration:** Mặc định token hết hạn sau 30 ngày (`config/sanctum.php` thiết lập `'expiration' => 43200`).

### 4.2 Luồng nghiệp vụ Auth Endpoints (`/api/v1/auth/*`)
1. **POST `/api/v1/auth/register`:** Đăng ký tài khoản mới. Kiểm tra email unique, băm mật khẩu bằng Argon2id. Trả về thông tin user và access token.
2. **POST `/api/v1/auth/login`:** Xác thực credentials. Kiểm tra mật khẩu, thu hồi các token cũ nếu cần hoặc cấp token mới.
3. **POST `/api/v1/auth/refresh`:** Thu hồi token hiện tại (`$request->user()->currentAccessToken()->delete()`) và cấp ngay một plain text token mới thay thế mà không cần người dùng nhập lại mật khẩu.
4. **POST `/api/v1/auth/logout`:** Thu hồi và xóa token hiện tại trong database.
5. **POST `/api/v1/auth/logout-all`:** Thu hồi toàn bộ token của tài khoản trên mọi thiết bị (`$request->user()->tokens()->delete()`).
6. **POST `/api/v1/auth/forgot-password`:** Tạo mật khẩu reset token tạm thời có hạn 15 phút, gửi email thông báo.
7. **POST `/api/v1/auth/reset-password`:** Kiểm tra token reset và cập nhật mật khẩu mới.

### 4.3 Phân quyền (Authorization & Admin RBAC)
- **User Ownership Isolation (Cách ly dữ liệu người dùng):** Tuyệt đối không nhận `user_id` từ body của request. Mọi nghiệp vụ đọc/ghi dữ liệu của `workout_logs`, `nutrition_logs`, `body_metrics`, `pose_check_sessions` đều lấy `user_id` trực tiếp từ `Auth::id()` thông qua Middleware `auth:sanctum`.
- **Laravel Policies:** Sử dụng triệt để Policy (`WorkoutLogPolicy`, `PoseCheckSessionPolicy`):
  ```php
  public function view(User $user, PoseCheckSession $session): bool {
      return $user->id === $session->user_id || $user->role === 'admin';
  }
  ```
- **Admin Authorization:** Middleware `EnsureUserIsAdmin` chặn tất cả các route bắt đầu bằng `/api/v1/admin/*`, kiểm tra `$request->user()->role === 'admin'`.

### 4.4 Các tiêu chuẩn an ninh hệ thống bổ sung
- **Transport Layer:** Bắt buộc 100% kết nối qua HTTPS TLS 1.3. Cấu hình HSTS (`Strict-Transport-Security`).
- **Rate Limiting (Throttle Middleware):**
  - Route thông thường: Tối đa 60 requests/phút trên mỗi user/IP.
  - Route AI (`/api/v1/ai/*`): Tối đa 5 requests/phút trên mỗi user.
  - Route Upload Video (`/api/v1/pose-check/upload`): Tối đa 3 uploads/phút trên mỗi user.
- **CORS Configuration:** Khóa Origin theo danh sách whitelist cụ thể (Web domain sản xuất). Không dùng wildcard `*` trên môi trường Production.
- **SQL Injection & Mass Assignment Defense:** Sử dụng Eloquent parameter binding; Tất cả Model định nghĩa `$fillable` nghiêm ngặt, cấm sử dụng `$guarded = []`.
- **Prompt Injection Defense:** Các trường văn bản từ người dùng (vd: tên bài tập cộng đồng) được escape, bao bọc bởi tag phân cách rõ ràng trong System Prompt và kiểm duyệt từ khóa độc hại trước khi đưa vào LLM Context.

---

## 5. API SPECIFICATION (RESTful `/api/v1`)

### 5.1 Quy chuẩn định dạng Response thống nhất

#### 5.1.1 Response thành công (Single Resource)
```json
{
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Barbell Squat",
    "muscle_group": "legs",
    "has_pose_check": true
  }
}
```

#### 5.1.2 Response thành công danh sách (Paginated Collection)
```json
{
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Barbell Squat",
      "muscle_group": "legs"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 85,
    "last_page": 5
  }
}
```

#### 5.1.3 Response lỗi tiêu chuẩn (Standard Error Envelope)
HTTP Status: `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu gửi lên không hợp lệ.",
    "details": {
      "weight_kg": ["Trường cân nặng phải là số dương lớn hơn 0."],
      "log_date": ["Định dạng ngày không hợp lệ. Chuẩn yêu cầu YYYY-MM-DD."]
    }
  }
}
```

Mã lỗi hệ thống chuẩn hóa (`code`):
- `UNAUTHENTICATED`: Chưa đăng nhập hoặc token không hợp lệ / hết hạn (`401`).
- `FORBIDDEN`: Không có quyền truy cập tài nguyên của người khác (`403`).
- `NOT_FOUND`: Tài nguyên không tồn tại (`404`).
- `VALIDATION_ERROR`: Dữ liệu đầu vào sai cấu trúc (`422`).
- `IDEMPOTENCY_CONFLICT`: Request trùng lặp đang trong quá trình xử lý (`409`).
- `FILE_TOO_LARGE`: Dung lượng file upload vượt quá giới hạn cho phép (`413`).
- `UNSUPPORTED_MEDIA_TYPE`: Định dạng file không được hỗ trợ (`415`).
- `AI_SERVICE_UNAVAILABLE`: Sự cố kết nối AI / Đã kích hoạt fallback (`503`).
- `INTERNAL_SERVER_ERROR`: Lỗi hệ thống ngoài dự kiến (`500`).

---

### 5.2 Cơ chế phân trang (Pagination Specification)
Tất cả các API trả về danh sách đều áp dụng chuẩn phân trang sau:
- **Query Parameters:**
  - `page`: Số trang hiện tại (Integer >= 1, mặc định: `1`).
  - `per_page`: Số bản ghi mỗi trang (Integer từ 1 đến 100, mặc định: `20`).
- **Chính sách an toàn:** Backend cưỡng chế giới hạn tối đa `per_page <= 100`. Nếu client truyền `per_page=500`, backend tự động ép về `100` để ngăn chặn tấn công vét cạn bộ nhớ (Memory Exhaustion DoS).

---

### 5.3 Cơ chế đảm bảo tính lũy kế (Idempotency-Key Specification)

Để xử lý triệt để tình huống mạng chập chờn trên ứng dụng Mobile khiến app tự động retry request, hệ thống áp dụng cơ chế **Idempotency-Key** cho các phương thức POST nhạy cảm.

#### 5.3.1 Các endpoint bắt buộc áp dụng
- `POST /api/v1/workout-logs`
- `POST /api/v1/workout-logs/{id}/sets`
- `POST /api/v1/nutrition-logs`
- `POST /api/v1/pose-check/upload`
- `POST /api/v1/ai/exercise-plan`
- `POST /api/v1/ai/meal-plan`

#### 5.3.2 Quy trình xử lý tại Laravel Backend Middleware (`IdempotencyMiddleware`)
1. Client sinh một chuỗi UUIDv4 ngẫu nhiên và gửi kèm trong HTTP Header:  
   `Idempotency-Key: 7b36f78a-c45b-4328-86d9-f56f1dc7c50a`
2. Server trích xuất `key_name = "idempotency:" . $user->id . ":" . $idempotencyKey`.
3. Server thực hiện atomic lock trên Redis:
   - **Trường hợp 1 (Key chưa tồn tại):** Ghi nhận trạng thái `status: 'IN_PROGRESS'` với thời gian hết hạn TTL = 120 giây (phòng trường hợp server crash giữa chừng). Tiếp tục cho request chạy vào Controller.
   - **Trường hợp 2 (Key tồn tại và đang `IN_PROGRESS`):** Một request giống hệt đang được xử lý song song. Server lập tức trả về HTTP `409 Conflict` với mã lỗi `IDEMPOTENCY_CONFLICT`.
   - **Trường hợp 3 (Key tồn tại với trạng thái `COMPLETED`):** Server bỏ qua Controller, lấy nguyên vẹn `HTTP status code` và `Response JSON body` đã lưu trong Redis để trả về ngay cho client.
4. Khi Controller thực thi thành công: Cập nhật Redis key sang `status: 'COMPLETED'`, đính kèm toàn bộ response payload và gia hạn TTL = 86400 giây (24 giờ).

---

### 5.4 Danh mục Endpoints đầy đủ

#### 5.4.1 Nhóm Authentication (`/api/v1/auth`)
| Method | Endpoint | Headers bắt buộc | Mô tả chi tiết |
|---|---|---|---|
| `POST` | `/auth/register` | Content-Type | Đăng ký tài khoản, cấp token đầu tiên |
| `POST` | `/auth/login` | Content-Type | Đăng nhập bằng email/password, trả Bearer Token |
| `POST` | `/auth/refresh` | Authorization | Thu hồi token hiện tại, cấp token mới thay thế |
| `POST` | `/auth/logout` | Authorization | Thu hồi token hiện tại của thiết bị |
| `POST` | `/auth/logout-all` | Authorization | Thu hồi toàn bộ session token trên mọi thiết bị |
| `POST` | `/auth/forgot-password`| Content-Type | Gửi link/token reset mật khẩu qua email |
| `POST` | `/auth/reset-password` | Content-Type | Cập nhật mật khẩu mới bằng token reset |
| `GET` | `/auth/me` | Authorization | Lấy thông tin profile người dùng hiện tại |
| `PUT` | `/auth/profile` | Authorization | Cập nhật thông tin thể chất (weight, height, goal) |

#### 5.4.2 Nhóm Tracking: Workout, Nutrition, Metrics (`/api/v1`)
| Method | Endpoint | Idempotency | Phân trang | Mô tả chi tiết |
|---|---|---|---|---|
| `GET` | `/workout-logs` | Không | Có (`page`, `per_page`) | Lấy danh sách nhật ký tập luyện (lọc theo khoảng ngày) |
| `POST` | `/workout-logs` | **Có** | Không | Tạo mới buổi tập (chỉ tạo header nhật ký) |
| `GET` | `/workout-logs/{id}` | Không | Không | Xem chi tiết buổi tập và danh sách sets đi kèm |
| `POST` | `/workout-logs/{id}/sets`| **Có** | Không | Thêm một set bài tập mới vào buổi tập |
| `DELETE`| `/workout-logs/{id}` | Không | Không | Xóa mềm nhật ký buổi tập (Cascade sets) |
| `GET` | `/nutrition-logs` | Không | Có (`page`, `per_page`) | Lấy danh sách thực phẩm đã nạp theo ngày |
| `POST` | `/nutrition-logs` | **Có** | Không | Thêm mục dinh dưỡng mới (calories, macros) |
| `DELETE`| `/nutrition-logs/{id}` | Không | Không | Xóa mục dinh dưỡng |
| `GET` | `/body-metrics` | Không | Có (`page`, `per_page`) | Lịch sử chỉ số cân nặng, mỡ cơ thể |
| `POST` | `/body-metrics` | Không | Không | Ghi nhận cân nặng/chỉ số mới trong ngày (Upsert) |
| `GET` | `/progress/summary` | Không | Không | Tổng hợp biểu đồ tiến độ (`range=7d`, `30d`, `90d`) |

#### 5.4.3 Nhóm Kho bài tập cộng đồng (`/api/v1/exercises`)
| Method | Endpoint | Auth | Phân trang | Mô tả chi tiết |
|---|---|---|---|---|
| `GET` | `/exercises` | Public | Có | Danh sách bài tập (Filter: `muscle_group`, `difficulty`, `has_pose_check`, `q`) |
| `GET` | `/exercises/{id}` | Public | Không | Thông tin chi tiết kỹ thuật bài tập |
| `POST` | `/exercises` | User | Không | Người dùng đóng góp bài tập mới (status mặc định: `under_review`) |
| `POST` | `/exercises/{id}/ratings` | User | Không | Đánh giá 1-5 sao và comment (Unique 1 user/1 bài) |
| `POST` | `/exercises/{id}/reports` | User | Không | Báo cáo bài tập có nội dung nguy hiểm/sai lệch |

#### 5.4.4 Nhóm Quản trị viên (`/api/v1/admin`)
| Method | Endpoint | Quyền hạn | Mô tả chi tiết |
|---|---|---|---|
| `GET` | `/admin/exercises/reports` | Admin | Danh sách báo cáo vi phạm cần duyệt (kèm phân trang) |
| `PATCH` | `/admin/exercises/{id}/status` | Admin | Duyệt bài (`active`), từ chối (`rejected`), gỡ bỏ (`removed`) |
| `PATCH` | `/admin/exercises/reports/{id}`| Admin | Xử lý báo cáo (`resolved`, `dismissed`) |

#### 5.4.5 Nhóm AI Hub (`/api/v1/ai`)
| Method | Endpoint | Idempotency | Rate Limit | Mô tả chi tiết |
|---|---|---|---|---|
| `POST` | `/ai/exercise-plan` | **Có** | 5 req/phút | Sinh lịch tập tối ưu theo thể trạng và mục tiêu |
| `POST` | `/ai/meal-plan` | **Có** | 5 req/phút | Sinh thực đơn dinh dưỡng cá nhân hóa |

#### 5.4.6 Nhóm Pose Check (`/api/v1/pose-check`)
| Method | Endpoint | Mode | Mô tả chi tiết |
|---|---|---|---|
| `POST` | `/pose-check/realtime/result` | Realtime | Nhận kết quả tổng kết buổi tập real-time từ client sau khi kết thúc set (reps, score, issues) để lưu DB. |
| `POST` | `/pose-check/upload` | Upload | Upload file video (`multipart/form-data`), kiểm tra bảo mật, đẩy vào S3 + Queue, trả về `session_id`. |
| `GET` | `/pose-check/sessions/{id}` | Upload | Polling kiểm tra trạng thái xử lý video (`pending` → `processing` → `completed`/`failed`) và nhận kết quả chi tiết. |
| `GET` | `/pose-check/sessions` | Chung | Xem lịch sử các lần kiểm tra form (hỗ trợ phân trang). |

> [!NOTE]
> **Thay đổi Endpoint Realtime:** Trong phiên bản cũ v1.0, endpoint mang tên `POST /pose-check/realtime/frame`. Trên thực tế, hệ thống không bao giờ stream từng frame lên server. Do đó, endpoint được đổi tên thành `POST /pose-check/realtime/result` để phản ánh chính xác ngữ nghĩa kỹ thuật. Để đảm bảo tính tương thích ngược (Backward Compatibility) với các phiên bản Mobile app cũ đã phát hành, Laravel Route định nghĩa alias route trỏ chung về cùng Controller action.

---

## 6. KIẾN TRÚC AI HUBS & JSON SCHEMAS

### 6.1 Quy trình điều phối AI an toàn (AI Orchestration Pipeline)

```
[Client Request]
       |
       v
+-------------------------------------------------------------+
| 1. Laravel AI Controller & Context Builder                  |
|    - Trích xuất dữ liệu thể trạng từ DB (Tuổi, BMI, Mục tiêu)|
|    - Loại bỏ PII (Tên, Email, ID định danh)                 |
|    - Khóa Idempotency-Key chống duplicate requests          |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 2. Gọi External LLM API (Structured JSON Mode)              |
|    - System Prompt cưỡng chế JSON format                    |
|    - Temperature: 0.2 (Giảm biến thiên cú pháp)             |
|    - Timeout: 15 giây                                       |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 3. Sanitization & JSON Parsing                              |
|    - Cắt bỏ Markdown code fences (```json ... ```)          |
|    - Chuyển chuỗi JSON sang cấu trúc mảng PHP               |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 4. Xác thực Cấu trúc qua JSON Schema (Lớp 1)                |
|    - Sử dụng Thư viện Opis / JustinRainbow Schema Validator |
|    - Kiểm tra additionalProperties: false, required, types  |
+---------------+------------------------------+--------------+
                | Hợp lệ                       | Vi phạm Schema
                v                              v
+--------------------------------+   +------------------------+
| 5. Xác thực Ngữ nghĩa          |   | 6. Recovery Pipeline   |
|    (Semantic Validation - Lớp 2|   |    - Lớp 1: Prompt     |
|    - Kiểm tra exercise_id tồn  |   |      Correction Retry   |
|      tại & active trong DB     |   |    - Lớp 2: JSON Repair|
|    - Calories = Protein*4 +    |   |    - Lớp 3: Static Goal|
|      Carbs*4 + Fat*9 (+/- 10%) |   |      Fallback Template |
|    - Không có macro âm         |   +-----------+------------+
+---------------+----------------+               |
                | Thành công                     | Fallback hoàn tất
                v                                v
+-------------------------------------------------------------+
| 7. Ghi nhận Database & Phản hồi Client                     |
|    - Lưu bản ghi vào ai_recommendations                     |
|    - Status: 'success' hoặc 'fallback_used'                 |
|    - Trả JSON chuẩn hóa về Web / Mobile                     |
+-------------------------------------------------------------+
```

---

### 6.2 Định nghĩa JSON Schema chuẩn

#### 6.2.1 Schema — Exercise Plan (`/api/v1/ai/exercise-plan`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ExercisePlanResponse",
  "type": "object",
  "additionalProperties": false,
  "required": ["plan_name", "goal", "duration_weeks", "sessions"],
  "properties": {
    "plan_name": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "goal": {
      "type": "string",
      "enum": ["lose_weight", "gain_muscle", "maintain"]
    },
    "duration_weeks": {
      "type": "integer",
      "minimum": 1,
      "maximum": 12
    },
    "sessions": {
      "type": "array",
      "minItems": 1,
      "maxItems": 7,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["day_label", "focus_area", "exercises"],
        "properties": {
          "day_label": {
            "type": "string",
            "minLength": 2,
            "maxLength": 30
          },
          "focus_area": {
            "type": "string",
            "minLength": 2,
            "maxLength": 50
          },
          "exercises": {
            "type": "array",
            "minItems": 1,
            "maxItems": 15,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": ["exercise_name", "exercise_id", "sets", "reps", "rest_seconds"],
              "properties": {
                "exercise_name": {
                  "type": "string",
                  "minLength": 2,
                  "maxLength": 100
                },
                "exercise_id": {
                  "type": ["string", "null"],
                  "format": "uuid"
                },
                "sets": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 10
                },
                "reps": {
                  "type": "string",
                  "pattern": "^[0-9]{1,3}(-[0-9]{1,3})?(\\s*(reps|s|sec|min))?$"
                },
                "rest_seconds": {
                  "type": "integer",
                  "minimum": 15,
                  "maximum": 300
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### 6.2.2 Schema — Meal Plan (`/api/v1/ai/meal-plan`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MealPlanResponse",
  "type": "object",
  "additionalProperties": false,
  "required": ["target_calories", "macros", "meals"],
  "properties": {
    "target_calories": {
      "type": "integer",
      "minimum": 800,
      "maximum": 6000
    },
    "macros": {
      "type": "object",
      "additionalProperties": false,
      "required": ["protein_g", "carbs_g", "fat_g"],
      "properties": {
        "protein_g": { "type": "integer", "minimum": 0, "maximum": 500 },
        "carbs_g": { "type": "integer", "minimum": 0, "maximum": 800 },
        "fat_g": { "type": "integer", "minimum": 0, "maximum": 300 }
      }
    },
    "meals": {
      "type": "array",
      "minItems": 2,
      "maxItems": 6,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["meal_type", "items"],
        "properties": {
          "meal_type": {
            "type": "string",
            "enum": ["breakfast", "lunch", "dinner", "snack"]
          },
          "items": {
            "type": "array",
            "minItems": 1,
            "maxItems": 10,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": ["food_name", "calories", "protein_g", "carbs_g", "fat_g"],
              "properties": {
                "food_name": { "type": "string", "minLength": 2, "maxLength": 100 },
                "calories": { "type": "integer", "minimum": 0, "maximum": 2000 },
                "protein_g": { "type": "integer", "minimum": 0, "maximum": 200 },
                "carbs_g": { "type": "integer", "minimum": 0, "maximum": 300 },
                "fat_g": { "type": "integer", "minimum": 0, "maximum": 150 }
              }
            }
          }
        }
      }
    }
  }
}
```

#### 6.2.3 Schema — Pose Feedback (`feedback_json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PoseFeedbackResponse",
  "type": "object",
  "additionalProperties": false,
  "required": ["rep_count", "score", "rep_feedback"],
  "properties": {
    "rep_count": {
      "type": "integer",
      "minimum": 0,
      "maximum": 500
    },
    "score": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "rep_feedback": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["rep_number", "score", "issues"],
        "properties": {
          "rep_number": {
            "type": "integer",
            "minimum": 1
          },
          "score": {
            "type": "number",
            "minimum": 0,
            "maximum": 100
          },
          "timestamp_sec": {
            "type": ["number", "null"],
            "minimum": 0
          },
          "issues": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": ["issue_code", "severity", "message"],
              "properties": {
                "issue_code": {
                  "type": "string",
                  "enum": [
                    "KNEE_VALGUS",
                    "INSUFFICIENT_DEPTH",
                    "EXCESSIVE_FORWARD_LEAN",
                    "ROUNDED_BACK",
                    "FLARING_ELBOWS",
                    "HIPS_SAGGING",
                    "HIPS_PIKING"
                  ]
                },
                "severity": {
                  "type": "string",
                  "enum": ["low", "medium", "high"]
                },
                "message": {
                  "type": "string",
                  "maxLength": 200
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### 6.3 Cơ chế Fallback 3 lớp nâng cao (Triple-Layer Fallback Architecture)

Hệ thống cam kết: **Frontend không bao giờ nhận raw error hoặc dữ liệu sai định dạng từ LLM.**

```
+-----------------------------------------------------------------+
| LLM Raw Response Received                                       |
+-------------------------------+---------------------------------+
                                |
                                v
                +-------------------------------+
                | JSON Schema & Semantic Check  |
                +---------------+---------------+
                                |
                +---------------+---------------+
                | Valid                         | Invalid / Malformed
                v                               v
       +------------------+           +-------------------+
       | Return Validated |           | LAYER 1:          |
       | JSON to User     |           | Local JSON Repair |
       +------------------+           +---------+---------+
                                                |
                               +----------------+----------------+
                               | Sửa thành công                  | Không thể sửa
                               v                                 v
                      +------------------+             +-------------------+
                      | Check Schema     |             | LAYER 2:          |
                      | Validated -> OK  |             | Prompt Retry (x1) |
                      +------------------+             +---------+---------+
                                                                 |
                                                +----------------+----------------+
                                                | Retry thành công                | Vẫn thất bại / Timeout
                                                v                                 v
                                       +------------------+             +-------------------+
                                       | Return Validated |             | LAYER 3:          |
                                       | JSON to User     |             | Static Expert     |
                                       +------------------+             | Fallback Template |
                                                                        +---------+---------+
                                                                                  |
                                                                                  v
                                                                        +-------------------+
                                                                        | status =          |
                                                                        | 'fallback_used'   |
                                                                        +-------------------+
```

- **Lớp 1 — Local JSON Repair (Sửa lỗi cục bộ không tốn chi phí gọi lại AI):**
  - Xử lý các lỗi phổ biến: Loại bỏ chuỗi ```json bao ngoài, cắt tỉa khoảng trắng đầu/cuối.
  - Sửa lỗi trailing commas (dấu phẩy thừa trước ngoặc nhọn/ngoặc vuông) thông qua Regex an toàn trước khi decode.
- **Lớp 2 — Prompt Correction Retry (Thử lại có kèm phản hồi lỗi):**
  - Giới hạn: **Duy nhất 1 lần retry**. Timeout: 10 giây.
  - Gửi lại request cho LLM nhưng bổ sung message: *"Đầu ra trước đó của bạn vi phạm JSON Schema tại các vị trí: [chi tiết lỗi]. Hãy sửa lại chính xác cấu trúc."*
- **Lớp 3 — Static Goal-Based Fallback (Mẫu dự phòng chuẩn hóa):**
  - Kích hoạt khi Layer 1 & 2 thất bại hoặc AI Gateway gặp sự cố mạng (HTTP 5xx, Network Timeout).
  - Trích xuất template mẫu đã được các chuyên gia thể hình/dinh dưỡng cấu hình sẵn trong database/config, tương ứng với `goal` của user (`lose_weight`, `gain_muscle`, `maintain`).
  - Ghi nhận trạng thái bản ghi trong `ai_recommendations`: `status = 'fallback_used'`, đồng thời lưu mã lỗi `fallback_reason`.

---

### 6.4 Giám sát & An toàn dữ liệu AI (Observability & Privacy)
- **Sanitization (Khử trùng dữ liệu nhạy cảm):**
  - Tuyệt đối không gửi các trường PII (Personally Identifiable Information) như: `id`, `name`, `email`, `avatar_url`, `birth_date` dạng thô lên LLM.
  - Context truyền vào System Prompt được chuẩn hóa thành chỉ số ẩn danh:  
    `{ "age": 26, "gender": "male", "bmi": 22.4, "goal": "gain_muscle", "activity_level": "moderate" }`.
- **Audit Logging:** Mỗi lần gọi AI đều được ghi vết tại `ai_recommendations` với các chỉ số đo lường:
  - `request_id`, `user_id`, `model_used`, `latency_ms`, `prompt_tokens`, `completion_tokens`, `status`.
  - Không bao giờ log API Key, token authorization hoặc prompt thô chứa dữ liệu riêng tư của người dùng vào File Logs hệ thống.

---

## 7. KIẾN TRÚC AI POSE CHECK & COMPUTER VISION

Hệ thống phân định ranh giới rõ rệt giữa Realtime Edge Feedback và Asynchronous Deep Video Analysis.

### 7.1 Luồng Realtime Pose Check (Edge Computing — 100% Client-Side)
- **Mục tiêu:** Độ trễ thấp (< 50ms), bảo vệ quyền riêng tư người dùng, không tiêu tốn băng thông máy chủ.
- **Cơ chế hoạt động:**
  1. Camera trên Web (HTML5 Video Element) hoặc Camera trên Mobile (CameraX / AVFoundation) quay khung hình bài tập.
  2. Mô hình Pose Detection on-device trích xuất 33 tọa độ xương (Landmarks):
     - **Web:** Chạy `@mediapipe/camera_utils` + `@mediapipe/pose` qua WebAssembly/WebGL.
     - **Mobile:** Chạy Google ML Kit Pose Detection hoặc MediaPipe On-Device SDK (iOS/Android).
  3. Client tính toán góc xoay khớp (Joint Angles) và so khớp với Rule Engine cục bộ.
  4. Đếm số rep và hiển thị gợi ý sửa lỗi trực tiếp trên giao diện màn hình.
  5. **Kết thúc buổi tập:** Client chỉ gửi duy nhất một payload JSON tóm tắt kết quả về server:
     `POST /api/v1/pose-check/realtime/result`
     ```json
     {
       "exercise_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
       "rep_count": 12,
       "score": 88.5,
       "feedback_json": { ... }
     }
     ```
- **Lưu ý:** Server **không lưu video**, chỉ lưu bản ghi đánh giá vào bảng `pose_check_sessions`.

---

### 7.2 Luồng Upload Video Pose Check (Asynchronous Server-Side Pipeline)
Dành cho người dùng muốn quay lại toàn bộ set tập ở góc quay rộng để nhận phân tích chi tiết từng giây chuyển động.

```
[Mobile/Web Client]
       |
       | 1. POST /api/v1/pose-check/upload (Video File <= 100MB)
       v
+-------------------------------------------------------------------+
| Laravel API Server                                                |
|  2. Validate File (Size <= 100MB, MIME: video/mp4, video/quicktime)|
|  3. Validate Magic Bytes (Chống giả mạo đuôi file)                |
|  4. Generate Safe S3 Key: "pose-videos/{userId}/{sessionId}.mp4"  |
|  5. Stream trực tiếp vào S3-Compatible Private Bucket             |
|  6. Insert pose_check_sessions (status='pending')                 |
|  7. Dispatch Job: ProcessPoseCheckJob(sessionId) -> Redis Queue   |
|  8. Return HTTP 202 Accepted {"data": {"session_id": "...",       |
|                                "status": "pending"}}              |
+-------------------------------------------------------------------+
       |
       | (Trạng thái Job lưu trong Redis Queue)
       v
+-------------------------------------------------------------------+
| Laravel Queue Worker                                              |
|  9. Nhặt Job từ Redis -> Cập nhật status='processing'             |
|  10. Tạo Pre-signed GET URL từ S3 (Hạn dùng 15 phút)              |
|  11. Chuyển giao Task cho Python Pose Worker qua Private Network   |
+---------------------------------+---------------------------------+
                                  |
               (Internal HTTP/RPC)|
                                  v
+-------------------------------------------------------------------+
| Python Pose Worker (FastAPI / OpenCV / MediaPipe)                 |
|  12. Nhận task: { session_id, video_presigned_url, rules_key }    |
|  13. Stream/Decode frames bằng OpenCV                             |
|  14. Chạy MediaPipe Pose trích xuất 33 Landmarks từng frame        |
|  15. Chạy Kinematic Rules Engine (Tính góc, xác định lỗi, đếm rep)|
|  16. Tính Score tổng thể và gắn Timestamp lỗi                     |
|  17. Trả về kết quả cấu trúc JSON cho Laravel Queue Worker        |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| Laravel Queue Worker (Hoàn tất)                                   |
|  18. Nhận kết quả -> Validate qua JSON Schema 6.2.3               |
|  19. Cập nhật PostgreSQL: feedback_json, score, status='completed'|
|  20. Xóa file video tạm trên worker disk nếu có                   |
+-------------------------------------------------------------------+
       |
       v
[Client Polling]
Client gọi GET /api/v1/pose-check/sessions/{id} mỗi 2.5s để lấy kết quả
```

---

### 7.3 Kinematic Rules Engine cho các bài tập chuẩn (MVP)

Quy tắc chấm điểm không phụ thuộc vào LLM mà dựa trên tính toán hình học giải phẫu học thể thao (Kinematics). Các ngưỡng góc được cấu hình độc lập trong file versioned config `pose_rules.json` để dễ dàng bảo trì, cập nhật.

#### 7.3.1 Công thức tính góc giữa 3 khớp xương
Cho 3 điểm mốc không gian $A, B, C$ với tọa độ $(x, y)$, góc tại khớp $B$ được tính theo công thức vector:
$$\theta = \arccos\left(\frac{\vec{BA} \cdot \vec{BC}}{|\vec{BA}| |\vec{BC}|}\right) \times \frac{180}{\pi}$$

#### 7.3.2 Bài tập 1: Squat (Quy tắc kiểm tra)
- **Khớp theo dõi:** Hông (Hip - 23/24), Gối (Knee - 25/26), Cổ chân (Ankle - 27/28), Vai (Shoulder - 11/12).
- **State Machine xác định Rep:**
  - `STATE_START`: Góc gối $\ge 160^\circ$ (Đứng thẳng).
  - `STATE_DESCENDING`: Góc gối giảm dần $< 140^\circ$.
  - `STATE_BOTTOM`: Điểm uốn góc nhỏ nhất. Nếu góc gối $\le 95^\circ$ $\rightarrow$ Hợp lệ (Đủ độ sâu).
  - `STATE_ASCENDING`: Góc gối tăng trở lại.
  - `STATE_COMPLETED`: Góc gối trở lại $\ge 160^\circ$ $\rightarrow$ Ghi nhận +1 Rep.
- **Phát hiện lỗi kỹ thuật (Fault Detection):**
  - `INSUFFICIENT_DEPTH`: Tại điểm uốn thấp nhất, góc gối $> 100^\circ$ (Chưa xuống đủ sâu).
  - `EXCESSIVE_FORWARD_LEAN`: Góc nghiêng thân trên (Đường thẳng Thân-Hông so với phương thẳng đứng) $> 45^\circ$.
  - `KNEE_VALGUS`: Khoảng cách giữa 2 đầu gối bị thu hẹp đáng kể so với khoảng cách giữa 2 cổ chân khi đứng dậy (Gối sụp vào trong).

#### 7.3.3 Bài tập 2: Push-up (Hít đất)
- **Khớp theo dõi:** Vai (11/12), Khuỷu tay (Elbow - 13/14), Cổ tay (Wrist - 15/16), Hông (23/24), Mắt cá chân (27/28).
- **State Machine xác định Rep:**
  - `STATE_TOP`: Góc khuỷu tay $\ge 160^\circ$ (Khóa tay).
  - `STATE_BOTTOM`: Góc khuỷu tay $\le 90^\circ$ (Ngực chạm sát đất).
- **Phát hiện lỗi kỹ thuật:**
  - `FLARING_ELBOWS`: Cùi chỏ mở rộng vuông góc với thân người $> 75^\circ$ (Nguy cơ chấn thương khớp vai).
  - `HIPS_SAGGING`: Góc giữa Vai - Hông - Mắt cá chân bị võng $< 160^\circ$ (Võng lưng dưới).
  - `HIPS_PIKING`: Góc giữa Vai - Hông - Chân nhô cao $> 200^\circ$ (Nhô mông lên cao).

#### 7.3.4 Bài tập 3: Plank (Tư thế giữ tĩnh)
- **Theo dõi thời gian giữ (Hold Duration):** Tính bằng giây.
- **Phát hiện lỗi kỹ thuật:**
  - Giữ thẳng đường trục thân người (Đường thẳng nối Vai - Hông - Gót chân).
  - Nếu góc Vai-Hông-Mắt cá lệch khỏi dải $[165^\circ, 180^\circ]$ liên tục quá 3 giây $\rightarrow$ Ghi nhận cảnh báo lỗi tư thế tương ứng (`HIPS_SAGGING` hoặc `HIPS_PIKING`).

---

## 8. KIẾN TRÚC HÀNG ĐỢI & XỬ LÝ NỀN (LARAVEL QUEUE + REDIS)

Hệ thống sử dụng **Laravel Queue** kết hợp **Redis backend** để xử lý toàn bộ các tác vụ nền tảng.

### 8.1 Cấu hình & Vận hành Queue
- **Queue Connection:** `redis`.
- **Tên Queue phân định:**
  - `default`: Gửi email xác thực, tính toán số liệu thống kê ngầm.
  - `pose_processing`: Dành riêng cho xử lý video phân tích tư thế (yêu cầu cấu hình tài nguyên độc lập).
- **Các thông số kỹ thuật cấu hình Job (`ProcessPoseCheckJob`):**
  - `tries = 2`: Tối đa 2 lần thử nếu gặp lỗi mạng kết nối sang Python Worker.
  - `timeout = 180`: Giới hạn 180 giây cho toàn bộ tiến trình phân tích video. Nếu vượt quá, job tự động bị kill để giải phóng tài nguyên.
  - `backoff = [10, 30]`: Thời gian chờ trước khi retry (lần 1: 10 giây, lần 2: 30 giây).
- **Xử lý Thất bại (Failure & Dead-Letter Handling):**
  - Nếu Job thất bại sau toàn bộ số lần thử (`failed()` method kích hoạt):
    - Cập nhật trạng thái database: `pose_check_sessions.status = 'failed'`.
    - Ghi nhận `error_code = 'WORKER_TIMEOUT'` hoặc `'PROCESSING_ERROR'`.
    - Thông tin lỗi chi tiết được ghi tự động vào bảng `failed_jobs` của Laravel để Admin tra cứu.

### 8.2 Cơ chế giao tiếp giữa Laravel Queue Worker và Python Pose Worker
Lựa chọn kiến trúc tối ưu cho giai đoạn MVP đến Scale-up:
- **Mô hình triển khai:** **Internal Private REST Microservice**.
- **Lý do lựa chọn:** Giữ ranh giới rõ ràng (*Decoupling*) giữa ngôn ngữ PHP và Python. Laravel Queue Worker đóng vai trò điều phối nghiệp vụ (Orchestrator), còn Python Pose Worker là bộ xử lý tính toán thuần túy (Stateless Compute Engine).
- **Cơ chế gọi:**
  ```php
  // Bên trong app/Jobs/ProcessPoseCheckJob.php
  $response = Http::timeout(150)
      ->baseUrl(config('services.pose_worker.url'))
      ->post('/v1/process-video', [
          'session_id'    => $this->sessionId,
          'video_url'     => Storage::disk('s3')->temporaryUrl($session->s3_object_key, now()->addMinutes(15)),
          'exercise_type' => $session->exercise->pose_rules_key,
      ]);
  ```
- Toàn bộ giao tiếp diễn ra bên trong mạng riêng nội bộ (Docker Network / Kubernetes Private Cluster IP), tuyệt đối không mở port ra Internet.

---

## 9. QUẢN LÝ TÀI NGUYÊN S3 OBJECT STORAGE

Hệ thống cam kết: **Không bao giờ lưu file nhị phân (Binary video/audio) trực tiếp trong PostgreSQL.** Cơ sở dữ liệu chỉ quản lý siêu dữ liệu (Metadata).

### 9.1 Cấu hình Private Bucket & Đường dẫn lưu trữ
- **Quyền hạn Bucket:** Toàn bộ bucket ở chế độ riêng tư (`Block all public access = true`).
- **Quy tắc đặt tên Object Key an toàn (Chống xung đột và dò quét):**
  `pose-videos/{user_id}/{session_id}_{hash_sha256}.mp4`
- **Các thông tin metadata bắt buộc lưu trong PostgreSQL:**
  - `s3_bucket`: Tên bucket chứa file.
  - `s3_object_key`: Khóa định danh file.
  - `video_mime`: Chuẩn MIME đã kiểm tra (vd: `video/mp4`).
  - `video_size_bytes`: Kích thước file theo bytes.

### 9.2 Cơ chế Pre-signed URL cho Client xem lại video
Khi người dùng muốn xem lại video bài tập đã upload kèm đánh giá lỗi form:
1. Client gọi: `GET /api/v1/pose-check/sessions/{id}`.
2. Laravel kiểm tra quyền sở hữu (`$user->id === $session->user_id`).
3. Laravel sinh một đường dẫn Pre-signed tạm thời có thời hạn sống ngắn:
   ```php
   $temporaryUrl = Storage::disk('s3')->temporaryUrl(
       $session->s3_object_key,
       now()->addMinutes(30) // Link tự hủy sau 30 phút
   );
   ```
4. Client nhận link và truyền vào trình phát video. Sau 30 phút, link tự động vô hiệu lực, ngăn chặn rò rỉ dữ liệu riêng tư.

### 9.3 Chính sách vòng đời dữ liệu (Lifecycle Management Policy)
Để tối ưu chi phí lưu trữ S3:
- Cấu hình Lifecycle Rule trên Bucket: Các video gốc trong thư mục `pose-videos/` sẽ tự động chuyển đổi sang lớp lưu trữ chi phí thấp (S3 Infrequent Access) sau 30 ngày và tự động xóa vĩnh viễn sau 90 ngày nếu người dùng không có yêu cầu lưu trữ dài hạn. Dữ liệu phân tích `feedback_json` trong PostgreSQL vẫn được giữ nguyên vẹn.

---

## 10. REALTIME VS UPLOAD POSE CHECK & POLLING TRADE-OFFS

### 10.1 So sánh 2 chế độ Pose Check

| Tiêu chí | Realtime Pose Check | Upload Video Pose Check |
|---|---|---|
| **Vị trí xử lý** | Client-side (Browser / Mobile on-device) | Server-side (Python Pose Worker) |
| **Công nghệ** | MediaPipe JS / On-device ML Kit | OpenCV + MediaPipe Python Server |
| **Băng thông mạng** | 0 KB trong suốt buổi tập (Chỉ gửi 1 JSON ~2KB khi xong) | Upload file dung lượng 10MB - 100MB |
| **Độ trễ phản hồi** | Tức thời (< 50ms per frame) | Bất đồng bộ (10 - 45 giây tùy độ dài video) |
| **Phạm vi phân tích** | Phản hồi tại chỗ, đếm rep, nhắc lỗi tức thì | Báo cáo chi tiết toàn diện, tua lại video theo timestamp lỗi |
| **Lưu trữ video** | Không lưu trữ | Lưu trữ trên S3 Private Bucket |

### 10.2 Chiến lược Polling vs SSE (Server-Sent Events) cho Video Upload
Đối với luồng Upload Video:
- **Lựa chọn cho giai đoạn MVP:** **Short Polling**.
  - Client gửi `GET /api/v1/pose-check/sessions/{id}` mỗi **2.5 giây**.
  - **Lý do lựa chọn:** Triển khai cực kỳ đơn giản, hoạt động tốt qua mọi tầng proxy/firewall trên mạng di động 4G/5G, không yêu cầu duy trì persistent connection state trên Laravel API Server, dễ dàng scale-out không trạng thái (Stateless API).
- **Lộ trình nâng cấp sau MVP (Phase 2):** **Server-Sent Events (SSE)**.
  - Khi lượng người dùng tăng cao, chuyển sang endpoint `GET /api/v1/pose-check/sessions/{id}/events` để server chủ động đẩy thông báo khi job hoàn thành, giảm tải 80% lượng HTTP requests thăm dò từ client.

---

## 11. CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

### 11.1 Cấu trúc mã nguồn Laravel Backend (`/backend`)
Tổ chức thư mục tuân thủ chặt chẽ chuẩn mực idiomatic của Laravel 11, đảm bảo tính phân tách trách nhiệm (Separation of Concerns).

```
backend/
├── app/
│   ├── Enums/                     # Enum định danh hệ thống (Goal, MealType, SessionStatus)
│   │   ├── FitnessGoal.php
│   │   ├── MealType.php
│   │   └── PoseSessionStatus.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── AuthController.php
│   │   │           ├── WorkoutLogController.php
│   │   │           ├── NutritionLogController.php
│   │   │           ├── ExerciseController.php
│   │   │           ├── AiController.php
│   │   │           ├── PoseCheckController.php
│   │   │           └── Admin/
│   │   │               └── ExerciseModerationController.php
│   │   ├── Middleware/
│   │   │   ├── IdempotencyMiddleware.php     # Xử lý Idempotency-Key
│   │   │   └── EnsureUserIsAdmin.php         # Kiểm tra quyền Admin
│   │   ├── Requests/                         # Form Requests validate dữ liệu
│   │   │   ├── Auth/
│   │   │   ├── Workout/
│   │   │   └── PoseCheck/
│   │   │       └── UploadPoseVideoRequest.php
│   │   └── Resources/                        # API Resources biến đổi dữ liệu trả về
│   │       ├── WorkoutLogResource.php
│   │       ├── ExerciseResource.php
│   │       └── PoseCheckSessionResource.php
│   ├── Jobs/
│   │   └── ProcessPoseCheckJob.php           # Queue Job điều phối phân tích video
│   ├── Models/                               # Eloquent Models & Relationships
│   │   ├── User.php
│   │   ├── Exercise.php
│   │   ├── WorkoutLog.php
│   │   ├── WorkoutLogSet.php
│   │   ├── NutritionLog.php
│   │   ├── BodyMetric.php
│   │   ├── AiRecommendation.php
│   │   └── PoseCheckSession.php
│   ├── Policies/                             # Phân quyền truy cập tài nguyên
│   │   ├── WorkoutLogPolicy.php
│   │   └── PoseCheckSessionPolicy.php
│   └── Services/                             # Business Logic Services
│       ├── Ai/
│       │   ├── AiOrchestrationService.php    # Quản lý gọi LLM & Fallback
│       │   ├── SchemaValidator.php           # Validate JSON Schema
│       │   └── StaticPlanFallback.php        # Mẫu fallback tĩnh
│       └── Pose/
│           ├── PoseWorkerClient.php          # Giao tiếp HTTP với Python Worker
│           └── S3VideoStorageService.php     # Tương tác lưu trữ và Pre-signed URLs
├── config/
│   ├── ai.php                                # Cấu hình LLM model, token, timeout
│   ├── pose.php                              # Cấu hình worker URL và rules
│   └── filesystems.php
├── database/
│   ├── migrations/                           # Toàn bộ database migrations
│   └── seeders/
├── routes/
│   └── api.php                               # Định nghĩa endpoints /api/v1
└── tests/
    ├── Feature/                              # Tests chức năng API
    └── Unit/                                 # Tests logic nghiệp vụ
```

### 11.2 Cấu trúc mã nguồn Python Pose Worker (`/pose-worker`)

```
pose-worker/
├── app/
│   ├── cv/
│   │   ├── frame_extractor.py     # Đọc video qua OpenCV, tối ưu hóa FPS
│   │   ├── landmark_detector.py   # MediaPipe Pose pipeline
│   │   └── angle_math.py          # Tính toán vector học và góc xoay khớp
│   ├── rules/
│   │   ├── base_rule.py           # Interface cho các bài tập
│   │   ├── squat_rule.py          # Rule kinematics Squat
│   │   ├── pushup_rule.py         # Rule kinematics Push-up
│   │   └── plank_rule.py          # Rule kinematics Plank
│   ├── schemas/
│   │   ├── request.py             # Pydantic schema cho task nhận từ Laravel
│   │   └── response.py            # Pydantic schema cho feedback_json
│   ├── config.py                  # Ngưỡng góc và cài đặt xử lý
│   └── main.py                    # FastAPI server (Lắng nghe cổng nội bộ)
├── Dockerfile
└── requirements.txt
```

---

## 12. CHIẾN LƯỢC KIỂM THỬ TOÀN DIỆN (TESTING STRATEGY)

Hệ thống thiết lập bộ test tự động (Automated Test Suite) bao phủ từ Unit Test đến Integration Test.

### 12.1 Ma trận kiểm thử cốt lõi (Core Test Scenarios)

| STT | Kịch bản kiểm thử (Test Case) | Tầng thực hiện | Mục tiêu kiểm chứng |
|---|---|---|---|
| 1 | **LLM trả JSON chuẩn** | Feature Test | Laravel parse thành công, Schema hợp lệ, ghi `status='success'` vào DB và trả HTTP 200. |
| 2 | **LLM trả JSON sai schema (Lần 1)** | Feature Test | Kích hoạt Lớp 1 (Retry), LLM sửa đúng ở lần 2 $\rightarrow$ Trả kết quả hợp lệ, ghi nhận retry. |
| 3 | **LLM lỗi toàn diện / Timeout** | Feature Test | Kích hoạt Lớp 3 (Static Fallback), trả template chuẩn cho client, ghi nhận `status='fallback_used'`. |
| 4 | **Trùng lặp Idempotency-Key** | Feature Test | Gửi 2 request POST tạo workout log cùng key: Request 2 không tạo thêm bản ghi, trả lại response của request 1. |
| 5 | **Bảo mật phân quyền (Multi-tenancy)** | Security Test | User A gửi request đọc/xóa `pose_check_sessions` của User B $\rightarrow$ Nhận mã lỗi `403 Forbidden`. |
| 6 | **Upload Video quá dung lượng** | API Test | Upload file 105MB $\rightarrow$ Hệ thống reject lập tức với mã lỗi `413 Payload Too Large`. |
| 7 | **Upload sai định dạng file (Spoofed MIME)**| Security Test | Đổi đuôi file `.exe` thành `.mp4` $\rightarrow$ Kiểm tra Magic Bytes thất bại, trả về `422 Unprocessable Entity`. |
| 8 | **Queue Job gặp sự cố** | Integration Test | Giả lập Python Worker chết kết nối $\rightarrow$ Job retry đủ 2 lần, chuyển trạng thái session thành `failed`. |
| 9 | **Kiểm định góc Kinematics Pose** | Unit Test (Python) | Đưa tọa độ landmark mẫu bài Squat $\rightarrow$ Rule engine phát hiện chính xác lỗi `INSUFFICIENT_DEPTH`. |

---

## 13. TRIỂN KHAI HỆ THỐNG & DEVOPS (DEPLOYMENT ARCHITECTURE)

Hệ thống hỗ trợ đóng gói hoàn toàn bằng Docker, sẵn sàng scale độc lập giữa tầng Web API và Worker tính toán nặng.

### 13.1 Sơ đồ phân bố Containers (Container Architecture)

```
                       [ Incoming Traffic :443 ]
                                   |
                                   v
                      +--------------------------+
                      |   Nginx Reverse Proxy    |
                      +-------------+------------+
                                    |
                    +---------------+---------------+
                    | (HTTP)                        | (Static Storage)
                    v                               v
        +-----------------------+       +-----------------------+
        |   Laravel API App     |       |    MinIO / AWS S3     |
        |  (PHP 8.3-FPM/Octane) |       | (Private Object Store)|
        +-----------+-----------+       +-----------------------+
                    |
    +---------------+---------------+
    | (SQL)                         | (Jobs / Cache)
    v                               v
+-------+---------------+       +-------+---------------+
|   PostgreSQL 16       |       |      Redis 7          |
|   (Primary Data)      |       |  (Queues & Sessions)  |
+-----------------------+       +-----------+-----------+
                                            |
                                            | (Pops Job)
                                            v
                                +-----------------------+
                                |  Laravel Queue Worker |
                                +-----------+-----------+
                                            |
                        (Private Network RPC| :8001)
                                            v
                                +-----------------------+
                                |  Python Pose Worker   |
                                | (MediaPipe / OpenCV)  |
                                +-----------------------+
```

### 13.2 Nguyên tắc Scale-out độc lập trên Production
- **API Nodes (Laravel API):** Tăng giảm số lượng instances linh hoạt dựa trên lưu lượng người dùng (CPU/RAM metric) mà không ảnh hưởng tới hàng đợi.
- **Queue Workers (Laravel Queue):** Tăng cường số lượng worker threads khi có nhiều video chờ phân tích trong Redis.
- **Python Pose Workers:** Tách biệt trên các nodes có cấu hình CPU đa nhân hoặc GPU (nếu dùng Deep Learning) chuyên dụng. Không để việc decode video làm cạn kiệt tài nguyên xử lý request của API.

---

## 14. BIẾN MÔI TRƯỜNG CẤU HÌNH (ENVIRONMENT VARIABLES SPECIFICATION)

Dưới đây là danh mục các biến cấu hình chuẩn trong file `.env.example`:

```ini
# --- APPLICATION CONFIGURATION ---
APP_NAME="FitTrack AI"
APP_ENV=production
APP_KEY=base64:YOUR_32_CHARACTER_GENERATED_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.fittrack.example.com

# --- DATABASE CONFIGURATION (POSTGRESQL) ---
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=fittrack_prod
DB_USERNAME=fittrack_app
DB_PASSWORD=YOUR_SECURE_STRONG_DB_PASSWORD_HERE

# --- REDIS CONFIGURATION ---
REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PASSWORD=YOUR_REDIS_AUTH_PASSWORD_HERE
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1

# --- QUEUE & SESSION CONFIGURATION ---
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# --- AWS / S3-COMPATIBLE STORAGE ---
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=YOUR_S3_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_S3_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=fittrack-user-assets
AWS_USE_PATH_STYLE_ENDPOINT=false
# AWS_ENDPOINT=http://minio:9000  # Sử dụng dòng này khi chạy MinIO nội bộ

# --- SANCTUM AUTHENTICATION ---
SANCTUM_TOKEN_EXPIRATION=43200  # Token sống 30 ngày (phút)

# --- AI (LLM) GATEWAY CONFIGURATION ---
AI_PROVIDER=openai              # 'openai' | 'anthropic'
AI_API_KEY=sk-proj-YOUR_API_KEY_HERE
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_SECONDS=15
AI_MAX_RETRIES=1

# --- INTERNAL PYTHON POSE WORKER ---
POSE_WORKER_URL=http://python-pose-worker:8001
POSE_WORKER_TIMEOUT_SECONDS=180
POSE_VIDEO_MAX_SIZE_MB=100
POSE_VIDEO_MAX_DURATION_SEC=60
```

---

## 15. KẾ HOẠCH PHÁT TRIỂN & BACKLOG KỸ THUẬT (DEVELOPMENT BACKLOG)

Kế hoạch triển khai được tổ chức thành 16 hạng mục theo trình tự ưu tiên kỹ thuật:

```
[Phase 1: Foundation]
  1. Setup Laravel Core + API Structure + Sanctum
  2. PostgreSQL Migrations + Indexes + Soft Deletes
  3. Authentication & RBAC (Register, Login, Refresh, Password Reset)
  4. Core Business Domain APIs (Exercises, Workout & Nutrition Logs)
        |
        v
[Phase 2: Background & AI Integration]
  5. Redis Setup + Laravel Queue Worker Configuration
  6. AI Orchestrator Service + JSON Schema Validation
  7. Triple-Layer Fallback Architecture (Local Repair, Retry, Static Fallback)
  8. Idempotency-Key Middleware Engine
        |
        v
[Phase 3: Pose Check & Computer Vision Pipeline]
  9. S3 Storage Integration + Private Bucket + Pre-signed URL Strategy
  10. Realtime Pose Check Client Integration (Summary Result Endpoint)
  11. Python Pose Worker (OpenCV + MediaPipe Pipeline)
  12. Kinematic Rules Engine (Squat, Push-up, Plank)
  13. Upload Video Endpoint + Laravel Queue Worker Delegation
  14. Polling Session Results API
        |
        v
[Phase 4: Hardening & Release]
  15. Admin Moderation & Community Reporting APIs
  16. Automated Test Suite + Security Audit + Docker Compose Staging
```

---

## 16. NHỮNG THAY ĐỔI SO VỚI TÀI LIỆU V1.0 (CHANGELOG & ARCHITECTURAL COMPARISON)

Bảng đối chiếu toàn diện giúp đội ngũ kỹ sư và quản trị dự án nắm bắt chính xác các thay đổi cốt lõi giữa kiến trúc cũ và kiến trúc mới:

| Hạng mục | Tài liệu cũ (v1.0) | Kiến trúc mới (v2.0) | Lý do thay đổi & Lợi ích kỹ thuật |
|---|---|---|---|
| **Backend Framework** | NodeJS (NestJS) | **PHP 8.3+ / Laravel 11.x** | Thống nhất backend theo yêu cầu kiến trúc mới; Tận dụng hệ sinh thái phong phú (Sanctum, Eloquent, Queues, Form Requests) giúp phát triển nhanh, bảo trì đồng bộ. |
| **Authentication Strategy** | JWT thuần tùy biến | **Laravel Sanctum (Personal Access Token)** | Chuẩn hóa token dùng chung cho cả Web và Mobile qua header `Authorization: Bearer <token>`; Hỗ trợ quản lý thu hồi token linh hoạt, phân quyền role-based rõ ràng. |
| **Queue & Worker Engine** | BullMQ (NodeJS ecosystem) | **Laravel Queue (Redis driver)** | Loại bỏ phụ thuộc vào thư viện NodeJS ngoài; Sử dụng Laravel Queue Worker bản địa giúp quản lý retry, backoff, failed jobs và transactional data an toàn, chặt chẽ. |
| **Computer Vision Engine** | Chạy nhúng trong Node/Python không rõ ràng | **Dedicated Python Pose Worker (FastAPI/MediaPipe)** | Đóng gói môi trường Computer Vision chuyên biệt bằng Python; Tách hoàn toàn tác vụ ngốn CPU/Memory khỏi API Server chính để đảm bảo tính ổn định và khả năng scale độc lập. |
| **API Versioning** | Chưa định rõ quy chuẩn base path | **Cưỡng chế chuẩn `/api/v1`** | Đảm bảo tính sẵn sàng cho việc nâng cấp phiên bản API trong tương lai mà không gây breaking changes cho ứng dụng Mobile đã cài đặt trên máy người dùng. |
| **Giao tiếp Realtime Pose** | Gửi từng frame lên `/realtime/frame` | **Client-side 100% + Gửi summary `/realtime/result`** | Triệt tiêu nguy cơ nghẽn mạng do upload hàng nghìn frame; Giảm latency xuống mức tức thời trên máy client; Bảo vệ quyền riêng tư người dùng. Đổi tên endpoint cho đúng bản chất kỹ thuật. |
| **Phân trang (Pagination)** | Chưa quy chuẩn đồng bộ | **Chuẩn `page`, `per_page` kèm `meta` envelope** | Ngăn chặn truy vấn quá tải dữ liệu; Tối ưu hóa bộ nhớ ứng dụng mobile; Cưỡng chế giới hạn tối đa `per_page <= 100` chống tấn công DoS. |
| **Chống trùng lặp Request** | Không có cơ chế xử lý | **Cơ chế `Idempotency-Key` qua Redis** | Ngăn ngừa việc tạo dữ liệu trùng lặp (dup records) khi kết nối mạng di động chập chờn khiến mobile app tự động retry các request POST quan trọng. |
| **Bảo mật File & Storage** | Lưu trữ chung, chưa rõ phân quyền | **Private S3 Bucket + Pre-signed URL tạm thời** | Video của người dùng là dữ liệu riêng tư nhạy cảm; Không cấp link public; Chỉ cấp link tạm thời có hạn dùng ngắn khi chính chủ yêu cầu xem lại. |
| **Kiểm định Output từ LLM** | Validate schema cơ bản | **JSON Schema + Semantic Validation chặt chẽ** | Chặn đứng việc dữ liệu rác từ AI đi vào DB; Kiểm tra tính hợp lệ của `exercise_id` trong database thật; Đảm bảo tính toàn vẹn dinh dưỡng và kỹ thuật bài tập. |
| **Xử lý sự cố AI (Fallback)** | Ý tưởng 3 lớp đơn giản | **Triple-Layer Fallback có Local Repair + Observability** | Tối ưu hóa chi phí API bằng việc sửa lỗi JSON cục bộ trước khi retry; Tự động chuyển sang static expert templates theo mục tiêu nếu AI sập, đảm bảo UI luôn hiển thị ổn định. |
| **Mô hình Dữ liệu (Database)** | Schema đơn giản, thiếu metadata | **Bổ sung Indexes, Soft Deletes, S3/Worker Tracking** | Tối ưu hóa hiệu năng truy vấn trên PostgreSQL; Hỗ trợ truy vết lỗi xử lý video (`worker_version`, `error_code`); Bảo toàn dữ liệu người dùng qua Soft Deletes. |

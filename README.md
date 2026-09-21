# FitTrack AI — 3D Fitness Tracking & AI Pose Check Platform

<div align="center">

![FitTrack Banner](https://img.shields.io/badge/FitTrack%20AI-v2.0%20Course%20MVP-FF6B35?style=for-the-badge&logo=flame&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel%2011-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Python](https://img.shields.io/badge/Python%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2016-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Nền tảng theo dõi luyện tập & dinh dưỡng cá nhân hóa tích hợp AI, chấm điểm kỹ thuật động tác (Pose Check) qua Computer Vision và Dashboard 3D Home-Gym tĩnh cách điệu.**

[Tính năng](#-tính-năng-cốt-lõi) • [Kiến trúc](#-kiến-trúc-kỹ-thuật) • [Quy tắc 3D](#-quy-tắc-dashboard-3d) • [Cài đặt & Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy) • [API Specification](#-api-endpoints)

</div>

---

## 📖 Giới thiệu (Overview)

**FitTrack AI** là ứng dụng hỗ trợ luyện tập thể hình và dinh dưỡng toàn diện, tích hợp trí tuệ nhân tạo (AI) lập kế hoạch thông minh, công nghệ thị giác máy tính (Computer Vision) chấm điểm form động tác trực tiếp, cùng không gian trải nghiệm **3D Home-Gym Dashboard** trực quan.

Dự án được tối ưu theo kiến trúc **Course MVP v2.0** (`FitTrack_AI_System_Design_v2_Course_MVP.md`):
- **Tối giản hạ tầng (Infrastructure Simplification)**: Loại bỏ triệt để các dịch vụ phụ trợ phức tạp như Redis, MinIO/AWS S3, Nginx proxy để phục vụ môi trường chạy cục bộ nhanh gọn, nhẹ tài nguyên.
- **Single Source of Truth trên PostgreSQL**: Toàn bộ dữ liệu nghiệp vụ (Business Data), hàng đợi xử lý nền (Database Queue via `jobs` table) và khóa chống trùng lặp (Idempotency Records) đều được quản lý tập trung và an toàn trên PostgreSQL 16.
- **Lưu trữ tệp tin riêng tư cục bộ (Laravel Private Local Storage)**: Video phân tích tư thế được lưu trữ trên disk riêng biệt và chia sẻ trực tiếp với Python CV Worker thông qua Docker Named Volume (`private_storage`).
- **Giữ trọn vẹn ranh giới hệ thống (System Boundaries)**: Mô hình gồm *Frontend Client (Next.js 14) + Monolith API Gateway (Laravel 11) + Asynchronous Queue Worker (Laravel) + AI Pose Worker (Python FastAPI)* vẫn phân tách module rành mạch và tuân thủ chặt chẽ API Contract OpenAPI.

---

## ✨ Tính năng cốt lõi

### 1. 🏠 3D Home-Gym Dashboard
- Góc nhìn **3/4 Isometric cố định** (`position: [7.2, 6.2, 7.2]`), không tự do xoay camera (no OrbitControls) và không có cơ chế di chuyển WASD (không biến thành game).
- Phòng tập cách điệu với các vật thể hình học nguyên khối: Thảm tập, Giàn tạ trang trí, Giường hồi phục, Kệ cây, Bình nước, Poster động lực.
- Nhân vật trang trí có hiệu ứng nhịp thở / idle nhẹ.
- **2 Tương tác 3D cốt lõi**:
  - 📌 **Bảng ghi chú tường (Wall Note)**: Mở Modal xem và cập nhật các chỉ số cơ thể (Cân nặng, % Mỡ, Khối lượng cơ, BMI, Lịch sử đo).
  - 📷 **Album ảnh tiến độ (Progress Photo Album)**: Mở Modal dòng thời gian ảnh chụp theo ngày và chế độ So sánh Trước/Sau (Before/After).

### 2. 🏋️ Workout Logger & Tracker (`/workout`)
- Ghi nhận chi tiết từng hiệp tập (Set, Reps, Khối lượng tạ kg, RPE, Thời gian nghỉ).
- Tích hợp trạng thái hoàn thành hiệp và thống kê tổng khối lượng nâng / thời gian buổi tập.
- Hỗ trợ cơ chế Idempotency Key bảo đảm không bị ghi trùng hiệp tập khi mạng chập chờn.

### 3. 🥗 Nutrition & Macro Tracker (`/nutrition`)
- Theo dõi năng lượng calo nạp theo từng bữa: Sáng, Trưa, Tối, Bữa phụ.
- Tự động tổng hợp và cân đối tỷ lệ đa lượng: Protein (Đạm), Carbohydrate (Tinh bột), Fat (Chất béo).

### 4. 📈 Body Metrics & Composition (`/metrics`)
- Theo dõi tiến độ thay đổi thể hình qua thời gian: Cân nặng, % Body Fat, Khối lượng cơ bắp (Muscle Mass).
- Tự động tính toán và đối chiếu chỉ số BMI theo chiều cao và cân nặng người dùng.

### 5. 🤖 AI Coach Studio & Pose Check (`/ai-coach`)
- **AI Pose Check thời gian thực (Edge Computing)**: Trích xuất 33 mốc xương cơ thể qua MediaPipe WebAssembly/WebGL trực tiếp tại trình duyệt client, tính góc khớp và chấm điểm form tập (Squat, Push-up, Plank) với độ trễ thấp (< 50ms).
- **Async Video Pose Check (Phân tích nâng cao)**: Tải lên video bài tập ($\le 100\text{ MB}$, $\le 60\text{s}$) lưu trữ an toàn trong Private Local Storage, đưa vào hàng đợi nền (Laravel Database Queue) để Python Pose Worker đọc qua shared volume và phân tích kinematics chi tiết.
- **AI Workout & Meal Planner**: Sinh lịch tập và thực đơn cá nhân hóa theo mục tiêu (`lose_weight`, `gain_muscle`, `maintain`) với cơ chế **Triple-Layer Fallback** (Local JSON Repair $\rightarrow$ Prompt Retry $\rightarrow$ Static Expert Templates) đảm bảo luôn trả lời tin cậy mà không phát sinh lỗi 500 ra giao diện.

### 6. 🌐 Exercise Library & Community (`/community`)
- Khám phá kho bài tập theo nhóm cơ (`chest`, `back`, `legs`, `core`), dụng cụ và độ khó.
- Nhãn kiểm định **Verified Badge** và bộ lọc các bài tập hỗ trợ AI Pose Check.

---

## 🏗️ Kiến trúc kỹ thuật (Architecture)

```
                       +-----------------------------------+
                       |      CLIENT LAYER (Next.js 14)    |
                       |  - React Three Fiber (3D Room)    |
                       |  - Edge MediaPipe (Realtime Pose) |
                       |  - Tailwind CSS + Lucide Icons    |
                       +-----------------+-----------------+
                                         |
                                         | HTTPS / REST API (/api/v1)
                                         | (Bearer Token + Idempotency-Key)
                                         v
+-----------------------------------------------------------------------------------+
|                            LARAVEL 11 API BACKEND                                 |
|  - Laravel Sanctum Authentication                                                 |
|  - DB-based Idempotency Middleware (PostgreSQL Atomic Unique Constraint)          |
|  - AI Orchestrator (Triple-Layer Fallback & Sanitization)                         |
|  - Private Local Video Storage Service (storage/app/private/pose-videos)          |
+-----------+---------------------+-------------------+---------------------+-------+
            |                     |                   |                     |
     (SQL Queries)       (Pushes Jobs into)    (Writes Video)         (Structured Prompt)
            v              (jobs table)               v                     v
  +------------------+   +-----------------+ +-----------------+  +-------------------+
  |    PostgreSQL    |   |   PostgreSQL    | |  Docker Shared  |  |  External LLM API |
  | (Primary RDBMS)  |   | (Database Queue)| |  Named Volume   |  | (OpenAI / Claude) |
  |                  |   |                 | |(private_storage)|  |                   |
  +------------------+   +--------+--------+ +--------+--------+  +-------------------+
                                  |                   ^
                           (Pops Job)                 | (Reads Video directly
                                  v                   |  from local path)
                         +-----------------+          |
                         |  Laravel Queue  |          |
                         |  Worker Daemon  +----------+
                         +--------+--------+
                                  |
                (Internal Private |
                 REST Task :8001) v
                         +-----------------+
                         |   Python Pose   |
                         |  Worker (CV)    |
                         | MediaPipe/OpenCV|
                         +-----------------+
```

### Chi tiết Stack công nghệ:
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Three.js, `@react-three/fiber`, `@react-three/drei`, Lucide React.
- **Backend API**: PHP 8.3, Laravel 11.x, Laravel Sanctum, Eloquent ORM, `opis/json-schema`.
- **Hàng đợi & Chống lặp (Queue & Idempotency)**:
  - **Queue**: Laravel Database Driver sử dụng bảng `jobs` trên PostgreSQL (hoàn toàn không cần Redis).
  - **Idempotency**: Bảng `idempotency_records` với ràng buộc `UNIQUE(user_id, idempotency_key, endpoint)` và xử lý xung đột transaction mức cơ sở dữ liệu.
- **Lưu trữ Video (Private Video Storage)**: Laravel Local Storage Private Disk (`storage/app/private/pose-videos/{user_id}/{session_id}.{ext}`), chia sẻ cho container Python thông qua Docker Volume `private_storage` (không phụ thuộc S3/MinIO).
- **AI Pose Worker**: Python 3.11+, FastAPI, OpenCV headless, MediaPipe, NumPy, Pydantic v2. Đọc tệp video trực tiếp từ đường dẫn local mount `/app/private_storage`.
- **Cơ sở dữ liệu**: PostgreSQL 16 (UUID primary keys, JSONB, Timestamps, Soft Deletes, Index tối ưu hóa truy vấn).

---

## 📐 Quy tắc Dashboard 3D (3D Rules)

Giao diện 3D tuân thủ nghiêm ngặt các nguyên tắc thiết kế Course MVP:
1. **Camera cố định**: Góc nhìn 3/4 isometric chuẩn (`[7.2, 6.2, 7.2]`), không dùng `OrbitControls` trên môi trường sản xuất để giữ bố cục cố định.
2. **Không biến thành Game**: Không di chuyển nhân vật bằng phím WASD, không cơ chế chiến đấu/nhập vai gây nặng tải trình duyệt.
3. **Đúng 2 tương tác hợp lệ**:
   - **Wall Note**: Mở Body Metrics modal xem/ghi nhận chỉ số.
   - **Progress Photo Album**: Mở Photo Timeline modal xem ảnh tiến độ trước/sau.
4. **Các vật thể khác strictly trang trí**: Giàn tạ (Weight Rack), Thảm tập (Gym Mat), Giường hồi phục (Bed Area) đóng vai trò thẩm mỹ không gian, không kích hoạt route sai quy định.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Cách 1: Chạy toàn bộ hệ thống bằng Docker Compose (Khuyến nghị)

**Yêu cầu**: Đã cài đặt và đang bật **Docker Desktop**.

1. **Chuẩn bị cấu hình môi trường**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```
   *(Tùy chọn: Điền `AI_API_KEY` vào `backend/.env` nếu muốn kích hoạt tính năng AI Coach với OpenAI/Claude).*

2. **Khởi chạy toàn bộ Container**:
   ```bash
   docker compose up -d --build
   ```

3. **Chạy Migration và Seed dữ liệu mẫu**:
   ```bash
   docker compose exec backend php artisan migrate:fresh --seed
   ```

4. **Chạy bộ kiểm thử tự động (Unit & Feature Tests)**:
   ```bash
   docker compose exec backend php artisan test
   ```

5. **Truy cập các dịch vụ**:
   | Dịch vụ | Địa chỉ truy cập | Mô tả |
   |---|---|---|
   | 🌐 **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | Giao diện người dùng Next.js 14 |
   | 🔌 **Laravel API Gateway** | [http://localhost:8000/api/v1](http://localhost:8000/api/v1) | Backend REST API |
   | 🧠 **Python Pose Worker Docs** | [http://localhost:8001/docs](http://localhost:8001/docs) | OpenAPI Swagger của Computer Vision Worker |
   | 🗄️ **PostgreSQL Database** | `localhost:5432` | DB: `fittrack`, User: `fittrack_user` |

---

### Cách 2: Chạy riêng Frontend (Standalone Local)

1. **Di chuyển vào thư mục frontend**:
   ```bash
   cd frontend
   ```

2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

3. **Kiểm tra TypeScript & Build**:
   ```bash
   npm run type-check
   npm run build
   ```

4. **Khởi chạy môi trường Dev**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 📡 API Endpoints (`/api/v1`)

| Method | Endpoint | Auth | Idempotency | Mô tả |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Không | Đăng ký tài khoản mới, cấp token |
| `POST` | `/api/v1/auth/login` | Public | Không | Đăng nhập email/mật khẩu |
| `GET` | `/api/v1/auth/me` | User | Không | Lấy profile người dùng hiện tại |
| `POST` | `/api/v1/auth/logout` | User | Không | Thu hồi Bearer Token |
| `GET` | `/api/v1/exercises` | Public | Không | Danh sách bài tập (lọc nhóm cơ, Pose Check) |
| `POST` | `/api/v1/exercises` | User | Không | Người dùng đóng góp bài tập mới |
| `GET` | `/api/v1/workout-logs` | User | Không | Lịch sử các buổi tập |
| `POST` | `/api/v1/workout-logs` | User | **Có** | Tạo nhật ký buổi tập mới |
| `POST` | `/api/v1/workout-logs/{id}/sets` | User | **Có** | Thêm hiệp tập (set) vào buổi tập |
| `GET` | `/api/v1/nutrition-logs` | User | Không | Danh sách nhật ký ăn uống trong ngày |
| `POST` | `/api/v1/nutrition-logs` | User | **Có** | Ghi nhận món ăn và calo/macro |
| `GET` | `/api/v1/body-metrics` | User | Không | Lịch sử chỉ số cân nặng, mỡ cơ thể |
| `POST` | `/api/v1/body-metrics` | User | Không | Upsert chỉ số cơ thể hôm nay |
| `POST` | `/api/v1/ai/exercise-plan` | User | **Có** | AI sinh lịch tập cá nhân hóa |
| `POST` | `/api/v1/ai/meal-plan` | User | **Có** | AI sinh thực đơn dinh dưỡng |
| `POST` | `/api/v1/pose-check/realtime/result` | User | Không | Gửi tóm tắt kết quả chấm form real-time |
| `POST` | `/api/v1/pose-check/upload` | User | **Có** | Upload video bài tập vào Private Storage & dispatch Queue |
| `GET` | `/api/v1/pose-check/sessions/{id}` | User | Không | Polling trạng thái và kết quả phân tích video bài tập |

---

## 📁 Cấu trúc thư mục dự án

```text
fitness-leveling/
├── .gitignore                     # Gitignore chuẩn hóa toàn dự án
├── docker-compose.yml             # Điều phối 5 containers (frontend, backend, queue-worker, pose-worker, postgres)
├── README.md                      # Tài liệu hướng dẫn chính của dự án
├── frontend/                      # Next.js 14 App Router + Three.js
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/                   # Routes: /, /workout, /nutrition, /metrics, /ai-coach, /community
│       ├── components/
│       │   ├── layout/            # Sidebar, TopBar
│       │   └── home/              # FitnessRoom, TodayPanel, CharacterTag, Modals
│       │       └── 3d/            # RoomStructure, Character, WallNote, ProgressPhotoAlbum, GymMat, WeightRack...
│       └── lib/                   # fitnessData.ts, api.ts
├── backend/                       # Laravel 11.x Monolith API Gateway
│   ├── Dockerfile
│   ├── composer.json
│   ├── app/
│   │   ├── Enums/                 # FitnessGoal, MealType, PoseSessionStatus
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/# Auth, Workout, Nutrition, Metrics, Exercise, AI, PoseCheck
│   │   │   └── Middleware/        # IdempotencyMiddleware (DB Transaction-based)
│   │   ├── Jobs/                  # ProcessPoseCheckJob (Database Queue Worker)
│   │   ├── Models/                # User, Exercise, WorkoutLog, PoseCheckSession, IdempotencyRecord...
│   │   └── Services/
│   │       ├── Ai/                # AiOrchestrationService, StaticPlanFallback
│   │       └── Pose/              # PoseWorkerClient, PrivateVideoStorageService
│   ├── database/migrations/       # 12 migration files (PostgreSQL schema, jobs, failed_jobs, idempotency_records)
│   └── routes/api.php             # /api/v1 REST endpoints
└── pose-worker/                   # Python 3.11+ FastAPI Computer Vision Worker
    ├── Dockerfile
    ├── requirements.txt           # fastapi, uvicorn, opencv-headless, mediapipe, numpy, pydantic (no boto3)
    └── app/
        ├── cv/                    # angle_math.py (Kinematics calculations)
        ├── rules/                 # squat_rule.py, pushup_rule.py, plank_rule.py
        ├── schemas/               # Pydantic request (video_path) & response schemas
        └── main.py                # FastAPI endpoint POST /v1/process-video (đọc video từ local path)
```

---

## 🔒 Bảo mật & Tính toàn vẹn dữ liệu

- **Bảo mật tệp tin**: Video người dùng được lưu trữ độc quyền trong thư mục private (`storage/app/private/pose-videos`), không tạo symlink ra `public/` và không lộ đường dẫn trực tiếp ra ngoài Internet.
- **Chống trùng lặp (Idempotency)**: Middleware sử dụng bảng `idempotency_records` với cơ chế transaction và bắt ngoại lệ `UniqueConstraintViolationException` ở tầng cơ sở dữ liệu, đảm bảo các yêu cầu ghi trùng (như thanh toán, trừ calo, ghi nhận log) bị chặn tuyệt đối ngay cả khi tải cao.
- **An toàn LLM**: Tự động khử trùng thông tin định danh cá nhân (PII Sanitization) trước khi chuyển tiếp tới API nhà cung cấp mô hình ngôn ngữ lớn.

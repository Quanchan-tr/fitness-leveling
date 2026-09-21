# FitTrack AI — 3D Fitness Tracking & AI Pose Check Platform

<div align="center">

![FitTrack Banner](https://img.shields.io/badge/FitTrack%20AI-v2.0_Course_MVP-FF6B35?style=for-the-badge&logo=flame&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel%2011-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Python](https://img.shields.io/badge/Python%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2016-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Nền tảng theo dõi luyện tập & dinh dưỡng cá nhân hóa tích hợp AI, chấm điểm kỹ thuật động tác (Pose Check) qua Computer Vision và Dashboard 3D Home-Gym tĩnh cách điệu.**

[Tính năng](#-tính-năng-cốt-lõi) • [Kiến trúc v2 MVP](#-kiến-trúc-kỹ-thuật-v2-course-mvp) • [Quy tắc 3D](#-quy-tắc-dashboard-3d) • [Cài đặt & Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy) • [API Specification](#-api-endpoints)

</div>

---

## 📖 Giới thiệu (Overview)

**FitTrack AI** là giải pháp toàn diện kết hợp giữa công cụ ghi chép thể hình (Workout & Nutrition Logging), trợ lý AI lập kế hoạch cá nhân hóa, công nghệ thị giác máy tính chấm form tập trực tiếp trên trình duyệt (Edge MediaPipe) và phân tích chuyên sâu qua video bất đồng bộ (Python CV Worker), cùng không gian trải nghiệm **3D Home-Gym Dashboard** trực quan.

Dự án được xây dựng và chuẩn hóa theo tài liệu kiến trúc **FitTrack AI System Design v2.0 (Course Project MVP)**:
- **Tối giản hạ tầng (Infrastructure Simplification)**: Loại bỏ các dependency phức tạp bên ngoài như Redis, MinIO/AWS S3, Nginx proxy, tập trung vào **PostgreSQL 16 làm Single Source of Truth** (lưu trữ nghiệp vụ, Database Queue `jobs`, Database Cache & Atomic Locks, Idempotency Records).
- **Lưu trữ video an toàn**: Sử dụng **Laravel Private Local Storage** trên Docker Named Volume (`private_storage`) dùng chung giữa Backend, Queue Worker và Python Pose Worker, loại bỏ sự phụ thuộc vào S3 presigned URL.
- **Ranh giới hệ thống rõ ràng**: Unified Laravel Monolith API + Decoupled Asynchronous Python CV Worker + Client-Side Edge Inference (Next.js 14 App Router + Three.js).

---

## ✨ Tính năng cốt lõi

### 1. 🏠 3D Home-Gym Dashboard
- Góc nhìn **3/4 Isometric cố định** (`position: [7.2, 6.2, 7.2]`), không tự do xoay camera (no OrbitControls) và không có cơ chế điều khiển di chuyển WASD (không biến thành game).
- Phòng tập cách điệu với các vật thể hình học nguyên khối: Thảm tập, Giàn tạ trang trí, Giường hồi phục, Kệ cây, Bình nước, Poster động lực.
- Nhân vật trang trí có hiệu ứng nhịp thở / idle nhẹ.
- **2 Tương tác 3D cốt lõi**:
  - 📌 **Bảng ghi chú tường (Wall Note)**: Click mở Modal xem và ghi nhận các chỉ số cơ thể (Cân nặng, Tỷ lệ mỡ, Khối lượng cơ, BMI, Lịch sử đo).
  - 📷 **Album ảnh tiến độ (Progress Photo Album)**: Click mở Modal dòng thời gian ảnh chụp theo ngày và chế độ So sánh Trước/Sau (Before/After).

### 2. 🏋️ Workout Logger & Tracker (`/workout`)
- Ghi nhận chi tiết từng hiệp tập (Set, Reps, Khối lượng tạ kg, Thời gian nghỉ).
- Tích hợp trạng thái hoàn thành hiệp và thống kê tổng thời gian buổi tập.

### 3. 🥗 Nutrition & Macro Tracker (`/nutrition`)
- Theo dõi năng lượng calo nạp theo từng bữa: Sáng, Trưa, Tối, Bữa phụ.
- Tự động tổng hợp và cân đối tỷ lệ đa lượng: Protein (Đạm), Carbohydrate (Tinh bột), Fat (Chất béo tốt).

### 4. 📈 Body Metrics & Composition (`/metrics`)
- Theo dõi tiến độ thay đổi thể hình qua thời gian: Cân nặng, % Body Fat, Khối lượng cơ bắp (Muscle Mass).
- Đồng bộ chỉ số BMI theo chiều cao và cân nặng người dùng.

### 5. 🤖 AI Coach Studio & Edge Pose Check (`/ai-coach`)
- **AI Pose Check thời gian thực (Edge Computing)**: Trích xuất 33 mốc xương cơ thể qua MediaPipe WebAssembly/WebGL trực tiếp tại trình duyệt client, tính góc khớp và chấm điểm form tập (Squat, Push-up, Plank) với độ trễ < 50ms.
- **Async Video Pose Check (Phân tích video bất đồng bộ)**:
  - Tải lên video bài tập ($\le 100\text{ MB}$, $\le 60\text{s}$) qua API `/api/v1/pose-check/upload`.
  - Video được lưu trữ bảo mật tại **Laravel Private Local Storage** (`storage/app/private/pose-checks/`).
  - Đẩy công việc vào **Laravel Database Queue** (`jobs` table trên PostgreSQL).
  - **Python CV Worker** đọc video trực tiếp từ shared volume `/app/private_storage`, phân tích kinematic angles qua MediaPipe + OpenCV và trả kết quả tổng hợp (Reps, Form Score, Lỗi sai & Khuyến nghị) cập nhật vào PostgreSQL.
- **AI Workout & Meal Planner**: Sinh lịch tập và thực đơn theo mục tiêu (`lose_weight`, `gain_muscle`, `maintain`) với cơ chế **Triple-Layer Fallback** (Local JSON Repair $\rightarrow$ Prompt Retry $\rightarrow$ Static Expert Templates) đảm bảo hệ thống không bao giờ trả về lỗi thô.

### 6. 🌐 Exercise Library & Community (`/community`)
- Khám phá kho bài tập theo nhóm cơ (`chest`, `back`, `legs`, `core`), dụng cụ và độ khó.
- Nhãn kiểm định **Verified Badge** và bộ lọc các bài tập hỗ trợ AI Pose Check.

---

## 🏗️ Kiến trúc kỹ thuật (v2 Course MVP)

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
|  - Request Validation & Idempotency Key Lock (Database Lock & Idempotency Table)  |
|  - AI Orchestrator (Triple-Layer Fallback & Sanitization)                         |
|  - Private Video Storage Service (Local Secure Storage)                           |
+-----------+---------------------+-------------------+---------------------+-------+
            |                     |                   |                     |
     (SQL Queries)         (Queue & Locks)     (Save Video File)      (Structured Prompt)
            v                     v                   v                     v
  +-------------------------------------+   +-----------------+   +-------------------+
  |            POSTGRESQL 16            |   | Shared Volume   |   |  External LLM API |
  |      (Single Source of Truth)       |   | private_storage |   | (OpenAI / Claude) |
  |  - Business Models (UUID)           |   | (Pose Check Vid)|   +-------------------+
  |  - Database Queue (`jobs`)          |   +--------+--------+
  |  - Database Cache & Locks (`cache`) |            ^
  |  - Idempotency (`idempotency_rec`)  |            | (Direct File Read via Mount)
  +------------------+------------------+            |
                     |                               |
              (Pops Job from DB)                     |
                     v                               |
            +-----------------+                      |
            |  Laravel Queue  |                      |
            |     Worker      +----------------------+
            +--------+--------+                      |
                     |                               |
   (Internal Private |                               |
    REST Task :8001) v                               |
            +-----------------+                      |
            |   Python Pose   |                      |
            |   Worker (CV)   +----------------------+
            | MediaPipe/OpenCV|
            +-----------------+
```

### Chi tiết Stack công nghệ:
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Three.js, `@react-three/fiber`, `@react-three/drei`, Lucide React.
- **Backend API**: PHP 8.3, Laravel 11.x, Laravel Sanctum, Eloquent ORM, Database Queue Driver, Database Cache & Atomic Locks, `guzzlehttp/guzzle`, `opis/json-schema`.
- **AI Pose Worker**: Python 3.11+, FastAPI, OpenCV headless, MediaPipe, NumPy, Pydantic v2 (Xử lý trực tiếp file hệ thống, không dùng boto3/S3).
- **Cơ sở dữ liệu**: PostgreSQL 16 (UUID primary keys, JSONB, Soft deletes, jobs queue, cache locks, idempotency table).
- **Lưu trữ Video**: Docker Named Volume (`private_storage`) gắn kết tại `/var/www/html/storage/app/private` (Backend/Queue Worker) và `/app/private_storage` (Python Worker).
- **Phạm vi MVP**: Hoàn toàn **không dùng** Redis, MinIO/S3, Nginx, Kafka, hay microservice phân mảnh — tối ưu hóa tài nguyên cho môi trường Course Project MVP.

---

## 📐 Quy tắc Dashboard 3D (3D Rules)

Theo tài liệu đặc tả, giao diện 3D tuân thủ nghiêm ngặt các nguyên tắc:
1. **Camera cố định**: Góc nhìn 3/4 isometric chuẩn (`[7.2, 6.2, 7.2]`), không dùng `OrbitControls` trên môi trường sản xuất.
2. **Không biến thành Game**: Không di chuyển nhân vật bằng phím WASD, không cơ chế chiến đấu/nhập vai phức tạp.
3. **Đúng 2 tương tác hợp lệ**:
   - **Wall Note**: Mở Body Metrics modal.
   - **Progress Photo Album**: Mở Photo Timeline modal.
4. **Các vật thể khác strictly trang trí**: Giàn tạ (Weight Rack), Gương (Mirror), Thảm tập (Gym Mat), Kệ cây chỉ đóng vai trò thẩm mỹ, không kích hoạt route sai quy định.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Cách 1: Chạy toàn bộ hệ thống bằng Docker Compose (Khuyến nghị)

**Yêu cầu**: Đã cài đặt và đang bật **Docker Desktop**.

1. **Chuẩn bị cấu hình môi trường**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

2. **Khởi chạy toàn bộ Container**:
   ```bash
   docker compose up -d --build
   ```

3. **Chạy Migration & Seed cơ sở dữ liệu**:
   ```bash
   docker compose exec backend php artisan migrate --seed
   ```

4. **Truy cập các dịch vụ**:
   - 🌐 **Web App Frontend**: [http://localhost:3000](http://localhost:3000)
   - 🔌 **Laravel API Backend**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
   - 🧠 **Python Pose Worker Swagger Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

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
| `POST` | `/api/v1/pose-check/upload` | User | **Có** | Upload video bài tập lên Private Local Storage & đẩy Job vào Queue |
| `GET` | `/api/v1/pose-check/sessions/{id}` | User | Không | Polling kết quả phân tích video bài tập (Session status, reps, score, feedback) |

---

## 📁 Cấu trúc thư mục dự án

```text
fitness-leveling/
├── .gitignore                     # Gitignore chuẩn hóa cho full stack
├── docker-compose.yml             # Orchestration: frontend, backend, queue-worker, pose-worker, postgres
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
│       │       └── 3d/            # RoomStructure, Character, WallNote, ProgressPhotoAlbum, GymMat, WeightRack, BedArea
│       └── lib/                   # fitnessData.ts, api.ts
├── backend/                       # Laravel 11.x Monolith API
│   ├── Dockerfile
│   ├── composer.json
│   ├── app/
│   │   ├── Enums/                 # FitnessGoal, MealType, PoseSessionStatus
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/# Auth, Workout, Nutrition, Metrics, Exercise, AI, PoseCheck
│   │   │   └── Middleware/        # IdempotencyMiddleware, EnsureUserIsAdmin
│   │   ├── Jobs/                  # ProcessPoseCheckJob (Database Queue)
│   │   ├── Models/                # User, Exercise, WorkoutLog, NutritionLog, PoseCheckSession...
│   │   └── Services/
│   │       ├── Ai/                # AiOrchestrationService, StaticPlanFallback...
│   │       └── Pose/              # PrivateVideoStorageService, PoseWorkerClient
│   ├── database/migrations/       # Migrations: users, exercises, logs, sessions, cache, jobs, idempotency_records...
│   └── routes/api.php             # /api/v1 REST endpoints
└── pose-worker/                   # Python 3.11+ FastAPI Computer Vision Worker
    ├── Dockerfile
    ├── requirements.txt           # fastapi, uvicorn, mediapipe, opencv-headless, numpy, pydantic
    └── app/
        ├── cv/                    # angle_math.py (Kinematics)
        ├── rules/                 # squat_rule.py, pushup_rule.py, plank_rule.py
        ├── schemas/               # request.py (video_path), response.py
        └── main.py                # POST /v1/process-video (đọc video từ shared volume)
```

---

## 🔒 Bản quyền & Bảo mật

- **Không hardcode thông tin nhạy cảm**: Toàn bộ secrets và API keys được nạp qua biến môi trường (`.env`).
- **PII Sanitization**: Tự động khử trùng dữ liệu nhận dạng cá nhân trước khi gửi prompt tới External LLM.
- **Bảo mật file video riêng tư**: Video bài tập được lưu trữ tại Private Local Storage, không public ra Internet, chỉ được truy cập nội bộ thông qua đường dẫn bảo mật giữa Backend và Worker container.
- **Bảo vệ toàn vẹn dữ liệu**: Quản lý phiên làm việc bằng Laravel Sanctum Bearer Token, UUID và kiểm soát tránh trùng lặp thao tác bằng Database Idempotency Locks.

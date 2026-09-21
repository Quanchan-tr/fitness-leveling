# FitTrack AI — 3D Fitness Tracking & AI Pose Check Platform

<div align="center"> 

![FitTrack Banner](https://img.shields.io/badge/FitTrack%20AI-v2.0-FF6B35?style=for-the-badge&logo=flame&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel%2011-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Python](https://img.shields.io/badge/Python%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2016-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis%207-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**Nền tảng theo dõi luyện tập & dinh dưỡng cá nhân hóa tích hợp AI, chấm điểm kỹ thuật động tác (Pose Check) qua Computer Vision và Dashboard 3D Home-Gym tĩnh cách điệu.**

[Tính năng](#-tính-năng-cốt-lõi) • [Kiến trúc](#-kiến-trúc-kỹ-thuật) • [Quy tắc 3D](#-quy-tắc-dashboard-3d) • [Cài đặt & Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy) • [API Specification](#-api-endpoints)

</div>

---

## 📖 Giới thiệu (Overview)

**FitTrack AI** là giải pháp toàn diện kết hợp giữa công cụ ghi chép thể hình (Workout & Nutrition Logging), trợ lý AI lập kế hoạch cá nhân hóa, công nghệ thị giác máy tính chấm form tập trực tiếp trên trình duyệt, cùng không gian trải nghiệm **3D Home-Gym Dashboard** trực quan.

Dự án được xây dựng dựa trên tài liệu **Đề xuất dự án v1.0** và **Tài liệu Thiết kế Kỹ thuật v2.0** (`tech_design_reword.md`), loại bỏ toàn bộ kiến trúc cũ để chuẩn hóa theo mô hình *Unified Laravel Monolith API + Decoupled Asynchronous Python CV Worker + Client-Side Edge Inference (Next.js/React)*.

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
- **Async Video Upload**: Tải lên video bài tập ($\le 100\text{ MB}$, $\le 60\text{s}$) lên S3 Private Bucket, đưa vào hàng đợi Redis để Python Worker phân tích chi tiết từng giây chuyển động.
- **AI Workout & Meal Planner**: Sinh lịch tập và thực đơn theo mục tiêu (`lose_weight`, `gain_muscle`, `maintain`) với cơ chế **Triple-Layer Fallback** (Local JSON Repair $\rightarrow$ Prompt Retry $\rightarrow$ Static Expert Templates) đảm bảo hệ thống không bao giờ trả về lỗi thô.

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
|  - Request Validation & Idempotency Key Lock (Redis Atomic Locks)                 |
|  - AI Orchestrator (Triple-Layer Fallback & Sanitization)                         |
|  - S3 Storage Manager (Pre-signed URL Generator)                                  |
+-----------+---------------------+-------------------+---------------------+-------+
            |                     |                   |                     |
     (SQL Queries)         (Cache & Queues)     (Private Video)       (Structured Prompt)
            v                     v                   v                     v
  +------------------+   +-----------------+ +-----------------+  +-------------------+
  |    PostgreSQL    |   |      Redis      | |  MinIO / AWS S3 |  |  External LLM API |
  | (Primary RDBMS)  |   | (Queue + Cache) | | Object Storage  |  | (OpenAI / Claude) |
  +------------------+   +--------+--------+ +--------+--------+  +-------------------+
                                  |                   ^
                           (Pops Job)                 | (Fetch Video)
                                  v                   |
                         +-----------------+          |
                         |  Laravel Queue  |          |
                         |     Worker      +----------+
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
- **Backend**: PHP 8.3, Laravel 11.x, Laravel Sanctum, Eloquent ORM, `predis/predis`, `opis/json-schema`.
- **AI Pose Worker**: Python 3.11+, FastAPI, OpenCV headless, MediaPipe, NumPy, Pydantic v2, boto3.
- **Cơ sở dữ liệu & Cache**: PostgreSQL 16 (UUID primary keys, JSONB, Soft deletes) + Redis 7.2 (Queues, Cache, Idempotency locks).
- **Lưu trữ Object Storage**: MinIO (Local) / AWS S3 (Production) với Private Bucket & Pre-signed URLs tạm thời.

---

## 📐 Quy tắc Dashboard 3D (3D Rules)

Theo tài liệu đặc tả, giao diện 3D tuân thủ nghiêm ngặt các nguyên tắc:
1. **Camera cố định**: Góc nhìn 3/4 isometric chuẩn, không dùng `OrbitControls` trên môi trường sản xuất.
2. **Không biến thành Game**: Không di chuyển nhân vật bằng phím WASD, không cơ chế chiến đấu/nhập vai phức tạp.
3. **Đúng 2 tương tác hợp lệ**:
   - **Wall Note**: Mở Body Metrics modal.
   - **Progress Photo Album**: Mở Photo Timeline modal.
4. **Các vật thể khác strictly trang trí**: Giàn tạ (Weight Rack), Gương (Mirror), Cúp (Trophy) chỉ đóng vai trò thẩm mỹ, không kích hoạt route sai quy định.

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

3. **Chạy Migration cơ sở dữ liệu**:
   ```bash
   docker compose exec backend php artisan migrate
   ```

4. **Truy cập các dịch vụ**:
   - 🌐 **Web App Frontend**: [http://localhost:3000](http://localhost:3000)
   - 🔌 **Laravel API Backend**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
   - 🧠 **Python Pose Worker Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)
   - 📦 **MinIO S3 Storage Console**: [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)

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
| `POST` | `/api/v1/pose-check/upload` | User | **Có** | Upload video bài tập lên S3 & Queue |
| `GET` | `/api/v1/pose-check/sessions/{id}` | User | Không | Polling kết quả phân tích video và link Pre-signed |

---

## 📁 Cấu trúc thư mục dự án

```text
Fitness-tracking-3d/
├── .gitignore                     # Master gitignore cấu hình toàn diện
├── docker-compose.yml             # Orchestration cho toàn bộ stack
├── README.md                      # Tài liệu hướng dẫn chính của dự án
├── docs/                          # Tài liệu kỹ thuật và thiết kế
│   ├── FitTrack-AI-De-xuat-du-an.docx
│   ├── tech_design_reword.md      # Tài liệu chuẩn thiết kế v2.0
│   ├── implementation-status.md   # Nhật ký và trạng thái triển khai
│   └── setup-guide.md             # Hướng dẫn chi tiết môi trường
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
│       │       └── 3d/            # RoomStructure, Character, WallNote, ProgressPhotoAlbum, GymMat, WeightRack, BedArea, RoomLighting
│       └── lib/                   # fitnessData.ts, api.ts
├── backend/                       # Laravel 11.x Monolith API
│   ├── Dockerfile
│   ├── composer.json
│   ├── app/
│   │   ├── Enums/                 # FitnessGoal, MealType, PoseSessionStatus
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/# Auth, Workout, Nutrition, Metrics, Exercise, AI, PoseCheck
│   │   │   └── Middleware/        # IdempotencyMiddleware, EnsureUserIsAdmin
│   │   ├── Jobs/                  # ProcessPoseCheckJob
│   │   ├── Models/                # User, Exercise, WorkoutLog, NutritionLog, PoseCheckSession...
│   │   └── Services/              # AiOrchestrationService, StaticPlanFallback, PoseWorkerClient...
│   ├── database/migrations/       # 9 migration files với UUID, Foreign Keys, Indexes
│   └── routes/api.php             # /api/v1 endpoints
└── pose-worker/                   # Python 3.11+ FastAPI Computer Vision Worker
    ├── Dockerfile
    ├── requirements.txt
    └── app/
        ├── cv/                    # angle_math.py (Kinematics)
        ├── rules/                 # squat_rule.py, pushup_rule.py, plank_rule.py
        ├── schemas/               # Pydantic request & response schemas
        └── main.py                # FastAPI endpoint POST /v1/process-video
```

---

## 🔒 Bản quyền & Bảo mật

- Dự án được phát triển theo tiêu chuẩn an toàn bảo mật: Không lưu khóa API cứng trong mã nguồn, tự động khử trùng dữ liệu nhạy cảm (PII Sanitization) trước khi gửi tới LLM, và cách ly dữ liệu người dùng tuyệt đối qua UUID và Laravel Policies.

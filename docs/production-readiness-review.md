# Báo Cáo Đánh Giá Độ Sẵn Sàng Production (Production Readiness Review)

**Dự án**: FitApp / Fitness Leveling  
**Ngày đánh giá**: 20/10/2026  
**Phạm vi**: Toàn bộ hệ thống gồm `backend/` (Laravel 11), `pose-worker/` (FastAPI), `frontend/` (Next.js 14 Web Studio), `mobile/` (Android Kotlin) và hạ tầng Docker/DevOps.

---

## 1. Đã hoàn thành (Done)

Các tính năng, module và cấu hình cốt lõi đã được xây dựng hoàn chỉnh và chạy ổn định về mặt kiến trúc:

### 1.1. Backend (Laravel 11 REST API)
- **Database Schema & Migrations**: Đã có đầy đủ 13 file migration trong `backend/database/migrations/`:
  - Hồ sơ thể chất, nhân trắc học và thống kê người dùng (`users`, `user_profiles`, `user_stats`).
  - Danh mục bài tập (`exercises`), nhật ký luyện tập (`workout_logs`, `workout_log_exercises`, `workout_log_sets`) và nhật ký dinh dưỡng (`nutrition_logs`).
  - Phiên làm việc và kết quả AI Pose Check (`pose_check_sessions`, `pose_check_results`).
  - Hỗ trợ Idempotency key (`idempotency_keys`) cho các thao tác ghi nhạy cảm.
- **REST API Endpoints**: Hệ thống V1 chuẩn RESTful tại `backend/routes/api.php` kèm Controller và Form Request Validation riêng biệt:
  - **Auth**: Register, Login, Logout, Profile, Refresh.
  - **Workout & Nutrition**: CRUD Logs, thống kê chuỗi tập luyện (streak).
  - **Pose Check**: Upload video phân tích, webhook nhận kết quả, cấp realtime session ticket.
- **Queue & Async Job**: `ProcessPoseCheckJob` xử lý bất đồng bộ kết nối sang Pose Worker qua HTTP, có sẵn fallback kết quả heuristic nếu worker quá tải hoặc gặp lỗi mạng.
- **AI Gateway & Circuit Breaker**: `AiOrchestrationService` hỗ trợ sinh lời khuyên dinh dưỡng/luyện tập, có cơ chế fallback trả về gợi ý tĩnh an toàn khi quota OpenAI/LLM bị cạn.

### 1.2. AI Engine & Pose Worker (FastAPI + MediaPipe)
- **Biomechanics Rule Engine**: Đã module hóa hoàn chỉnh bộ quy tắc cho **13 bài tập** (Squat, Pushup, Plank, Lunge, Glute Bridge, Jumping Jack, Mountain Climber, Wall Sit, Bicep Curl, Shoulder Press, Deadlift, Sit-up, Lateral Raise) tại `pose-worker/app/rules/`:
  - Kế thừa cấu trúc chuẩn `BasePoseRule` và `RepBasedRule`.
  - Bộ lọc làm mượt góc khớp Exponential Moving Average (EMA).
  - Máy trạng thái Hysteresis chống rung rep (START -> INFLECTION -> FINISH).
  - Kiểm tra góc quay camera (Side / Front view validation) dựa trên vector vai và hông.
- **Realtime API & Batch Processing**: Đầy đủ endpoint WebSocket chấm điểm thời gian thực và REST endpoint xử lý file video tải lên tại `pose-worker/app/main.py`.

### 1.3. Frontend Web (Next.js 14)
- **Giao diện & Trải nghiệm (UI/UX)**: Giao diện Cyberpunk/Fitness Leveling hiện đại với Dark Mode, Glassmorphism, tích hợp Three.js 3D Canvas hiển thị mô hình nhân vật trực quan tại `/dashboard`.
- **Client-side MediaPipe Integration**: Đã tích hợp thư viện `@mediapipe/tasks-vision` trực tiếp trên trình duyệt qua hook `usePoseDetection.ts`, xử lý video webcam và trích xuất landmark 33 điểm thời gian thực.

---

## 2. Còn dở dang (WIP / Gaps)

Những phần đã có mã nguồn nhưng chưa hoàn thiện hoặc đang dùng dữ liệu giả lập, ngăn cản luồng nghiệp vụ hoạt động End-to-End:

| Thành phần | Vị trí code | Hiện trạng & Rủi ro |
| :--- | :--- | :--- |
| **Frontend Auth bị Mock** | `frontend/src/lib/auth.ts` | Xác thực phía Web đang dùng `setTimeout(..., 500)` và sinh token giả `mock_token_...` lưu vào `localStorage`. Chưa kết nối tới API `/api/v1/auth/login` hay `/register` của Laravel Backend. |
| **Frontend State dùng Mock Data** | `frontend/src/contexts/FitnessContext.tsx` | Dữ liệu người dùng, điểm kinh nghiệm (EXP), nhiệm vụ và danh mục bài tập đang lấy cứng từ `fitnesslevelingMockData.ts`, chưa đồng bộ trạng thái thực từ database qua API. |
| **Mobile Android mới chỉ là UI tĩnh** | `mobile/app/src/main/java/com/fittrack/app/` | Toàn bộ các Activity (`AiPoseActiveSessionActivity`, `LoginActivity`, ...) chỉ gọi `setContentView` và gán sự kiện `finish()`. Trong `build.gradle.kts` hoàn toàn chưa có thư viện mạng (Retrofit/OkHttp), CameraX hay MediaPipe. |
| **Dockerfile chạy lệnh Development** | `backend/Dockerfile`<br>`frontend/Dockerfile` | - Backend đang chạy `php -S 0.0.0.0:8000` (server dev đơn luồng, không chịu tải, nghẽn I/O ngay khi có 2 request đồng thời).<br>- Frontend đang chạy `npm run dev` (không có optimize bundle, ngốn CPU/RAM gấp nhiều lần so với bản build standalone). |
| **Thiếu hụt Test Suite** | `backend/tests/`<br>`pose-worker/tests/` | - Backend chỉ có 2 test mẫu cơ bản, thư mục `Unit/` trống hoàn toàn. Chưa có test cho Auth, Idempotency, PoseCheck flow.<br>- Pose-worker còn 3 test cũ của bài tập Squat đang fail do cấu trúc keypoint chưa khớp. |

---

## 3. Chưa làm (Missing)

Các thành phần thiết yếu bắt buộc phải có của một hệ thống Production chuẩn:

### 3.1. Bảo mật & Cấu hình môi trường (Security & Env)
1. **Application Key & Debug Mode**:
   - `backend/.env` đang để:
     ```env
     APP_KEY=base64:GENERATE_WITH_ARTISAN_KEY_GENERATE
     APP_DEBUG=true
     ```
     *Hậu quả*: Mã hóa session/cookie bị vô hiệu hóa; khi có lỗi unhandled, Laravel sẽ xuất toàn bộ Stack Trace kèm thông tin đăng nhập DB ra ngoài.
2. **Cấu hình Bí mật (Secrets Management)**:
   - `docker-compose.yml` đang gán mật khẩu cứng `postgres:postgres`, cổng DB `5432` đang mở thẳng ra ngoài Internet thay vì nằm trong mạng nội bộ Docker.
   - `AI_API_KEY` đang là placeholder: `sk-proj-YOUR_API_KEY_HERE`.

### 3.2. Giới hạn tần suất gọi API (Rate Limiting / Throttling)
- `backend/routes/api.php` không gắn middleware throttle:
  - Endpoint `/api/v1/auth/login` không có rate limit: Dễ bị tấn công Brute-force mật khẩu.
  - Endpoint `/api/v1/ai/*` không có rate limit: Dễ bị tấn công cạn kiệt tài nguyên (DDoS) và làm cạn kiệt quota OpenAI/LLM.

### 3.3. Hạ tầng Mạng & Reverse Proxy (SSL/TLS)
- Chưa có cấu hình Reverse Proxy (Nginx, Caddy hoặc Traefik) đứng trước các container:
  - Chưa có SSL/TLS Termination (HTTPS / WSS). Việc truyền webcam landmark và authentication token qua giao thức HTTP không an toàn là vi phạm nghiêm trọng về an toàn thông tin.
  - Chưa có cơ chế nén Gzip/Brotli, giới hạn kích thước payload và cấu hình HTTP Security Headers (`HSTS`, `CSP`, `X-Frame-Options`).

### 3.4. Giám sát, Logging & CI/CD
- **Không có CI/CD Pipeline**: Không có thư mục `.github/workflows/` hay pipeline tự động kiểm tra code style, unit test, build docker image khi tạo PR hoặc release.
- **Không có Centralized Logging / Error Tracking**: Chưa tích hợp công cụ giám sát lỗi thời gian thực (Sentry, Datadog hay Grafana Loki).

---

## 4. Kết luận Production Readiness

### Đánh giá: ❌ **CHƯA ĐẠT (NOT READY)**

> **Tóm tắt đánh giá**: Dự án có kiến trúc backend và thuật toán AI pose-worker được thiết kế bài bản, giao diện Web Studio phong phú. Tuy nhiên, hệ thống **chưa thể deploy lên Production** do:
> 1. Web frontend và Backend vẫn đang chạy tách rời nhau qua Mock Data.
> 2. Cấu hình container và môi trường đang ở chế độ Development (`php -S`, `npm run dev`, `APP_DEBUG=true`).
> 3. Mobile app mới chỉ dừng lại ở mức bản vẽ giao diện (Prototype).

---

### 📋 Checklist 5 việc ƯU TIÊN BẮT BUỘC phải xử lý trước khi Deploy

```markdown
- [x] 1. Chuẩn hóa Dockerfile Production (Loại bỏ toàn bộ Dev Server) (ĐÃ HOÀN THÀNH - 20/10/2026)
      - Backend: Đổi sang mô hình PHP-FPM 8.3 + Nginx kết hợp Supervisord, tối ưu opcache, upload max size 100M, thay thế hoàn toàn `php -S`.
      - Frontend: Đổi sang multi-stage build (deps -> builder -> runner) với Next.js standalone output và non-root user `nextjs`. Tách riêng `docker-compose.dev.yml` cho môi trường dev.

- [ ] 2. Khóa bảo mật Backend (.env & Secrets)
      - Chạy `php artisan key:generate` để tạo APP_KEY thực.
      - Đổi `APP_DEBUG=false`, `APP_ENV=production`.
      - Đổi mật khẩu PostgreSQL, bỏ expose cổng 5432 ra host trong compose production.

- [x] 3. Tích hợp Authentication & API Thật trên Web Frontend (ĐÃ HOÀN THÀNH - 20/10/2026)
      - Đã viết lại `frontend/src/lib/auth.ts`: Gỡ bỏ hàm mock + setTimeout, kết nối API thực `/api/v1/auth/login`, `/register`, `/logout`, `/me`, `PUT /profile`.
      - Đã đồng bộ state của FitnessContext với dữ liệu database (`exercises`, `workout-logs`, `body-metrics`, `nutrition-logs`). Khôi phục `packages/shared/src/types.ts`.

- [ ] 4. Kích hoạt Rate Limiting trong routes/api.php
      - Thêm `throttle:6,1` cho route đăng nhập / đăng ký để chống brute-force.
      - Thêm `throttle:30,1` hoặc token bucket cho các endpoint gọi tới AI Gateway (`/ai/workout-plan`, `/ai/nutrition-advice`).

- [ ] 5. Thiết lập Reverse Proxy & Chứng chỉ SSL/TLS (HTTPS)
      - Đặt Nginx/Caddy làm Gateway phía trước tiếp nhận traffic cổng 80/443.
      - Cấp phát SSL (Let's Encrypt / Cloudflare) để đảm bảo toàn bộ request webcam stream và WebSocket được mã hóa qua WSS / HTTPS.
```

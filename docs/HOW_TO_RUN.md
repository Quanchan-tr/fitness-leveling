Side Question: giờ làm sao để chạy thửu xem đã coi được dữ liệu thật hay chưa

Để chạy thử và kiểm tra dữ liệu thật ngay bây giờ, bạn có thể thực hiện theo **2 cách** tùy vào việc bạn muốn kiểm tra nhanh giao diện Web Studio hay chạy toàn bộ hệ thống cùng Database:

---
**DÙNG CÁCH 2**
---

### Cách 1: Chạy thử nhanh Frontend Web (Khuyên dùng — Xem ngay trong 30 giây)

Nhờ kiến trúc **Offline-first / Hybrid** vừa thiết lập, bạn có thể khởi động Frontend ngay mà không cần mở Docker:

1. **Khởi động server dev frontend**:
   Mở terminal và chạy lệnh:
   ```bash
   npm --prefix frontend run dev
   ```
2. **Mở trình duyệt truy cập**: [`http://localhost:3000`](http://localhost:3000)

3. **Các điểm kiểm tra dữ liệu thật**:
   - **Kho bài tập ([`http://localhost:3000/workout`](http://localhost:3000/workout))**:
     - Xem danh mục bài tập: Đã hiển thị đủ **1,324 bài tập thật** từ dataset (thay vì 12 bài cũ).
     - Thử tìm kiếm bài tập (ví dụ: gõ `Bench Press`, `Squat`, `Pull-Up`): Bạn sẽ thấy animation GIF bài tập động, nhóm cơ chính, phụ và thiết bị đi kèm.
     - Kiểm tra tab **Lộ trình tập (Routines)**: Thấy **3 Lộ trình Khởi đầu** chuẩn (*Full Body Kích Hoạt*, *Upper Body Sức Mạnh*, *Lower Body & Core*).
     - Thử bấm nút **"AI Planner"**: Trải nghiệm tạo lịch tập 7 ngày tự động chọn lọc từ kho 1,324 bài thật.
   - **Đăng nhập & Dashboard ([`http://localhost:3000/auth/login`](http://localhost:3000/auth/login))**:
     - Bấm nút **"Đăng nhập nhanh tài khoản Demo"**: Hệ thống sẽ đưa bạn vào Dashboard.
     - **Kiểm tra chỉ số**: Thấy số liệu chuỗi ngày tập (**Streak: 0 ngày**, **Level: 1**, **0 XP**) — toàn bộ dữ liệu mẫu cũ (17 ngày / Level 12) đã biến mất.
   - **Thử hoàn thành 1 buổi tập**:
     - Tại Dashboard hoặc trang Workout, bấm **"Vào buổi tập"** -> bấm tick hoàn thành các set -> bấm **"Hoàn thành buổi tập"**.
     - Ngay lập tức, bạn sẽ thấy hệ thống tính toán thật: **Streak tăng từ 0 lên 1**, **+120 XP** và lưu vào lịch sử tập luyện.

---

### Cách 2: Chạy toàn bộ Full-Stack kèm Cơ sở dữ liệu PostgreSQL (Docker)

Nếu bạn muốn kiểm tra cả việc lưu trữ dữ liệu vào Database thật:

1. **Bật ứng dụng Docker Desktop** trên máy.
2. **Khởi động các container**:
   ```bash
   docker compose up -d
   ```
3. **Chạy migration và nạp dataset vào database**:
   ```bash
   docker compose exec backend php artisan migrate:fresh --seed
   ```
   *(Lệnh này sẽ tạo tài khoản demo `demo@fitnessleveling.test` / `password123` và nạp toàn bộ bài tập vào bảng `exercises` trong PostgreSQL).*
4. Truy cập Web tại [`http://localhost:3000`](http://localhost:3000), đăng nhập và mọi lượt log tập luyện, dinh dưỡng, cân nặng sẽ được gửi trực tiếp qua API `/api/v1/*` lưu vào DB PostgreSQL.
# Changelog — FitnessLeveling Project

Tất cả các thay đổi, bổ sung và nâng cấp đáng chú ý của dự án kể từ mốc ghi nhận trong [`docs/CONTEXT.md`](file:///d:/Code/FitApp/fitness-leveling/docs/CONTEXT.md) (mốc ngày **25/10/2026**).

---

## [Unreleased / Latest Updates] — 2026-11-02

### 1. AI Workout Planner Subsystem (Toàn diện Backend & Frontend)
- **Backend Rule-Based Engine ([`WorkoutPlanRuleEngine.php`](file:///d:/Code/FitApp/fitness-leveling/backend/app/Services/Ai/WorkoutPlanRuleEngine.php))**:
  - Xây dựng thuật toán sinh lịch tập 7 ngày theo phương pháp khoa học, tự động tính toán split phù hợp theo số buổi/tuần:
    - 1–3 buổi: **Full Body** (Tập toàn thân với các compound lifts).
    - 4 buổi: **Upper / Lower Split** (Phân chia thân trên / thân dưới cân đối).
    - 5–6 buổi: **Push / Pull / Legs (PPL)** hoặc **Bro Split** (Tập chuyên sâu từng nhóm cơ).
  - Tích hợp các tham số cá nhân hóa: Cấp độ (Beginner, Intermediate, Advanced), mục tiêu (Hypertrophy, Strength, Fat Loss, Endurance), trang thiết bị (Full Gym, Dumbbell Only, Bodyweight/Home) và nhóm cơ cần ưu tiên (Chest, Back, Legs, Arms, Core).
  - Tích hợp trực tiếp vào [`AiOrchestrationService.php`](file:///d:/Code/FitApp/fitness-leveling/backend/app/Services/Ai/AiOrchestrationService.php) như một lớp fallback thông minh song hành cùng LLM Gateway và template tĩnh.
- **Frontend Planner Engine ([`workoutPlannerEngine.ts`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/lib/workoutPlannerEngine.ts))**:
  - Hiện thực logic sinh lịch tập tương đương với Backend trực tiếp bằng TypeScript trên Client, cho phép sinh lịch tập tức thì kể cả khi offline hoặc backend quá tải.
- **AI Workout Planner Wizard UI ([`AiWorkoutPlannerWizard.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/ai/AiWorkoutPlannerWizard.tsx))**:
  - Giao diện Wizard đa bước trực quan trong Web Studio giúp người dùng lựa chọn mục tiêu, số ngày tập, trang thiết bị và nhóm cơ trọng tâm.
  - Hỗ trợ xem trước lịch 7 ngày, xem chi tiết bài tập/sets/reps, tùy biến bài tập và lưu thành routine kích hoạt trực tiếp trong [`/workout`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/app/workout/page.tsx).

---

### 2. Tái cấu trúc Kiến trúc Điều hướng & Shell Layout
- **Đồng bộ TopBar cố định trong [`ShellLayout.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/layout/ShellLayout.tsx)**:
  - Đưa [`TopBar`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/layout/TopBar.tsx) lên cấp độ `ShellLayout` chạy cố định ngang hàng với `Sidebar`, không bị unmount/re-render khi chuyển giữa các trang/tab.
  - Gỡ bỏ hoàn toàn việc nhúng thẻ `TopBar` lặp lại ở từng trang riêng rẽ (`dashboard`, `workout`, `metrics`, `nutrition`, `ai-coach`, `community`, `profile`), loại bỏ tình trạng giật giao diện và mount trùng lặp.
- **Tối ưu chuyển Tab tức thì (<1ms)**:
  - Loại bỏ độ trễ khi chuyển tab; unmount trang cũ ngay lập tức và render [`PageLoadingSkeleton.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/layout/PageLoadingSkeleton.tsx) mượt mà phần nội dung trong khi TopBar vẫn giữ nguyên trạng thái.
- **Dọn dẹp trùng lặp Dashboard Header ([`MainGrid.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/layout/MainGrid.tsx))**:
  - Gỡ bỏ nút *"Vào buổi tập"* bị duplicate ở thanh Header; giữ lại duy nhất nút hành động ở card *"Tiêu điểm buổi tập hôm nay"* (kèm đầy đủ bài tập và thời lượng dự kiến).
- **Thống nhất Streak dữ liệu**:
  - Đồng bộ con số chuỗi tập luyện (Streak) thành 17 ngày trên toàn bộ [`fitnessData.ts`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/lib/fitnessData.ts), [`fitnesslevelingMockData.ts`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/data/fitnesslevelingMockData.ts) và `FitnessContext.tsx`, khắc phục tình trạng lệch pha hiển thị 12 ngày và 17 ngày.

---

### 3. Trang Cài Đặt Độc Lập Mới ([`/settings`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/app/settings/page.tsx))
- Xây dựng trang Cài đặt trung tâm toàn diện với 7 phân hệ cấu hình:
  1. **Hồ sơ cá nhân (Profile)**: Cập nhật họ tên, username, email, avatar, số đo cơ thể cơ bản.
  2. **Thông báo (Notifications)**: Tùy chỉnh bật/tắt nhắc nhở buổi tập, nhắc uống nước/dinh dưỡng, cập nhật cộng đồng và âm thanh cảnh báo.
  3. **Buổi tập & Âm thanh (Workout & Audio)**: Cài đặt đếm ngược nghỉ ngơi (Rest timer: 30s/60s/90s/120s), âm thanh đếm nhịp, bật/tắt HLV ảo (Voice Coach), tự động chuyển bài.
  4. **Quyền riêng tư & Bảo mật (Privacy)**: Tùy chọn chia sẻ thông tin workout lên bảng tin công khai, hiển thị số đo cơ thể.
  5. **Bộ nhớ & Dữ liệu (Storage & Cache)**: Quản lý dung lượng offline, xóa bộ nhớ đệm cache ứng dụng.
  6. **Trợ giúp & Thông tin (About & Support)**: Phiên bản app, điều khoản sử dụng, chính sách bảo mật.
  7. **Vùng nguy hiểm (Danger Zone)**: Đặt lại toàn bộ tiến độ tập luyện hoặc yêu cầu xóa tài khoản có xác thực an toàn.

---

### 4. Nâng cấp Trải nghiệm Tập Luyện Trực Tiếp (Live Workout) & Dữ liệu Bài tập
- **Giao diện tập luyện [`/workout/live`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/app/workout/live/page.tsx)**:
  - Phóng to khung hiển thị animation GIF hướng dẫn form bài tập, giúp người tập dễ quan sát kỹ thuật từ xa trong lúc tập.
  - Loại bỏ các nhãn kỹ thuật rườm rà gây rối mắt trên màn hình tập.
  - Đồng bộ đường dẫn GIF chính xác từ [`exerciseDataset.json`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/data/exerciseDataset.json).

---

### 5. Progressive Web App (PWA) & Trải Nghiệm Offline
- **Web App Manifest ([`frontend/public/manifest.json`](file:///d:/Code/FitApp/fitness-leveling/frontend/public/manifest.json))**:
  - Hỗ trợ cài đặt ứng dụng web thành ứng dụng desktop/mobile độc lập (`display: standalone`) với theme màu `#0F172A` và icon ứng dụng chuẩn.
- **Service Worker ([`frontend/public/sw.js`](file:///d:/Code/FitApp/fitness-leveling/frontend/public/sw.js)) & [`PwaRegister.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/pwa/PwaRegister.tsx)**:
  - Đăng ký service worker tự động khi tải trang, hỗ trợ cache static assets và chiến lược network-first kèm offline fallback.
- **Banner Báo Mất Mạng ([`OfflineBanner.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/ui/OfflineBanner.tsx))**:
  - Tự động phát hiện trạng thái mất kết nối mạng (`navigator.onLine`) và hiển thị cảnh báo nhẹ nhàng trên đầu màn hình, tự ẩn khi có mạng trở lại.

---

### 6. Bộ Thành Phần UI/UX Tiêu Chuẩn (State Handling Components)
- Bổ sung bộ components xử lý trạng thái giao diện nhất quán cho toàn bộ ứng dụng:
  - [`EmptyState.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/ui/EmptyState.tsx): Hiển thị trạng thái rỗng kèm nút kêu gọi hành động (Call-to-Action) cho danh sách bài tập, nhật ký ăn uống và bài viết.
  - [`ErrorState.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/ui/ErrorState.tsx): Khung thông báo lỗi chuẩn hóa kèm nút thử lại (`onRetry`).
  - [`NoSearchResults.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/ui/NoSearchResults.tsx): Trạng thái không tìm thấy kết quả tìm kiếm thực phẩm / bài tập.
  - [`SessionExpiredModal.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/ui/SessionExpiredModal.tsx): Modal chặn trải nghiệm khi token phiên làm việc hết hạn (Sanctum 401), hỗ trợ đăng nhập lại trực tiếp mà không mất trạng thái trang.
  - [`Skeleton.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/ui/Skeleton.tsx) & [`PageLoadingSkeleton.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/layout/PageLoadingSkeleton.tsx): Khung xương tải trang đồng nhất phong cách Glassmorphism.

---

### 7. Ngăn Thông Báo Nâng Cao (Notification Drawer)
- **Cải tiến [`TopBar.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/layout/TopBar.tsx)**:
  - Bổ sung Notification Drawer tương tác đầy đủ: huy hiệu đếm thông báo chưa đọc, phân loại thông báo (buổi tập, dinh dưỡng, thành tích, hệ thống).
  - Thao tác đánh dấu đã đọc (`mark as read`), đánh dấu tất cả đã đọc (`mark all as read`) và điều hướng trực tiếp đến trang liên quan.
  - Menu Profile dropdown tích hợp lối tắt nhanh sang trang Cài đặt, Hồ sơ và Đăng xuất.

---

### 8. Bộ Kiểm Thử Tự Động (Automated Unit Testing Suite)
- **Unit Test Suite ([`frontend/test/unit.test.mjs`](file:///d:/Code/FitApp/fitness-leveling/frontend/test/unit.test.mjs))**:
  - Bổ sung bộ test chạy trên Node.js độc lập (không phụ thuộc framework ngoài cồng kềnh), bao phủ **8/8 test cases** đã pass:
    1. Kiểm thử phân bổ lịch tập Full Body (1–3 ngày).
    2. Kiểm thử phân bổ lịch tập Upper / Lower (4 ngày).
    3. Kiểm thử phân bổ lịch tập PPL / Push-Pull-Legs (5–6 ngày).
    4. Kiểm thử phân bổ lịch tập Bro Split (5–6 ngày).
    5. Kiểm thử cân bằng nhóm cơ và phân bố ngày nghỉ khoa học.
    6. Kiểm thử công thức tính BMR/TDEE & Macro calo.
    7. Kiểm thử logic tính chuỗi Streak và cộng dồn tiến độ.
    8. Kiểm thử tính xác định (determinism) của bộ luật AI Planner khi chạy offline.

---

### 9. Tài Liệu Thiết Kế & Audit Giao Diện
- **Bổ sung [`FIGMA_UI_AUDIT.md`](file:///d:/Code/FitApp/fitness-leveling/FIGMA_UI_AUDIT.md)**:
  - Bản phân tích và đối soát toàn diện giữa 40 màn hình thiết kế Figma với mã nguồn thực tế của Web Studio và Mobile App.
  - Bảng tổng hợp mức độ hoàn thiện tính năng, độ tương thích giao diện, các điểm chênh lệch và lộ trình chuẩn hóa.

---

### 10. Tinh Chỉnh Cấu Hình Mobile Build
- Cập nhật [`mobile/gradle.properties`](file:///d:/Code/FitApp/fitness-leveling/mobile/gradle.properties) và [`mobile/gradle/wrapper/gradle-wrapper.properties`](file:///d:/Code/FitApp/fitness-leveling/mobile/gradle/wrapper/gradle-wrapper.properties) nhằm tối ưu bộ nhớ heap và tương thích với toolchain JVM/Gradle mới nhất khi build Android.



---

### 11. Chuyển Đổi Hoàn Toàn Sang Dataset Thật & Database Thật (Loại bỏ Mockup)
- **Nạp toàn diện kho bài tập 1,324+ bài từ Dataset ([`exerciseDataset.json`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/data/exerciseDataset.json))**:
  - Chuyển `FitnessContext.tsx` sang nạp trọn bộ 1,324 bài tập thật chuẩn (kèm animation GIF, mô tả form, nhóm cơ tác động chính và phụ) thay thế hoàn toàn danh sách 12 bài hardcode cũ.
  - Hỗ trợ kiến trúc Hybrid / Offline-first: Lọc và tìm kiếm tức thì trên Client, đồng thời đồng bộ 2 chiều với cơ sở dữ liệu PostgreSQL qua endpoint `/api/v1/exercises`.
- **3 Lộ trình Khởi đầu Chuẩn ([`starterRoutines.ts`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/data/starterRoutines.ts))**:
  - Xây dựng 3 Routine mẫu khoa học (*Full Body Kích Hoạt*, *Upper Body Sức Mạnh*, *Lower Body & Core*) liên kết trực tiếp bằng ID bài tập thật trong dataset (`ex-0025`, `ex-0007`, `ex-0662`, `ex-1004`, `ex-0464`, `ex-1429`, `ex-0219`, `ex-1634`, `ex-1001`, `ex-3544`, `ex-0001`).
- **Thống Kê Thật & Động (Real Physiological Stats)**:
  - Chỉ số Level, XP, Total Workouts và Streak chuỗi ngày tập liên tục được tính toán hoàn toàn động dựa trên lịch sử tập luyện thực tế (`workoutHistory`), không còn số liệu mock cố định (17 ngày / level 12).
  - Người dùng mới bắt đầu từ Level 1, 0 XP, 0 Streak; khi bấm hoàn thành buổi tập, hệ thống tự động cộng dồn XP (+120 XP), thăng cấp và gửi log đồng bộ về API Backend `/api/v1/workout-logs`.
- **Strict Auth & Tài khoản Demo Thật trên Database**:
  - Seed tài khoản thật `demo@fitnessleveling.test` / `password123` vào PostgreSQL qua [`DatabaseSeeder.php`](file:///d:/Code/FitApp/fitness-leveling/backend/database/seeders/DatabaseSeeder.php).
  - Nút *"Đăng nhập nhanh Demo"* thực hiện đăng nhập API thật và nhận Bearer token Sanctum thật từ DB.
  - Bảo vệ nghiêm ngặt các trang cá nhân ([`/dashboard`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/app/dashboard/page.tsx)), tự động chuyển hướng về `/auth/login` nếu chưa đăng nhập.
  - Đồng bộ số đo thể chất và lịch sử cân nặng từ API `/api/v1/body-metrics`.
- **Mở rộng Unit Test Suite (10/10 tests passed)**:
  - Bổ sung kiểm thử tự động xác minh tính toàn vẹn của 11 ID bài tập mẫu trong dataset 1,324 bài và kiểm thử thuật toán tính chuỗi Streak liên tục theo ngày lịch.


---

### 12. Bổ Sung Tab "Bài Tập" Riêng Biệt ([`/exercises`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/app/exercises/page.tsx))
- **Navigation Placement ([`Sidebar.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/layout/Sidebar.tsx))**:
  - Tích hợp mục menu **"Bài tập"** tại vị trí thứ 3 trên thanh Sidebar (ngay sau *"Luyện tập"*), sử dụng icon `BookOpen` liên kết đến đường dẫn `/exercises`.
- **Thư Viện Bài Tập Đầy Đủ (1,324+ Bài Tập)**:
  - Cho phép tra cứu toàn bộ kho bài tập từ dataset chuẩn quốc tế với hiệu năng cao trên client.
  - Thanh công cụ phía trên gồm: Ô tìm kiếm từ khóa thông minh (debounce 250ms), bộ lọc **Nhóm cơ** (*Ngực, Lưng, Đùi, Bắp chân, Vai, Tay, Bụng & Eo, Cardio*), bộ lọc **Dụng cụ** (*Bodyweight, Barbell, Dumbbell, Cable, Machine...*), và nút chuyển đổi nhanh **Chỉ bài tập có AI Pose Check**.
- **Lưới Ô Thẻ Bài Tập Trực Quan & Phân Trang Số Truyền Thống**:
  - Giao diện lưới thẻ responsive kèm ảnh minh họa thumbnail sắc nét, thẻ nhóm cơ, dụng cụ và huy hiệu AI.
  - Thanh phân trang số truyền thống `[Trước] [1] [2] [3] ... [56] [Sau]` với 24 bài tập/trang, tự động cuộn mượt mà lên đầu trang khi chuyển trang.
- **Cửa Sổ Chi Tiết Bài Tập Nổi ([`ExerciseDetailModal.tsx`](file:///d:/Code/FitApp/fitness-leveling/frontend/src/components/exercises/ExerciseDetailModal.tsx))**:
  - Hiển thị Popup Glassmorphism khi nhấp vào bất kỳ bài tập nào mà không làm mất vị trí cuộn trang.
  - Chiếu **ảnh GIF chuyển động cỡ lớn** thị phạm form chuẩn của động tác.
  - Thông tin chi tiết: Cơ chính, cơ phụ, dụng cụ, phân loại, trạng thái AI Pose Check.
  - **Hướng dẫn kỹ thuật từng bước (Step-by-step)** được định dạng rõ ràng từ mô tả tiếng Anh chuẩn.
  - Tích hợp 2 nút hành động: *"Tập bài này ngay"* (chuyển thẳng sang Live Workout session) và *"Thêm vào Routine"* (đưa vào routine tập luyện cá nhân).

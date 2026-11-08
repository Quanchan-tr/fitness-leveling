# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN (DEPLOYMENT GUIDE) DÀNH CHO NGƯỜI MỚI BẮT ĐẦU

> **Dành cho:** Lập trình viên mới bắt đầu, chưa từng có kinh nghiệm triển khai (deploy) sản phẩm lên Cloud/VPS.  
> **Hạ tầng mục tiêu:** Máy chủ ảo Ubuntu 24.04 LTS trên **Microsoft Azure for Students** (Standard B2als v2: 2 vCPU, 4GB RAM).  
> **Kiến trúc ứng dụng:** Docker Compose điều phối 5 Containers (Frontend Next.js 14, Backend Laravel 11 + Nginx, PostgreSQL 16, Queue Worker, Python MediaPipe Pose Worker).

---

## MỤC LỤC

1. [Hiểu đúng về "Deploy" — Tư duy hệ thống (Mental Model)](#1-hiểu-đúng-về-deploy--tư-duy-hệ-thống-mental-model)
2. [Hệ sinh thái ứng dụng của chúng ta trên VPS](#2-hệ-sinh-thái-ứng-dụng-của-chúng-ta-trên-vps)
3. [Giai đoạn 1: Mở cổng mạng (Port) trên Azure Firewall](#giai-đoạn-1-mở-cổng-mạng-port-trên-azure-firewall)
4. [Giai đoạn 2: Kết nối vào VPS bằng SSH qua file khóa (.pem)](#giai-đoạn-2-kết-nối-vào-vps-bằng-ssh-qua-file-khóa-pem)
5. [Giai đoạn 3: Chuẩn bị hệ điều hành (Tạo Swap RAM & Cài Docker)](#giai-đoạn-3-chuẩn-bị-hệ-điều-hành-tạo-swap-ram--cài-docker)
6. [Giai đoạn 4: Đưa mã nguồn lên máy chủ VPS](#giai-đoạn-4-đưa-mã-nguồn-lên-máy-chủ-vps)
7. [Giai đoạn 5: Cấu hình biến môi trường & Khởi chạy Docker Compose](#giai-đoạn-5-cấu-hình-biến-môi-trường--khởi-chạy-docker-compose)
8. [Giai đoạn 6: Khởi tạo Cơ sở dữ liệu (Database Migration & Seeding)](#giai-đoạn-6-khởi-tạo-cơ-sở-dữ-liệu-database-migration--seeding)
9. [Giai đoạn 7: Quản trị, Xử lý sự cố & Bảo toàn $100 Credit](#giai-đoạn-7-quản-trị-xử-lý-sự-cố--bảo-toàn-100-credit)

---

## 1. HIỂU ĐÚNG VỀ "DEPLOY" — TƯ DUY HỆ THỐNG (MENTAL MODEL)

### "Deploy" là gì? Tại sao phải deploy?
* **Ở máy cá nhân (Localhost):** Khi bạn gõ `npm run dev` hay chạy Docker trên máy tính của bạn, website chỉ hoạt động tại địa chỉ `http://localhost:3000`. Chỉ có duy nhất một mình bạn ngồi trước màn hình máy tính đó mới xem được. Người ngoài hoặc điện thoại không thể vào được.
* **Deploy (Triển khai):** Là hành động đưa toàn bộ mã nguồn, cơ sở dữ liệu và các dịch vụ của dự án lên một chiếc máy tính thật đang chạy 24/7 trên Internet (gọi là máy chủ ảo — **VPS: Virtual Private Server**). Chiếc máy chủ này được cấp một địa chỉ **Public IP** cố định (ví dụ `13.75.74.115`), giúp bất kỳ ai trên thế giới có kết nối Internet đều có thể truy cập được ứng dụng của bạn.

---

## 2. HỆ SINH THÁI ỨNG DỤNG CỦA CHÚNG TA TRÊN VPS

Trước khi gõ lệnh, bạn cần hình dung được trên máy chủ đang chạy những gì:

```
                                      INTERNET
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
                 Cổng 3000 (Web UI)              Cổng 8000 (API REST)
                         │                               │
        ┌────────────────┼───────────────────────────────┼────────────────┐
        │ VPS (UBUNTU)   │                               │                │
        │                ▼                               ▼                │
        │      ┌──────────────────┐            ┌──────────────────┐       │
        │      │     Frontend     │            │   Backend API    │       │
        │      │   (Next.js 14)   │ ─────────► │ (Laravel+Nginx)  │       │
        │      └──────────────────┘            └────────┬─────────┘       │
        │                                               │                 │
        │                        ┌──────────────────────┼──────────┐      │
        │                        ▼                      ▼          ▼      │
        │              ┌──────────────────┐   ┌────────────┐ ┌──────────┐ │
        │              │  PostgreSQL 16   │   │Queue Worker│ │AI Worker │ │
        │              │(Cơ sở dữ liệu DB)│   │(Hàng đợi)  │ │(FastAPI) │ │
        │              └──────────────────┘   └────────────┘ └──────────┘ │
        │                                                                 │
        └─────────────────────────────────────────────────────────────────┘
```

Dự án này gồm **5 Container** được Docker kết nối với nhau trong một mạng nội bộ ảo:
1. **Frontend (Next.js 14):** Cung cấp giao diện web, phòng tập 3D Three.js (chạy cổng 3000).
2. **Backend API (Laravel 11 + PHP 8.3-FPM + Nginx):** Tiếp nhận yêu cầu đăng nhập, lưu bài tập, dinh dưỡng, gamification (chạy cổng 8000).
3. **Database (PostgreSQL 16):** Nơi lưu trữ vĩnh viễn thông tin user, 1,324 bài tập, lịch sử tập, điểm XP.
4. **Queue Worker:** Container chạy ngầm để quét hàng đợi, tự động chuyển video sang cho AI xử lý mà không làm đơ web.
5. **Pose Worker (Python FastAPI + MediaPipe):** Trí tuệ nhân tạo bóc tách 33 khớp xương và chấm điểm động tác tập luyện (nội bộ, bảo mật không mở ra ngoài).

---

## GIAI ĐOẠN 1: MỞ CỔNG MẠNG (PORT) TRÊN AZURE FIREWALL

### Giảng giải: Cổng (Port) là gì? Tường lửa (Firewall) là gì?
* **Địa chỉ IP** giống như số nhà của bạn trên Internet.
* **Cổng (Port)** giống như các cánh cửa vào nhà:
  * Cửa 22 (SSH): Cửa dành riêng cho người quản trị vào sửa nhà bằng dòng lệnh.
  * Cửa 80 / 443 (HTTP/HTTPS): Cửa chính cho khách vào xem web chuẩn.
  * Cửa 3000: Cửa dẫn vào giao diện Next.js Web của chúng ta.
  * Cửa 8000: Cửa dẫn vào hệ thống API Laravel của chúng ta.
* **Tường lửa (Azure Network Security Group — NSG):** Mặc định Azure dựng một bức tường thép chặn tất cả mọi cổng vào VPS để hacker không thể tấn công. Nếu bạn không vào Azure khai báo *"Tôi cho phép mở cổng 3000 và 8000"*, thì dù ứng dụng trên VPS có chạy hoàn hảo, người dùng ở ngoài gõ vào web vẫn bị báo lỗi: **`Connection timed out` (Không thể kết nối)**.

### Thao tác thực hiện trên Azure Portal:
1. Mở trang quản lý máy ảo `fittrack-vps` trên Azure Portal.
2. Bấm nút **`▶️ Start`** ở thanh trên cùng để bật máy (chờ trạng thái chuyển sang xanh: **`Running`**).
3. Nhìn sang cột bên phải, ghi lại địa chỉ **`Public IP address`** (ví dụ: `13.75.74.115`).
4. Ở thanh menu bên trái, chọn mục **Networking** (hoặc **Network settings**).
5. Bấm nút **`Add inbound port rule`** ở góc phải màn hình và điền chính xác:
   * **Source:** `Any` *(Cho phép mọi người từ khắp nơi truy cập)*
   * **Destination port ranges:** `3000, 8000` *(Mở cùng lúc cổng Web và cổng API)*
   * **Protocol:** `TCP` hoặc `Any`
   * **Action:** `Allow` *(Cho phép đi qua)*
   * **Priority:** `310` (hoặc bất kỳ số nào từ 100 đến 4000)
   * **Name:** `Allow-FitTrack-Web-API`
6. Bấm **Add** và chờ 10 giây để Azure lưu lại.

---

## GIAI ĐOẠN 2: KẾT NỐI VÀO VPS BẰNG SSH QUA FILE KHÓA (.PEM)

### Giảng giải: SSH là gì? Tại sao dùng file khóa (.pem) thay vì mật khẩu?
* **SSH (Secure Shell):** Là đường hầm mã hóa bảo mật cho phép bạn ngồi ở máy tính của mình (Windows) nhưng điều khiển máy chủ Linux đặt cách xa hàng ngàn cây số thông qua giao diện dòng lệnh.
* **File khóa `.pem` (Public-Private Key):** Đăng nhập bằng mật khẩu thường dễ bị hacker đoán hoặc dò tự động (brute-force). File `.pem` là một chìa khóa số học mã hóa cực kỳ phức tạp (2048-bit), chỉ ai giữ chiếc chìa khóa này trong máy mới có thể mở cửa vào VPS.

### Thao tác thực hiện từ máy tính của bạn:

1. Xác định vị trí file **`fittrack-vps_key.pem`** bạn đã tải về khi tạo máy (thường nằm ở `C:\Users\<Tên_Bạn>\Downloads`).
2. Mở cửa sổ **PowerShell** hoặc **Command Prompt** trên máy Windows của bạn.
3. Di chuyển đến thư mục chứa file khóa:
   ```powershell
   cd ~/Downloads
   ```
4. Gõ lệnh kết nối SSH (thay `13.75.74.115` bằng Public IP thực tế của bạn):
   ```bash
   ssh -i fittrack-vps_key.pem azureuser@13.75.74.115
   ```
5. **Lần đầu tiên kết nối**, terminal sẽ hỏi xác nhận độ tin cậy:
   ```text
   The authenticity of host '13.75.74.115' can't be established.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```
   👉 Gõ: **`yes`** rồi bấm **Enter**.
6. Khi terminal đổi thành dấu nhắc:
   ```text
   azureuser@fittrack-vps:~$
   ```
   🎉 **Bạn đã đăng nhập thành công vào bên trong máy chủ Linux!**

> [!TIP]
> **Xử lý lỗi quyền file trên Windows (Nếu gặp lỗi "UNPROTECTED PRIVATE KEY FILE"):**  
> Nếu Windows cảnh báo file `.pem` có quyền quá mở, mở PowerShell chạy lệnh sau để khóa quyền chỉ cho riêng bạn đọc:
> ```powershell
> icacls .\fittrack-vps_key.pem /inheritance:r
> icacls .\fittrack-vps_key.pem /grant:r "$($env:USERNAME):(R)"
> ```

---

## GIAI ĐOẠN 3: CHUẨN BỊ HỆ ĐIỀU HÀNH (TẠO SWAP RAM & CÀI DOCKER)

### Việc 1: Tạo 4GB RAM ảo (Swap Space) — Bắt buộc đối với máy 4GB RAM!
* **Tại sao phải làm vậy?** Máy ảo của bạn có 4GB RAM vật lý. Khi cả 5 container chạy, dung lượng RAM cơ bản chiếm khoảng 1.5GB. Tuy nhiên, khi người dùng tải lên 1 video quay tư thế tập squat để AI Pose phân tích, thư viện MediaPipe và OpenCV sẽ ngốn tức thời thêm 1GB – 1.5GB RAM. Nếu không có Swap, tổng RAM vượt quá 4GB, hệ điều hành Linux sẽ kích hoạt cơ chế tự vệ **OOM (Out Of Memory) Killer** và tự động "bắn hạ" (tắt đột ngột) container Database hoặc Backend khiến web bị sập.
* **Swap là gì?** Swap là việc trích ra 4GB dung lượng từ ổ cứng SSD để làm "RAM dự phòng". Khi RAM thật đầy, máy sẽ tạm thời chuyển dữ liệu sang Swap, giữ cho hệ thống luôn sống sót mượt mà.

**Gõ lệnh tạo Swap trên terminal VPS:**
```bash
# 1. Tạo 1 file trống dung lượng 4GB
sudo fallocate -l 4G /swapfile

# 2. Phân quyền chỉ quản trị viên mới được đọc file này (bảo mật)
sudo chmod 600 /swapfile

# 3. Định dạng file thành bộ nhớ Swap
sudo mkswap /swapfile

# 4. Kích hoạt Swap ngay lập tức
sudo swapon /swapfile

# 5. Lưu vào cấu hình hệ thống để mỗi lần khởi động lại máy Swap tự bật
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Kiểm tra lại kết quả
free -h
```
*(Nếu thấy dòng `Swap:` hiển thị khoảng `4.0Gi` là bạn đã tạo RAM ảo thành công!)*

---

### Việc 2: Cài đặt Docker và Docker Compose
* **Tại sao dùng Docker mà không cài PHP, Node.js, Python thẳng vào máy?** Nếu cài thẳng vào máy, bạn sẽ phải cài hàng chục thư viện khác nhau, rất dễ bị xung đột phiên bản (ví dụ máy chủ dùng Python 3.12 trong khi code cần Python 3.11, hoặc phiên bản PHP không tương thích). Docker đóng gói mọi thứ thành các "thùng hàng" (Containers) độc lập, chứa sẵn môi trường hoàn hảo giống y hệt như lúc lập trình, đảm bảo chạy đúng 100%.

**Gõ lệnh cài đặt Docker chính thức:**
```bash
# Tải script cài đặt tự động từ trang chủ Docker
curl -fsSL https://get.docker.com -o get-docker.sh

# Chạy script cài đặt
sudo sh get-docker.sh

# Cấp quyền cho user azureuser sử dụng Docker không cần gõ sudo
sudo usermod -aG docker $USER
newgrp docker

# Cài đặt thêm Git để tải code
sudo apt-get update && sudo apt-get install -y git

# Kiểm tra Docker đã chạy tốt chưa
docker compose version
```
*(Màn hình hiện ra `Docker Compose version v2.x.x` là hoàn thành).*

---

## GIAI ĐOẠN 4: ĐƯA MÃ NGUỒN LÊN MÁY CHỦ VPS

Bạn có 2 lựa chọn đưa code lên máy chủ:

### 👉 Cách 1: Dùng Git Clone từ GitHub (Cách chuẩn & chuyên nghiệp)
Nếu mã nguồn của bạn đã được đẩy lên GitHub cá nhân (public hoặc private):
```bash
# Di chuyển về thư mục gốc của user
cd ~

# Tải dự án từ GitHub về VPS
git clone <ĐƯỜNG_DẪN_REPO_GITHUB_CỦA_BẠN>

# Truy cập vào thư mục vừa tải
cd fitness-leveling
```

### 👉 Cách 2: Copy trực tiếp từ máy tính Windows lên VPS bằng lệnh `scp`
Nếu bạn chưa đưa code lên GitHub và muốn copy trực tiếp thư mục `fitness-leveling` hiện tại:

1. Mở một cửa sổ **PowerShell MỚI trên máy tính của bạn** (đang đứng tại máy tính cá nhân, không phải trên VPS).
2. Chạy lệnh copy sau (thay `13.75.74.115` bằng IP máy ảo):
   ```powershell
   scp -i ~/Downloads/fittrack-vps_key.pem -r d:\Code\FitApp\fitness-leveling azureuser@13.75.74.115:/home/azureuser/
   ```
3. Chờ tiến trình copy hoàn tất. Trên cửa sổ SSH của VPS gõ `ls` sẽ thấy thư mục `fitness-leveling`.

---

## GIAI ĐOẠN 5: CẤU HÌNH BIẾN MÔI TRƯỜNG & KHỞI CHẠY DOCKER COMPOSE

### Việc 1: Hiểu về biến môi trường (Environment Variables)
* Biến môi trường (`.env`) chứa các thông tin nhạy cảm: Mật khẩu Database, Secret Key, địa chỉ IP của máy chủ. Chúng ta không bao giờ đưa mật khẩu này lên GitHub công khai mà sẽ cấu hình riêng ngay trên máy chủ thật.

Truy cập vào thư mục dự án trên VPS:
```bash
cd ~/fitness-leveling
```

### Việc 2: Cấu hình biến môi trường cho Backend (`backend/.env`)
Kiểm tra file cấu hình môi trường Backend trên VPS:
```bash
cat backend/.env
```
Đảm bảo các cấu hình cơ bản đã sẵn sàng:
* `APP_ENV=production`
* `APP_DEBUG=false` *(Tắt chế độ debug trên server để tránh lộ thông tin bảo mật khi có lỗi)*
* `DB_HOST=postgres` *(Docker tự động trỏ tên container thành địa chỉ mạng nội bộ)*
* `DB_DATABASE=fitnessleveling`
* `DB_USERNAME=fitnessleveling_user`
* `DB_PASSWORD=fitnessleveling_password`

### Việc 3: Cấu hình biến môi trường cho Frontend (CỰC KỲ QUAN TRỌNG)
> [!IMPORTANT]
> **"Bẫy" kinh điển của Next.js:**  
> Next.js biên dịch mã nguồn phía client (trình duyệt người dùng tải về chạy). Nếu bạn để `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`, khi một người bạn ở nhà mở trình duyệt gõ `http://13.75.74.115:3000`, trình duyệt của bạn đó sẽ cố gửi API vào máy tính của chính bạn đó (`localhost`) thay vì gửi vào VPS của bạn!  
> Vì vậy, chúng ta phải khai báo biến `NEXT_PUBLIC_API_BASE_URL` trỏ vào chính **Public IP của VPS**.

Tạo file `.env` ở thư mục gốc của dự án trên VPS (thay `13.75.74.115` bằng IP máy ảo):
```bash
echo "NEXT_PUBLIC_API_BASE_URL=http://13.75.74.115:8000/api/v1" > .env
```

---

### Việc 4: Khởi chạy toàn bộ hệ thống bằng Docker Compose
Gõ lệnh để Docker tải base images, build và khởi động 5 containers:
```bash
docker compose up -d --build
```

**Giải thích ý nghĩa lệnh:**
* `up`: Ra lệnh cho Docker dựng và chạy tất cả các dịch vụ được khai báo trong `docker-compose.yml`.
* `-d` (*detached mode*): Chạy ngầm dưới nền. Sau khi chạy xong, terminal sẽ trả lại dấu nhắc để bạn gõ lệnh tiếp mà không bị khóa màn hình. Nếu tắt cửa sổ SSH, web vẫn tiếp tục chạy bình thường.
* `--build`: Ép Docker biên dịch lại mã nguồn mới nhất (Next.js build, PHP-FPM build, Python dependencies).

Quá trình build lần đầu tiên trên VPS mất khoảng **3 – 5 phút**. Khi hoàn tất, màn hình sẽ báo:
```text
✔ Container fitnessleveling-postgres       Started
✔ Container fitnessleveling-backend        Started
✔ Container fitnessleveling-queue-worker   Started
✔ Container fitnessleveling-pose-worker    Started
✔ Container fitnessleveling-frontend       Started
```

Kiểm tra trạng thái các container đang chạy:
```bash
docker compose ps
```
*(Nếu thấy cả 5 container đều ghi chữ **`Up`** là hệ thống đã hoạt động mỹ mãn!)*

---

## GIAI ĐOẠN 6: KHỞI TẠO CƠ SỞ DỮ LIỆU (DATABASE MIGRATION & SEEDING)

### Giảng giải: Tại sao có PostgreSQL rồi mà vẫn phải chạy migration?
Container PostgreSQL giống như một cuốn sổ trắng tinh mới mua về. Lệnh **`migrate`** của Laravel sẽ tự động đọc các file migration và kẻ các trang bảng: tạo bảng người dùng (`users`), bảng bài tập (`exercises`), nhật ký tập luyện (`workout_logs`), gamification (`xp, level, streak`), v.v.  
Lệnh **`db:seed`** sẽ bơm sẵn 1,324 bài tập thể hình chuẩn và tài khoản demo vào database để bạn có dữ liệu thật sử dụng ngay.

**Gõ 3 lệnh sau trên terminal VPS:**

```bash
# 1. Tạo chìa khóa bảo mật APP_KEY cho Laravel
docker compose exec backend php artisan key:generate --force

# 2. Tạo toàn bộ 16 bảng dữ liệu vào cơ sở dữ liệu PostgreSQL
docker compose exec backend php artisan migrate --force

# 3. Nạp tài khoản demo và dữ liệu khởi tạo
docker compose exec backend php artisan db:seed --force
```

---

## 7. TẬN HƯỞNG THÀNH QUẢ TRÊN TRÌNH DUYỆT 🚀

Mở trình duyệt trên máy tính hoặc điện thoại bất kỳ (kể cả mạng 4G/5G) và truy cập:

1. **Giao diện Web 3D Fitness Leveling:**
   ```text
   http://<IP_MÁY_ẢO_CỦA_BẠN>:3000
   ```
   *(Ví dụ: `http://13.75.74.115:3000`)*
   * Đăng nhập thử với tài khoản demo: `demo@fitnessleveling.test` / `password123`.
   * Trải nghiệm phòng tập 3D, tạo giáo án tập luyện, xem bảng nhiệm vụ hôm nay và thử tính năng AI Pose Coach!

2. **Kiểm tra API Backend hoạt động:**
   ```text
   http://<IP_MÁY_ẢO_CỦA_BẠN>:8000/api/v1/exercises
   ```
   *(Nếu thấy trả về chuỗi JSON danh mục bài tập là Backend hoàn toàn khỏe mạnh).*

---

## GIAI ĐOẠN 7: QUẢN TRỊ, XỬ LÝ SỰ CỐ & BẢO TOÀN $100 CREDIT

### 1. Cách xem Log kiểm tra lỗi khi có sự cố
Nếu website bị lỗi hoặc một container không chạy được, bạn có thể xem "nhật ký hoạt động" (logs) của container đó theo thời gian thực:
```bash
# Xem log toàn bộ hệ thống
docker compose logs -f

# Hoặc chỉ xem riêng log Backend Laravel
docker compose logs -f backend

# Hoặc chỉ xem riêng log AI Pose Worker Python
docker compose logs -f pose-worker
```
*(Bấm `Ctrl + C` để thoát khỏi màn hình xem log).*

### 2. Các lệnh quản lý thường dùng:
```bash
# Khởi động lại hệ thống
docker compose restart

# Tạm dừng toàn bộ hệ thống (dữ liệu DB trong volume vẫn được giữ nguyên)
docker compose down

# Khi bạn sửa code và muốn cập nhật phiên bản mới nhất lên server:
git pull
docker compose up -d --build
```

### 3. QUY TẮC SỐ 1 VỀ BẢO TOÀN $100 CREDIT AZURE (CỰC KỲ QUAN TRỌNG)
* Khi bạn không sử dụng hoặc chuẩn bị đi ngủ:
  * Mở trình duyệt vào **Azure Portal** ➔ Chọn máy ảo `fittrack-vps`.
  * Bấm nút **`⏹ Stop`** ở thanh trên cùng.
  * Chờ trạng thái máy chuyển sang: **`Stopped (deallocated)`**.
* **Ý nghĩa:** Trạng thái `Stopped (deallocated)` đồng nghĩa Azure giải phóng 100% CPU & RAM, tiền giờ máy = **$0**. Mọi dữ liệu cài đặt, code, Docker, Database của bạn vẫn nằm nguyên vẹn trên ổ cứng mà không bị mất gì cả. Khi nào cần dùng tiếp, bạn chỉ việc vào bấm **`▶️ Start`** lại là mọi thứ tự động chạy lại bình thường!


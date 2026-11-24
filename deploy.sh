#!/bin/bash
# Dừng script ngay lập tức nếu có bất kỳ lệnh nào bị lỗi
set -e

echo "🚀 [1/5] Kéo mã nguồn mới nhất từ GitHub..."
git fetch origin dev
git reset --hard origin/dev

echo "📦 [2/5] Build và khởi động lại các Container..."
docker compose up -d --build

echo "🗄️ [3/5] Chạy cập nhật Cơ sở dữ liệu (Migration)..."
docker compose exec -T backend php artisan migrate --force

echo "⚡ [4/5] Tối ưu hóa bộ nhớ Cache Laravel..."
# Tạo đầy đủ các thư mục cache nếu chưa có và cấp quyền ghi
docker compose exec -T backend mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions
docker compose exec -T backend chmod -R 775 storage bootstrap/cache

docker compose exec -T backend php artisan config:cache
docker compose exec -T backend php artisan route:cache
docker compose exec -T backend php artisan view:cache

echo "🔄 [5/5] Tải lại Nginx..."
sudo systemctl reload nginx

echo "🎉 ===> TRIỂN KHAI TỰ ĐỘNG THÀNH CÔNG (DEPLOY SUCCESSFUL) <==="
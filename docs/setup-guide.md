# FitTrack AI — Setup & Deployment Guide

This guide outlines how to configure, run, and validate the FitTrack AI full-stack platform.

---

## 1. Quick Start with Docker Compose (Recommended)

Make sure **Docker Desktop** is running, then execute from the repository root:

```powershell
# Copy environment configuration
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Build and start all services
docker compose up -d --build
```

### Services Started
- **Next.js Frontend:** [http://localhost:3000](http://localhost:3000)
- **Laravel 11 Backend API:** [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Python Pose Worker:** [http://localhost:8001/docs](http://localhost:8001/docs)
- **MinIO Object Storage Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin` / Pass: `minioadmin`)
- **PostgreSQL 16:** Port `5432` (`fittrack` db, `fittrack_user` / `fittrack_password`)
- **Redis 7.2:** Port `6379`
- **Laravel Queue Worker:** Running background jobs for `pose_processing` and `default`

---

## 2. Running Migrations

Inside the backend container:

```powershell
docker compose exec backend php artisan migrate
```

---

## 3. Local Frontend Development (Standalone)

```powershell
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. 3D Dashboard Interactive Controls

- **Fixed 3/4 Isometric Camera:** Camera is fixed at `[7.2, 6.2, 7.2]` looking at `[0, 0.9, 0]`.
- **Wall Note (Corkboard):** Click to open the **Body Metrics & Measurements Modal**.
- **Progress Photo Album (Desk):** Click to open the **Progress Photo Timeline & Before/After Comparison Modal**.

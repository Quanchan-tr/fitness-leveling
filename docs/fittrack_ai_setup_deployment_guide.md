# FitTrack AI — Setup & Deployment Guide

This guide outlines how to configure, run, and validate the FitTrack AI full-stack platform across Windows (Command Prompt / PowerShell) and Linux/macOS environments.

---

## 1. Quick Start with Docker Compose (Recommended)

Make sure **Docker Desktop** is installed and actively running, then follow the setup steps from the repository root.

### Step 1.1: Image Registry Adjustment (Important)

Due to changes in MinIO distribution on Docker Hub, verify that your `docker-compose.yml` points to the official Quay.io registry for MinIO to avoid pull access errors:

```yaml
# Inside docker-compose.yml under services.minio:
image: quay.io/minio/minio:latest
```

*(Optional: Remove the obsolete top-level `version: '...'` attribute if present to silence compose warnings).*

---

### Step 1.2: Environment Configuration

Copy the default environment templates to create active configurations.

**On Windows Command Prompt (CMD):**
```cmd
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

**On PowerShell / macOS / Linux:**
```powershell
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

---

### Step 1.3: Build and Start Services

```cmd
docker compose up -d --build
```

### Services Started
- **Next.js Frontend:** [http://localhost:3000](http://localhost:3000)
- **Laravel 11 Backend API:** [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Python Pose Worker Docs:** [http://localhost:8001/docs](http://localhost:8001/docs)
- **MinIO Object Storage Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin` / Pass: `minioadmin`)
- **PostgreSQL 16:** Port `5432` (`fittrack` db, `fittrack_user` / `fittrack_password`)
- **Redis 7.2:** Port `6379`
- **Laravel Queue Worker:** Running background jobs for `pose_processing` and `default`

---

## 2. Running Migrations

Once the containers are up and healthy, execute the database migrations inside the backend service:

```cmd
docker compose exec backend php artisan migrate
```

---

## 3. Local Frontend Development (Standalone Option)

If you prefer developing the Next.js UI on your host system instead of within Docker:

1. Stop the containerized frontend:
   ```cmd
   docker compose stop frontend
   ```
2. Navigate to the frontend directory and start the local development server:
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```
3. Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. 3D Dashboard Interactive Controls

- **Fixed 3/4 Isometric Camera:** Camera is fixed at `[7.2, 6.2, 7.2]` looking at `[0, 0.9, 0]`.
- **Wall Note (Corkboard):** Click to open the **Body Metrics & Measurements Modal**.
- **Progress Photo Album (Desk):** Click to open the **Progress Photo Timeline & Before/After Comparison Modal**.

---

## 5. Troubleshooting Common Issues

- **MinIO Pull Access Denied (`pull access denied for minio/minio`):** Ensure you updated the image reference to `quay.io/minio/minio:latest` in `docker-compose.yml`.
- **Port Conflict (`bind: address already in use`):** Ensure local services using ports `3000`, `8000`, `5432`, `6379`, or `9000/9001` (e.g., local PostgreSQL or Redis) are stopped before running `docker compose up`.
- **File Not Found (`copy` / `cd` errors):** Wrap file and directory paths containing spaces or special characters in double quotes (`"..."`).
# Session State: FitnessLeveling AI Pose Worker (FastAPI Microservice)
*Last Updated: 2026-10-25 00:17*

## 1. Core Objective & Scope
- **Goal:** High-precision computer vision microservice analyzing human biomechanics for workout tracking. Ingests video files and live camera streams, extracts 33 BlazePose landmarks via Google MediaPipe, and evaluates exercise form, Range of Motion (ROM), rep count, and posture faults across 13 compound movements.
- **Constraints & Environment:**
  - **Runtime & Language:** Python 3.11-slim (Docker container) / Python 3.14 (Host dev environment).
  - **Framework & Libraries:** FastAPI 0.115+, Uvicorn 0.31+, Pydantic v2 (2.9+), MediaPipe 0.10.30+, OpenCV headless 4.10+, NumPy 1.26+.
  - **Service Port & Network:** Port 8001, private internal Docker Compose network (unexposed publicly).
  - **Shared Storage:** Direct read access to shared Docker named volume (`private_storage` mounted at `/app/private_storage`).
  - **Processing Constraints:** Video size cap 100MB (`POSE_VIDEO_MAX_SIZE_MB`), maximum video duration 60s (`POSE_VIDEO_MAX_DURATION_SEC`).

## 2. Key Decisions & Architecture
- **Unified Rule Engine & 13 Exercises:**
  - Implemented in `pose-worker/app/rules/` and registered in `EXERCISE_RULES` / `RULES_REGISTRY` (supporting standard keys and `_v1` aliases):
    - **Core / Baseline:** Squat (`SquatRule`), Pushup (`PushupRule`), Plank (`PlankRule`), Wall Sit (`WallSitRule`).
    - **Bodyweight Series:** Lunge (`LungeRule`), Glute Bridge (`GluteBridgeRule`), Jumping Jack (`JumpingJackRule`), Mountain Climber (`MountainClimberRule`).
    - **Weighted Series:** Bicep Curl (`BicepCurlRule`), Shoulder Press (`ShoulderPressRule`), Deadlift (`DeadliftRule`), Sit-Up (`SitUpRule`), Lateral Raise (`LateralRaiseRule`).
- **Decoupled Rep Classification:**
  - Independent evaluation of Range of Motion (ROM) vs Technical Form (`RepStatus` schema):
    - `GOOD_REP`: Reached minimum ROM threshold (`PEAK_OK >= 0.85`) with correct biomechanics.
    - `BAD_FORM`: Reached minimum ROM threshold, but flagged with biomechanical posture defects (knee valgus, rounded back, excessive torso lean).
    - `NO_REP`: Initiated movement but failed to achieve minimum ROM depth.
- **State Machine & Signal Processing:**
  - Exponential Moving Average (EMA) angle smoothing (`alpha = 0.40`).
  - Hysteresis thresholds to eliminate jitter: `START = 0.30`, `END = 0.15`, `PEAK_OK = 0.85`.
  - Temporal boundaries: Minimum rep duration (`MIN_REP_SEC = 0.6s`), rep cooldown (`COOLDOWN_SEC = 0.2s`), and pace monitoring (`RHYTHM_SLOWING`).
  - Automatic Camera View Detection (`detect_camera_view`): Classifies perspective (`FRONT_VIEW`, `SIDE_VIEW`, `DIAGONAL_VIEW`) via shoulder-hip vectors to dynamically select the optimal 2D/3D projection plane.
- **Service Endpoints & Workflows:**
  - `POST /v1/process-video`: Asynchronous video batch processing dispatched by Laravel queue worker; reads directly from `private_storage` volume and returns `WorkerTaskResult`.
  - `POST /v1/analyze-frame`: Single base64 image decoding for browser landmark extraction.
  - `WEBSOCKET /ws/pose-stream/{exercise_type}`: Bidirectional live WebSocket stream for mobile clients using `RealtimePoseEvaluator`.

## 3. Execution Log (Attempts & Results)
- [x] **[Success]** Initial Pose Service Scaffolding: Established FastAPI service structure, MediaPipe landmark extractor, and initial Squat/Pushup/Plank evaluation rules.
- [x] **[Success]** Kinematic Rule Expansion (`62efff5`, `6846a06`): Modularized and integrated 10 additional exercises into `BasePoseRule` and `RepBasedRule` with normalized `measure()` and `judge()` hooks.
- [x] **[Success]** Decoupled Rep Status Schema (`a25e764`): Introduced `RepStatus` (`GOOD_REP`, `BAD_FORM`, `NO_REP`) to separate valid physical reps from posture penalty scores.
- [x] **[Success]** Bidirectional WebSocket Engine (`d019d46`): Implemented `RealtimePoseEvaluator` and `/ws/pose-stream/{exercise_type}` for low-latency live camera streaming.
- [x] **[Success]** Shared Volume File Access (`c4cc612`): Replaced S3 / MinIO pre-signed URL downloads with direct volume file reading on `private_storage`.
- [ ] **[Dead End]** Pre-signed S3 URL Video Downloads: Provisioning MinIO/S3 object storage for local Docker workflows added network and memory overhead without benefit; pivoted to internal shared named volume.
- [ ] **[Dead End]** HTTP POST Polling for Camera Frames: Streaming 30fps base64 images over HTTP POST produced excessive TCP overhead and dropped frames; pivoted to WebSocket binary stream for real-time and client-side `@mediapipe/tasks-vision` for web.
- [x] **[Pivot]** Generic Rep-Based Rule Base Class: Centralized hysteresis state machine, EMA smoothing, and rep feedback formatting in `RepBasedRule`, reducing exercise-specific implementations to concise `measure()` and `judge()` functions.

## 4. Current State & Residual Debt
- **Active Working Set:**
  - `pose-worker/app/main.py`: REST and WebSocket API routes.
  - `pose-worker/app/rules/`: 13 biomechanics kinematic rule evaluators.
  - `pose-worker/app/rules/realtime_evaluator.py`: Live streaming pose evaluator.
  - `pose-worker/app/cv/`: MediaPipe landmark extractor and 3D angle math utilities.
  - `pose-worker/tests/`: 30 unit tests (27 passing, 3 failing).
- **Current Blocker / State:**
  - 3 Test Failures in `tests/test_pose_rules.py`:
    1. `test_squat_cooldown_prevents_double_count`: Rep cooldown boundary condition counted 2 reps instead of 1.
    2. `test_squat_no_rep_insufficient_rom`: Incomplete ROM cycle assert expected 1 rep recorded as `NO_REP`, but 0 reps were added.
    3. `test_squat_bad_form_excessive_lean`: Forward lean test frame produced `GOOD_REP` instead of `BAD_FORM` due to synthetic landmark coordinate offsets.
  - CPU-Only Execution: OpenCV and MediaPipe currently execute on CPU without GPU delegate or TensorRT optimizations.
  - Landmark Visibility Thresholds: Raised to 0.65 to align with frontend gatekeeper, requiring good ambient lighting and clear camera framing.

## 5. Next Steps (For Resuming Session)
1. Fix the 3 failing tests in `pose-worker/tests/test_pose_rules.py` by tuning synthetic coordinate geometry and updating hysteresis boundary assertions.
2. Add end-to-end integration test simulating `POST /v1/process-video` using a sample MP4 on the `private_storage` volume.
3. Optimize WebSocket frame decoding: implement frame throttling/skipping in `RealtimePoseEvaluator` to preserve 30fps throughput on slower mobile networks.
4. Profile memory and CPU utilization during concurrent multi-session video processing to tune Uvicorn worker concurrency.

# Session State: FitTrack Mobile (Android Client)
*Last Updated: 2026-10-25 00:11*

## 1. Core Objective & Scope
- **Goal:** Native Android mobile client for Fitness Leveling providing gamified workout and nutrition tracking, body metrics analytics, daily RPG quests, and on-device AI Pose Coach form validation via CameraX and MediaPipe.
- **Constraints & Environment:**
  - **Platform & Language:** Native Android, Kotlin (Plugin `2.1.0`, compiler `jvmTarget = "17"`), Java 17 compatibility.
  - **SDK Versions:** `compileSdk = 35`, `minSdk = 26`, `targetSdk = 35`, Android Gradle Plugin (AGP) `8.7.3`.
  - **UI & Architecture:** ViewBinding (`buildFeatures.viewBinding = true`), Jetpack Navigation Component `2.8.5` (`nav_graph.xml`), Material Design 3 (`1.12.0`), ConstraintLayout `2.2.0`, Activity-KTX `1.9.3`.
  - **Permissions:** `android.permission.INTERNET`, `android.permission.CAMERA` declared in `mobile/app/src/main/AndroidManifest.xml`.
  - **Package Namespace:** `com.fittrack.app`.

## 2. Key Decisions & Architecture
- **Hybrid Navigation Model:**
  - **Auth Flow:** Single-Activity host (`MainActivity.kt`) using Jetpack Navigation component (`nav_graph.xml`) routing between 6 fragments (`LoginFragment`, `SignUpFragment`, `VerifyEmailFragment`, `ForgotPasswordFragment`, `VerifyForgotPasswordFragment`, `CreateNewPasswordFragment`).
  - **Core Feature Hubs:** Dedicated Activities for distinct functional domains (`DashboardActivity`, `WorkoutsActivity`, `BodyMetricsActivity`, `NutritionTrackerActivity`, `CommunityActivity`, `UserProfileActivity`, `SettingsActivity`, `AiPoseCoachActivity`, `AiPoseActiveSessionActivity`).
  - **Onboarding Pipeline:** Linear 13-stage Activity flow (`OnboardingGenderActivity` through `OnboardingLoadingActivity`) with automated redirect to `DashboardActivity` on completion.
- **Bottom Navigation Sync:**
  - Shared `layout_bottom_nav.xml` coordinated via `mobile/app/src/main/java/com/fittrack/app/ui/BottomNavHelper.kt`.
  - Tab styling and state switching (`DASHBOARD`, `WORKOUTS`, `METRICS`, `COMMUNITY`, `PROFILE`) use `Intent.FLAG_ACTIVITY_REORDER_TO_FRONT` with zero-duration transitions (`overridePendingTransition(0, 0)`).
- **Modal Dialog Pattern:**
  - Full-screen modal interactions implemented as lightweight translucent activities (`@style/Theme.FitTrack.Modal` with dim overlay `#8A000000`): `DailyQuestsModalActivity`, `ExercisePickerModalActivity`, `WorkoutSummaryModalActivity`, `AiCalibrationModalActivity`, `LogMealModalActivity`.
- **Styling & Localization:**
  - Centralized Figma design tokens in `mobile/app/src/main/res/values/colors.xml`: Primary brand `#FF5722`, active nav `#FF7A00`, secondary blue `#2563EB`, background `#FFFFFF`, dark text `#0F172A`.
  - Complete Vietnamese translation in `mobile/app/src/main/res/values/strings.xml`, rendered with HTML span support via `TextView.setHtmlText()` (`AuthExtensions.kt`).
  - Solid vector drawables (`ic_volume_up_solid`, `ic_volume_off_solid`, etc.) standardizing iconography across activities.

## 3. Execution Log (Attempts & Results)
- [x] **[Success]** Scaffold Android Project (`58559a5`): Initialized Gradle build with SDK 35, ViewBinding, and Material 3 components.
- [x] **[Success]** Figma UI to XML Layout Conversion (`5aa6528`, `05be3c5`): Reconstructed 40 production XML layouts in `mobile/app/src/main/res/layout/` across Onboarding (13), Auth (6), Modals (5), and Core Features (14).
- [x] **[Success]** Activity Wiring & Transitions (`9d1777b`): Wired ViewBinding, click listeners, and Intent routes between core feature screens and modals.
- [x] **[Success]** Bottom Navigation Sync (`9d1777b`): Implemented `BottomNavHelper.kt` to handle active tab coloring and back-stack retention across main screens.
- [x] **[Success]** Vector Icon Overhaul (`2b267b3`): Replaced emoji glyphs with vector assets across all layouts.
- [x] **[Success]** Localization (`30efaa5`): Centralized and translated all UI labels, button texts, validation prompts, and modal content to Vietnamese.
- [x] **[Success]** UI Alignment & Padding Fixes (`11cfc18`): Adjusted elevations, scroll views, and button constraints in `activity_dashboard.xml`, `activity_workouts.xml`, and `activity_nutrition_tracker.xml`.
- [ ] **[Dead End]** Pure Single-Activity Navigation for entire app: Nested dialog overlays, camera lifecycles, and bottom navigation state caused back-stack fragmentation; pivoted to Hybrid model (Single-Activity for Auth, Multi-Activity for Core Hubs, Translucent Activities for Modals).
- [x] **[Pivot]** Translucent Activities over Fragment Dialogs: Shifted complex modal flows (`DailyQuestsModalActivity`, `AiCalibrationModalActivity`) to Translucent Activities to isolate view lifecycles and layout bindings cleanly.

## 4. Current State & Residual Debt
- **Active Working Set:**
  - `mobile/app/src/main/java/com/fittrack/app/ui/`: 26 Activities, 6 Auth Fragments, and UI helpers (`BottomNavHelper.kt`, `AuthExtensions.kt`).
  - `mobile/app/src/main/res/layout/`: 40 complete XML layouts matching Figma specification.
  - `mobile/app/build.gradle.kts`: Gradle build configuration currently containing only UI and Jetpack Navigation dependencies.
- **Current Blocker / State:**
  - Networking Layer Missing: No Retrofit, OkHttp, or JSON converter dependencies in `build.gradle.kts`. UI clicks currently navigate with mock/static intents without calling Laravel `/api/v1` backend endpoints.
  - Session & Token Management Missing: No `EncryptedSharedPreferences` or DataStore to securely store Sanctum Bearer tokens and user profiles upon login/registration.
  - CameraX & MediaPipe Edge Integration Pending: `AiPoseActiveSessionActivity.kt` is a UI placeholder; CameraX preview stream and Google MediaPipe Tasks Vision Android SDK are not yet connected to the view finder.
  - Test Coverage: `mobile/app/src/test` and `mobile/app/src/androidTest` are currently empty.

## 5. Next Steps (For Resuming Session)
1. Add networking dependencies to `mobile/app/build.gradle.kts` (`com.squareup.retrofit2:retrofit:2.11.0`, `converter-gson:2.11.0`, `com.squareup.okhttp3:logging-interceptor:4.12.0`).
2. Create API client infrastructure in `com.fittrack.app.data.api`: `ApiClient.kt`, `AuthInterceptor.kt` (attaching Bearer token and `Idempotency-Key`), and API interfaces for Auth, Dashboard, Workouts, and Body Metrics.
3. Implement `SessionManager.kt` using `androidx.security:security-crypto` (`EncryptedSharedPreferences`) to manage user credentials, tokens, and active session state.
4. Add CameraX dependencies (`androidx.camera:camera-camera2:1.4.1`, `camera-lifecycle:1.4.1`, `camera-view:1.4.1`) and `@google.mediapipe:tasks-vision:0.10.14` to implement real-time landmark extraction in `AiPoseActiveSessionActivity.kt`.
5. Connect `LoginFragment.kt`, `DashboardActivity.kt`, and `WorkoutsActivity.kt` to live API endpoints, replacing hardcoded placeholders with dynamic ViewModel / Repository observations.

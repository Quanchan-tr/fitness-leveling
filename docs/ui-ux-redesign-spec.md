# FitnessLeveling AI — UI/UX Redesign Specification & Design System

> **Document Version:** 2.0 (Post-Audit Design System Baseline)  
> **Status:** Approved for Implementation  
> **Target Audience:** Frontend Engineers, UI/UX Designers  
> **Core Principle:** "Personal Fitness Command Center" — High-performance SaaS precision, standalone 3D interactive avatar, zero 3D room background.

---

## 1. Product Identity & Design Tone

FitnessLeveling AI is a modern personal fitness command center. It bridges data tracking, computer-vision AI, and visual character progression.

- **Tone & Mood:** Athletic, Data-Driven, Crisp, Confident, Modern, Slightly Futuristic.
- **Visual Stance:**
  - High-contrast, clean neutral surfaces (`#0B0F19`, `#111827` or crisp light `#F8FAFC` / `#FFFFFF`).
  - Athletic Orange accent (`#FF5722` / `#FF6B35`) for energy, drive, and streak momentum.
  - Electric Blue / Cyan (`#0284C7` / `#06B6D4`) for AI guidance, metrics, and computer vision.
  - Emerald Green (`#10B981`) for completed sets, positive deltas, and optimal ranges.
  - Amber / Yellow (`#F59E0B`) for warnings, rest timers, and moderate RPE.
- **Anti-Patterns Explicitly Banned (Impeccable Craft Floor):**
  - NO 3D bedroom, gym room, walls, floors, ceilings, or furniture in the background.
  - NO purple/blue neon AI clichés or arbitrary glassmorphism overlays on top of 3D scenes.
  - NO bounce/elastic easing animations.
  - NO gradient text headlines.
  - NO low-contrast beige-on-beige captions.

---

## 2. Design Tokens & Variables

### 2.1 Color Palette
```css
:root {
  /* Surfaces */
  --bg-app: #F8FAFC;            /* Slate 50 - Ultra-clean background */
  --bg-surface: #FFFFFF;        /* Pure white for high scanability cards */
  --bg-surface-elevated: #FFFFFF;
  --bg-surface-subtle: #F1F5F9; /* Slate 100 for secondary pills, tags, table headers */
  --border-subtle: #E2E8F0;     /* Slate 200 for crisp hairline dividers */
  --border-strong: #CBD5E1;     /* Slate 300 for active inputs and boundaries */

  /* Text Hierarchy */
  --text-primary: #0F172A;       /* Slate 900 - maximum readability */
  --text-secondary: #475569;     /* Slate 600 - clear descriptive text */
  --text-muted: #94A3B8;         /* Slate 400 - captions and units */

  /* Brand & Status Accents */
  --brand-primary: #FF5722;      /* Deep Athletic Orange */
  --brand-primary-hover: #E64A19;
  --brand-primary-light: #FFF3E0;/* Tint for badges and active pills */
  
  --color-ai: #0284C7;           /* Sky 600 - AI Intelligence & Vision */
  --color-ai-light: #E0F2FE;
  
  --color-success: #10B981;      /* Emerald 500 - Completed sets, goals met */
  --color-success-light: #ECFDF5;
  
  --color-warning: #F59E0B;      /* Amber 500 - Form warnings, rest timer */
  --color-warning-light: #FEF3C7;
  
  --color-danger: #EF4444;       /* Rose 500 - Form errors, missed targets */
  --color-danger-light: #FEF2F2;

  /* Elevation */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --shadow-hover: 0 10px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.04);
  --shadow-dropdown: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-avatar-pedestal: 0 20px 40px -15px rgba(255, 87, 34, 0.15);

  /* Radius Scale */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

### 2.2 Typography Scale
- **Display Stat (Key Numbers):** 32px – 40px, `font-black`, `tabular-nums tracking-tight`.
- **H1 (Page Title):** 24px – 28px, `font-extrabold`, `tracking-tight text-slate-900`.
- **H2 (Section Header):** 18px – 20px, `font-bold`, `tracking-tight text-slate-900`.
- **H3 (Card Title):** 14px – 15px, `font-bold`, `text-slate-800`.
- **Body Text:** 13px – 14px, `font-medium`, `text-slate-600`, line-height 1.5.
- **Metric Micro-label:** 11px, `font-bold uppercase tracking-wider text-slate-400`.
- **Numeric Figures:** Always use `tabular-nums` (`font-variant-numeric: tabular-nums`) so numbers in logs and timers do not jitter.

---

## 3. Global Shell & Navigation Structure

```
+------------------------------------------------------------------------------------+
|  [FitnessLeveling AI]  | TopBar: Date/Time | Streak | Quick Actions | Notifications | User |
+-----------------+------------------------------------------------------------------+
| Sidebar (240px) | Main Scrollable Workspace (Content Area)                         |
|                 |                                                                  |
| - Dashboard     |                                                                  |
| - Workout       |                                                                  |
| - Nutrition     |                                                                  |
| - Body Metrics  |                                                                  |
| - AI Coach Hub  |                                                                  |
| - Community     |                                                                  |
|                 |                                                                  |
+-----------------+------------------------------------------------------------------+
```

### Mobile Shell Behavior
- On screens `< 1024px`, the sidebar collapses into a sleek slide-over drawer toggled from a hamburger icon in the TopBar, plus an optional fixed bottom navigation bar for the 5 primary tabs (Home, Workout, Nutrition, Metrics, AI Coach).

---

## 4. Dashboard Architecture: The Standalone 3D Avatar Hero

The dashboard is structured into a clean, scan-friendly grid without background room distraction:

```
+------------------------------------------------------------------------------------+
|  GREETING & QUICK METRICS BANNER                                                   |
|  "Welcome back, Alex. Day 17 streak. 3 workouts scheduled this week."              |
+------------------------------------+-----------------------------------------------+
|  COL 1: 3D AVATAR FOCAL COMPONENT  |  COL 2: TODAY'S WORKOUT & NUTRITION COMMAND   |
|  +-------------------------------+  |  +-----------------------------------------+  |
|  | [360° Interactive 3D Avatar]  |  |  | Today's Workout: Push Hypertrophy       |  |
|  |  - Voxel Muscle Scaling       |  |  |  - Bench Press: 4x8 (80kg)              |  |
|  |  - Drag to Rotate 360°        |  |  |  - Overhead Press: 3x10 (45kg)          |  |
|  |  - Level 17 (2,450 / 3,000 XP)|  |  |  [Start Workout] [View Routine]        |  |
|  |  - Attributes: STR / END / MOB|  |  +-----------------------------------------+  |
|  |  [Customize Outfit] [Rotate]  |  |  +-----------------------------------------+  |
|  +-------------------------------+  |  | Nutrition & Macro Real-time Bar         |  |
|                                    |  |  Calories: 1,840 / 2,400 kcal (76%)     |  |
|                                    |  |  PRO: 142g | CARBS: 185g | FAT: 54g     |  |
|                                    |  +-----------------------------------------+  |
+------------------------------------+-----------------------------------------------+
|  ROW 3: FITNESS VITALS & AI RECOMMENDATION                                         |
|  +----------------+ +----------------+ +----------------+ +---------------------+  |
|  | Weight & Fat   | | Hydration      | | Daily Steps    | | AI Coach Smart Card |  |
|  | 74.2 kg (-0.8) | | 2.2L / 3.0L    | | 8,420 steps    | | Form Tip: Squat depth| |
|  +----------------+ +----------------+ +----------------+ +---------------------+  |
+------------------------------------------------------------------------------------+
```

### 3D Avatar Integration Rules
1. **Container:** Wrapped in a dedicated `<AvatarHeroCard />` with subtle studio lighting, soft radial pedestal gradient, and titanium base.
2. **Interactivity:**
   - Drag anywhere on the pedestal to rotate 360°.
   - Quick toggle for continuous smooth auto-rotation.
   - "Customize Outfit" button opens the color picker modal (shirt, headband, shorts, shoes).
   - "Level & Attributes" displays STR, END, MOB with level-scaled visual progress rings.
3. **Zero Waste:** Does NOT load walls, rugs, cats, city skylines, or room geometry. Only the character mesh, shadows, and pedestal are rendered.

---

## 5. Core Page Specifications

### 5.1 Workout Command Center (`/workout`)
- **Weekly Schedule Ribbon:** Monday – Sunday tabs showing status (`Completed`, `Today / Planned`, `Rest Day`).
- **Active Session Hero:** Big, urgent workout header showing current session name, target muscle groups, estimated duration, and completion progress.
- **Exercise Block:**
  - Exercise title with target muscle badge and pose check badge.
  - Set table: Set #, Previous weight, Target Reps, Weight (kg), RPE tag (6-10), and one-click Done checkmark.
  - Inline Rest Timer (countdown with audio/visual flash).
  - "Add Exercise" drawer querying the full exercise database with search and muscle filters.

### 5.2 Nutrition & Macro Tracker (`/nutrition`)
- **Daily Target Dial:** Prominent caloric intake versus budget (`1,840 / 2,400 kcal`).
- **Macro Distribution Trio:**
  - Protein (Target 160g, Logged 142g, 88%)
  - Carbs (Target 240g, Logged 185g, 77%)
  - Fats (Target 70g, Logged 54g, 77%)
- **Meal Logs by Category:** Breakfast, Lunch, Dinner, Snacks with quick calorie and macro breakdowns.
- **Quick Food Log Form:** Direct input for food item, calories, and macros with instantaneous state update.

### 5.3 Body Metrics & Composition (`/metrics`)
- **Composition Cards:** Current Weight, Body Fat %, Skeletal Muscle Mass, BMI with health status pills.
- **Visual Progress Charts:** Interactive line/area trend representation of weight and body fat over recent weeks.
- **Progress Photo Album:** Visual comparison timeline (Before / After side-by-side mode, front, side, back photo tagging).
- **Log New Measurement Modal:** Date, Weight, Fat %, Muscle Mass with automatic BMI calculation.

### 5.4 AI Coach Hub & Pose Check Studio (`/ai-coach`)
- **Coaching Tabs:** AI Pose Check (Default), AI Workout Planner, AI Meal Planner.
- **AI Pose Check Studio:**
  - **Live Camera / Viewport:** Sleek athletic dark studio viewfinder with corner targeting reticles, skeleton overlay guide, and recording indicator.
  - **Coaching HUD Overlay:** Large real-time Rep Counter (`12 reps`), Form Quality Gauge (`92% Excellent`), Real-time correction cue pill (`"Keep chest proud & knees tracking over toes"`).
  - **Session Summary:** Timestamped kinematic feedback list (`depth: 100%`, `knee stability: 94%`).
- **AI Workout & Meal Generator:** Structured input cards (Goal, Equipment, Dietary Restrictions) generating verified, structured multi-week routines and macro plans.

### 5.5 Social Fitness Community Feed (`/community`)
- **Feed Architecture:** Centered, focused column (`max-w-2xl mx-auto`).
- **Prominent Post Composer:** "Share an exercise, workout routine, or form check..." with media upload, muscle group tagger, and AI pose check link.
- **Exercise Feed Cards:**
  - Author avatar, name, level badge, and verification tick.
  - Exercise name, difficulty pill, muscle group tag, and AI Pose Check readiness badge.
  - Star rating system with cached aggregate count.
  - Interactive Action Bar: Star rating, Save / Bookmark, Share, Report.
- **Search & Filter Bar:** Sticky filter by muscle group (All, Chest, Legs, Back, Core) and Pose-Check-only toggle.

---

## 6. Accessibility & Performance Guardrails
- **WCAG AA Compliance:** Contrast ratio ≥ 4.5:1 for all normal text, ≥ 3:1 for large display metrics.
- **Keyboard Navigation:** Full focus ring visible on all interactive buttons, inputs, tabs, and modals (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`).
- **WebGL Context Isolation:** Only pages with 3D components (`/` and modals) initialize Three.js canvas. Canvas gracefully falls back if WebGL is unavailable.
- **Motion Controls:** Animations use clean CSS transitions (`ease-out`, 150-250ms). No elastic bounce.

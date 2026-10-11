/**
 * usePoseDetection.ts
 *
 * Custom hook for real-time pose detection using @mediapipe/tasks-vision.
 *
 * Key improvements over v1:
 *  1. Keypoint Visibility Gatekeeper — exercise-specific required landmarks
 *     with visibility >= 0.65. If not met: state frozen, warning emitted.
 *  2. EMA Angle Smoothing — exponential moving average (alpha=0.4) on raw
 *     angles before feeding into the state machine.
 *  3. Hysteresis Bands — separate enter/exit thresholds per state (60–65 deg
 *     gap) to prevent jitter around transition points.
 *  4. Temporal Constraints — minimum rep duration (800ms) and rep cooldown
 *     (500ms) to eliminate flickering and double-counting.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExerciseType = 'squat' | 'pushup' | 'plank';
export type IssueSeverity = 'low' | 'medium' | 'high';
export type RepStatus = 'GOOD_REP' | 'BAD_FORM' | 'NO_REP';

export interface PoseFeedbackIssue {
  issueCode: string;
  severity: IssueSeverity;
  message: string;
}

export interface VisibilityWarning {
  code: 'INCOMPLETE_BODY_VISIBLE' | 'POSE_NOT_DETECTED';
  message: string;
}

export type CameraView = 'FRONT_VIEW' | 'SIDE_VIEW' | 'DIAGONAL_VIEW' | 'UNKNOWN';

export interface PoseMetrics {
  repCount: number;         // Tổng số chu kỳ chuyển động hoàn thành
  validRepCount: number;    // Số rep đạt biên độ tối thiểu (GOOD_REP hoặc BAD_FORM)
  goodRepCount: number;     // Số rep form chuẩn (GOOD_REP)
  lastRepStatus: RepStatus | null; // Trạng thái rep vừa hoàn thành (GOOD_REP | BAD_FORM | NO_REP)
  score: number;           // 0-100 overall form score
  isInRep: boolean;        // currently mid-rep
  currentRepScore: number;
  cameraView: CameraView;   // Detected camera angle
  issues: PoseFeedbackIssue[];
  landmarks: NormalisedLandmark[] | null;
  fps: number;
  // Visibility gating
  isFrameValid: boolean;
  visibilityWarning: VisibilityWarning | null;
}

function createInitialMetrics(): PoseMetrics {
  return {
    repCount: 0,
    validRepCount: 0,
    goodRepCount: 0,
    lastRepStatus: null,
    score: 100,
    isInRep: false,
    currentRepScore: 100,
    cameraView: 'UNKNOWN',
    issues: [],
    landmarks: null,
    fps: 0,
    isFrameValid: false,
    visibilityWarning: null,
  };
}

export interface NormalisedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface UsePoseDetectionOptions {
  exercise: ExerciseType;
  onRepCompleted?: (
    repNum: number,
    score: number,
    issues: PoseFeedbackIssue[],
    status?: RepStatus,
    isRepValid?: boolean,
  ) => void;
  onVideoEnded?: (finalState: RepEngineState) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WASM_BUNDLE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/** Minimum visibility score for a landmark to be considered reliably seen */
const VISIBILITY_THRESHOLD = 0.50;

/** EMA smoothing factor. Higher = more responsive but noisier */
const EMA_ALPHA = 0.40;

/** Minimum milliseconds a rep cycle must take to be counted (prevents flicker) */
const MIN_REP_DURATION_MS = 600;

/** Cooldown after a rep is counted. Prevents double-counting on jitter at top */
const REP_COOLDOWN_MS = 300;

// ---------------------------------------------------------------------------
// Landmark Indices
// ---------------------------------------------------------------------------

const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

// ---------------------------------------------------------------------------
// Visibility Gatekeeper
// ---------------------------------------------------------------------------

function isVisible(lms: NormalisedLandmark[], idx: number): boolean {
  const lm = lms[idx];
  return !!lm && (lm.visibility ?? 1) >= VISIBILITY_THRESHOLD;
}

/**
 * Returns null if the frame satisfies minimum visibility requirements,
 * or a VisibilityWarning describing what is missing.
 * Allows single-side view (left OR right) for side-profile exercise filming.
 */
function checkVisibility(
  lms: NormalisedLandmark[] | null | undefined,
  exercise: ExerciseType,
): VisibilityWarning | null {
  if (!lms || lms.length === 0) {
    return {
      code: 'POSE_NOT_DETECTED',
      message: 'Không phát hiện được tư thế. Hãy đứng vào khung hình.',
    };
  }

  if (exercise === 'squat') {
    const leftSide = isVisible(lms, LM.LEFT_HIP) && isVisible(lms, LM.LEFT_KNEE) && isVisible(lms, LM.LEFT_ANKLE);
    const rightSide = isVisible(lms, LM.RIGHT_HIP) && isVisible(lms, LM.RIGHT_KNEE) && isVisible(lms, LM.RIGHT_ANKLE);
    if (!leftSide && !rightSide) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera cần thấy rõ hông, đầu gối và cổ chân (ít nhất một bên). Hãy lùi xa hơn.',
      };
    }
  } else if (exercise === 'pushup') {
    const leftArm = isVisible(lms, LM.LEFT_SHOULDER) && isVisible(lms, LM.LEFT_ELBOW) && isVisible(lms, LM.LEFT_WRIST);
    const rightArm = isVisible(lms, LM.RIGHT_SHOULDER) && isVisible(lms, LM.RIGHT_ELBOW) && isVisible(lms, LM.RIGHT_WRIST);
    if (!leftArm && !rightArm) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera cần thấy rõ vai, khuỷu tay và cổ tay (ít nhất một bên). Điều chỉnh góc camera.',
      };
    }
    const hasHip = isVisible(lms, LM.LEFT_HIP) || isVisible(lms, LM.RIGHT_HIP);
    if (!hasHip) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera cần thấy được hông để kiểm tra tư thế cơ thể.',
      };
    }
  } else if (exercise === 'plank') {
    const leftSide = isVisible(lms, LM.LEFT_SHOULDER) && isVisible(lms, LM.LEFT_HIP) && isVisible(lms, LM.LEFT_ANKLE);
    const rightSide = isVisible(lms, LM.RIGHT_SHOULDER) && isVisible(lms, LM.RIGHT_HIP) && isVisible(lms, LM.RIGHT_ANKLE);
    if (!leftSide && !rightSide) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera cần thấy toàn bộ cơ thể (vai, hông, mắt cá ít nhất một bên).',
      };
    }
  }

  return null; // frame is valid
}

// ---------------------------------------------------------------------------
// Pure Math Helpers
// ---------------------------------------------------------------------------

function angle2D(a: NormalisedLandmark, b: NormalisedLandmark, c: NormalisedLandmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBa = Math.sqrt(ba.x ** 2 + ba.y ** 2) + 1e-7;
  const magBc = Math.sqrt(bc.x ** 2 + bc.y ** 2) + 1e-7;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBa * magBc)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

function angle3D(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  c: { x: number; y: number; z: number }
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBa = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2) + 1e-7;
  const magBc = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2) + 1e-7;
  if (magBa < 1e-7 || magBc < 1e-7) return 180.0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBa * magBc)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

function verticalAngle(a: NormalisedLandmark, b: NormalisedLandmark): number {
  const vec = { x: b.x - a.x, y: b.y - a.y };
  const cosAngle = -vec.y / (Math.sqrt(vec.x ** 2 + vec.y ** 2) + 1e-7);
  return (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;
}

function verticalAngle3D(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const vec = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const norm = Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2) + 1e-7;
  const cosAngle = Math.max(-1, Math.min(1, -vec.y / norm));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

function midpoint(a: NormalisedLandmark, b: NormalisedLandmark): NormalisedLandmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

function detectCameraView(lms: NormalisedLandmark[] | null | undefined): CameraView {
  if (!lms || lms.length === 0) return 'UNKNOWN';
  const lSh = lms[LM.LEFT_SHOULDER];
  const rSh = lms[LM.RIGHT_SHOULDER];
  const lHip = lms[LM.LEFT_HIP];
  const rHip = lms[LM.RIGHT_HIP];

  const hasLSh = !!lSh && (lSh.visibility ?? 1) >= 0.5;
  const hasRSh = !!rSh && (rSh.visibility ?? 1) >= 0.5;
  const hasLHip = !!lHip && (lHip.visibility ?? 1) >= 0.5;
  const hasRHip = !!rHip && (rHip.visibility ?? 1) >= 0.5;

  if (hasLSh !== hasRSh || hasLHip !== hasRHip) return 'SIDE_VIEW';
  if (!hasLSh || !hasRSh || !hasLHip || !hasRHip) return 'UNKNOWN';

  const shoulderDistX = Math.abs(lSh.x - rSh.x);
  const midSh = { x: (lSh.x + rSh.x) / 2, y: (lSh.y + rSh.y) / 2 };
  const midHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };
  const torsoLen = Math.sqrt((midSh.x - midHip.x) ** 2 + (midSh.y - midHip.y) ** 2);

  if (torsoLen < 1e-5) return 'FRONT_VIEW';
  const ratio = shoulderDistX / torsoLen;
  if (ratio < 0.22) return 'SIDE_VIEW';
  if (ratio > 0.42) return 'FRONT_VIEW';
  return 'DIAGONAL_VIEW';
}

// ---------------------------------------------------------------------------
// EMA Angle State
// ---------------------------------------------------------------------------

interface EmaAngles {
  kneeAngle: number;
  elbowAngle: number;
  bodyAlignment: number;
  leanAngle: number;
}

function createEmaAngles(): EmaAngles {
  return { kneeAngle: 170, elbowAngle: 170, bodyAlignment: 180, leanAngle: 0 };
}

// ---------------------------------------------------------------------------
// FSM State
// ---------------------------------------------------------------------------

type RepState = 'READY' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING' | 'TOP';

interface RepEngineState {
  state: RepState;
  repCount: number;
  validRepCount: number;
  goodRepCount: number;
  lastRepStatus: RepStatus | null;
  score: number;
  currentRepScore: number;
  isInRep: boolean;
  issues: PoseFeedbackIssue[];
  minKneeAngle: number;
  maxLeanAngle: number;
  minElbowAngle: number;
  maxElbowFlare: number;
  minValgusRatio: number;
  standingHipY: number;
  badBodyFrames: number;
  totalBodyFrames: number;
  repStartTime: number;   // performance.now() when rep started
  lastRepTime: number;    // performance.now() when last rep was counted
}

function createRepState(): RepEngineState {
  return {
    state: 'READY',
    repCount: 0,
    validRepCount: 0,
    goodRepCount: 0,
    lastRepStatus: null,
    score: 100,
    currentRepScore: 100,
    isInRep: false,
    issues: [],
    minKneeAngle: 180,
    maxLeanAngle: 0,
    minElbowAngle: 180,
    maxElbowFlare: 0,
    minValgusRatio: 1.0,
    standingHipY: 0.5,
    badBodyFrames: 0,
    totalBodyFrames: 0,
    repStartTime: 0,
    lastRepTime: 0,
  };
}

// ---------------------------------------------------------------------------
// Squat Engine
//
// Hysteresis (gap = 68 deg):
//   Trigger descent:  kneeAngle < 148
//   Confirm bottom:   kneeAngle <= 90
//   Start ascent:     kneeAngle >  105
//   Complete rep:     kneeAngle >= 158
// ---------------------------------------------------------------------------

function processSquatFrame(
  lms: NormalisedLandmark[],
  worldLms: NormalisedLandmark[] | null | undefined,
  cameraView: CameraView,
  state: RepEngineState,
  prevEma: EmaAngles,
  nowMs: number,
  onRep: (s: RepEngineState, status: RepStatus, isRepValid: boolean) => void,
): { state: RepEngineState; ema: EmaAngles } {
  const s = { ...state };

  // Select the clearer side for side-profile squats
  const lSide = isVisible(lms, LM.LEFT_HIP) && isVisible(lms, LM.LEFT_KNEE) && isVisible(lms, LM.LEFT_ANKLE);
  const rSide = isVisible(lms, LM.RIGHT_HIP) && isVisible(lms, LM.RIGHT_KNEE) && isVisible(lms, LM.RIGHT_ANKLE);

  // 3D Landmark source (prefer world coordinates if available)
  const src = worldLms && worldLms.length >= 33 ? worldLms : lms;

  let rawKnee: number;
  let rawLean = 0;

  if (lSide && !rSide) {
    rawKnee = angle3D(src[LM.LEFT_HIP], src[LM.LEFT_KNEE], src[LM.LEFT_ANKLE]);
    if (src[LM.LEFT_SHOULDER]) {
      rawLean = verticalAngle3D(src[LM.LEFT_HIP], src[LM.LEFT_SHOULDER]);
    }
  } else if (!lSide && rSide) {
    rawKnee = angle3D(src[LM.RIGHT_HIP], src[LM.RIGHT_KNEE], src[LM.RIGHT_ANKLE]);
    if (src[LM.RIGHT_SHOULDER]) {
      rawLean = verticalAngle3D(src[LM.RIGHT_HIP], src[LM.RIGHT_SHOULDER]);
    }
  } else {
    const lAngle = angle3D(src[LM.LEFT_HIP], src[LM.LEFT_KNEE], src[LM.LEFT_ANKLE]);
    const rAngle = angle3D(src[LM.RIGHT_HIP], src[LM.RIGHT_KNEE], src[LM.RIGHT_ANKLE]);
    rawKnee = (lAngle + rAngle) / 2.0;

    const midHip = midpoint(src[LM.LEFT_HIP], src[LM.RIGHT_HIP]);
    const midShoulder = midpoint(src[LM.LEFT_SHOULDER], src[LM.RIGHT_SHOULDER]);
    rawLean = verticalAngle3D(midHip, midShoulder);
  }

  // 2D Knee Valgus ratio
  let valgusRatio = 1.0;
  if (lms[LM.LEFT_KNEE] && lms[LM.RIGHT_KNEE]) {
    const kneeWidth = Math.abs(lms[LM.LEFT_KNEE].x - lms[LM.RIGHT_KNEE].x);
    const ankleWidth = lms[LM.LEFT_ANKLE] && lms[LM.RIGHT_ANKLE]
      ? Math.abs(lms[LM.LEFT_ANKLE].x - lms[LM.RIGHT_ANKLE].x) : 0;
    const hipWidth = lms[LM.LEFT_HIP] && lms[LM.RIGHT_HIP]
      ? Math.abs(lms[LM.LEFT_HIP].x - lms[LM.RIGHT_HIP].x) : 0;
    const refWidth = Math.max(ankleWidth, hipWidth, 1e-5);
    valgusRatio = kneeWidth / refWidth;
  }

  // 2D Hip Drop ratio
  const currentHipY = ((lms[LM.LEFT_HIP]?.y ?? 0) + (lms[LM.RIGHT_HIP]?.y ?? 0)) / 2 || lms[LM.LEFT_HIP]?.y || 0.5;
  if (s.state === 'READY' || s.state === 'TOP') {
    s.standingHipY = currentHipY;
  }
  const hipDrop = Math.max(0, currentHipY - s.standingHipY);

  const newEma: EmaAngles = {
    ...prevEma,
    kneeAngle: EMA_ALPHA * rawKnee + (1 - EMA_ALPHA) * prevEma.kneeAngle,
    leanAngle: EMA_ALPHA * rawLean + (1 - EMA_ALPHA) * prevEma.leanAngle,
  };

  const ka = newEma.kneeAngle;
  const la = newEma.leanAngle;

  switch (s.state) {
    case 'READY':
    case 'TOP':
      if (ka < 148 || (cameraView === 'FRONT_VIEW' && hipDrop > 0.08)) {
        s.state = 'DESCENDING';
        s.isInRep = true;
        s.repStartTime = nowMs;
        s.minKneeAngle = ka;
        s.maxLeanAngle = la;
        s.minValgusRatio = valgusRatio;
        s.currentRepScore = 100;
      }
      break;

    case 'DESCENDING':
      s.minKneeAngle = Math.min(s.minKneeAngle, ka);
      s.maxLeanAngle = Math.max(s.maxLeanAngle, la);
      s.minValgusRatio = Math.min(s.minValgusRatio, valgusRatio);

      const isBottom = ka <= 95 || (cameraView === 'FRONT_VIEW' && ka <= 105 && hipDrop >= 0.12);
      if (isBottom) {
        s.state = 'BOTTOM';
      } else if (ka > s.minKneeAngle + 12 && s.minKneeAngle <= 125) {
        s.state = 'ASCENDING';
      }
      break;

    case 'BOTTOM':
      s.minKneeAngle = Math.min(s.minKneeAngle, ka);
      s.maxLeanAngle = Math.max(s.maxLeanAngle, la);
      s.minValgusRatio = Math.min(s.minValgusRatio, valgusRatio);
      if (ka > s.minKneeAngle + 10 || ka > 105) {
        s.state = 'ASCENDING';
      }
      break;

    case 'ASCENDING':
      s.maxLeanAngle = Math.max(s.maxLeanAngle, la);
      s.minValgusRatio = Math.min(s.minValgusRatio, valgusRatio);
      const isStanding = ka >= 148 || (ka >= s.minKneeAngle + 35 && ka >= 140) || (cameraView === 'FRONT_VIEW' && hipDrop <= 0.04);
      const isReSquat = ka < s.minKneeAngle + 8 && nowMs - s.repStartTime > 800;

      if (isStanding || isReSquat) {
        const repDuration = nowMs - s.repStartTime;
        const cooldownOk = nowMs - s.lastRepTime >= REP_COOLDOWN_MS;

        if (repDuration >= MIN_REP_DURATION_MS && cooldownOk) {
          const issues: PoseFeedbackIssue[] = [];
          let repScore = 100;

          // Core Rule 1: Range of motion (ROM / Depth)
          const isRomSufficient = s.minKneeAngle <= 120;
          if (!isRomSufficient) {
            repScore -= 30;
            issues.push({
              issueCode: 'HALF_SQUAT',
              severity: 'high',
              message: `Hạ chưa đủ sâu (góc gối 3D: ${Math.round(s.minKneeAngle)}°). Cần hạ thấp hơn (<= 95°).`,
            });
          } else if (s.minKneeAngle > 95) {
            repScore -= 15;
            issues.push({
              issueCode: 'INSUFFICIENT_DEPTH',
              severity: 'medium',
              message: `Chưa hạ đủ sâu (góc gối ${Math.round(s.minKneeAngle)}°). Cần đùi song song sàn (<= 95°).`,
            });
          }

          // Form Modifier: Torso Lean (Only evaluated for SIDE_VIEW & DIAGONAL_VIEW)
          if (cameraView === 'SIDE_VIEW' || cameraView === 'DIAGONAL_VIEW') {
            if (s.maxLeanAngle > 55) {
              repScore -= 25;
              issues.push({
                issueCode: 'EXCESSIVE_FORWARD_LEAN',
                severity: 'high',
                message: `Lưng bị gập quá mức (${Math.round(s.maxLeanAngle)}°). Mở ngực và giữ cột sống thẳng!`,
              });
            } else if (s.maxLeanAngle > 45) {
              repScore -= 10;
              issues.push({
                issueCode: 'FORWARD_LEAN',
                severity: 'medium',
                message: `Thân trên hơi ngả về trước (${Math.round(s.maxLeanAngle)}°). Giữ ngực thẳng hơn.`,
              });
            }
          }

          // Form Modifier: Knee Valgus (Only evaluated for FRONT_VIEW & DIAGONAL_VIEW)
          if (cameraView === 'FRONT_VIEW' || cameraView === 'DIAGONAL_VIEW') {
            if (s.minValgusRatio < 0.75) {
              repScore -= 20;
              issues.push({
                issueCode: 'KNEE_VALGUS',
                severity: s.minValgusRatio < 0.6 ? 'high' : 'medium',
                message: 'Đầu gối chụm vào trong (Knee Valgus). Đẩy gối ra ngoài theo hướng ngón chân!',
              });
            }
          }

          repScore = Math.max(0, repScore);

          const hasHighSeverity = issues.some(
            (i) => i.severity === 'high' && i.issueCode !== 'HALF_SQUAT',
          );
          let repStatus: RepStatus = 'GOOD_REP';
          let isRepValid = true;

          if (!isRomSufficient) {
            repStatus = 'NO_REP';
            isRepValid = false;
          } else if (hasHighSeverity || repScore < 75 || s.minKneeAngle > 95) {
            repStatus = 'BAD_FORM';
            isRepValid = true;
          } else {
            repStatus = 'GOOD_REP';
            isRepValid = true;
          }

          s.repCount += 1;
          if (isRepValid) s.validRepCount += 1;
          if (repStatus === 'GOOD_REP') s.goodRepCount += 1;
          s.lastRepStatus = repStatus;
          s.currentRepScore = repScore;
          s.score = Math.round(
            (s.score * (s.repCount - 1) + s.currentRepScore) / s.repCount,
          );
          s.issues = issues;
          s.lastRepTime = nowMs;
          onRep(s, repStatus, isRepValid);
        }

        s.state = 'READY';
        s.isInRep = false;
        s.minKneeAngle = 180;
        s.maxLeanAngle = 0;
        s.minValgusRatio = 1.0;
        s.standingHipY = currentHipY;
      }
      break;
  }

  return { state: s, ema: newEma };
}

// ---------------------------------------------------------------------------
// Push-up Engine
//
// Flexible Hysteresis:
//   Trigger descent:  elbowAngle < 140
//   Confirm bottom:   elbowAngle <= 100
//   Start ascent:     elbowAngle > minElbowAngle + 12
//   Complete rep:     elbowAngle >= 140 (or >= min + 35)
// ---------------------------------------------------------------------------

function processPushupFrame(
  lms: NormalisedLandmark[],
  worldLms: NormalisedLandmark[] | null | undefined,
  state: RepEngineState,
  prevEma: EmaAngles,
  nowMs: number,
  onRep: (s: RepEngineState, status: RepStatus, isRepValid: boolean) => void,
): { state: RepEngineState; ema: EmaAngles } {
  const s = { ...state };

  // Select the clearer arm for side-profile push-ups
  const lArm = isVisible(lms, LM.LEFT_SHOULDER) && isVisible(lms, LM.LEFT_ELBOW) && isVisible(lms, LM.LEFT_WRIST);
  const rArm = isVisible(lms, LM.RIGHT_SHOULDER) && isVisible(lms, LM.RIGHT_ELBOW) && isVisible(lms, LM.RIGHT_WRIST);

  const src = worldLms && worldLms.length >= 33 ? worldLms : lms;

  let shoulder: NormalisedLandmark;
  let elbow: NormalisedLandmark;
  let wrist: NormalisedLandmark;
  let hip: NormalisedLandmark;
  let ankle: NormalisedLandmark;

  if (lArm && !rArm) {
    shoulder = src[LM.LEFT_SHOULDER];
    elbow = src[LM.LEFT_ELBOW];
    wrist = src[LM.LEFT_WRIST];
    hip = src[LM.LEFT_HIP] ?? src[LM.RIGHT_HIP];
    ankle = src[LM.LEFT_ANKLE] ?? src[LM.RIGHT_ANKLE];
  } else if (!lArm && rArm) {
    shoulder = src[LM.RIGHT_SHOULDER];
    elbow = src[LM.RIGHT_ELBOW];
    wrist = src[LM.RIGHT_WRIST];
    hip = src[LM.RIGHT_HIP] ?? src[LM.LEFT_HIP];
    ankle = src[LM.RIGHT_ANKLE] ?? src[LM.LEFT_ANKLE];
  } else {
    shoulder = midpoint(src[LM.LEFT_SHOULDER] ?? src[LM.RIGHT_SHOULDER], src[LM.RIGHT_SHOULDER] ?? src[LM.LEFT_SHOULDER]);
    elbow = midpoint(src[LM.LEFT_ELBOW] ?? src[LM.RIGHT_ELBOW], src[LM.RIGHT_ELBOW] ?? src[LM.LEFT_ELBOW]);
    wrist = midpoint(src[LM.LEFT_WRIST] ?? src[LM.RIGHT_WRIST], src[LM.RIGHT_WRIST] ?? src[LM.LEFT_WRIST]);
    hip = midpoint(src[LM.LEFT_HIP] ?? src[LM.RIGHT_HIP], src[LM.RIGHT_HIP] ?? src[LM.LEFT_HIP]);
    ankle = midpoint(src[LM.LEFT_ANKLE] ?? src[LM.RIGHT_ANKLE], src[LM.RIGHT_ANKLE] ?? src[LM.LEFT_ANKLE]);
  }

  // 3D Angle calculations
  const rawFlare = hip ? angle3D(elbow, shoulder, hip) : 45;
  const rawElbow = angle3D(shoulder, elbow, wrist);
  const rawBody = hip && ankle ? angle3D(shoulder, hip, ankle) : 180;

  const newEma: EmaAngles = {
    ...prevEma,
    elbowAngle: EMA_ALPHA * rawElbow + (1 - EMA_ALPHA) * prevEma.elbowAngle,
    bodyAlignment: EMA_ALPHA * rawBody + (1 - EMA_ALPHA) * prevEma.bodyAlignment,
  };

  const ea = newEma.elbowAngle;
  const ba = newEma.bodyAlignment;

  switch (s.state) {
    case 'READY':
    case 'TOP':
      if (ea < 140) {
        s.state = 'DESCENDING';
        s.isInRep = true;
        s.repStartTime = nowMs;
        s.minElbowAngle = ea;
        s.maxElbowFlare = rawFlare;
        s.currentRepScore = 100;
      }
      break;

    case 'DESCENDING':
      s.minElbowAngle = Math.min(s.minElbowAngle, ea);
      s.maxElbowFlare = Math.max(s.maxElbowFlare, rawFlare);
      if (ea <= 100) {
        s.state = 'BOTTOM';
      } else if (ea > s.minElbowAngle + 12 && s.minElbowAngle <= 125) {
        // Switched to pushing up without reaching full bottom
        s.state = 'ASCENDING';
      }
      break;

    case 'BOTTOM':
      s.minElbowAngle = Math.min(s.minElbowAngle, ea);
      s.maxElbowFlare = Math.max(s.maxElbowFlare, rawFlare);
      if (ea > s.minElbowAngle + 10 || ea > 105) {
        s.state = 'ASCENDING';
      }
      break;

    case 'ASCENDING':
      s.maxElbowFlare = Math.max(s.maxElbowFlare, rawFlare);
      const isExtended = ea >= 140 || (ea >= s.minElbowAngle + 35 && ea >= 135);
      const isReDescent = ea < s.minElbowAngle + 8 && nowMs - s.repStartTime > 800;

      if (isExtended || isReDescent) {
        const repDuration = nowMs - s.repStartTime;
        const cooldownOk = nowMs - s.lastRepTime >= REP_COOLDOWN_MS;

        if (repDuration >= MIN_REP_DURATION_MS && cooldownOk) {
          const issues: PoseFeedbackIssue[] = [];
          let repScore = 100;

          // Rule 1: Range of motion (ROM / Depth)
          const isRomSufficient = s.minElbowAngle <= 120;
          if (!isRomSufficient) {
            repScore -= 35;
            issues.push({
              issueCode: 'HALF_REP',
              severity: 'high',
              message: `Hạ chưa đủ sâu (khuỷu tay ${Math.round(s.minElbowAngle)}°). Cần hạ thấp hơn (<= 90°).`,
            });
          } else if (s.minElbowAngle > 95) {
            repScore -= 15;
            issues.push({
              issueCode: 'INSUFFICIENT_DEPTH',
              severity: 'medium',
              message: `Khuỷu tay đạt ${Math.round(s.minElbowAngle)}°. Cố gắng hạ sâu hơn (<= 90°).`,
            });
          }

          // Rule 2: Body alignment
          if (ba < 155) {
            repScore -= 25;
            issues.push({
              issueCode: 'HIPS_SAGGING',
              severity: 'high',
              message: 'Lưng bị võng. Siết core và mông để giữ thẳng người!',
            });
          } else if (ba > 205) {
            repScore -= 15;
            issues.push({
              issueCode: 'HIPS_PIKING',
              severity: 'medium',
              message: 'Hông nhô lên cao. Hạ hông xuống ngang thân.',
            });
          }

          // Rule 3: Elbow flare
          if (s.maxElbowFlare > 80) {
            repScore -= 25;
            issues.push({
              issueCode: 'ELBOW_FLARE_T_SHAPE',
              severity: 'high',
              message: `Khuỷu tay xòe ngang ${Math.round(s.maxElbowFlare)}° chữ T. Khép vào ~45° để bảo vệ vai!`,
            });
          } else if (s.maxElbowFlare > 65) {
            repScore -= 10;
            issues.push({
              issueCode: 'ELBOW_FLARE_WIDE',
              severity: 'medium',
              message: `Khuỷu tay hơi xòe (${Math.round(s.maxElbowFlare)}°). Khép vào khoảng 45°.`,
            });
          }

          repScore = Math.max(0, repScore);

          // Form Quality Analyzer: Phân biệt rõ Form đúng vs Rep hợp lệ
          const hasHighSeverity = issues.some(
            (i) => i.severity === 'high' && i.issueCode !== 'HALF_REP',
          );
          let repStatus: RepStatus = 'GOOD_REP';
          let isRepValid = true;

          if (!isRomSufficient) {
            repStatus = 'NO_REP';
            isRepValid = false;
          } else if (hasHighSeverity || repScore < 75 || s.minElbowAngle > 95) {
            repStatus = 'BAD_FORM';
            isRepValid = true;
          } else {
            repStatus = 'GOOD_REP';
            isRepValid = true;
          }

          // Total cycle count ALWAYS increments
          s.repCount += 1;
          if (isRepValid) s.validRepCount += 1;
          if (repStatus === 'GOOD_REP') s.goodRepCount += 1;
          s.lastRepStatus = repStatus;
          s.currentRepScore = repScore;
          s.score = Math.round(
            (s.score * (s.repCount - 1) + s.currentRepScore) / s.repCount,
          );
          s.issues = issues;
          s.lastRepTime = nowMs;
          onRep(s, repStatus, isRepValid);
        }

        s.state = 'TOP';
        s.isInRep = false;
        s.minElbowAngle = 180;
        s.maxElbowFlare = 0;
      }
      break;
  }

  return { state: s, ema: newEma };
}

// ---------------------------------------------------------------------------
// Plank Engine
// ---------------------------------------------------------------------------

function processPlankFrame(
  lms: NormalisedLandmark[],
  state: RepEngineState,
  prevEma: EmaAngles,
  _nowMs: number,
  _onRep: (s: RepEngineState, status: RepStatus, isRepValid: boolean) => void,
): { state: RepEngineState; ema: EmaAngles } {
  const s = { ...state };

  const shoulder = midpoint(lms[LM.LEFT_SHOULDER], lms[LM.RIGHT_SHOULDER]);
  const hip = midpoint(lms[LM.LEFT_HIP], lms[LM.RIGHT_HIP]);
  const ankle = midpoint(lms[LM.LEFT_ANKLE], lms[LM.RIGHT_ANKLE]);

  const rawBody = angle2D(shoulder, hip, ankle);
  const newEma: EmaAngles = {
    ...prevEma,
    bodyAlignment: EMA_ALPHA * rawBody + (1 - EMA_ALPHA) * prevEma.bodyAlignment,
  };
  const ba = newEma.bodyAlignment;

  s.totalBodyFrames += 1;
  s.isInRep = true;

  const issues: PoseFeedbackIssue[] = [];

  if (ba < 165) {
    s.badBodyFrames += 1;
    issues.push({
      issueCode: 'HIPS_SAGGING',
      severity: ba < 150 ? 'high' : 'medium',
      message: 'Lưng dưới đang võng. Siết cơ bụng và giữ đường thẳng vai-hông-gót.',
    });
  } else if (ba > 195) {
    s.badBodyFrames += 1;
    issues.push({
      issueCode: 'HIPS_PIKING',
      severity: 'medium',
      message: 'Hông đang nhô cao. Hạ xương chậu nhẹ để căng cơ bụng.',
    });
  }

  s.issues = issues;

  if (s.totalBodyFrames > 0) {
    const badRatio = s.badBodyFrames / s.totalBodyFrames;
    s.score = Math.max(0, Math.round(100 - badRatio * 100));
    s.currentRepScore = s.score;
    const hasSevere = issues.some((i) => i.severity === 'high');
    s.lastRepStatus = s.score >= 75 && !hasSevere ? 'GOOD_REP' : s.score >= 40 ? 'BAD_FORM' : 'NO_REP';
    s.validRepCount = s.totalBodyFrames >= 150 ? 1 : 0; // 5s at 30fps
    s.repCount = s.validRepCount;
    if (s.lastRepStatus === 'GOOD_REP' && s.validRepCount > 0) {
      s.goodRepCount = 1;
    }
  }

  return { state: s, ema: newEma };
}

// ---------------------------------------------------------------------------
// Skeleton Drawing
// ---------------------------------------------------------------------------

const POSE_CONNECTIONS: [number, number][] = [
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
  [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  lms: NormalisedLandmark[],
  canvasWidth: number,
  canvasHeight: number,
  score: number,
  isFrameValid: boolean,
  isMirrored: boolean = false,
) {
  // Dim skeleton when frame is gated (not valid)
  const alpha = isFrameValid ? 1.0 : 0.3;
  const colour = isFrameValid
    ? score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
    : '#94a3b8'; // muted slate when gated

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  const getX = (lm: NormalisedLandmark) => isMirrored ? (1 - lm.x) * canvasWidth : lm.x * canvasWidth;
  const getY = (lm: NormalisedLandmark) => lm.y * canvasHeight;

  for (const [a, b] of POSE_CONNECTIONS) {
    const la = lms[a];
    const lb = lms[b];
    if (!la || !lb) continue;
    if ((la.visibility ?? 1) < 0.35 || (lb.visibility ?? 1) < 0.35) continue;
    ctx.beginPath();
    ctx.moveTo(getX(la), getY(la));
    ctx.lineTo(getX(lb), getY(lb));
    ctx.stroke();
  }

  for (let i = 0; i < lms.length; i++) {
    const lm = lms[i];
    if (!lm || (lm.visibility ?? 1) < 0.35) continue;
    const isKeyJoint = Object.values(LM).includes(i as typeof LM[keyof typeof LM]);
    const radius = isKeyJoint ? 5 : 3;
    ctx.fillStyle = isKeyJoint ? colour : 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(getX(lm), getY(lm), radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePoseDetection({ exercise, onRepCompleted, onVideoEnded }: UsePoseDetectionOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const isVideoFileRef = useRef<boolean>(false);
  const repStateRef = useRef<RepEngineState>(createRepState());
  const emaRef = useRef<EmaAngles>(createEmaAngles());
  const lastFrameTimeRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PoseMetrics>(createInitialMetrics());

  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) return;
    setIsModelLoading(true);
    setError(null);
    try {
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(WASM_BUNDLE_URL);
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (err) {
      console.error('[usePoseDetection] Model load failed:', err);
      setError('Khong the tai mo hinh MediaPipe. Vui long kiem tra ket noi internet.');
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const processFrame = useCallback(
    (timestamp: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !landmarker || video.readyState < 2) {
        if (!video?.ended) {
          animFrameRef.current = requestAnimationFrame(processFrame);
        }
        return;
      }

      if (video.ended) {
        setIsRunning(false);
        cancelAnimationFrame(animFrameRef.current);
        return;
      }

      if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const dt = timestamp - lastFrameTimeRef.current;
      if (dt > 0) fpsRef.current = Math.round(1000 / dt);
      lastFrameTimeRef.current = timestamp;

      const result: PoseLandmarkerResult = landmarker.detectForVideo(video, timestamp);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Draw video to canvas (mirrored for webcam, unmirrored for uploaded video)
      ctx.save();
      if (isVideoFileRef.current) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();

      const lms = (result.landmarks?.[0] ?? null) as NormalisedLandmark[] | null;
      const worldLms = (result.worldLandmarks?.[0] ?? null) as NormalisedLandmark[] | null;
      const cameraView = detectCameraView(lms);

      // ── Visibility Gatekeeper ─────────────────────────────────────────
      const visWarning = checkVisibility(lms, exercise);
      const isFrameValid = visWarning === null;

      if (lms) {
        drawSkeleton(
          ctx,
          lms,
          canvas.width,
          canvas.height,
          repStateRef.current.score,
          isFrameValid,
          !isVideoFileRef.current
        );
      }

      if (!isFrameValid || !lms) {
        // Freeze state machine — do NOT run rule engine
        setMetrics((prev) => ({
          ...prev,
          fps: fpsRef.current,
          landmarks: lms,
          cameraView,
          isFrameValid: false,
          visibilityWarning: visWarning,
        }));
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // ── Rule Engine (only runs on valid frames) ───────────────────────
      const nowMs = performance.now();
      const onRep = (s: RepEngineState, status: RepStatus, isRepValid: boolean) => {
        onRepCompleted?.(s.repCount, s.currentRepScore, s.issues, status, isRepValid);
      };

      let engineResult: { state: RepEngineState; ema: EmaAngles };

      switch (exercise) {
        case 'squat':
          engineResult = processSquatFrame(lms, worldLms, cameraView, repStateRef.current, emaRef.current, nowMs, onRep);
          break;
        case 'pushup':
          engineResult = processPushupFrame(lms, worldLms, repStateRef.current, emaRef.current, nowMs, onRep);
          break;
        case 'plank':
          engineResult = processPlankFrame(lms, repStateRef.current, emaRef.current, nowMs, onRep);
          break;
        default:
          engineResult = { state: repStateRef.current, ema: emaRef.current };
      }

      repStateRef.current = engineResult.state;
      emaRef.current = engineResult.ema;

      const ns = repStateRef.current;
      setMetrics({
        repCount: ns.repCount,
        validRepCount: ns.validRepCount,
        goodRepCount: ns.goodRepCount,
        lastRepStatus: ns.lastRepStatus,
        score: ns.score,
        isInRep: ns.isInRep,
        currentRepScore: ns.currentRepScore,
        cameraView,
        issues: ns.issues,
        landmarks: lms,
        fps: fpsRef.current,
        isFrameValid: true,
        visibilityWarning: null,
      });

      animFrameRef.current = requestAnimationFrame(processFrame);
    },
    [exercise, onRepCompleted],
  );

  const stop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
        videoRef.current.src = '';
      }
    }
    return repStateRef.current;
  }, []);

  const start = useCallback(async (videoFile?: File) => {
    setError(null);
    if (!landmarkerRef.current) await loadModel();
    if (!landmarkerRef.current) return;

    try {
      if (videoFile) {
        isVideoFileRef.current = true;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
          }
          const url = URL.createObjectURL(videoFile);
          videoUrlRef.current = url;
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.onended = () => {
            stop();
            onVideoEnded?.(repStateRef.current);
          };
          await videoRef.current.play();
        }
      } else {
        isVideoFileRef.current = false;
        if (videoUrlRef.current) {
          URL.revokeObjectURL(videoUrlRef.current);
          videoUrlRef.current = null;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.onended = null;
          videoRef.current.src = '';
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }
    } catch {
      setError(videoFile ? 'Không thể phát video đã tải lên.' : 'Khong the truy cap webcam. Vui long cap quyen camera.');
      return;
    }

    repStateRef.current = createRepState();
    emaRef.current = createEmaAngles();
    setMetrics(createInitialMetrics());

    setIsRunning(true);
    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [loadModel, onVideoEnded, processFrame, stop]);

  const reset = useCallback(() => {
    repStateRef.current = createRepState();
    emaRef.current = createEmaAngles();
    setMetrics(createInitialMetrics());
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  return { videoRef, canvasRef, isModelLoading, isRunning, error, metrics, start, stop, reset };
}

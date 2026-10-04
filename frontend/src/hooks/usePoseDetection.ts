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

export interface PoseFeedbackIssue {
  issueCode: string;
  severity: IssueSeverity;
  message: string;
}

export interface VisibilityWarning {
  code: 'INCOMPLETE_BODY_VISIBLE' | 'POSE_NOT_DETECTED';
  message: string;
}

export interface PoseMetrics {
  repCount: number;
  score: number;           // 0-100 overall form score
  isInRep: boolean;        // currently mid-rep
  currentRepScore: number;
  issues: PoseFeedbackIssue[];
  landmarks: NormalisedLandmark[] | null;
  fps: number;
  // Visibility gating
  isFrameValid: boolean;
  visibilityWarning: VisibilityWarning | null;
}

export interface NormalisedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface UsePoseDetectionOptions {
  exercise: ExerciseType;
  onRepCompleted?: (repNum: number, score: number, issues: PoseFeedbackIssue[]) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WASM_BUNDLE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/** Minimum visibility score for a landmark to be considered reliably seen */
const VISIBILITY_THRESHOLD = 0.65;

/** EMA smoothing factor. Higher = more responsive but noisier */
const EMA_ALPHA = 0.4;

/** Minimum milliseconds a rep cycle must take to be counted (prevents flicker) */
const MIN_REP_DURATION_MS = 800;

/** Cooldown after a rep is counted. Prevents double-counting on jitter at top */
const REP_COOLDOWN_MS = 500;

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
 * The state machine MUST NOT run when this returns non-null.
 */
function checkVisibility(
  lms: NormalisedLandmark[] | null | undefined,
  exercise: ExerciseType,
): VisibilityWarning | null {
  if (!lms || lms.length === 0) {
    return {
      code: 'POSE_NOT_DETECTED',
      message: 'Khong phat hien duoc tu the. Hay dung vao khung hinh.',
    };
  }

  if (exercise === 'squat') {
    const required = [LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_KNEE, LM.RIGHT_KNEE, LM.LEFT_ANKLE, LM.RIGHT_ANKLE];
    const missing = required.filter((i) => !isVisible(lms, i));
    if (missing.length > 0) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera can thay toan bo phan duoi co the (hong, goi, mat ca). Hay lui xa hon.',
      };
    }
  } else if (exercise === 'pushup') {
    // Upper body: all required
    const upper = [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_WRIST];
    const upperMissing = upper.filter((i) => !isVisible(lms, i));
    if (upperMissing.length > 0) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera can thay ro vai, khuyu tay va co tay. Hay dieu chinh goc camera.',
      };
    }
    // Lower body: at least one hip AND at least one ankle
    const hasHip = isVisible(lms, LM.LEFT_HIP) || isVisible(lms, LM.RIGHT_HIP);
    const hasAnkle = isVisible(lms, LM.LEFT_ANKLE) || isVisible(lms, LM.RIGHT_ANKLE);
    if (!hasHip || !hasAnkle) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera can thay duoc hong va mat ca de kiem tra duong thang co the. Lui camera ra xa.',
      };
    }
  } else if (exercise === 'plank') {
    const required = [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_ANKLE, LM.RIGHT_ANKLE];
    const missing = required.filter((i) => !isVisible(lms, i));
    if (missing.length > 0) {
      return {
        code: 'INCOMPLETE_BODY_VISIBLE',
        message: 'Camera can thay toan bo co the (vai, hong, mat ca). Dat camera tu xa va tu ben hong.',
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

function verticalAngle(a: NormalisedLandmark, b: NormalisedLandmark): number {
  const vec = { x: b.x - a.x, y: b.y - a.y };
  const cosAngle = -vec.y / (Math.sqrt(vec.x ** 2 + vec.y ** 2) + 1e-7);
  return (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;
}

function midpoint(a: NormalisedLandmark, b: NormalisedLandmark): NormalisedLandmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
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
  score: number;
  currentRepScore: number;
  isInRep: boolean;
  issues: PoseFeedbackIssue[];
  minKneeAngle: number;
  maxLeanAngle: number;
  minElbowAngle: number;
  maxElbowFlare: number;
  badBodyFrames: number;
  totalBodyFrames: number;
  repStartTime: number;   // performance.now() when rep started
  lastRepTime: number;    // performance.now() when last rep was counted
}

function createRepState(): RepEngineState {
  return {
    state: 'READY',
    repCount: 0,
    score: 100,
    currentRepScore: 100,
    isInRep: false,
    issues: [],
    minKneeAngle: 180,
    maxLeanAngle: 0,
    minElbowAngle: 180,
    maxElbowFlare: 0,
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
  state: RepEngineState,
  prevEma: EmaAngles,
  nowMs: number,
  onRep: (s: RepEngineState) => void,
): { state: RepEngineState; ema: EmaAngles } {
  const s = { ...state };

  const hip = midpoint(lms[LM.LEFT_HIP], lms[LM.RIGHT_HIP]);
  const knee = midpoint(lms[LM.LEFT_KNEE], lms[LM.RIGHT_KNEE]);
  const ankle = midpoint(lms[LM.LEFT_ANKLE], lms[LM.RIGHT_ANKLE]);
  const shoulder = midpoint(lms[LM.LEFT_SHOULDER], lms[LM.RIGHT_SHOULDER]);

  const rawKnee = angle2D(hip, knee, ankle);
  const rawLean = verticalAngle(shoulder, hip);

  const newEma: EmaAngles = {
    ...prevEma,
    kneeAngle: EMA_ALPHA * rawKnee + (1 - EMA_ALPHA) * prevEma.kneeAngle,
    leanAngle: EMA_ALPHA * rawLean + (1 - EMA_ALPHA) * prevEma.leanAngle,
  };

  const ka = newEma.kneeAngle;
  const la = newEma.leanAngle;

  switch (s.state) {
    case 'READY':
      if (ka < 148) {
        s.state = 'DESCENDING';
        s.isInRep = true;
        s.repStartTime = nowMs;
        s.minKneeAngle = ka;
        s.maxLeanAngle = la;
        s.currentRepScore = 100;
      }
      break;

    case 'DESCENDING':
      s.minKneeAngle = Math.min(s.minKneeAngle, ka);
      s.maxLeanAngle = Math.max(s.maxLeanAngle, la);
      if (ka <= 90) {
        s.state = 'BOTTOM';
      } else if (ka > s.minKneeAngle + 20 && s.minKneeAngle > 100) {
        // Rose back up without reaching bottom — partial rep
        s.state = 'ASCENDING';
      }
      break;

    case 'BOTTOM':
      s.minKneeAngle = Math.min(s.minKneeAngle, ka);
      s.maxLeanAngle = Math.max(s.maxLeanAngle, la);
      if (ka > 105) s.state = 'ASCENDING';
      break;

    case 'ASCENDING':
      s.maxLeanAngle = Math.max(s.maxLeanAngle, la);
      if (ka >= 158) {
        const repDuration = nowMs - s.repStartTime;
        const cooldownOk = nowMs - s.lastRepTime >= REP_COOLDOWN_MS;

        if (repDuration >= MIN_REP_DURATION_MS && cooldownOk) {
          const issues: PoseFeedbackIssue[] = [];
          let repScore = 100;

          if (s.minKneeAngle > 120) {
            repScore -= 30;
            issues.push({
              issueCode: 'HALF_SQUAT',
              severity: 'high',
              message: `Chua du sau (goc goi ${Math.round(s.minKneeAngle)} deg). Xuat xuong <= 90 deg.`,
            });
          } else if (s.minKneeAngle > 100) {
            repScore -= 15;
            issues.push({
              issueCode: 'INSUFFICIENT_DEPTH',
              severity: 'medium',
              message: `Chua du sau (goc goi ${Math.round(s.minKneeAngle)} deg). Can xuong <= 90 deg.`,
            });
          }
          if (s.maxLeanAngle > 55) {
            repScore -= 25;
            issues.push({
              issueCode: 'EXCESSIVE_FORWARD_LEAN',
              severity: 'high',
              message: 'Than nguoi do ve truoc qua nhieu. Giu nguc thang.',
            });
          } else if (s.maxLeanAngle > 45) {
            repScore -= 10;
            issues.push({
              issueCode: 'FORWARD_LEAN',
              severity: 'medium',
              message: 'Than nguoi hoi nga ve truoc. Giu nguc thang hon.',
            });
          }

          s.repCount += 1;
          s.currentRepScore = Math.max(0, repScore);
          s.score = Math.round(
            (s.score * (s.repCount - 1) + s.currentRepScore) / s.repCount,
          );
          s.issues = issues;
          s.lastRepTime = nowMs;
          onRep(s);
        }
        // Reset regardless (valid or timing-rejected)
        s.state = 'READY';
        s.isInRep = false;
        s.minKneeAngle = 180;
        s.maxLeanAngle = 0;
      }
      break;
  }

  return { state: s, ema: newEma };
}

// ---------------------------------------------------------------------------
// Push-up Engine
//
// Hysteresis (gap = 65 deg):
//   Trigger descent:  elbowAngle < 145
//   Confirm bottom:   elbowAngle <= 90
//   Start ascent:     elbowAngle >  105
//   Complete rep:     elbowAngle >= 155
// ---------------------------------------------------------------------------

function processPushupFrame(
  lms: NormalisedLandmark[],
  state: RepEngineState,
  prevEma: EmaAngles,
  nowMs: number,
  onRep: (s: RepEngineState) => void,
): { state: RepEngineState; ema: EmaAngles } {
  const s = { ...state };

  const shoulder = midpoint(lms[LM.LEFT_SHOULDER], lms[LM.RIGHT_SHOULDER]);
  const elbow = midpoint(lms[LM.LEFT_ELBOW], lms[LM.RIGHT_ELBOW]);
  const wrist = midpoint(lms[LM.LEFT_WRIST], lms[LM.RIGHT_WRIST]);

  // Elbow flare: angle between upper-arm and torso at shoulder joint
  const lShoulder = lms[LM.LEFT_SHOULDER];
  const lElbow = lms[LM.LEFT_ELBOW];
  const lHip = lms[LM.LEFT_HIP] ?? lms[LM.RIGHT_HIP];
  const rawFlare = lHip ? angle2D(lElbow, lShoulder, lHip) : 45;

  // Body alignment — use available hip/ankle
  const hipLm = lms[LM.LEFT_HIP] && lms[LM.RIGHT_HIP]
    ? midpoint(lms[LM.LEFT_HIP], lms[LM.RIGHT_HIP])
    : (lms[LM.LEFT_HIP] ?? lms[LM.RIGHT_HIP]);
  const ankleLm = lms[LM.LEFT_ANKLE] && lms[LM.RIGHT_ANKLE]
    ? midpoint(lms[LM.LEFT_ANKLE], lms[LM.RIGHT_ANKLE])
    : (lms[LM.LEFT_ANKLE] ?? lms[LM.RIGHT_ANKLE]);

  const rawElbow = angle2D(shoulder, elbow, wrist);
  const rawBody = hipLm && ankleLm ? angle2D(shoulder, hipLm, ankleLm) : 180;

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
      if (ea < 145) {
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
      if (ea <= 90) {
        s.state = 'BOTTOM';
      }
      break;

    case 'BOTTOM':
      s.minElbowAngle = Math.min(s.minElbowAngle, ea);
      s.maxElbowFlare = Math.max(s.maxElbowFlare, rawFlare);
      if (ea > 105) s.state = 'ASCENDING';
      break;

    case 'ASCENDING':
      s.maxElbowFlare = Math.max(s.maxElbowFlare, rawFlare);
      if (ea >= 155) {
        const repDuration = nowMs - s.repStartTime;
        const cooldownOk = nowMs - s.lastRepTime >= REP_COOLDOWN_MS;

        if (repDuration >= MIN_REP_DURATION_MS && cooldownOk) {
          const issues: PoseFeedbackIssue[] = [];
          let repScore = 100;

          if (s.minElbowAngle > 120) {
            repScore -= 35;
            issues.push({
              issueCode: 'HALF_REP',
              severity: 'high',
              message: `Bien do qua nho (khuyu tay ${Math.round(s.minElbowAngle)} deg). Rep chua hop le.`,
            });
          } else if (s.minElbowAngle > 90) {
            repScore -= 15;
            issues.push({
              issueCode: 'INSUFFICIENT_DEPTH',
              severity: 'medium',
              message: `Chua du sau (khuyu tay ${Math.round(s.minElbowAngle)} deg). Huong den <= 90 deg.`,
            });
          }

          if (ba < 160) {
            repScore -= 25;
            issues.push({
              issueCode: 'HIPS_SAGGING',
              severity: 'high',
              message: 'Hong dang chay xe. Siet core va mong de giu thang nguoi.',
            });
          } else if (ba > 205) {
            repScore -= 20;
            issues.push({
              issueCode: 'HIPS_PIKING',
              severity: 'medium',
              message: 'Hong dang nho qua cao. Ha xuong chau xuong.',
            });
          }

          if (s.maxElbowFlare > 80) {
            repScore -= 25;
            issues.push({
              issueCode: 'ELBOW_FLARE_T_SHAPE',
              severity: 'high',
              message: `Khuyu tay xoe ngang ${Math.round(s.maxElbowFlare)} deg tu the chu T! De chan thuong vai.`,
            });
          } else if (s.maxElbowFlare > 65) {
            repScore -= 10;
            issues.push({
              issueCode: 'ELBOW_FLARE_WIDE',
              severity: 'medium',
              message: `Khuyu tay hoi xoe rong (${Math.round(s.maxElbowFlare)} deg). Khep vao ~45 deg.`,
            });
          }

          s.repCount += 1;
          s.currentRepScore = Math.max(0, repScore);
          s.score = Math.round(
            (s.score * (s.repCount - 1) + s.currentRepScore) / s.repCount,
          );
          s.issues = issues;
          s.lastRepTime = nowMs;
          onRep(s);
        }
        // Reset regardless
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
  _onRep: (s: RepEngineState) => void,
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
      message: 'Lung duoi dang vong. Siet co bung va giu duong thang vai-hong-got.',
    });
  } else if (ba > 195) {
    s.badBodyFrames += 1;
    issues.push({
      issueCode: 'HIPS_PIKING',
      severity: 'medium',
      message: 'Hong dang nho cao. Ha xuong chau nhe de cang co bung.',
    });
  }

  s.issues = issues;

  if (s.totalBodyFrames > 0) {
    const badRatio = s.badBodyFrames / s.totalBodyFrames;
    s.score = Math.max(0, Math.round(100 - badRatio * 100));
    s.currentRepScore = s.score;
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

  for (const [a, b] of POSE_CONNECTIONS) {
    const la = lms[a];
    const lb = lms[b];
    if (!la || !lb) continue;
    if ((la.visibility ?? 1) < 0.35 || (lb.visibility ?? 1) < 0.35) continue;
    ctx.beginPath();
    ctx.moveTo(la.x * canvasWidth, la.y * canvasHeight);
    ctx.lineTo(lb.x * canvasWidth, lb.y * canvasHeight);
    ctx.stroke();
  }

  for (let i = 0; i < lms.length; i++) {
    const lm = lms[i];
    if (!lm || (lm.visibility ?? 1) < 0.35) continue;
    const isKeyJoint = Object.values(LM).includes(i as typeof LM[keyof typeof LM]);
    const radius = isKeyJoint ? 5 : 3;
    ctx.fillStyle = isKeyJoint ? colour : 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePoseDetection({ exercise, onRepCompleted }: UsePoseDetectionOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const repStateRef = useRef<RepEngineState>(createRepState());
  const emaRef = useRef<EmaAngles>(createEmaAngles());
  const lastFrameTimeRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PoseMetrics>({
    repCount: 0,
    score: 100,
    isInRep: false,
    currentRepScore: 100,
    issues: [],
    landmarks: null,
    fps: 0,
    isFrameValid: false,
    visibilityWarning: null,
  });

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
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
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

      // Mirror video to canvas
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const lms = (result.landmarks?.[0] ?? null) as NormalisedLandmark[] | null;

      // ── Visibility Gatekeeper ─────────────────────────────────────────
      const visWarning = checkVisibility(lms, exercise);
      const isFrameValid = visWarning === null;

      if (lms) {
        drawSkeleton(ctx, lms, canvas.width, canvas.height, repStateRef.current.score, isFrameValid);
      }

      if (!isFrameValid || !lms) {
        // Freeze state machine — do NOT run rule engine
        setMetrics((prev) => ({
          ...prev,
          fps: fpsRef.current,
          landmarks: lms,
          isFrameValid: false,
          visibilityWarning: visWarning,
        }));
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // ── Rule Engine (only runs on valid frames) ───────────────────────
      const nowMs = performance.now();
      const onRep = (s: RepEngineState) => {
        onRepCompleted?.(s.repCount, s.currentRepScore, s.issues);
      };

      let engineResult: { state: RepEngineState; ema: EmaAngles };

      switch (exercise) {
        case 'squat':
          engineResult = processSquatFrame(lms, repStateRef.current, emaRef.current, nowMs, onRep);
          break;
        case 'pushup':
          engineResult = processPushupFrame(lms, repStateRef.current, emaRef.current, nowMs, onRep);
          break;
        case 'plank':
          engineResult = processPlankFrame(lms, repStateRef.current, emaRef.current, nowMs, onRep);
          break;
        default:
          engineResult = { state: repStateRef.current, ema: emaRef.current };
      }

      repStateRef.current = engineResult.state;
      emaRef.current = engineResult.ema;

      const ns = engineResult.state;
      setMetrics({
        repCount: ns.repCount,
        score: ns.score,
        isInRep: ns.isInRep,
        currentRepScore: ns.currentRepScore,
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

  const start = useCallback(async () => {
    setError(null);
    if (!landmarkerRef.current) await loadModel();
    if (!landmarkerRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError('Khong the truy cap webcam. Vui long cap quyen camera.');
      return;
    }

    repStateRef.current = createRepState();
    emaRef.current = createEmaAngles();
    setMetrics({
      repCount: 0,
      score: 100,
      isInRep: false,
      currentRepScore: 100,
      issues: [],
      landmarks: null,
      fps: 0,
      isFrameValid: false,
      visibilityWarning: null,
    });

    setIsRunning(true);
    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [loadModel, processFrame]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    return repStateRef.current;
  }, []);

  const reset = useCallback(() => {
    repStateRef.current = createRepState();
    emaRef.current = createEmaAngles();
    setMetrics({
      repCount: 0,
      score: 100,
      isInRep: false,
      currentRepScore: 100,
      issues: [],
      landmarks: null,
      fps: 0,
      isFrameValid: false,
      visibilityWarning: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, canvasRef, isModelLoading, isRunning, error, metrics, start, stop, reset };
}

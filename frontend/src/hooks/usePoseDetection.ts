/**
 * usePoseDetection.ts
 *
 * Custom hook for real-time pose detection using @mediapipe/tasks-vision
 * in the browser. Runs fully client-side — no server round-trip for
 * landmark extraction during webcam sessions.
 *
 * Architecture:
 *   1. Hook initialises MediaPipe PoseLandmarker (WASM + model asset)
 *   2. Streams webcam video to a <video> element
 *   3. Runs PoseLandmarker on every animation frame
 *   4. Applies rule engine logic (squat/pushup/plank) to count reps + score
 *   5. Returns reactive state: landmarks, rep count, score, feedback
 *
 * Usage:
 *   const { videoRef, canvasRef, isRunning, start, stop, metrics } = usePoseDetection({ exercise: 'squat' });
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ExerciseType = 'squat' | 'pushup' | 'plank';
export type IssueSeverity = 'low' | 'medium' | 'high';

export interface PoseFeedbackIssue {
  issueCode: string;
  severity: IssueSeverity;
  message: string;
}

export interface PoseMetrics {
  repCount: number;
  score: number;          // 0–100 overall form score
  isInRep: boolean;       // currently in the middle of a rep
  currentRepScore: number;
  issues: PoseFeedbackIssue[];
  landmarks: NormalisedLandmark[] | null;
  fps: number;
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

// ─── MediaPipe CDN URLs ──────────────────────────────────────────────────────

const WASM_BUNDLE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// ─── Landmark Indices ────────────────────────────────────────────────────────

const LM = {
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

// ─── Pure math helpers ────────────────────────────────────────────────────────

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

// ─── Rule Engines ────────────────────────────────────────────────────────────

type RepState = 'READY' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING' | 'TOP';

interface RepEngineState {
  state: RepState;
  repCount: number;
  score: number;
  currentRepScore: number;
  isInRep: boolean;
  issues: PoseFeedbackIssue[];
  // Per-rep accumulators
  minKneeAngle: number;
  maxLeanAngle: number;
  minElbowAngle: number;
  badBodyFrames: number;
  totalBodyFrames: number;
  holdFrames: number;
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
    badBodyFrames: 0,
    totalBodyFrames: 0,
    holdFrames: 0,
  };
}

function processSquatFrame(
  lms: NormalisedLandmark[],
  state: RepEngineState,
  onRep: (s: RepEngineState) => void
): RepEngineState {
  const s = { ...state };
  const hip = midpoint(lms[LM.LEFT_HIP], lms[LM.RIGHT_HIP]);
  const knee = midpoint(lms[LM.LEFT_KNEE], lms[LM.RIGHT_KNEE]);
  const ankle = midpoint(lms[LM.LEFT_ANKLE], lms[LM.RIGHT_ANKLE]);
  const shoulder = midpoint(lms[LM.LEFT_SHOULDER], lms[LM.RIGHT_SHOULDER]);

  const kneeAngle = angle2D(hip, knee, ankle);
  const leanAngle = verticalAngle(shoulder, hip);

  switch (s.state) {
    case 'READY':
      if (kneeAngle < 155) {
        s.state = 'DESCENDING';
        s.isInRep = true;
        s.minKneeAngle = kneeAngle;
        s.maxLeanAngle = leanAngle;
        s.currentRepScore = 100;
      }
      break;

    case 'DESCENDING':
      s.minKneeAngle = Math.min(s.minKneeAngle, kneeAngle);
      s.maxLeanAngle = Math.max(s.maxLeanAngle, leanAngle);
      if (kneeAngle <= 95) {
        s.state = 'BOTTOM';
      } else if (kneeAngle > s.minKneeAngle + 15 && s.minKneeAngle > 95) {
        s.state = 'ASCENDING';
      }
      break;

    case 'BOTTOM':
      s.minKneeAngle = Math.min(s.minKneeAngle, kneeAngle);
      s.maxLeanAngle = Math.max(s.maxLeanAngle, leanAngle);
      if (kneeAngle > 110) s.state = 'ASCENDING';
      break;

    case 'ASCENDING':
      s.maxLeanAngle = Math.max(s.maxLeanAngle, leanAngle);
      if (kneeAngle >= 160) {
        // Rep complete — evaluate quality
        const issues: PoseFeedbackIssue[] = [];
        let repScore = 100;

        if (s.minKneeAngle > 100) {
          repScore -= 25;
          issues.push({
            issueCode: 'INSUFFICIENT_DEPTH',
            severity: 'medium',
            message: `Chưa đủ độ sâu (góc gối ${Math.round(s.minKneeAngle)}°). Cần xuống ≤ 90°.`,
          });
        }
        if (s.maxLeanAngle > 45) {
          repScore -= 20;
          issues.push({
            issueCode: 'EXCESSIVE_FORWARD_LEAN',
            severity: 'medium',
            message: 'Thân người đổ về trước quá nhiều. Giữ ngực thẳng, cột sống trung lập.',
          });
        }

        s.repCount += 1;
        s.currentRepScore = Math.max(0, repScore);
        s.score = Math.round((s.score * (s.repCount - 1) + s.currentRepScore) / s.repCount);
        s.issues = issues;
        s.state = 'READY';
        s.isInRep = false;
        s.minKneeAngle = 180;
        s.maxLeanAngle = 0;
        onRep(s);
      }
      break;
  }

  return s;
}

function processPushupFrame(
  lms: NormalisedLandmark[],
  state: RepEngineState,
  onRep: (s: RepEngineState) => void
): RepEngineState {
  const s = { ...state };
  const shoulder = midpoint(lms[LM.LEFT_SHOULDER], lms[LM.RIGHT_SHOULDER]);
  const elbow = midpoint(lms[LM.LEFT_ELBOW], lms[LM.RIGHT_ELBOW]);
  const wrist = midpoint(lms[LM.LEFT_WRIST], lms[LM.RIGHT_WRIST]);
  const hip = midpoint(lms[LM.LEFT_HIP], lms[LM.RIGHT_HIP]);
  const ankle = midpoint(lms[LM.LEFT_ANKLE], lms[LM.RIGHT_ANKLE]);

  const elbowAngle = angle2D(shoulder, elbow, wrist);
  const bodyAlignment = angle2D(shoulder, hip, ankle);

  switch (s.state) {
    case 'READY':
    case 'TOP':
      if (elbowAngle < 150) {
        s.state = 'DESCENDING';
        s.isInRep = true;
        s.minElbowAngle = elbowAngle;
        s.currentRepScore = 100;
      }
      break;

    case 'DESCENDING':
    case 'BOTTOM':
      s.minElbowAngle = Math.min(s.minElbowAngle, elbowAngle);
      if (elbowAngle >= 155) {
        // Rep complete
        const issues: PoseFeedbackIssue[] = [];
        let repScore = 100;

        if (s.minElbowAngle > 95) {
          repScore -= 20;
          issues.push({
            issueCode: 'INSUFFICIENT_DEPTH',
            severity: 'medium',
            message: `Chưa đủ độ sâu (góc khuỷu ${Math.round(s.minElbowAngle)}°). Hướng đến ≤ 90°.`,
          });
        }
        if (bodyAlignment < 158) {
          repScore -= 25;
          issues.push({
            issueCode: 'HIPS_SAGGING',
            severity: 'high',
            message: 'Hông đang chảy xệ xuống. Siết core và mông để giữ thẳng người.',
          });
        } else if (bodyAlignment > 205) {
          repScore -= 20;
          issues.push({
            issueCode: 'HIPS_PIKING',
            severity: 'medium',
            message: 'Hông đang nâng quá cao. Hạ xương chậu để tư thế phẳng.',
          });
        }

        s.repCount += 1;
        s.currentRepScore = Math.max(0, repScore);
        s.score = Math.round((s.score * (s.repCount - 1) + s.currentRepScore) / s.repCount);
        s.issues = issues;
        s.state = 'TOP';
        s.isInRep = false;
        s.minElbowAngle = 180;
        onRep(s);
      }
      break;
  }

  return s;
}

function processPlankFrame(
  lms: NormalisedLandmark[],
  state: RepEngineState,
  _onRep: (s: RepEngineState) => void
): RepEngineState {
  const s = { ...state };
  const shoulder = midpoint(lms[LM.LEFT_SHOULDER], lms[LM.RIGHT_SHOULDER]);
  const hip = midpoint(lms[LM.LEFT_HIP], lms[LM.RIGHT_HIP]);
  const ankle = midpoint(lms[LM.LEFT_ANKLE], lms[LM.RIGHT_ANKLE]);

  const bodyAlignment = angle2D(shoulder, hip, ankle);
  s.totalBodyFrames += 1;

  if (bodyAlignment < 165) {
    s.badBodyFrames += 1;
    s.isInRep = true;
    const issues: PoseFeedbackIssue[] = [
      {
        issueCode: 'HIPS_SAGGING',
        severity: 'high',
        message: 'Lưng dưới đang võng. Siết cơ bụng và giữ đường thẳng vai–hông–gót.',
      },
    ];
    s.issues = issues;
  } else if (bodyAlignment > 195) {
    s.badBodyFrames += 1;
    s.isInRep = true;
    const issues: PoseFeedbackIssue[] = [
      {
        issueCode: 'HIPS_PIKING',
        severity: 'medium',
        message: 'Hông đang nhô cao. Hạ xương chậu nhẹ để căng cơ bụng hơn.',
      },
    ];
    s.issues = issues;
  } else {
    s.isInRep = true;
    s.issues = [];
  }

  // Update score based on bad frame ratio
  if (s.totalBodyFrames > 0) {
    const badRatio = s.badBodyFrames / s.totalBodyFrames;
    s.score = Math.max(0, Math.round(100 - badRatio * 100));
    s.currentRepScore = s.score;
  }

  return s;
}

// ─── Skeleton drawing ─────────────────────────────────────────────────────────

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
  score: number
) {
  // Colour based on score
  const colour = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Draw connections
  for (const [a, b] of POSE_CONNECTIONS) {
    const la = lms[a];
    const lb = lms[b];
    if (!la || !lb) continue;
    if ((la.visibility ?? 1) < 0.4 || (lb.visibility ?? 1) < 0.4) continue;

    ctx.beginPath();
    ctx.moveTo(la.x * canvasWidth, la.y * canvasHeight);
    ctx.lineTo(lb.x * canvasWidth, lb.y * canvasHeight);
    ctx.stroke();
  }

  // Draw joint dots
  for (let i = 0; i < lms.length; i++) {
    const lm = lms[i];
    if (!lm || (lm.visibility ?? 1) < 0.4) continue;

    const isKeyJoint = Object.values(LM).includes(i as typeof LM[keyof typeof LM]);
    const radius = isKeyJoint ? 5 : 3;

    ctx.fillStyle = isKeyJoint ? colour : 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePoseDetection({ exercise, onRepCompleted }: UsePoseDetectionOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const repStateRef = useRef<RepEngineState>(createRepState());
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
  });

  // Load MediaPipe model
  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) return;

    setIsModelLoading(true);
    setError(null);
    try {
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(WASM_BUNDLE_URL);
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (err) {
      console.error('[usePoseDetection] Model load failed:', err);
      setError('Không thể tải mô hình MediaPipe. Vui lòng kiểm tra kết nối internet.');
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  // Process a single frame
  const processFrame = useCallback(
    (timestamp: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !landmarker || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // FPS tracking
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

      if (result.worldLandmarks?.length > 0 || result.landmarks?.length > 0) {
        const lms = result.landmarks[0] as NormalisedLandmark[];

        // Draw skeleton on mirrored canvas
        drawSkeleton(ctx, lms, canvas.width, canvas.height, repStateRef.current.score);

        // Run rule engine
        let newState: RepEngineState;
        const onRep = (s: RepEngineState) => {
          onRepCompleted?.(s.repCount, s.currentRepScore, s.issues);
        };

        switch (exercise) {
          case 'squat':
            newState = processSquatFrame(lms, repStateRef.current, onRep);
            break;
          case 'pushup':
            newState = processPushupFrame(lms, repStateRef.current, onRep);
            break;
          case 'plank':
            newState = processPlankFrame(lms, repStateRef.current, onRep);
            break;
          default:
            newState = repStateRef.current;
        }

        repStateRef.current = newState;

        setMetrics({
          repCount: newState.repCount,
          score: newState.score,
          isInRep: newState.isInRep,
          currentRepScore: newState.currentRepScore,
          issues: newState.issues,
          landmarks: lms,
          fps: fpsRef.current,
        });
      }

      animFrameRef.current = requestAnimationFrame(processFrame);
    },
    [exercise, onRepCompleted]
  );

  const start = useCallback(async () => {
    setError(null);

    // Load model if not ready
    if (!landmarkerRef.current) {
      await loadModel();
    }
    if (!landmarkerRef.current) return; // model load failed

    // Request webcam
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
    } catch (err) {
      setError('Không thể truy cập webcam. Vui lòng cấp quyền camera.');
      return;
    }

    // Reset state for new session
    repStateRef.current = createRepState();
    setMetrics({
      repCount: 0,
      score: 100,
      isInRep: false,
      currentRepScore: 100,
      issues: [],
      landmarks: null,
      fps: 0,
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Return final session state for saving
    return repStateRef.current;
  }, []);

  // Reset session (exercise change)
  const reset = useCallback(() => {
    repStateRef.current = createRepState();
    setMetrics({
      repCount: 0,
      score: 100,
      isInRep: false,
      currentRepScore: 100,
      issues: [],
      landmarks: null,
      fps: 0,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isModelLoading,
    isRunning,
    error,
    metrics,
    start,
    stop,
    reset,
  };
}

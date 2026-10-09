'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { apiRequest, generateUUID } from '@/lib/api';
import {
  usePoseDetection,
  type ExerciseType,
  type PoseFeedbackIssue,
  type RepStatus,
} from '@/hooks/usePoseDetection';
import {
  Video,
  Bot,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  Upload,
  Wifi,
  WifiOff,
  Activity,
  Target,
  Timer,
  Zap,
  Camera,
  CameraOff,
} from 'lucide-react';
import { useShell } from '@/components/layout/ShellLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = 'pose' | 'workout';

interface RepLog {
  repNumber: number;
  score: number;
  status: RepStatus;
  isRepValid: boolean;
  issues: PoseFeedbackIssue[];
  timestamp: number;
}

// ─── Score colour helper ──────────────────────────────────────────────────────

function scoreColour(score: number): string {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 65) return 'text-amber-400';
  return 'text-rose-500';
}

function scoreBgColour(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 65) return 'bg-amber-400';
  return 'bg-rose-500';
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AiCoachPage() {
  const { toggleMobileNav } = useShell();
  const [activeTab, setActiveTab] = useState<TabType>('pose');
  const [poseExercise, setPoseExercise] = useState<ExerciseType>('squat');
  const [sessionActive, setSessionActive] = useState(false);
  const [repLogs, setRepLogs] = useState<RepLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isUploadAnalyzing, setIsUploadAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Rep completion callback
  const handleRepCompleted = useCallback(
    (
      repNum: number,
      score: number,
      issues: PoseFeedbackIssue[],
      status: RepStatus = 'GOOD_REP',
      isRepValid: boolean = true,
    ) => {
      setRepLogs((prev) => [
        ...prev,
        { repNumber: repNum, score, issues, status, isRepValid, timestamp: Date.now() },
      ]);
    },
    []
  );

  const saveSessionRef = useRef<(finalState: any) => Promise<void>>();

  // MediaPipe hook
  const {
    videoRef,
    canvasRef,
    isModelLoading,
    isRunning,
    error: poseError,
    metrics,
    start,
    stop,
    reset,
  } = usePoseDetection({
    exercise: poseExercise,
    onRepCompleted: handleRepCompleted,
    onVideoEnded: (finalState) => {
      setSessionActive(false);
      if (finalState?.repCount > 0) {
        saveSessionRef.current?.(finalState);
      }
    },
  });

  // Save session to backend
  const saveSession = useCallback(async (finalState: any) => {
    setIsSaving(true);
    try {
      const exerciseIdMap: Record<ExerciseType, string> = {
        squat: '00000000-0000-0000-0000-000000000001',
        pushup: '00000000-0000-0000-0000-000000000002',
        plank: '00000000-0000-0000-0000-000000000003',
      };

      const feedbackJson = {
        rep_count: finalState?.repCount ?? metrics.repCount,
        valid_rep_count: finalState?.validRepCount ?? metrics.validRepCount,
        good_rep_count: finalState?.goodRepCount ?? metrics.goodRepCount,
        score: finalState?.score ?? metrics.score,
        rep_feedback: repLogs.map((r) => ({
          rep_number: r.repNumber,
          score: r.score,
          status: r.status,
          is_rep_valid: r.isRepValid,
          issues: r.issues.map((i) => ({
            issue_code: i.issueCode,
            severity: i.severity,
            message: i.message,
          })),
        })),
      };

      await apiRequest('/pose-check/realtime/result', {
        method: 'POST',
        body: JSON.stringify({
          exercise_id: exerciseIdMap[poseExercise],
          rep_count: finalState?.repCount ?? metrics.repCount,
          score: finalState?.score ?? metrics.score,
          feedback_json: feedbackJson,
        }),
        useIdempotency: true,
      });

      setSaveSuccess(true);
    } catch (err) {
      console.warn('[AiCoachPage] Save session failed (non-blocking):', err);
    } finally {
      setIsSaving(false);
    }
  }, [metrics, poseExercise, repLogs]);

  saveSessionRef.current = saveSession;

  // Start / Stop handler
  const handleToggleSession = async () => {
    if (isRunning) {
      // Stop and save session
      const finalState = stop();
      setSessionActive(false);

      if (metrics.repCount > 0) {
        await saveSession(finalState);
      }
    } else {
      // Start new session
      setRepLogs([]);
      setSaveSuccess(false);
      reset();
      setSessionActive(true);
      await start();
    }
  };

  // Exercise change resets state
  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isRunning) return; // Can't change mid-session
    setPoseExercise(e.target.value as ExerciseType);
    reset();
    setRepLogs([]);
  };

  // Upload video for analysis (supports local client-side analysis when backend is unavailable)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadAnalyzing(true);
    setUploadResult(null);

    let sessionId = generateUUID();
    let isServerUploaded = false;

    // 1. Optional background sync with backend if running (non-blocking)
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('exercise_id', '00000000-0000-0000-0000-000000000001');

      const result = await apiRequest<{ data: { session_id: string; status: string } }>(
        '/pose-check/upload',
        {
          method: 'POST',
          body: formData,
          useIdempotency: true,
        }
      );
      if (result?.data?.session_id) {
        sessionId = result.data.session_id;
        isServerUploaded = true;
      }
    } catch (err) {
      console.warn('[AiCoachPage] Server upload offline (using direct MediaPipe analysis):', err);
    }

    // 2. Run local MediaPipe AI analysis on uploaded video directly in the viewport
    try {
      setRepLogs([]);
      setSaveSuccess(false);
      reset();
      setSessionActive(true);
      await start(file);
      setUploadResult({
        session_id: sessionId,
        message: isServerUploaded
          ? `Video đã tải lên server và đang phân tích trực tiếp bằng MediaPipe AI (Session: ${sessionId.slice(0, 8)}...).`
          : `Đang phát và phân tích video trực tiếp bằng MediaPipe AI (Session: ${sessionId.slice(0, 8)}...).`,
      });
    } catch (err: any) {
      console.error('[AiCoachPage] Local video analysis failed:', err);
      setUploadResult({ error: err?.message || 'Không thể xử lý file video.' });
    } finally {
      setIsUploadAnalyzing(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };


  // ─── AI Workout Planner state ─────────────────────────────────────────────

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const result = await apiRequest<{ data: any }>('/ai/exercise-plan', {
        method: 'POST',
        useIdempotency: true,
      });
      setGeneratedPlan(result.data);
    } catch (err) {
      console.warn('[AiCoachPage] Exercise plan generation failed:', err);
      // Fallback plan
      setGeneratedPlan({
        plan_name: 'Kế hoạch tập luyện cơ bản',
        duration_weeks: 4,
        sessions: [
          {
            day_label: 'Buổi 1',
            focus_area: 'Toàn thân',
            exercises: [
              { exercise_name: 'Squat', sets: 3, reps: '12 reps', rest_seconds: 60 },
              { exercise_name: 'Push-up', sets: 3, reps: '10 reps', rest_seconds: 60 },
              { exercise_name: 'Plank', sets: 3, reps: '45s', rest_seconds: 30 },
            ],
          },
        ],
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const exerciseLabel: Record<ExerciseType, string> = {
    squat: 'Squat',
    pushup: 'Push-up',
    plank: 'Plank',
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <TopBar
        user={initialFitnessData.user}
        streak={initialFitnessData.today.streak}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Video className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5722]" />
              <span>AI Pose Check &amp; Huấn luyện</span>
            </h1>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1.5 bg-slate-200/70 p-1 rounded-lg w-fit">
          <button
            id="tab-pose"
            onClick={() => setActiveTab('pose')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'pose'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>AI Pose Check (Webcam)</span>
          </button>
          <button
            id="tab-workout"
            onClick={() => setActiveTab('workout')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'workout'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>AI Workout Planner</span>
          </button>
        </div>

        {/* ── Tab 1: AI Pose Check Studio ─────────────────────────────────── */}
        {activeTab === 'pose' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Camera / Skeleton Viewport (8 cols) */}
            <div className="lg:col-span-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative flex flex-col min-h-[460px]">
              {/* HUD Top Bar */}
              <div className="p-3.5 flex items-center justify-between z-10 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRunning
                        ? 'bg-red-500 animate-pulse'
                        : isModelLoading
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-white text-xs font-bold tracking-wide">
                    {isRunning
                      ? 'Đang phân tích realtime'
                      : isModelLoading
                      ? 'Đang tải mô hình AI...'
                      : 'MediaPipe BlazePose Sẵn sàng'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isRunning && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {metrics.fps} FPS
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <span>Quy tắc:</span>
                    <span className="text-slate-200 font-bold uppercase px-2 py-0.5 rounded bg-slate-800">
                      {poseExercise}_v2
                    </span>
                  </div>
                </div>
              </div>

              {/* Video + Canvas Overlay */}
              <div className="relative flex-1 flex items-center justify-center bg-slate-950 min-h-[360px]">
                {/* Hidden video element for webcam stream */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)', display: isRunning ? 'block' : 'none' }}
                  playsInline
                  muted
                />

                {/* Canvas for skeleton overlay */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ display: isRunning ? 'block' : 'none' }}
                />

                {/* Placeholder when camera is off */}
                {!isRunning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 p-8">
                    {/* Viewfinder corners */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-orange-500/50" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-orange-500/50" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-orange-500/50" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-orange-500/50" />

                    {isModelLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-2 border-[#FF5722] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-slate-300">
                          Đang tải mô hình MediaPipe...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-900/80 border-2 border-[#FF5722] flex items-center justify-center shadow-lg shadow-orange-500/20">
                          <Camera className="w-9 h-9 text-[#FF5722]" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-base">
                            Camera chưa được bật
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            Nhấn &quot;Bắt đầu phân tích&quot; để mở camera và chạy AI
                          </p>
                        </div>
                        {poseError && (
                          <div className="bg-rose-900/50 border border-rose-700 rounded-lg px-4 py-2 text-xs text-rose-300 max-w-xs">
                            {poseError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Realtime score overlay (when running) */}
                {isRunning && (
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                        Chu kỳ
                      </div>
                      <div className="text-2xl font-black text-white tabular-nums leading-none">
                        {metrics.repCount}
                      </div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                        Hợp lệ (ROM)
                      </div>
                      <div className="text-2xl font-black text-emerald-400 tabular-nums leading-none">
                        {metrics.validRepCount}
                      </div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                        Điểm Form
                      </div>
                      <div
                        className={`text-2xl font-black tabular-nums leading-none ${scoreColour(metrics.score)}`}
                      >
                        {metrics.score}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Status indicator (In rep / Last rep badge) */}
                {isRunning && (
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    {metrics.isInRep && (
                      <div className="bg-[#FF5722]/90 text-white text-xs font-bold px-2.5 py-1 rounded shadow animate-pulse">
                        ● ĐANG THỰC HIỆN
                      </div>
                    )}
                    {metrics.lastRepStatus && (
                      <div
                        className={`text-xs font-black px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 transition-all ${
                          metrics.lastRepStatus === 'GOOD_REP'
                            ? 'bg-emerald-600 text-white border border-emerald-400'
                            : metrics.lastRepStatus === 'BAD_FORM'
                            ? 'bg-amber-600 text-white border border-amber-400'
                            : 'bg-rose-600 text-white border border-rose-400'
                        }`}
                      >
                        {metrics.lastRepStatus === 'GOOD_REP' && '✓ GOOD REP'}
                        {metrics.lastRepStatus === 'BAD_FORM' && '⚠ BAD FORM'}
                        {metrics.lastRepStatus === 'NO_REP' && '✕ NO REP'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Control Dock */}
              <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    id="btn-start-stop"
                    onClick={handleToggleSession}
                    disabled={isModelLoading || isSaving}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRunning
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-[#FF5722] hover:bg-[#E64A19] text-white'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>
                          {isSaving ? 'Đang lưu...' : 'Kết thúc & Lưu kết quả'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {isModelLoading ? 'Đang tải...' : 'Bắt đầu phân tích'}
                        </span>
                      </>
                    )}
                  </button>

                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã lưu!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploadAnalyzing ? 'Đang phân tích...' : 'Tải video phân tích'}
                    </span>
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="video/mp4,video/mov,video/quicktime"
                      className="hidden"
                      onChange={handleVideoUpload}
                      disabled={isUploadAnalyzing}
                    />
                  </label>
                </div>
              </div>

              {/* Upload result notification */}
              {uploadResult && (
                <div
                  className={`px-4 py-2.5 text-xs font-semibold border-t ${
                    uploadResult.error
                      ? 'bg-rose-900/30 text-rose-300 border-rose-800'
                      : 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {uploadResult.error ? (
                    <span>⚠ Lỗi upload: {uploadResult.error}</span>
                  ) : (
                    <span>
                      ✓ {uploadResult.message || `Video đang được phân tích (Session: ${uploadResult.session_id?.slice(0, 8)}...).`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel: Metrics + Feedback (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Exercise selector */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  Chọn bài tập kiểm tra form
                </label>
                <select
                  id="exercise-select"
                  value={poseExercise}
                  onChange={handleExerciseChange}
                  disabled={isRunning}
                  className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#FF5722] disabled:opacity-50"
                >
                  <option value="squat">Barbell Squat / Bodyweight Squat</option>
                  <option value="pushup">Hít đất (Standard Push-up)</option>
                  <option value="plank">Plank tĩnh (Isometric Plank)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {poseExercise === 'squat' &&
                    'Đứng thẳng trước camera • Toàn thân trong khung hình'}
                  {poseExercise === 'pushup' &&
                    'Nghiêng người • Camera nhìn từ bên cạnh để tốt nhất'}
                  {poseExercise === 'plank' && 'Nằm nghiêng • Camera nhìn từ bên hông'}
                </p>
              </div>

              {/* Score + Rep Metrics */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                  Thống kê phiên tập
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                      Chu kỳ
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
                      {metrics.repCount}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                      Hợp Lệ
                    </span>
                    <div className="text-2xl font-black text-emerald-600 mt-0.5 tabular-nums">
                      {metrics.validRepCount}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                      Điểm Form
                    </span>
                    <div
                      className={`text-2xl font-black mt-0.5 tabular-nums ${scoreColour(metrics.score)}`}
                    >
                      {metrics.score}%
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-3">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${scoreBgColour(metrics.score)}`}
                      style={{ width: `${metrics.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Realtime Feedback Issues */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700 block">
                  Phân tích động học (Realtime)
                </span>

                {metrics.issues.length === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">
                      {isRunning
                        ? 'Tư thế tốt! Tiếp tục duy trì.'
                        : 'Bắt đầu phiên tập để xem phân tích.'}
                    </span>
                  </div>
                ) : (
                  metrics.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2.5 border ${
                        issue.severity === 'high'
                          ? 'bg-rose-50 text-rose-950 border-rose-200'
                          : 'bg-amber-50 text-amber-950 border-amber-200'
                      }`}
                    >
                      <AlertCircle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          issue.severity === 'high' ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      />
                      <span className="leading-snug">{issue.message}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Rep History Log */}
              {repLogs.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Lịch sử reps ({repLogs.length})
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                      <span className="text-emerald-600">
                        {repLogs.filter((r) => r.status === 'GOOD_REP').length} Good
                      </span>
                      <span>•</span>
                      <span className="text-amber-600">
                        {repLogs.filter((r) => r.status === 'BAD_FORM').length} Bad Form
                      </span>
                      <span>•</span>
                      <span className="text-rose-600">
                        {repLogs.filter((r) => r.status === 'NO_REP').length} No Rep
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {repLogs.map((rep) => (
                      <div
                        key={rep.repNumber}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              Rep #{rep.repNumber}
                            </span>
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                rep.status === 'GOOD_REP'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : rep.status === 'BAD_FORM'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {rep.status === 'GOOD_REP' && 'GOOD REP'}
                              {rep.status === 'BAD_FORM' && 'BAD FORM'}
                              {rep.status === 'NO_REP' && 'NO REP'}
                            </span>
                          </div>
                          <span
                            className={`font-black tabular-nums ${scoreColour(rep.score)}`}
                          >
                            {rep.score}%
                          </span>
                        </div>
                        {rep.issues.length > 0 && (
                          <div className="text-[11px] text-slate-600 pl-1 border-l-2 border-slate-300">
                            {rep.issues.map((iss, idx) => (
                              <div key={idx} className="leading-tight text-slate-700">
                                • {iss.message}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 2: AI Workout Planner ────────────────────────────────────── */}
        {activeTab === 'workout' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  Kế hoạch tập luyện cá nhân hóa (AI Workout Plan)
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Dựa trên hồ sơ cá nhân: tuổi, BMI, mục tiêu, tần suất tập luyện.
                </p>
              </div>
              <button
                id="btn-generate-plan"
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-center disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
                <span>{isGeneratingPlan ? 'Đang phân tích dữ liệu...' : 'Sinh lịch tập mới'}</span>
              </button>
            </div>

            {generatedPlan ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{generatedPlan.plan_name}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Thời lượng: {generatedPlan.duration_weeks} tuần
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đã kiểm duyệt cấu trúc
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedPlan.sessions?.map((sess: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5"
                    >
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                          {sess.day_label || sess.day || `Buổi ${idx + 1}`}
                        </h5>
                        {sess.focus_area && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{sess.focus_area}</p>
                        )}
                      </div>
                      <ul className="text-xs space-y-1.5 text-slate-600">
                        {(sess.exercises || []).map((ex: any, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] mt-1.5 shrink-0" />
                            <span className="font-medium text-slate-800">
                              {typeof ex === 'string'
                                ? ex
                                : `${ex.exercise_name} — ${ex.sets}x${ex.reps}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <Bot className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Chưa có kế hoạch tập luyện
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Nhấn &quot;Sinh lịch tập mới&quot; để nhận đề xuất cá nhân hóa từ AI.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

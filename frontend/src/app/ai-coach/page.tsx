'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import {
  Video,
  Bot,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useShell } from '@/components/layout/ShellLayout';

export default function AiCoachPage() {
  const { toggleMobileNav } = useShell();
  const [activeTab, setActiveTab] = useState<'pose' | 'workout'>('pose');
  const [poseExercise, setPoseExercise] = useState('squat');
  const [isCapturing, setIsCapturing] = useState(false);
  const [repCount, setRepCount] = useState(12);
  const [score, setScore] = useState(92);
  const [feedback, setFeedback] = useState([
    { issue: 'Độ sâu đùi song song mặt sàn đạt chuẩn 100%', type: 'success' },
    { issue: 'Lưng thẳng, ngực mở tự nhiên trong suốt 12 reps', type: 'success' },
    { issue: 'Đầu gối hơi chụm vào trong ở Rep thứ 8 khi phát lực lên', type: 'warning' },
  ]);

  // AI Workout Generation state
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>({
    plan_name: '4-Tuần Hypertrophy Tăng Cơ Nạc & Cải Thiện Thăng Bằng',
    goal: 'gain_muscle',
    duration_weeks: 4,
    sessions: [
      {
        day: 'Buổi 1: Thân Trên Đẩy & Tay Sau',
        exercises: ['Barbell Bench Press (4x8 - 80kg)', 'Incline DB Press (3x10 - 26kg)', 'Tricep Cable Pushdown (3x12)'],
      },
      {
        day: 'Buổi 2: Thân Dưới & Squat Kiểm Tra Form AI',
        exercises: ['Barbell Squat (4x8 - AI Form Check)', 'Romanian Deadlift (3x10)', 'Calf Raises (4x15)'],
      },
      {
        day: 'Buổi 3: Lưng Xô & Tay Trước (Pull)',
        exercises: ['Pull-ups (3xMax)', 'Barbell Bent Over Row (4x8)', 'Bicep Barbell Curl (3x10)'],
      },
    ],
  });

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setGeneratedPlan({
        plan_name: '4-Tuần Hypertrophy Tối Ưu Tải Trọng & Thể Lực',
        goal: 'gain_muscle',
        duration_weeks: 4,
        sessions: [
          {
            day: 'Buổi 1: Ngực & Vai Trước (Heavy Push)',
            exercises: ['Flat Barbell Bench (4x6-8)', 'Overhead Dumbbell Press (3x8-10)', 'Dips (3xMax)'],
          },
          {
            day: 'Buổi 2: Đùi & Mông (Quad & Glute Power)',
            exercises: ['Barbell Back Squat (4x8 - AI Form Check)', 'Bulgarian Split Squat (3x10/bên)', 'Leg Extension (3x12)'],
          },
          {
            day: 'Buổi 3: Lưng Xô & Core Phục Hồi',
            exercises: ['Deadlift (3x5)', 'Lat Pulldown (3x10)', 'Hanging Leg Raise (3x15)'],
          },
        ],
      });
      setIsGeneratingPlan(false);
    }, 1000);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <TopBar
        user={initialFitnessData.user}
        streak={initialFitnessData.today.streak}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Header (Information-first, bold and focused) */}
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

        {/* Tab 1: AI Pose Check Studio */}
        {activeTab === 'pose' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Camera / Video Viewport Studio (8 cols) */}
            <div className="lg:col-span-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative flex flex-col justify-between min-h-[440px]">
              {/* Top Viewport HUD Bar */}
              <div className="p-3.5 flex items-center justify-between z-10 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCapturing ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-white text-xs font-bold tracking-wide">
                    {isCapturing ? 'Đang chấm điểm trực tiếp' : 'MediaPipe CV Sẵn sàng'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span>Quy tắc:</span>
                  <span className="text-slate-200 font-bold uppercase px-2 py-0.5 rounded bg-slate-800">
                    {poseExercise}_v1.2
                  </span>
                </div>
              </div>

              {/* Viewport Viewfinder with Reticle Overlay */}
              <div className="relative flex-1 flex flex-col items-center justify-center text-white/90 p-8 my-auto">
                {/* Viewfinder Target Corners */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-orange-500/60" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-orange-500/60" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-orange-500/60" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-orange-500/60" />

                {/* Center Camera Icon with Orange Circle */}
                <div className="w-20 h-20 rounded-full bg-slate-900/80 border-2 border-[#FF5722] flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Video className="w-9 h-9 text-[#FF5722]" />
                </div>
              </div>

              {/* Bottom Control Dock */}
              <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsCapturing(!isCapturing)}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                      isCapturing
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-[#FF5722] hover:bg-[#E64A19] text-white'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isCapturing ? 'Kết thúc & Lưu kết quả' : 'Bật Webcam & Bắt đầu'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải video phân tích</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Metrics & Kinematic Feedback (4 cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Chọn bài tập kiểm tra form
                </label>
                <select
                  value={poseExercise}
                  onChange={(e) => setPoseExercise(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#FF5722]"
                >
                  <option value="squat">Barbell Squat / Bodyweight Squat</option>
                  <option value="pushup">Hít đất (Standard Push-up)</option>
                  <option value="plank">Plank tĩnh (Isometric Plank)</option>
                </select>
              </div>

              {/* Score & Reps Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Số Rep Hợp Lệ
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-0.5 tabular-nums">
                    {repCount}
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Điểm Form Chuẩn
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-0.5 tabular-nums">
                    {score}%
                  </div>
                </div>
              </div>

              {/* Realtime Form Warnings / Feedback */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700 block">
                  Phân tích động học (Kinematic Cues)
                </span>
                {feedback.map((f, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2.5 border ${
                      f.type === 'success'
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                        : 'bg-amber-50 text-amber-950 border-amber-200'
                    }`}
                  >
                    {f.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{f.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Workout Planner */}
        {activeTab === 'workout' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  Kế hoạch tập luyện cá nhân hóa (AI Workout Plan)
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Ngữ cảnh: 26 tuổi • BMI 22.4 • Mục tiêu: Tăng cơ nạc • Tần suất: 3 buổi/tuần.
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-center"
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
                      Thời lượng: {generatedPlan.duration_weeks} tuần • Mục tiêu: Tăng cơ bắp nạc
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đã kiểm duyệt cấu trúc
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedPlan.sessions.map((sess: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
                      <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                        {sess.day}
                      </h5>
                      <ul className="text-xs space-y-1.5 text-slate-600">
                        {sess.exercises.map((ex: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
                            <span className="font-medium text-slate-800">{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <Bot className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Bấm &quot;Sinh lịch tập mới&quot; để nhận đề xuất bài tập tối ưu từ mô hình AI.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

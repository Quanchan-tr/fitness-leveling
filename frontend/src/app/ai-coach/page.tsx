'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { Sparkles, Video, Bot, Dumbbell, Utensils, CheckCircle2, AlertCircle, Play, RefreshCw, Upload } from 'lucide-react';

export default function AiCoachPage() {
  const [activeTab, setActiveTab] = useState<'workout' | 'meal' | 'pose'>('pose');
  const [poseExercise, setPoseExercise] = useState('squat');
  const [isCapturing, setIsCapturing] = useState(false);
  const [repCount, setRepCount] = useState(12);
  const [score, setScore] = useState(92);
  const [feedback, setFeedback] = useState([
    { issue: 'Good depth achieved on all sets', type: 'success' },
    { issue: 'Slight forward knee drift at Rep 8', type: 'warning' },
  ]);

  // AI Workout Generation state
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setGeneratedPlan({
        plan_name: '4-Week Hypertrophy & Core Focus',
        goal: 'gain_muscle',
        duration_weeks: 4,
        sessions: [
          { day: 'Day 1: Upper Body Strength', exercises: ['Barbell Bench Press (4x8)', 'Overhead Press (3x10)', 'Pull-ups (3xMax)'] },
          { day: 'Day 2: Lower Body & Pose Checked Squats', exercises: ['Barbell Squat (4x8 - AI Form Check)', 'Romanian Deadlift (3x10)', 'Calf Raises (4x15)'] },
          { day: 'Day 3: Core & Active Recovery', exercises: ['Plank Form Hold (3x60s)', 'Hanging Leg Raises (3x12)'] },
        ],
      });
      setIsGeneratingPlan(false);
    }, 1200);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <TopBar user={initialFitnessData.user} streak={initialFitnessData.today.streak} />

      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1F2328] tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-[#FF6B35]" />
              FitTrack AI Coach Hub
            </h1>
            <p className="text-xs text-[#76583E] mt-0.5">
              Triple-layer validated AI workout recommendations, meal plans, and real-time computer vision Pose Check.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 bg-[#E8E1D5]/60 p-1.5 rounded-2xl border border-[#B9A78E]/40 w-fit">
          <button
            onClick={() => setActiveTab('pose')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pose'
                ? 'bg-[#FF6B35] text-white shadow-sm'
                : 'text-[#76583E] hover:text-[#1F2328]'
            }`}
          >
            <Video className="w-4 h-4" />
            AI Pose Check
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'workout'
                ? 'bg-[#FF6B35] text-white shadow-sm'
                : 'text-[#76583E] hover:text-[#1F2328]'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            AI Workout Planner
          </button>
          <button
            onClick={() => setActiveTab('meal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'meal'
                ? 'bg-[#FF6B35] text-white shadow-sm'
                : 'text-[#76583E] hover:text-[#1F2328]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            AI Meal Planner
          </button>
        </div>

        {/* Tab 1: AI Pose Check Studio */}
        {activeTab === 'pose' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera / Video Viewport */}
            <div className="lg:col-span-2 bg-[#303238] rounded-3xl overflow-hidden shadow-lg border border-[#B9A78E]/30 relative flex flex-col justify-between min-h-[380px]">
              <div className="p-4 flex items-center justify-between z-10">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isCapturing ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                  <span>{isCapturing ? 'Pose Check Active' : 'Edge CV Ready'}</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
                  Rule Key: <strong className="text-[#FF6B35] uppercase">{poseExercise}_v1</strong>
                </div>
              </div>

              {/* Viewport Silhouette / Camera Preview */}
              <div className="flex flex-col items-center justify-center text-white/80 p-8 space-y-3">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-white/30 animate-pulse">
                  <Video className="w-10 h-10 text-[#FF6B35]" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-sm text-white">Client-Side Edge MediaPipe Engine</h3>
                  <p className="text-xs text-white/60 max-w-sm mt-1">
                    Pose landmarks are processed locally on your device in real-time. Zero frames sent to the server.
                  </p>
                </div>
              </div>

              {/* Controls bar */}
              <div className="p-4 bg-black/60 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCapturing(!isCapturing)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                      isCapturing
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    {isCapturing ? 'Finish Set & Send Summary' : 'Start Realtime Check'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="bg-white/15 text-white hover:bg-white/25 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Video (Async)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Metrics & Kinematic Feedback */}
            <div className="bg-white p-5 rounded-3xl border border-[#B9A78E]/40 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-[#76583E] uppercase tracking-wider">Exercise Selected</span>
                <select
                  value={poseExercise}
                  onChange={(e) => setPoseExercise(e.target.value)}
                  className="w-full bg-[#F7F3EA] mt-1.5 px-3.5 py-2.5 rounded-xl border border-[#B9A78E]/40 text-xs font-bold text-[#1F2328]"
                >
                  <option value="squat">Barbell / Bodyweight Squat</option>
                  <option value="pushup">Standard Push-up</option>
                  <option value="plank">Isometric Plank</option>
                </select>
              </div>

              {/* Score & Reps Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#E8E1D5]/40 p-4 rounded-2xl border border-[#B9A78E]/30 text-center">
                  <span className="text-[11px] font-bold text-[#76583E]">Valid Reps</span>
                  <div className="text-3xl font-black text-[#1F2328] mt-1">{repCount}</div>
                </div>
                <div className="bg-[#7FB069]/15 p-4 rounded-2xl border border-[#7FB069]/30 text-center">
                  <span className="text-[11px] font-bold text-[#7FB069]">Form Score</span>
                  <div className="text-3xl font-black text-[#7FB069] mt-1">{score}%</div>
                </div>
              </div>

              {/* Realtime Form Warnings / Feedback */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1F2328] block">Kinematic Feedback</span>
                {feedback.map((f, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                      f.type === 'success'
                        ? 'bg-[#7FB069]/15 text-[#1F2328]'
                        : 'bg-[#F4C95D]/25 text-[#1F2328]'
                    }`}
                  >
                    {f.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#7FB069] flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                    )}
                    <span>{f.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Workout Planner */}
        {activeTab === 'workout' && (
          <div className="bg-white p-6 rounded-3xl border border-[#B9A78E]/40 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#1F2328]">Tailored AI Exercise Plan</h3>
                <p className="text-xs text-[#76583E]">
                  Context: Age 26, BMI 22.3, Goal: Muscle Gain, Activity: Moderate.
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="bg-[#FF6B35] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#FF6B35]/90 transition-all flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
                {isGeneratingPlan ? 'Analyzing & Validating...' : 'Generate New Plan'}
              </button>
            </div>

            {generatedPlan ? (
              <div className="space-y-4">
                <div className="bg-[#E8E1D5]/40 p-4 rounded-2xl border border-[#B9A78E]/30">
                  <h4 className="font-bold text-sm text-[#1F2328]">{generatedPlan.plan_name}</h4>
                  <span className="text-xs text-[#FF6B35] font-semibold">
                    Duration: {generatedPlan.duration_weeks} Weeks • Goal: {generatedPlan.goal}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedPlan.sessions.map((sess: any, idx: number) => (
                    <div key={idx} className="bg-[#F7F3EA] p-4 rounded-2xl border border-[#B9A78E]/30 space-y-2">
                      <h5 className="font-bold text-xs text-[#1F2328]">{sess.day}</h5>
                      <ul className="text-xs space-y-1 text-[#76583E]">
                        {sess.exercises.map((ex: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-[#F7F3EA] rounded-2xl border border-[#B9A78E]/30 space-y-2">
                <Bot className="w-10 h-10 text-[#FF6B35] mx-auto" />
                <p className="text-xs font-semibold text-[#1F2328]">
                  Click "Generate New Plan" to request a structured plan from the AI Engine.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: AI Meal Planner */}
        {activeTab === 'meal' && (
          <div className="bg-white p-6 rounded-3xl border border-[#B9A78E]/40 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-[#1F2328]">Personalized AI Meal Guidance</h3>
            <p className="text-xs text-[#76583E]">
              Calorie Target: 2,400 kcal (Protein: 160g, Carbs: 260g, Fat: 75g)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F7F3EA] p-4 rounded-2xl border border-[#B9A78E]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF6B35]/15 text-[#FF6B35] px-2 py-0.5 rounded">
                  Breakfast • 600 kcal
                </span>
                <h4 className="font-bold text-xs text-[#1F2328]">High-Protein Power Oats</h4>
                <p className="text-xs text-[#76583E]">80g Rolled Oats, 1 Scoop Whey Protein, 100g Berries, 15g Peanut Butter.</p>
              </div>
              <div className="bg-[#F7F3EA] p-4 rounded-2xl border border-[#B9A78E]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4C95D]/25 text-[#1F2328] px-2 py-0.5 rounded">
                  Lunch • 850 kcal
                </span>
                <h4 className="font-bold text-xs text-[#1F2328]">Grilled Steak Rice Bowl</h4>
                <p className="text-xs text-[#76583E]">180g Lean Flank Steak, 200g Jasmine Rice, Roasted Asparagus & Olive Oil.</p>
              </div>
              <div className="bg-[#F7F3EA] p-4 rounded-2xl border border-[#B9A78E]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4D96FF]/15 text-[#4D96FF] px-2 py-0.5 rounded">
                  Dinner • 650 kcal
                </span>
                <h4 className="font-bold text-xs text-[#1F2328]">Salmon & Sweet Potato Mash</h4>
                <p className="text-xs text-[#76583E]">200g Wild Salmon, 200g Baked Sweet Potato, Steamed Broccoli with Lemon.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

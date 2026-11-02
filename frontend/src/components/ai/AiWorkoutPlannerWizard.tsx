'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Calendar,
  Clock,
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  RotateCcw,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Check,
  Video,
  X,
  Trash2,
} from 'lucide-react';
import { useFitness } from '@/contexts/FitnessContext';
import { apiRequest, generateUUID } from '@/lib/api';
import {
  ALL_WEEK_DAYS,
  PlannerConfig,
  SPLIT_DEFINITIONS,
  SplitType,
  WeeklyWorkoutPlan,
  convertPlanToScheduleAndRoutines,
  generateWeeklyWorkoutPlan,
  recommendSplit,
  validateSplit,
} from '@/lib/workoutPlannerEngine';
import { WeekDayVi } from '@/types/fitnessleveling.types';
import { Skeleton } from '@/components/ui/Skeleton';

export const AiWorkoutPlannerWizard: React.FC = () => {
  const { profile, schedule, applyWeeklySchedule } = useFitness();

  // ─── Planner Configuration State ──────────────────────────────────────────
  const [splitMode, setSplitMode] = useState<'auto' | 'manual'>('auto');
  const [selectedSplit, setSelectedSplit] = useState<SplitType>('upper_lower');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [customDays, setCustomDays] = useState<WeekDayVi[]>([]);
  const [isCustomDaysActive, setIsCustomDaysActive] = useState<boolean>(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [equipment, setEquipment] = useState<'all' | 'dumbbell' | 'bodyweight'>('all');
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // ─── Generation & Preview State ───────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [activeSessionTab, setActiveSessionTab] = useState<number>(0);

  // Active split calculation
  const effectiveSplit: SplitType =
    splitMode === 'auto'
      ? recommendSplit(experienceLevel, daysPerWeek, profile.goal)
      : selectedSplit;

  const splitValidation = validateSplit(effectiveSplit, daysPerWeek, experienceLevel);

  // Toggle injury item
  const toggleInjury = (key: string) => {
    setSelectedInjuries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Toggle target day selection
  const toggleDaySelection = (day: WeekDayVi) => {
    setCustomDays((prev) => {
      const exists = prev.includes(day);
      if (exists) {
        return prev.filter((d) => d !== day);
      }
      if (prev.length >= daysPerWeek) {
        return [...prev.slice(1), day];
      }
      return [...prev, day];
    });
  };

  // ─── Generate Workout Plan ────────────────────────────────────────────────
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setAppliedSuccess(false);

    const config: PlannerConfig = {
      splitMode,
      splitType: effectiveSplit,
      daysPerWeek,
      targetDays: isCustomDaysActive && customDays.length > 0 ? customDays : undefined,
      durationMinutes,
      equipment,
      injuryConstraints: selectedInjuries,
      goal: profile.goal as any,
      experience: experienceLevel,
    };

    try {
      // 1. Attempt Backend AI Generation via API
      const result = await apiRequest<{ data: any }>('/ai/exercise-plan', {
        method: 'POST',
        body: JSON.stringify({
          goal: profile.goal,
          experience: experienceLevel,
          days_per_week: daysPerWeek,
          split_type: splitMode === 'auto' ? 'auto' : selectedSplit,
          equipment,
          duration_minutes: durationMinutes,
          injuries: selectedInjuries,
          target_days: isCustomDaysActive ? customDays : null,
        }),
        useIdempotency: true,
      });

      if (result?.data?.sessions && Array.isArray(result.data.sessions) && result.data.sessions.length >= 7) {
        setGeneratedPlan(result.data);
        setActiveSessionTab(0);
        return;
      }
      throw new Error('Incomplete backend plan');
    } catch (err) {
      // 2. Triple-layer Fallback: Client-side science-based rule engine
      console.info('[AiWorkoutPlanner] Using client-side rule engine fallback:', err);
      const plan = generateWeeklyWorkoutPlan(config, profile);
      setGeneratedPlan(plan);
      setActiveSessionTab(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Apply to Schedule ────────────────────────────────────────────────────
  const handleConfirmApply = () => {
    if (!generatedPlan) return;

    const { newSchedule, newRoutines } = convertPlanToScheduleAndRoutines(
      generatedPlan,
      schedule,
      {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
      }
    );

    applyWeeklySchedule(newSchedule, newRoutines);
    setShowConfirmModal(false);
    setAppliedSuccess(true);
  };

  // Remove exercise from plan
  const handleRemoveExercise = (sessionIndex: number, exerciseIndex: number) => {
    if (!generatedPlan) return;
    const updatedSessions = [...generatedPlan.sessions];
    const session = updatedSessions[sessionIndex];
    if (session) {
      session.exercises = session.exercises.filter((_, i) => i !== exerciseIndex);
      setGeneratedPlan({
        ...generatedPlan,
        sessions: updatedSessions,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden border border-slate-700/80">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FF5722]/20 text-[#FF7043] border border-[#FF5722]/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Workout Planner</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Kế Hoạch Tập Luyện 7 Ngày
            </h2>
          </div>
        </div>
      </div>

      {/* ── Partitioned Configuration Panels ── */}
      <div className="space-y-4">
        {/* Panel 1: Cơ chế phân chia lịch tập */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-[#FF5722]" />
            <h3 className="font-bold text-sm text-slate-900">Cơ chế phân chia lịch tập</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSplitMode('auto')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                splitMode === 'auto'
                  ? 'border-[#FF5722] bg-[#FF5722]/5 ring-1 ring-[#FF5722]'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5722]" />
                AI Tự Động Tối Ưu
              </span>
              {splitMode === 'auto' && <CheckCircle2 className="w-4 h-4 text-[#FF5722]" />}
            </button>

            <button
              type="button"
              onClick={() => setSplitMode('manual')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                splitMode === 'manual'
                  ? 'border-[#FF5722] bg-[#FF5722]/5 ring-1 ring-[#FF5722]'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                Tự Chọn Split
              </span>
              {splitMode === 'manual' && <CheckCircle2 className="w-4 h-4 text-[#FF5722]" />}
            </button>
          </div>

          {/* Manual Split Selection Cards */}
          {splitMode === 'manual' && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-150">
              <span className="text-xs font-semibold text-slate-600 block">
                Chọn kiểu phân chia:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.keys(SPLIT_DEFINITIONS) as SplitType[]).map((splitKey) => {
                  const info = SPLIT_DEFINITIONS[splitKey];
                  const isSelected = selectedSplit === splitKey;
                  return (
                    <button
                      key={splitKey}
                      type="button"
                      onClick={() => setSelectedSplit(splitKey)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FF5722] bg-[#FF5722]/5 ring-1 ring-[#FF5722]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{info.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5722]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{info.shortDesc}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Đề xuất: {info.recommendedDays.join(', ')} buổi/tuần
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Tần suất & Ngày tập */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF5722]" />
              <h3 className="font-bold text-sm text-slate-900">Tần suất &amp; Ngày tập</h3>
            </div>
            <span className="text-xs text-slate-500">
              Split: <strong className="text-slate-800">{SPLIT_DEFINITIONS[effectiveSplit].name}</strong>
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Số buổi tập mỗi tuần: <span className="text-[#FF5722] font-bold">{daysPerWeek} buổi</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDaysPerWeek(num)}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    daysPerWeek === num
                      ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {num} buổi
                </button>
              ))}
            </div>

            {/* Validation Warning */}
            {!splitValidation.isValid && splitValidation.warning && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{splitValidation.warning}</span>
              </div>
            )}
          </div>

          {/* Target Days Selector */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Ngày tập trong tuần
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomDaysActive(!isCustomDaysActive);
                  if (!isCustomDaysActive) setCustomDays([]);
                }}
                className="text-xs text-[#FF5722] font-semibold hover:underline cursor-pointer"
              >
                {isCustomDaysActive ? 'Tự động phân bổ ngày nghỉ' : 'Tự chọn ngày cụ thể'}
              </button>
            </div>

            {isCustomDaysActive ? (
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                {ALL_WEEK_DAYS.map((day) => {
                  const isSelected = customDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDaySelection(day)}
                      className={`py-2 rounded-lg text-[11px] sm:text-xs font-bold border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-normal">
                Tự động phân bổ xen kẽ các ngày nghỉ nhằm tối ưu hóa 48h phục hồi cơ bắp.
              </p>
            )}
          </div>
        </div>

        {/* Panel 3: Thông số buổi tập & An toàn */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Dumbbell className="w-4 h-4 text-[#FF5722]" />
            <h3 className="font-bold text-sm text-slate-900">Thông số buổi tập &amp; Thể chất</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Thời lượng</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
              >
                <option value={45}>45 phút (Gọn gàng / 4 bài)</option>
                <option value={60}>60 phút (Tiêu chuẩn / 5 bài)</option>
                <option value={75}>75 phút (Chuyên sâu / 6 bài)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Thiết bị sẵn có</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as any)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
              >
                <option value="all">Phòng Gym đầy đủ</option>
                <option value="dumbbell">Tạ đơn tại nhà</option>
                <option value="bodyweight">Calisthenics / Bodyweight</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Trình độ</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
              >
                <option value="beginner">Người mới bắt đầu (&lt; 6 tháng)</option>
                <option value="intermediate">Trung cấp (6 tháng - 2 năm)</option>
                <option value="advanced">Nâng cao (&gt; 2 năm)</option>
              </select>
            </div>
          </div>

          {/* Vùng nhạy cảm / Chống chỉ định */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Vùng nhạy cảm (Tự động lọc bỏ bài tập gây áp lực)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'knee', label: 'Khớp gối' },
                { key: 'lower_back', label: 'Cột sống thắt lưng' },
                { key: 'shoulder', label: 'Khớp vai' },
              ].map((item) => {
                const active = selectedInjuries.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleInjury(item.key)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-rose-500' : 'bg-slate-300'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-1">
          <button
            type="button"
            id="btn-trigger-ai-planner"
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Đang tạo kế hoạch 7 ngày...' : 'Sinh Lịch Tập Tuần'}</span>
          </button>
        </div>
      </div>

      {/* ── Loading Skeleton State ── */}
      {isGenerating && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <Skeleton className="w-56 h-6 rounded-md" />
            <Skeleton className="w-28 h-6 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-3">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-40 h-5 rounded" />
                <div className="space-y-1.5 pt-2">
                  <Skeleton className="w-full h-3.5 rounded" />
                  <Skeleton className="w-4/5 h-3.5 rounded" />
                  <Skeleton className="w-3/4 h-3.5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Generated Plan Preview ── */}
      {generatedPlan && !isGenerating && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-5 sm:p-7">
          {/* Plan Header & Rationale */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Chu kỳ 4 tuần
                </span>
                <span className="text-xs font-bold text-[#FF5722] bg-[#FF5722]/10 px-2.5 py-0.5 rounded-full">
                  {generatedPlan.split_label}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {generatedPlan.plan_name}
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 flex items-start gap-1.5 max-w-2xl">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{generatedPlan.rationale}</span>
              </p>
            </div>

            {/* Apply Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow hover:shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Áp dụng vào Lịch tập tuần</span>
              </button>
            </div>
          </div>

          {/* Applied Success Banner */}
          {appliedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">
                    Đã cập nhật thành công vào Lịch tập tuần!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Tất cả 7 ngày trong tuần đã được cấu hình bài tập, số hiệp và bộ đếm thời gian nghỉ.
                  </p>
                </div>
              </div>
              <Link
                href="/workout"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Xem Lịch Tập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* 7-Day Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {generatedPlan.sessions.map((session, idx) => {
              const isRest = session.is_rest;
              const isCurrentView = activeSessionTab === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveSessionTab(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrentView
                      ? 'border-[#FF5722] bg-[#FF5722]/5 ring-1 ring-[#FF5722]'
                      : isRest
                      ? 'border-slate-200 bg-slate-50/60 opacity-80'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs text-slate-900">{session.day_of_week}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isRest
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-orange-50 text-[#FF5722] border border-orange-200'
                      }`}
                    >
                      {isRest ? 'Nghỉ' : `${session.exercises.length} bài`}
                    </span>
                  </div>
                  <h5 className="font-bold text-[11px] text-slate-800 line-clamp-1">
                    {session.session_title}
                  </h5>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {session.focus_area}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Session Detailed View */}
          {generatedPlan.sessions[activeSessionTab] && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#FF5722]">
                      {generatedPlan.sessions[activeSessionTab].day_of_week}
                    </span>
                    <span className="text-slate-300">•</span>
                    <h4 className="font-bold text-sm text-slate-900">
                      {generatedPlan.sessions[activeSessionTab].session_title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Trọng tâm: {generatedPlan.sessions[activeSessionTab].focus_area}
                    {generatedPlan.sessions[activeSessionTab].estimated_duration_min > 0 &&
                      ` • Dự kiến: ${generatedPlan.sessions[activeSessionTab].estimated_duration_min} phút`}
                  </p>
                </div>

                {generatedPlan.sessions[activeSessionTab].is_rest && (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                    Ngày phục hồi chủ động
                  </span>
                )}
              </div>

              {generatedPlan.sessions[activeSessionTab].is_rest ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-800">
                    Phục hồi &amp; Tái tạo năng lượng
                  </h5>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Cơ bắp không phát triển trong lúc bạn tập, mà phát triển khi bạn nghỉ ngơi và ăn uống đầy đủ. Hãy uống đủ 2-3 lít nước và ngủ đủ 7-8 tiếng hôm nay.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedPlan.sessions[activeSessionTab].exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                          {exIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {ex.exercise_name}
                            </span>
                            {ex.has_ai_check && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <Video className="w-2.5 h-2.5" />
                                <span>AI Pose</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>Nhóm cơ: {ex.target_muscle}</span>
                            <span>•</span>
                            <span>Thiết bị: {ex.equipment}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800">
                            {ex.sets} sets × {ex.reps}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            RPE {ex.rpe} • Nghỉ {ex.rest_seconds}s
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(activeSessionTab, exIdx)}
                          title="Xóa bài tập này khỏi buổi"
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Overwrite Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận áp dụng kế hoạch tập tuần?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Kế hoạch 7 ngày mới sẽ được gán trực tiếp vào lịch tập của bạn. Các bài tập đã gán trước đó trong tuần này sẽ được cập nhật lại theo chu kỳ tối ưu của AI.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div>
                • Split: <strong className="text-slate-800">{generatedPlan?.split_label}</strong>
              </div>
              <div>
                • Tần suất: <strong className="text-slate-800">{generatedPlan?.days_per_week} buổi/tuần</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-apply-plan"
                onClick={handleConfirmApply}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                Đồng ý Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

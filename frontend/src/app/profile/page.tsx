'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { useFitness } from '@/contexts/FitnessContext';
import { useShell } from '@/components/layout/ShellLayout';
import {
  User,
  Calendar,
  BarChart3,
  Dumbbell,
  Clock,
  CheckCircle2,
  Pencil,
  Sparkles,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Check,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { toggleMobileNav } = useShell();
  const { profile, updateProfile, workoutHistory } = useFitness();

  // Statistics state: Tab & Time filter
  const [statTab, setStatTab] = useState<'duration' | 'reps'>('duration');
  const [statFilter, setStatFilter] = useState<'12_weeks' | 'this_month' | 'all'>('12_weeks');

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editGoal, setEditGoal] = useState(profile.goal);

  // Calendar selected date for inspecting historical workout
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim() || profile.name,
      bio: editBio.trim() || profile.bio,
      goal: editGoal,
    });
    setIsEditModalOpen(false);
  };

  // Month days setup for Personal Calendar (October 2026)
  const currentMonthYear = 'Tháng 10, 2026';
  const daysInMonth = 31;
  // Let's assume Oct 1, 2026 was a Thursday (weekday index 3 if Mon is 0)
  const firstDayOffset = 3; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun

  // Extract completed days of the month from workoutHistory
  const completedDaysMap = workoutHistory.reduce((acc, item) => {
    try {
      const d = new Date(item.completedAt);
      const dayNum = d.getDate();
      acc[dayNum] = item;
    } catch {
      // ignore
    }
    return acc;
  }, {} as Record<number, typeof workoutHistory[0]>);

  // Statistics chart datasets according to statFilter and statTab
  const chartDatasets = {
    '12_weeks': {
      duration: [
        { label: 'T1', value: 160 },
        { label: 'T2', value: 180 },
        { label: 'T3', value: 210 },
        { label: 'T4', value: 195 },
        { label: 'T5', value: 240 },
        { label: 'T6', value: 220 },
        { label: 'T7', value: 260 },
        { label: 'T8', value: 250 },
        { label: 'T9', value: 280 },
        { label: 'T10', value: 270 },
        { label: 'T11', value: 310 },
        { label: 'T12', value: 290 },
      ],
      reps: [
        { label: 'T1', value: 240 },
        { label: 'T2', value: 260 },
        { label: 'T3', value: 310 },
        { label: 'T4', value: 290 },
        { label: 'T5', value: 360 },
        { label: 'T6', value: 340 },
        { label: 'T7', value: 410 },
        { label: 'T8', value: 390 },
        { label: 'T9', value: 450 },
        { label: 'T10', value: 430 },
        { label: 'T11', value: 510 },
        { label: 'T12', value: 480 },
      ],
    },
    'this_month': {
      duration: [
        { label: 'Tuần 1', value: 260 },
        { label: 'Tuần 2', value: 280 },
        { label: 'Tuần 3', value: 310 },
        { label: 'Tuần 4', value: 290 },
      ],
      reps: [
        { label: 'Tuần 1', value: 410 },
        { label: 'Tuần 2', value: 450 },
        { label: 'Tuần 3', value: 510 },
        { label: 'Tuần 4', value: 480 },
      ],
    },
    'all': {
      duration: [
        { label: 'Tháng 5', value: 860 },
        { label: 'Tháng 6', value: 920 },
        { label: 'Tháng 7', value: 1040 },
        { label: 'Tháng 8', value: 980 },
        { label: 'Tháng 9', value: 1120 },
        { label: 'Tháng 10', value: 1155 },
      ],
      reps: [
        { label: 'Tháng 5', value: 1420 },
        { label: 'Tháng 6', value: 1580 },
        { label: 'Tháng 7', value: 1840 },
        { label: 'Tháng 8', value: 1720 },
        { label: 'Tháng 9', value: 1960 },
        { label: 'Tháng 10', value: 2040 },
      ],
    },
  };

  const activeChartData = chartDatasets[statFilter][statTab];
  const maxChartValue = Math.max(...activeChartData.map((d) => d.value));

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      {/* Top Navigation Bar */}
      <TopBar
        user={{
          name: profile.name,
          level: profile.level,
          xp: profile.xp,
          nextLevelXp: profile.maxXp,
          str: 24,
          end: 18,
          mob: 15,
          goal: profile.goal,
        }}
        streak={profile.streak}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Section 19: Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-orange-500/30 shadow-md"
                />
                <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white font-extrabold text-xs px-2.5 py-1 rounded-full border-2 border-white shadow-xs">
                  Lv. {profile.level}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-lg">
                    {profile.goal === 'gain_muscle' ? 'Tăng cơ' : 'Giảm mỡ'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
                  {profile.bio}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pt-0.5">
                  <Flame className="w-4 h-4 text-[#FF5722]" />
                  <span>{profile.streak} ngày streak liên tục</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditName(profile.name);
                setEditBio(profile.bio);
                setEditGoal(profile.goal);
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center shadow-2xs"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          </div>

          {/* Followers, Following, Workouts Counter Trio */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-400 font-bold uppercase block">
                Tổng buổi tập
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                {profile.totalWorkouts}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-400 font-bold uppercase block">
                Người theo dõi
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                {profile.followersCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-400 font-bold uppercase block">
                Đang theo dõi
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                {profile.followingCount}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Middle Grid: Statistics Chart & Personal Monthly Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= SECTION 19.1: STATISTICS (7 cols) ================= */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FF5722]" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Thống kê tiến trình tập luyện
                </h2>
              </div>

              {/* Time Filter Pills: 12 tuần gần nhất, Tháng này, Tất cả */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setStatFilter('12_weeks')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statFilter === '12_weeks'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  12 tuần gần nhất
                </button>
                <button
                  onClick={() => setStatFilter('this_month')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statFilter === 'this_month'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tháng này
                </button>
                <button
                  onClick={() => setStatFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statFilter === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tất cả
                </button>
              </div>
            </div>

            {/* Metric Tabs: Thời lượng vs Số Reps */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatTab('duration')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statTab === 'duration'
                    ? 'bg-[#FF5722] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Thời lượng
              </button>
              <button
                onClick={() => setStatTab('reps')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statTab === 'reps'
                    ? 'bg-[#FF5722] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Số Reps
              </button>
            </div>

            {/* Interactive Clean Bar Chart */}
            <div className="pt-2">
              <div className="h-56 flex items-end justify-between gap-1.5 sm:gap-2 px-2 pt-6 pb-2 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                {activeChartData.map((d, idx) => {
                  const barHeight = Math.round((d.value / maxChartValue) * 100);
                  const isLatest = idx === activeChartData.length - 1;

                  return (
                    <div
                      key={`bar-${idx}`}
                      className="flex-1 flex flex-col items-center gap-2 group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none tabular-nums z-10 whitespace-nowrap">
                        {d.value} {statTab === 'duration' ? 'phút' : 'reps'}
                      </div>

                      <div className="w-full max-w-[28px] bg-slate-200 rounded-t-lg h-40 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isLatest
                              ? 'bg-[#FF5722]'
                              : 'bg-slate-700 group-hover:bg-[#FF5722]'
                          }`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= SECTION 19.2: PERSONAL MONTHLY CALENDAR (5 cols) ================= */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF5722]" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Lịch tập cá nhân
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                {currentMonthYear}
              </span>
            </div>

            {/* Weekday headers: T2 -> CN */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span className="text-[#FF5722]">CN</span>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {/* Empty leading padding */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-lead-${i}`} className="h-9" />
              ))}

              {/* Days 1 to 31 */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
                const historyRecord = completedDaysMap[dayNum];
                const isCompleted = !!historyRecord;
                const isToday = dayNum === 4; // Oct 4 = today

                return (
                  <button
                    key={`cal-day-${dayNum}`}
                    type="button"
                    onClick={() => {
                      if (historyRecord) {
                        setSelectedCalendarDate(historyRecord.completedAt);
                      }
                    }}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center font-bold transition-all relative cursor-pointer select-none ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                        : isToday
                        ? 'border-2 border-[#FF5722] text-[#FF5722] bg-orange-50/30'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    title={
                      isCompleted
                        ? `Ngày ${dayNum}: ${historyRecord.routineTitle} (${Math.round(historyRecord.durationSeconds / 60)}p)`
                        : `Ngày ${dayNum}`
                    }
                  >
                    <span className="tabular-nums text-xs">{dayNum}</span>
                    {isCompleted && (
                      <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Ngày đã hoàn thành buổi tập</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-[#FF5722] bg-orange-50" />
                <span>Hôm nay</span>
              </div>
            </div>

            {/* Selected Date Workout Card Preview */}
            {selectedCalendarDate && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900">
                    Chi tiết ngày đã tập
                  </span>
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-emerald-700 hover:text-emerald-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-emerald-800 font-bold">
                  {completedDaysMap[new Date(selectedCalendarDate).getDate()]?.routineTitle}
                </div>
                <div className="text-emerald-700 text-[11px]">
                  {Math.round(completedDaysMap[new Date(selectedCalendarDate).getDate()]?.durationSeconds / 60)} phút • {completedDaysMap[new Date(selectedCalendarDate).getDate()]?.totalSets} sets
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= SECTION 19.3: ACTIVITY HISTORY ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#FF5722]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Nhật ký hoạt động
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {workoutHistory.length} buổi tập
            </span>
          </div>

          {workoutHistory.length > 0 ? (
            <div className="space-y-3">
              {workoutHistory.map((item) => {
                const dateStr = new Date(item.completedAt).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                });
                const durationMinutes = Math.round(item.durationSeconds / 60);

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 capitalize">
                          {dateStr}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {item.routineTitle}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {item.exercisesSummary.map((exName, idx) => (
                          <span
                            key={`ex-hist-${idx}`}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                          >
                            {exName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div className="flex items-center gap-4 text-center shrink-0 self-end sm:self-center">
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Thời lượng
                        </span>
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          {durationMinutes}p
                        </span>
                      </div>

                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Tải trọng
                        </span>
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          {item.totalVolumeKg.toLocaleString('vi-VN')} kg
                        </span>
                      </div>

                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Hiệp tập
                        </span>
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          {item.totalSets} sets
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Section 19.3 Empty State */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chưa có buổi tập nào
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Bạn chưa ghi nhận buổi tập hoàn thành nào. Hãy chọn một routine và bắt đầu buổi tập hôm nay.
                </p>
              </div>
              <Link
                href="/workout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Bắt đầu buổi tập đầu tiên</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Chỉnh sửa thông tin hồ sơ
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#FF5722] bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mục tiêu luyện tập
                </label>
                <select
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold outline-none focus:border-[#FF5722] bg-white cursor-pointer"
                >
                  <option value="gain_muscle">Tăng cơ</option>
                  <option value="lose_fat">Giảm mỡ &amp; Cắt nét</option>
                  <option value="endurance">Sức bền &amp; Thể lực tổng hợp</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tiểu sử
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-[#FF5722] bg-slate-50"
                  placeholder="Mô tả ngắn gọn về bản thân và đam mê thể hình..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

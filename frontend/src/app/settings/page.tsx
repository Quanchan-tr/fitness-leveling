'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFitness } from '@/contexts/FitnessContext';
import {
  Settings,
  User,
  Bell,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  LogOut,
  Save,
  Volume2,
  Sparkles,
  ArrowLeft,
  Flame,
  X,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut, saveFitnessProfile } = useAuth();
  const { profile, updateProfile, vitals, updateWeight } = useFitness();
  const router = useRouter();

  // Active Settings Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'data'>('profile');

  // Profile Form State
  const [displayName, setDisplayName] = useState(profile.name || user?.displayName || 'Quan Tran');
  const [goal, setGoal] = useState<'gain_muscle' | 'lose_weight' | 'maintain'>(
    (profile.goal as any) || (user?.goal as any) || 'gain_muscle'
  );
  const [weightKg, setWeightKg] = useState<number>(user?.weightKg || 68.5);
  const [heightCm, setHeightCm] = useState<number>(user?.heightCm || 175);
  const [gender, setGender] = useState<'male' | 'female'>(user?.gender === 'female' ? 'female' : 'male');

  // Notification Preferences State (Persisted in localStorage)
  const [reminders, setReminders] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fitnessleveling_reminders_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading reminders', e);
      }
    }
    return {
      workoutReminder: true,
      workoutTime: '17:30',
      waterReminder: true,
      waterIntervalHours: 2,
      communityNotifications: true,
    };
  });

  // App Preferences State (Units & Audio)
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fitnessleveling_preferences_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading preferences', e);
      }
    }
    return {
      weightUnit: 'kg' as 'kg' | 'lbs',
      restTimerSound: true,
      autoRotateAvatar: false,
    };
  });

  // Feedback banner state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const mappedGoal = goal === 'gain_muscle' ? 'gain_muscle' : goal === 'lose_weight' ? 'lose_fat' : 'endurance';
    updateProfile({
      name: displayName.trim(),
      goal: mappedGoal,
    });
    if (weightKg) {
      updateWeight(weightKg);
    }
    if (saveFitnessProfile) {
      try {
        await saveFitnessProfile({
          fitnessGoal: goal === 'gain_muscle' ? 'build_muscle' : goal === 'lose_weight' ? 'lose_fat' : 'maintain',
          dailyActivityLevel: 'moderately_active',
          weightKg,
          heightCm,
          gender: gender === 'female' ? 'female' : 'male',
          age: 24,
          trainingExperience: 'intermediate',
        });
      } catch (err) {
        console.warn('Could not save fitness profile to auth storage:', err);
      }
    }
    showSuccess('Đã cập nhật thông tin hồ sơ và mục tiêu thành công!');
  };

  // Save Reminders Handler
  const handleToggleReminder = (key: keyof typeof reminders, val: any) => {
    const updated = { ...reminders, [key]: val };
    setReminders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitnessleveling_reminders_v1', JSON.stringify(updated));
    }
    showSuccess('Đã lưu tùy chọn lời nhắc thông báo.');
  };

  // Save Preferences Handler
  const handleTogglePreference = (key: keyof typeof preferences, val: any) => {
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitnessleveling_preferences_v1', JSON.stringify(updated));
    }
    showSuccess('Đã cập nhật cài đặt ứng dụng.');
  };

  // Export Data JSON
  const handleExportData = () => {
    const exportData = {
      user: { displayName, goal, weightKg, heightCm, gender },
      profile,
      vitals,
      reminders,
      preferences,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Đã xuất file sao lưu dữ liệu JSON thành công.');
  };

  // Reset Cache / Local Storage
  const handleResetStorage = () => {
    if (confirm('Bạn có chắc muốn xóa bộ nhớ đệm và khôi phục cài đặt gốc? (Dữ liệu cục bộ sẽ được làm mới)')) {
      if (typeof window !== 'undefined') {
        const preserveUser = localStorage.getItem('fitnessleveling_user');
        const preserveToken = localStorage.getItem('fitnessleveling_token');
        localStorage.clear();
        if (preserveUser) localStorage.setItem('fitnessleveling_user', preserveUser);
        if (preserveToken) localStorage.setItem('fitnessleveling_token', preserveToken);
        showSuccess('Đã xóa bộ nhớ đệm. Đang làm mới ứng dụng...');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  // Handler thoat cai dat: quay lai trang truoc hoac ve Dashboard
  const handleExit = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  // Lang nghe phim Esc de thoat nhanh
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {/* Standalone Settings Top Navigation Bar */}
      <header className="h-16 px-4 sm:px-8 bg-white border-b border-slate-200/90 flex items-center justify-between sticky top-0 z-30 select-none shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs hover:border-slate-300"
            title="Quay lại trang trước (hoặc bấm Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Quay lại</span>
            <span className="sm:hidden">Trở lại</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Brand Logo & Section Title */}
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" title="Về Dashboard">
            <div className="w-8 h-8 rounded-lg bg-[#FF5722] flex items-center justify-center text-white shadow-xs">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 block leading-none">
                Fitness<span className="text-[#FF5722]">Leveling</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Cài đặt ứng dụng
              </span>
            </div>
          </Link>
        </div>

        {/* User Status & Quick Exit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Lv. {profile.level} • {displayName}</span>
          </div>

          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
            title="Thoát cài đặt (Esc)"
          >
            <X className="w-4 h-4 text-slate-300" />
            <span>Thoát cài đặt</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700 text-slate-300 rounded font-mono">Esc</kbd>
          </button>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF5722]" />
              <span>Cài đặt hệ thống</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Tùy chỉnh hồ sơ cá nhân, lời nhắc lịch tập, đơn vị đo lường và quản lý dữ liệu
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Navigation Tabs (Sidebar style on desktop) */}
          <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-2 shadow-2xs space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
              <span>Hồ sơ & Thể hình</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
              <span>Lời nhắc & Thông báo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sliders className={`w-4 h-4 ${activeTab === 'preferences' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
              <span>Tùy chọn & Đơn vị</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Database className={`w-4 h-4 ${activeTab === 'data' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
              <span>Dữ liệu & Bộ nhớ</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
            {/* 1. Profile & Fitness Goal Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900">Hồ sơ cá nhân & Chỉ số thể chất</h3>
                  <p className="text-xs text-slate-500">Cập nhật thông tin để hệ thống AI tính toán TDEE và mục tiêu calo chuẩn xác nhất</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên hiển thị</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 outline-none focus:border-[#FF5722] bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mục tiêu luyện tập chính</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 outline-none focus:border-[#FF5722] bg-white cursor-pointer"
                    >
                      <option value="gain_muscle">💪 Tăng cơ bắp</option>
                      <option value="lose_weight">🔥 Giảm cân / Giảm mỡ</option>
                      <option value="maintain">⚖️ Duy trì vóc dáng & Sức khỏe</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none bg-white cursor-pointer"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Chiều cao (cm)</label>
                      <input
                        type="number"
                        min={100}
                        max={250}
                        value={heightCm}
                        onChange={(e) => setHeightCm(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cân nặng (kg)</label>
                      <input
                        type="number"
                        step={0.1}
                        min={30}
                        max={250}
                        value={weightKg}
                        onChange={(e) => setWeightKg(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu thông tin</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. Notifications & Reminders Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900">Lời nhắc & Thông báo luyện tập</h3>
                  <p className="text-xs text-slate-500">Tùy chỉnh thời điểm nhận thông báo để không bỏ lỡ lịch tập và mục tiêu dinh dưỡng</p>
                </div>

                <div className="space-y-4">
                  {/* Workout Reminder */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">Nhắc nhở buổi tập hàng ngày</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Nhận thông báo lịch tập trước khi bắt đầu bài tập trong ngày</p>
                      {reminders.workoutReminder && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-600 font-medium">Giờ nhắc:</span>
                          <input
                            type="time"
                            value={reminders.workoutTime}
                            onChange={(e) => handleToggleReminder('workoutTime', e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                          />
                        </div>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={reminders.workoutReminder}
                        onChange={(e) => handleToggleReminder('workoutReminder', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5722]"></div>
                    </label>
                  </div>

                  {/* Water Reminder */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">Nhắc nhở uống nước</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Nhắc nhở nạp nước đều đặn để duy trì hiệu suất trao đổi chất</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={reminders.waterReminder}
                        onChange={(e) => handleToggleReminder('waterReminder', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5722]"></div>
                    </label>
                  </div>

                  {/* Community Notifications */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">Tương tác bảng tin cộng đồng</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Thông báo khi có người thả tim, bình luận hoặc sao chép Routine của bạn</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={reminders.communityNotifications}
                        onChange={(e) => handleToggleReminder('communityNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5722]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Preferences & Units Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900">Tùy chọn hiển thị & Trải nghiệm</h3>
                  <p className="text-xs text-slate-500">Cấu hình đơn vị đo lường và âm thanh hỗ trợ luyện tập</p>
                </div>

                <div className="space-y-4">
                  {/* Rest Timer Audio Beep */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#FF5722]" />
                        <span>Âm thanh đếm ngược Rest Timer</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Phát tín hiệu âm thanh beep khi 3 giây nghỉ cuối cùng sắp hết</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.restTimerSound}
                        onChange={(e) => handleTogglePreference('restTimerSound', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5722]"></div>
                    </label>
                  </div>

                  {/* 3D Character Auto Rotate */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Tự động xoay 3D Avatar ở Dashboard</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Cho phép nhân vật thể hình 3D tự động xoay 360 độ chậm rãi</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.autoRotateAvatar}
                        onChange={(e) => handleTogglePreference('autoRotateAvatar', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5722]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Data & System Tab */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900">Quản lý dữ liệu & Hệ thống</h3>
                  <p className="text-xs text-slate-500">Sao lưu dữ liệu cá nhân, xóa bộ nhớ đệm và quản lý phiên đăng nhập</p>
                </div>

                <div className="space-y-4">
                  {/* Export Backup JSON */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">Sao lưu dữ liệu tập luyện (JSON)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Xuất toàn bộ lịch sử tập luyện, số đo cơ thể và nhật ký dinh dưỡng về máy tính</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất file JSON</span>
                    </button>
                  </div>

                  {/* Reset Storage */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Xóa bộ nhớ đệm ứng dụng</span>
                      </h4>
                      <p className="text-[11px] text-rose-700/80 mt-0.5">Xóa cache trình duyệt cục bộ và khôi phục trạng thái ban đầu của ứng dụng</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetStorage}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm mới Cache</span>
                    </button>
                  </div>

                  {/* App Version Info */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Phiên bản Web:</span>
                    <span className="font-black text-slate-900">FitnessLeveling v2.5.0</span>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-rose-50 hover:border-rose-200 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Footer Quick Return */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Màn hình Cài đặt độc lập. Nhấn phím <b>Esc</b> hoặc nút Quay lại để trở về ứng dụng.</span>
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#FF5722] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại ứng dụng (Esc)</span>
          </button>
        </div>
      </main>
    </div>
  );
}

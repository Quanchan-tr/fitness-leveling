'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  ArrowRight,
  Activity,
  Dumbbell,
  Utensils,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function LandingPage() {
  const { loginDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'pose' | 'avatar'>('pose');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoClick = async () => {
    setIsDemoLoading(true);
    try {
      await loginDemo();
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      {/* ── Fixed / Sticky Athletic Top Navigation ── */}
      <header className="sticky top-0 z-50 h-16 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF5722] flex items-center justify-center shadow-lg shadow-orange-950/50">
            <Flame className="w-5 h-5 fill-white text-white" strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-white block leading-none">
              FitTrack<span className="text-[#FF5722]"> AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-0.5">
              Command Center
            </span>
          </div>
        </Link>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDemoClick}
            disabled={isDemoLoading}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {isDemoLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#FF5722]" />
            )}
            <span>Trải nghiệm Demo</span>
          </button>

          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-sm font-bold transition-all shadow-md shadow-orange-950/40 active:scale-95"
          >
            <span>Tạo tài khoản</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero Section with Blurred Cinematic Athletic Background ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-8 py-16 overflow-hidden">
        {/* Background Image Layer with Blur and Moody Vignette */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/gym_hero_bg.jpg"
            alt="FitTrack Gym Background"
            fill
            priority
            className="object-cover object-center filter blur-xs scale-105"
          />
          {/* Deep dark gradient overlay with subtle orange atmospheric glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/90 to-slate-950" />
          <div className="absolute inset-0 bg-radial-at-c from-orange-900/10 via-transparent to-slate-950/90 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center pt-4 pb-12">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-orange-400 tracking-wide uppercase shadow-lg backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
            <span>Hệ Thống Quản Trị Thể Lực &amp; AI Pose Check</span>
          </div>

          {/* Impact Title */}
          <h1 className="font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] max-w-4xl mb-6">
            Đỉnh cao thể lực.{' '}
            <span className="text-[#FF5722]">Định hình phong độ.</span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mb-10 font-normal">
            Nền tảng kiểm soát thể hình toàn diện: Phân tích chỉ số khoa học Deurenberg,
            huấn luyện viên AI chỉnh tư thế theo thời gian thực và nhân vật 3D tiến hoá theo sức mạnh của bạn.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto flex items-center justify-center gap-3 h-14 sm:h-16 px-8 sm:px-11 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-base sm:text-lg tracking-wide shadow-xl shadow-orange-950/60 active:scale-[0.98] transition-all hover:shadow-orange-600/30 hover:scale-[1.02]"
            >
              <span>Bắt đầu ngay miễn phí</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={handleDemoClick}
              disabled={isDemoLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 h-14 sm:h-16 px-8 sm:px-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-2 border-slate-700 hover:border-slate-500 font-extrabold text-base sm:text-lg tracking-wide backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:scale-[1.02]"
            >
              {isDemoLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#FF5722]" />
              )}
              <span>Vào xem bản Demo trực tiếp</span>
            </button>
          </div>

          {/* Athletic Performance Numbers Strip */}
          <div className="grid grid-cols-3 gap-4 sm:gap-12 py-5 px-6 sm:px-10 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md w-full max-w-3xl">
            <div className="flex flex-col items-center">
              <span className="font-black text-2xl sm:text-3xl text-white tracking-tight tabular-nums">4.200+</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">Người tập luyện</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-800/90 px-2 sm:px-4">
              <span className="font-black text-2xl sm:text-3xl text-white tracking-tight tabular-nums">98.4%</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">Độ chính xác AI Pose</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-black text-2xl sm:text-3xl text-white tracking-tight tabular-nums">28.000+</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">Buổi tập hoàn thành</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Illustrated Visual Demo Showcase Section ── */}
      <section className="relative z-10 px-4 sm:px-8 py-20 bg-slate-900/70 border-t border-slate-800/90">
        <div className="max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#FF5722] block mb-2">
              Công nghệ tiên tiến
            </span>
            <h2 className="font-black text-3xl sm:text-4xl text-white tracking-tight mb-4">
              Minh hoạ trải nghiệm cốt lõi
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Khám phá hai tính năng độc bản mang lại hiệu quả vượt trội cho hành trình tập luyện của bạn.
            </p>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="flex flex-wrap justify-center gap-3.5 mb-10">
            <button
              onClick={() => setActiveTab('pose')}
              className={`flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all cursor-pointer ${
                activeTab === 'pose'
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-orange-950/50 scale-[1.02]'
                  : 'bg-slate-950 text-slate-300 hover:text-white border-2 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>AI Pose Check (Thị giác máy tính)</span>
            </button>
            <button
              onClick={() => setActiveTab('avatar')}
              className={`flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all cursor-pointer ${
                activeTab === 'avatar'
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-orange-950/50 scale-[1.02]'
                  : 'bg-slate-950 text-slate-300 hover:text-white border-2 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Nhân vật 3D &amp; Leveling Gamification</span>
            </button>
          </div>

          {/* Illustration Preview Display */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {activeTab === 'pose' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
                <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden bg-slate-950">
                  <Image
                    src="/images/ai_pose_demo.jpg"
                    alt="AI Pose Check Demonstration"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1 rounded-lg text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>REALTIME SKELETON TRACKING</span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold self-start">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Computer Vision Mediapipe</span>
                  </div>
                  <h3 className="font-black text-2xl text-white tracking-tight">
                    Chỉnh form chuẩn từng mili-giây
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Camera phân tích đa khớp xương: độ sâu squat, góc gập khuỷu tay push-up và độ thẳng lưng plank. Cảnh báo lỗi sai ngay lập tức giúp bạn tránh chấn thương và tối đa hóa hiệu quả phát triển cơ.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Tự động đếm rep khi hoàn thành đúng biên độ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Xử lý 100% cục bộ, bảo mật riêng tư tuyệt đối</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Chấm điểm kỹ thuật form sau mỗi hiệp tập</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
                <div className="lg:col-span-7 relative aspect-video w-full overflow-hidden bg-slate-950">
                  <Image
                    src="/images/fitness_3d_avatar.jpg"
                    alt="3D Character Avatar Leveling Demonstration"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-orange-500/40 px-3 py-1 rounded-lg text-[11px] font-bold text-orange-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>AVATAR LEVEL 17 ATHLETE</span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-950/80 border border-orange-800 text-orange-400 text-xs font-bold self-start">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Gamification Thể Lực</span>
                  </div>
                  <h3 className="font-black text-2xl text-white tracking-tight">
                    Biến mồ hôi thành điểm kinh nghiệm
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Mỗi buổi tập, mỗi lít nước uống và mỗi kỷ lục cá nhân (PR) đều biến thành XP tăng cấp cho nhân vật 3D đại diện. Mở khóa trang phục thi đấu mới và thăng hạng chỉ số Sức mạnh (STR), Bền bỉ (END) và Linh hoạt (AGI).
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs font-semibold text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5722]" />
                      <span>Xoay 360 độ tương tác nhân vật 3D mượt mà</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5722]" />
                      <span>Tùy biến trang phục, áo đấu, băng đeo trán và giày</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5722]" />
                      <span>Hệ thống chỉ số radar phản ánh đúng năng lực bản thân</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="px-4 sm:px-8 py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-2">
              Bộ công cụ toàn diện
            </span>
            <h2 className="font-black text-3xl text-white tracking-tight">
              Tất cả trong một Command Center
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-950/60 border border-orange-800/80 flex items-center justify-center text-[#FF5722] mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Chỉ số cơ thể chuẩn Deurenberg</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Tự động tính toán tỷ lệ mỡ (% Body Fat), phân loại BMI chuẩn WHO và bảng ACE mà không cần thiết bị đắt đỏ.
              </p>
              <div className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Theo dõi biểu đồ tiến độ &amp; ảnh vóc dáng</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-800/80 flex items-center justify-center text-sky-400 mb-5">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Nhật ký luyện tập chủ động</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Xây dựng lịch tập cá nhân, ghi nhận từng hiệp tạ, số reps, RPE và thời gian nghỉ giữa hiệp chính xác.
              </p>
              <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bạn toàn quyền kiểm soát kế hoạch của mình</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-5">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Quản trị dinh dưỡng &amp; Nước</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Công thức BMR Mifflin-St Jeor &amp; TDEE cá nhân hoá. Theo dõi Macro Protein/Carb/Fat và chuỗi ngày streak đủ nước.
              </p>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đồng bộ theo mục tiêu Tăng cơ / Giảm mỡ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Thông tin liên hệ (Khu vực để trống theo yêu cầu để cập nhật sau) ── */}
      <section className="px-4 sm:px-8 py-10 bg-slate-950 border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[40px]">
          {/* Khu vực để trống để sau này điền thông tin liên hệ */}
        </div>
      </section>

      {/* ── Clean Footer (Removed small 'Đăng ký' link on bottom right as requested) ── */}
      <footer className="h-14 bg-slate-950 border-t border-slate-900 px-6 sm:px-8 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>FitTrack AI v2.5 — Hệ Thống Theo Dõi Thể Hình Cá Nhân</span>
        </div>
        <div>
          <span>© 2026 FitTrack Command Center</span>
        </div>
      </footer>
    </div>
  );
}

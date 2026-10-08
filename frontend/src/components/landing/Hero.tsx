'use strict';

import React from 'react';
import Link from 'next/link';
import { SocialProof } from './SocialProof';
import { WebStudioMockup } from './WebStudioMockup';

interface HeroProps {
  onDemoClick?: () => void;
  isDemoLoading?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onDemoClick, isDemoLoading = false }) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-white pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-200">
      {/* Background Subtle Ambience with soft warm glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-50/60 to-transparent pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Web Value Proposition & High-converting CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-black text-[#FF5722] tracking-wider uppercase mb-5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
              <span>NỀN TẢNG WEB QUẢN TRỊ THỂ LỰC &amp; AI 3D LEVELING</span>
            </div>

            {/* Impact Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#0F172A] tracking-tight leading-[1.1] max-w-xl mb-5">
              Đỉnh cao thể lực,{' '}
              <span className="text-[#FF5722] relative inline-block">
                tiến hoá phong độ.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mb-8 font-normal">
              Chạy trực tiếp 100% trên trình duyệt Web: Phân tích tư thế AI qua webcam thời gian thực,
              chỉ số sinh trắc học Deurenberg chuẩn y khoa và nhân vật 3D tăng cấp theo từng hiệp tạ bạn nâng.
            </p>

            {/* Web Action CTA Group (No App Store downloads) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-sm tracking-tight shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105 active:scale-95 text-center cursor-pointer"
              >
                <span>Đăng ký ngay</span>
                <span className="text-base">→</span>
              </Link>

              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 text-center cursor-pointer shadow-md shadow-slate-900/10"
              >
                <span>Đăng nhập</span>
              </Link>

              {onDemoClick && (
                <button
                  type="button"
                  onClick={onDemoClick}
                  disabled={isDemoLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-300 cursor-pointer disabled:opacity-60"
                >
                  {isDemoLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-[#FF5722] rounded-full animate-spin" />
                  ) : (
                    <span className="text-[#FF5722]">⚡</span>
                  )}
                  <span>Dùng thử Demo</span>
                </button>
              )}
            </div>

            {/* Social Proof Strip */}
            <div className="pt-5 border-t border-slate-200 w-full max-w-lg">
              <SocialProof />
            </div>
          </div>

          {/* Right Column: Web Studio Showcase */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Glow backdrop */}
            <div className="absolute w-[420px] h-[420px] rounded-full bg-orange-100/60 blur-3xl -z-10" />

            <div className="relative w-full">
              <WebStudioMockup activeFeature="pose" />

              {/* Floating Verified Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200 shadow-xl flex items-center gap-3 transition-transform hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5722] font-black text-lg">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-black text-[#0F172A]">
                    98.4% Độ chuẩn xác
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    MediaPipe AI Pose trên trình duyệt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

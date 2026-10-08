'use strict';

import React from 'react';
import Link from 'next/link';
import { FOOTER_SECTIONS } from './landingData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-500 text-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-14">
          {/* Brand Info */}
          <div className="col-span-2 flex flex-col items-start pr-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group" aria-label="Fitness-Leveling">
              <div className="w-8 h-8 rounded-xl bg-[#FF5722] text-white flex items-center justify-center font-black text-sm">
                FL
              </div>
              <span className="font-black text-lg text-[#0F172A] tracking-tight">
                Fitness<span className="text-[#FF5722]">-Leveling</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mb-6">
              Nền tảng Web quản trị thể lực &amp; AI Pose Check thời gian thực.
              Biến từng giờ tập gym thành dữ liệu khoa học và cấp độ nhân vật 3D tiến hoá.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F172A] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hệ thống Web AI hoạt động 99.9%</span>
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_SECTIONS.map((col) => (
            <div key={col.title} className="flex flex-col space-y-3">
              <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                {col.title}
              </span>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-slate-500 hover:text-[#FF5722] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Fitness-Leveling. Bảo lưu mọi quyền.
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-700 transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-slate-700 transition-colors">
              Điều khoản dịch vụ
            </a>
            <a href="#" className="hover:text-slate-700 transition-colors">
              Bảo mật camera Web
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

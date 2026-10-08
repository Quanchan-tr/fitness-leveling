'use strict';

import React from 'react';
import { TESTIMONIALS } from './landingData';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black tracking-widest uppercase text-[#FF5722] block mb-2">
            ĐÁNH GIÁ THỰC TẾ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight mb-3">
            Cộng đồng người tập nói gì về chúng tôi?
          </h2>
          <p className="text-base text-slate-600">
            Lắng nghe chia sẻ từ những vận động viên và gymer luyện tập cùng Fitness-Leveling mỗi ngày.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-7 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div>
                {/* 5-star Rating */}
                <div className="flex items-center gap-1 text-amber-500 mb-5" aria-label="5 sao">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-[#0F172A] leading-relaxed mb-6 font-normal">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author & Verification Footer */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center font-black text-xs shrink-0">
                    {item.author
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#0F172A]">
                        {item.author}
                      </span>
                      {item.verified && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200" title="Đã xác thực tài khoản">
                          ✓ Đã dùng
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{item.role}</div>
                  </div>
                </div>

                {/* Tangible Metric Badge */}
                <div className="mt-3 text-[11px] font-bold text-[#FF5722] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                  🎯 {item.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

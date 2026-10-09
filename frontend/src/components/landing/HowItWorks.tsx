'use strict';

import React from 'react';
import { WORKFLOW_STEPS } from './landingData';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black tracking-widest uppercase text-[#FF5722] block mb-2">
            QUY TRÌNH TINH GỌN
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight mb-3">
            Bắt đầu trong 3 bước đơn giản
          </h2>
          <p className="text-base text-slate-600">
            Từ lúc mở trang web đến khi hoàn thành buổi tập đầu tiên với sự hỗ trợ của AI.
          </p>
        </div>

        {/* 3 Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.step}
              className="relative bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200 hover:border-orange-300 transition-all duration-200 flex flex-col justify-between group shadow-2xs"
            >
              <div>
                {/* Step Number Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-[#FF5722] tracking-tighter">
                    {step.step}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center font-bold text-xs group-hover:bg-[#FF5722] group-hover:text-white transition-colors">
                    →
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-bold text-[#0F172A] mb-3 leading-snug">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                  {step.description}
                </p>
              </div>

              {/* Bottom Detail */}
              <div className="pt-4 border-t border-slate-200 text-xs font-semibold text-[#0F172A]">
                ✓ {step.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

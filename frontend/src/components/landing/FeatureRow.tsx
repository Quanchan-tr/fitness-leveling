'use strict';

import React from 'react';
import { FeatureItem } from './landingData';
import { PhoneMockup } from './PhoneMockup';

interface FeatureRowProps {
  feature: FeatureItem;
  isReversed?: boolean;
}

export const FeatureRow: React.FC<FeatureRowProps> = ({ feature, isReversed = false }) => {
  return (
    <div className="py-14 md:py-20 border-b border-slate-200 last:border-b-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Visual Mockup */}
        <div
          className={`lg:col-span-5 flex justify-center items-center ${
            isReversed ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <div className="relative w-full max-w-[320px]">
            {/* Subtle soft orange backdrop */}
            <div className="absolute inset-0 bg-orange-50 rounded-3xl -rotate-1 scale-95 -z-10" />
            <PhoneMockup screenType={feature.screenType} isFloating />
          </div>
        </div>

        {/* Content Column */}
        <div
          className={`lg:col-span-7 flex flex-col items-start text-left ${
            isReversed ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          {/* Category Pill */}
          <span className="text-[11px] font-black tracking-widest text-[#FF5722] uppercase mb-3 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {feature.category}
          </span>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-tight mb-4">
            {feature.title}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-normal">
            {feature.description}
          </p>

          {/* Benefits List */}
          <div className="space-y-3 w-full">
            {feature.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-50 text-[#FF5722] flex items-center justify-center shrink-0 mt-0.5 border border-orange-200 font-black text-xs">
                  ✓
                </div>
                <span className="text-sm sm:text-base font-semibold text-[#0F172A] leading-snug">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

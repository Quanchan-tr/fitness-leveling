'use strict';

import React from 'react';
import { FEATURES } from './landingData';
import { FeatureRow } from './FeatureRow';

export const FeatureSection: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white" aria-label="Tính năng sản phẩm cốt lõi">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-black tracking-widest uppercase text-[#FF5722] block mb-2">
            CÔNG NGHỆ THỂ LỰC WEB TIÊN TIẾN
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight mb-3">
            Thiết kế để bứt phá từng giới hạn
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Sự kết hợp hoàn hảo giữa thị giác máy tính MediaPipe, đồ họa WebGL 3D và thuật toán sinh trắc học y tế.
          </p>
        </div>

        {/* Alternating Feature Rows */}
        <div className="divide-y divide-slate-200">
          {FEATURES.map((feature, idx) => (
            <FeatureRow
              key={feature.id}
              feature={feature}
              isReversed={idx % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

'use strict';

import React from 'react';
import { SOCIAL_PROOF } from './landingData';

interface SocialProofProps {
  className?: string;
}

export const SocialProof: React.FC<SocialProofProps> = ({ className = '' }) => {
  const avatarColors = [
    { bg: 'bg-[#FF5722]', text: 'FL', name: 'Fitness Leveler' },
    { bg: 'bg-slate-800', text: 'MT', name: 'Minh Tran' },
    { bg: 'bg-emerald-600', text: 'SC', name: 'Sarah Chen' },
    { bg: 'bg-amber-600', text: 'AR', name: 'Alex Rivera' },
  ];

  return (
    <div className={`inline-flex flex-wrap items-center gap-3.5 ${className}`}>
      {/* Overlapping User Avatars */}
      <div className="flex items-center -space-x-2.5 overflow-hidden py-1">
        {avatarColors.map((avatar, idx) => (
          <div
            key={idx}
            title={avatar.name}
            className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white ${avatar.bg} text-white font-bold text-[10px] tracking-wider shadow-xs select-none`}
          >
            {avatar.text}
          </div>
        ))}
      </div>

      {/* Rating & Stat Details */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          {/* Star Icons */}
          <div className="flex items-center gap-0.5 text-amber-500" aria-label="Đánh giá 4.9 sao">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-3.5 h-3.5 fill-current"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs font-black text-[#0F172A] tabular-nums">
            {SOCIAL_PROOF.rating} / 5.0
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Tin chọn bởi <span className="font-bold text-[#0F172A]">{SOCIAL_PROOF.activeUsers}</span> người tập luyện trực tuyến
        </p>
      </div>
    </div>
  );
};

'use strict';
'use client';

import React from 'react';

interface LinearProgressProps {
  value: number;
  max: number;
  height?: number;
  fillColor?: string;
  trackColor?: string;
  label?: string;
  valueLabel?: string;
  className?: string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  value,
  max,
  height = 6,
  fillColor = '#FF6B35',
  trackColor = 'rgba(0, 0, 0, 0.06)',
  label,
  valueLabel,
  className = '',
}) => {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-[11px]">
          {label && <span className="font-semibold text-[#4A4A4A]">{label}</span>}
          {valueLabel && <span className="font-bold text-[#1A1A1A]">{valueLabel}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full overflow-hidden rounded-full transition-all"
        style={{ height, backgroundColor: trackColor }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: fillColor }}
        />
      </div>
    </div>
  );
};

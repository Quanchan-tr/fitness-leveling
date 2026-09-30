'use strict';
'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`surface-card bg-white border border-slate-200 rounded-xl p-5 transition-colors select-none ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

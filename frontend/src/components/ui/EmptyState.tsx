import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    icon?: LucideIcon;
  };
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  children,
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5722] shadow-2xs">
          <Icon className="w-7 h-7" />
        </div>
      )}

      <div className="max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${action.variant === 'secondary'
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              : 'bg-[#FF5722] hover:bg-[#E64A19] text-white'
            }`}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          <span>{action.label}</span>
        </button>
      )}

      {children}
    </div>
  );
};


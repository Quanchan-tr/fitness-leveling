import React from 'react';
import { AlertCircle, WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  isNetworkError?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  onBack,
  isNetworkError = false,
  className = '',
}) => {
  const Icon = isNetworkError ? WifiOff : AlertCircle;
  const defaultTitle = isNetworkError
    ? 'Lỗi kết nối máy chủ'
    : 'Đã xảy ra sự cố';

  return (
    <div
      className={`p-8 sm:p-10 text-center bg-white rounded-2xl border border-rose-200/90 shadow-2xs flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h4 className="text-base font-extrabold text-slate-900">
          {title || defaultTitle}
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex items-center gap-2.5 pt-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        )}
      </div>
    </div>
  );
};


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogIn, Lock, X } from 'lucide-react';

export const SESSION_EXPIRED_EVENT = 'fitnessleveling:session-expired';

export function triggerSessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}

export const SessionExpiredModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleExpired = () => {
      // Don't show modal if already on auth pages
      if (pathname.startsWith('/auth')) return;
      setIsOpen(true);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, [pathname]);

  if (!isOpen) return null;

  const handleGoToLogin = () => {
    setIsOpen(false);
    const returnUrl = encodeURIComponent(pathname);
    router.push(`/auth/login?returnUrl=${returnUrl}&reason=session_expired`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <Lock className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-extrabold text-slate-900">
            Phiên đăng nhập đã hết hạn
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Phiên làm việc của bạn đã hết hạn bảo mật. Để tiếp tục đồng bộ dữ liệu với máy chủ, vui lòng đăng nhập lại. Dữ liệu đang hiển thị trên trang hiện tại vẫn được giữ nguyên.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập lại ngay</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
          >
            Đóng để lưu lại nội dung dở dang
          </button>
        </div>
      </div>
    </div>
  );
};


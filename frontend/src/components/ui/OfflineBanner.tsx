'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      // Small fast ping
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-md sticky top-0 z-50 animate-in fade-in slide-in-from-top-1"
    >
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span className="truncate">
          Bạn đang ngoại tuyến. Các tính năng phòng tập 3D, nhật ký tập và tính calo vẫn hoạt động trên bộ nhớ thiết bị.
        </span>
      </div>

      <button
        type="button"
        onClick={handleCheckConnection}
        disabled={isChecking}
        className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60"
      >
        <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
        <span>Kiểm tra lại</span>
      </button>
    </div>
  );
};


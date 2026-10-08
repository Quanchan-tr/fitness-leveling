'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * SSR-safe, resilient localStorage synchronization hook for Next.js
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  // Restore from localStorage after client hydration
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        let stored = window.localStorage.getItem(key);
        if (stored === null && key.startsWith('fitnessleveling_')) {
          const fallbackKey = key.replace('fitnessleveling_', 'fittrack_');
          stored = window.localStorage.getItem(fallbackKey);
        }
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          setValue(parsed);
        }
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Lỗi khi đọc key "${key}", dùng fallback mặc định:`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  // Sync back to localStorage when state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isHydrated) return;

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Không thể ghi vào key "${key}":`, error);
    }
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated] as const;
}

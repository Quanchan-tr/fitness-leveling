'use strict';
'use client';

import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingActiveWorkoutBar } from '@/components/workout/FloatingActiveWorkoutBar';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SessionExpiredModal } from '@/components/ui/SessionExpiredModal';
import { PageLoadingSkeleton } from './PageLoadingSkeleton';

interface ShellContextType {
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  navigatingTo: string | null;
  startNavigation: (href: string) => void;
}

const ShellContext = createContext<ShellContextType>({
  isMobileNavOpen: false,
  toggleMobileNav: () => { },
  closeMobileNav: () => { },
  navigatingTo: null,
  startNavigation: () => { },
});

export const useShell = () => useContext(ShellContext);

/** Routes that render their own full-screen layout without the app shell */
const SHELL_EXCLUDED_PREFIXES = ['/auth', '/onboarding', '/landing', '/settings'];

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  const startNavigation = useCallback((href: string) => {
    const cleanTarget = href.split('?')[0].split('#')[0];
    const cleanCurrent = pathname.split('?')[0].split('#')[0];
    if (cleanTarget && cleanTarget !== cleanCurrent) {
      setNavigatingTo(cleanTarget);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [pathname]);

  // Once pathname updates to target or any route, clear navigating state
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  // Safety fallback timeout: prevent stuck loading if navigation aborts
  useEffect(() => {
    if (!navigatingTo) return;
    const timer = setTimeout(() => {
      setNavigatingTo(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [navigatingTo]);

  // Global document click listener: immediately switch to loading on any internal link click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
      }

      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/#') &&
        !anchor.getAttribute('target') &&
        !anchor.getAttribute('download')
      ) {
        const cleanTarget = href.split('?')[0].split('#')[0];
        const cleanCurrent = pathname.split('?')[0].split('#')[0];
        if (cleanTarget && cleanTarget !== cleanCurrent) {
          startNavigation(cleanTarget);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [pathname, startNavigation]);

  // Root '/' is the public Landing Page -> no sidebar shell
  const isLandingPage = pathname === '/';

  const isShellExcluded =
    isLandingPage ||
    SHELL_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const isNavigating = Boolean(navigatingTo && navigatingTo !== pathname);

  // Landing, auth & onboarding pages render in full width without the sidebar shell
  if (isShellExcluded) {
    return (
      <ShellContext.Provider
        value={{
          isMobileNavOpen,
          toggleMobileNav,
          closeMobileNav,
          navigatingTo,
          startNavigation,
        }}
      >
        <div className="min-h-screen w-full bg-[var(--color-bg)]">
          <OfflineBanner />
          <SessionExpiredModal />
          {children}
          <FloatingActiveWorkoutBar />
        </div>
      </ShellContext.Provider>
    );
  }

  return (
    <ShellContext.Provider
      value={{
        isMobileNavOpen,
        toggleMobileNav,
        closeMobileNav,
        navigatingTo,
        startNavigation,
      }}
    >
      <div className="flex min-h-screen bg-[var(--color-bg)]">
        <Sidebar
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={closeMobileNav}
        />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          <TopBar onToggleMobileMenu={toggleMobileNav} />
          <OfflineBanner />
          <SessionExpiredModal />
          <div className="flex-1 flex flex-col min-w-0">
            {isNavigating ? (
              <PageLoadingSkeleton />
            ) : (
              children
            )}
          </div>
        </div>
        <FloatingActiveWorkoutBar />
      </div>
    </ShellContext.Provider>
  );
};

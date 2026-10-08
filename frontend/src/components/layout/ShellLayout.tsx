'use strict';
'use client';

import React, { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingActiveWorkoutBar } from '@/components/workout/FloatingActiveWorkoutBar';

interface ShellContextType {
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

const ShellContext = createContext<ShellContextType>({
  isMobileNavOpen: false,
  toggleMobileNav: () => {},
  closeMobileNav: () => {},
});

export const useShell = () => useContext(ShellContext);

/** Routes that render their own full-screen layout without the app shell */
const SHELL_EXCLUDED_PREFIXES = ['/auth', '/onboarding', '/landing'];

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  // Root '/' is the public Landing Page -> no sidebar shell
  const isLandingPage = pathname === '/';

  const isShellExcluded =
    isLandingPage ||
    SHELL_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Landing, auth & onboarding pages render in full width without the sidebar shell
  if (isShellExcluded) {
    return (
      <ShellContext.Provider value={{ isMobileNavOpen, toggleMobileNav, closeMobileNav }}>
        <div className="min-h-screen w-full bg-[var(--color-bg)]">
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
      }}
    >
      <div className="flex min-h-screen bg-[var(--color-bg)]">
        <Sidebar
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={closeMobileNav}
        />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          {children}
        </div>
        <FloatingActiveWorkoutBar />
      </div>
    </ShellContext.Provider>
  );
};

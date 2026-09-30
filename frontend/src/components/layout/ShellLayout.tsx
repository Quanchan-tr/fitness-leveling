'use strict';
'use client';

import React, { useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';

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

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setIsMobileNavOpen(false);

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
      </div>
    </ShellContext.Provider>
  );
};

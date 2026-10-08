'use strict';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from './landingData';

interface NavbarProps {
  onDemoClick?: () => void;
  isDemoLoading?: boolean;
}

interface PillMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onDemoClick,
  isDemoLoading = false,
}) => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sliding pill position inside the horizontal nav dock
  const [pillStyle, setPillStyle] = useState<PillMetrics>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const isProgrammaticScroll = useRef(false);
  const programmaticTargetId = useRef<string | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollTicking = useRef(false);

  // Update pill coordinates relative to the nav container
  const updatePillPosition = useCallback((targetId: string) => {
    const targetEl = itemRefs.current[targetId];
    if (!targetEl) return;

    setPillStyle({
      left: targetEl.offsetLeft,
      top: targetEl.offsetTop,
      width: targetEl.offsetWidth,
      height: targetEl.offsetHeight,
      opacity: 1,
    });
  }, []);

  // Update pill when activeSection changes or after layout render
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePillPosition(activeSection);
    }, 40);
    return () => clearTimeout(timer);
  }, [activeSection, updatePillPosition]);

  // Robust scroll-spy and scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollY > 20);

      // If user clicked a tab, let smooth scroll finish without overriding active state
      if (isProgrammaticScroll.current) return;

      if (!scrollTicking.current) {
        window.requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = window.innerHeight;

          // If scrolled to the bottom of the page, activate the last tab (Cộng đồng)
          if (scrollY + clientHeight >= scrollHeight - 60) {
            const lastId = NAV_LINKS[NAV_LINKS.length - 1].id;
            setActiveSection(lastId);
            scrollTicking.current = false;
            return;
          }

          // Check sections in reverse order (bottom to top)
          // Threshold is 140px below the top of the viewport
          const checkPoint = scrollY + 140;
          let currentId = NAV_LINKS[0].id;

          for (let i = NAV_LINKS.length - 1; i >= 0; i--) {
            const link = NAV_LINKS[i];
            const el = document.getElementById(link.id);
            if (el) {
              const top = el.getBoundingClientRect().top + scrollY;
              if (checkPoint >= top) {
                currentId = link.id;
                break;
              }
            }
          }

          setActiveSection(currentId);
          scrollTicking.current = false;
        });
        scrollTicking.current = true;
      }
    };

    // User manual wheel/touch cancels programmatic scroll lock immediately
    const handleUserInterrupt = () => {
      isProgrammaticScroll.current = false;
      programmaticTargetId.current = null;
    };

    const handleResize = () => {
      updatePillPosition(activeSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleUserInterrupt, { passive: true });
    window.addEventListener('touchmove', handleUserInterrupt, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleUserInterrupt);
      window.removeEventListener('touchmove', handleUserInterrupt);
      window.removeEventListener('resize', handleResize);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [activeSection, updatePillPosition]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Smooth click navigation with instant pill glide
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    id: string
  ) => {
    e.preventDefault();

    // 1. Immediately update active section so pill glides without lag
    setActiveSection(id);
    updatePillPosition(id);

    // 2. Lock programmatic scrolling
    isProgrammaticScroll.current = true;
    programmaticTargetId.current = id;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    // 3. Smooth scroll with offset for the sticky navbar height
    if (id === 'hero') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      const target = document.querySelector(href);
      if (target) {
        const navOffset = 80;
        const elementPosition =
          target.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: Math.max(0, elementPosition - navOffset),
          behavior: 'smooth',
        });
      }
    }

    // 4. Release programmatic lock after smooth scroll settles
    scrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
      programmaticTargetId.current = null;
    }, 1100);
  };

  return (
    <>
      {/* Sticky Header with Smooth Frosted Glass Background */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 py-3 px-4 sm:px-6 lg:px-8 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80'
            : 'bg-white/95'
        }`}
      >
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          {/* Logo Brand: Fitness-Leveling */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, '#hero', 'hero')}
            className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.03] active:scale-95 shrink-0"
            aria-label="Fitness-Leveling Trang chủ"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5722] to-[#E64A19] text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/25 transition-transform duration-200 group-hover:rotate-6">
              <svg
                width="20"
                height="20"
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-4.5-4.5 1.41-1.41L13 13.67l6.09-6.09 1.41 1.41L13 16.5z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xl tracking-tight text-[#0F172A] leading-none">
                Fitness<span className="text-[#FF5722]">-Leveling</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">
                Web Command Center
              </span>
            </div>
          </Link>

          {/* Desktop Floating Horizontal Pill Navigation Dock with GLIDING Orange Indicator */}
          <nav
            ref={navRef}
            className="relative hidden lg:flex items-center p-1.5 rounded-full bg-slate-100/95 border border-slate-200/90 shadow-inner"
            aria-label="Điều hướng chính"
          >
            {/* Smooth Gliding Orange Pill Indicator */}
            <div
              className="absolute top-0 left-0 rounded-full bg-[#FF5722] shadow-md shadow-orange-500/30 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0"
              style={{
                transform: `translate3d(${pillStyle.left}px, ${pillStyle.top}px, 0)`,
                width: `${pillStyle.width}px`,
                height: `${pillStyle.height}px`,
                opacity: pillStyle.opacity,
              }}
            />

            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <a
                  key={link.id}
                  ref={(el) => {
                    itemRefs.current[link.id] = el;
                  }}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.id)}
                  className={`relative z-10 px-4 py-2 rounded-full text-xs font-black tracking-tight select-none cursor-pointer transition-colors duration-200 text-center whitespace-nowrap inline-flex items-center justify-center ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {onDemoClick && (
              <button
                type="button"
                onClick={onDemoClick}
                disabled={isDemoLoading}
                className="hidden xl:inline-flex px-3.5 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-[#FF5722] hover:bg-orange-50 transition-all duration-200 cursor-pointer items-center gap-1.5"
              >
                {isDemoLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-orange-500/40 border-t-orange-600 rounded-full animate-spin" />
                ) : (
                  <span className="text-[#FF5722]">⚡</span>
                )}
                <span>Dùng thử Demo</span>
              </button>
            )}

            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
            >
              Đăng nhập
            </Link>

            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-black tracking-tight shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Đăng ký ngay
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-[80%] max-w-[320px] bg-white shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <span className="font-black text-lg text-[#0F172A]">
              Fitness<span className="text-[#FF5722]">-Leveling</span>
            </span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  closeMobileMenu();
                  handleNavClick(e, link.href, link.id);
                }}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#FF5722] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-orange-50 hover:text-[#FF5722]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t border-slate-200">
          {onDemoClick && (
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                onDemoClick();
              }}
              disabled={isDemoLoading}
              className="w-full py-2.5 rounded-full border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {isDemoLoading ? 'Đang mở demo…' : '⚡ Dùng thử Web Demo'}
            </button>
          )}

          <Link
            href="/auth/login"
            onClick={closeMobileMenu}
            className="w-full py-2.5 rounded-full border border-slate-300 text-xs font-bold text-center text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Đăng nhập
          </Link>

          <Link
            href="/auth/register"
            onClick={closeMobileMenu}
            className="w-full py-2.5 rounded-full bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-black text-center shadow-md transition-colors"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </>
  );
};

'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { FeatureSection } from './FeatureSection';
import { ProductShowcase } from './ProductShowcase';
import { HowItWorks } from './HowItWorks';
import { Testimonials } from './Testimonials';
import { Footer } from './Footer';

export function LandingPage() {
  const { loginDemo } = useAuth();
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoClick = async () => {
    setIsDemoLoading(true);
    try {
      await loginDemo();
      router.push('/dashboard');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-orange-100 selection:text-[#FF5722] antialiased">
      {/* 01 — Top Sticky / Floating Horizontal Island Navbar */}
      <Navbar onDemoClick={handleDemoClick} isDemoLoading={isDemoLoading} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* 02 — Hero Section with Web Studio Mockup & Fast Actions */}
        <Hero onDemoClick={handleDemoClick} isDemoLoading={isDemoLoading} />

        {/* 03 — Alternating Core Web Features */}
        <FeatureSection />

        {/* 05 — Interactive App Experience & 3D WebGL Showcase */}
        <ProductShowcase />

        {/* 06 — 3-Step Simple Web Workflow */}
        <HowItWorks />

        {/* 07 — Community Testimonials */}
        <Testimonials />
      </main>

      {/* 08 — Clean Low-Contrast Web Footer */}
      <Footer />
    </div>
  );
}

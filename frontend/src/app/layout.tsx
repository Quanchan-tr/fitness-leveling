import type { Metadata } from 'next';
import './globals.css';
import { ShellLayout } from '@/components/layout/ShellLayout';

export const metadata: Metadata = {
  title: 'FitTrack AI — Fitness Command Center & 3D Avatar',
  description:
    'Comprehensive fitness platform with 3D athletic character leveling, workout tracking, nutrition logging, body metrics, AI recommendations, and AI Pose Check.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-orange-500/20 selection:text-orange-900">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}

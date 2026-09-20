import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'FitTrack AI — 3D Fitness Tracking & AI Coach',
  description:
    'Comprehensive fitness platform with 3D home-gym dashboard, workout tracking, nutrition logging, body metrics, AI recommendations, and AI Pose Check.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7F3EA] text-[#1F2328] antialiased flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}

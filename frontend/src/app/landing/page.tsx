'use strict';

import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'FitTrack — Web Command Center & 3D Avatar Leveling',
  description:
    'Nền tảng Web quản trị thể lực thế hệ mới: AI Pose Check qua webcam thời gian thực, tính toán chỉ số Deurenberg y khoa và nhân vật 3D tiến hoá theo mồ hôi của bạn.',
  openGraph: {
    title: 'FitTrack — Nền tảng Web Thể Lực & 3D Leveling',
    description:
      'Chỉnh form tập chuẩn xác từng rep với AI Pose Camera trên trình duyệt và nhân vật 3D tiến hoá.',
    url: 'https://myfittrack.io.vn',
    siteName: 'FitTrack',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function LandingRoutePage() {
  return <LandingPage />;
}

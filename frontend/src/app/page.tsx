'use strict';

import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Fitness-Leveling — Web Command Center & 3D Avatar Leveling',
  description:
    'Nền tảng Web quản trị thể lực thế hệ mới: AI Pose Check qua webcam thời gian thực, tính toán chỉ số Deurenberg y khoa và nhân vật 3D tiến hoá theo mồ hôi của bạn.',
};

export default function RootPage() {
  return <LandingPage />;
}

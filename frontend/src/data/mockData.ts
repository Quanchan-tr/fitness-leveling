import { DashboardData } from '@/types/dashboard.types';

export const mockDashboardData: DashboardData = {
  user: {
    name: "Quan",
    level: 12,
    exp: { current: 640, max: 1000 },
    stats: { STR: 24, END: 18, AGI: 15 },
  },
  nutrition: {
    calories: { current: 1800, target: 2400 },
    macros: {
      protein: { current: 90, target: 150 },
      carbs: { current: 180, target: 250 },
      fat: { current: 45, target: 70 },
    },
  },
  hydration: {
    water: { current: 1.8, target: 2 },
    steps: 5421,
  },
  weightSleep: {
    weightHistory: [
      { date: "2026-09-21", weightKg: 68.4 },
      { date: "2026-09-22", weightKg: 68.2 },
      { date: "2026-09-23", weightKg: 68.3 },
      { date: "2026-09-24", weightKg: 68.0 },
      { date: "2026-09-25", weightKg: 67.9 },
      { date: "2026-09-26", weightKg: 67.7 },
      { date: "2026-09-27", weightKg: 67.6 },
    ],
    sleepLastNight: { hours: 7, minutes: 30 },
  },
  workout: {
    lastExercise: "Chest & Triceps",
    muscleGroupIcon: "chest",
    statGains: [
      { stat: "STR", value: 2 },
      { stat: "END", value: 1 },
    ],
    completedAt: "2026-09-27T07:15:00Z",
  },
};

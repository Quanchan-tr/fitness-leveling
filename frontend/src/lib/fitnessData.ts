export interface FitnessUser {
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  str: number;
  end: number;
  mob: number;
  avatarUrl?: string;
  goal: string;
}

export interface BodyMetricsData {
  weight: number;
  bodyFat: number;
  muscle: number;
  height: number;
  bmi: number;
}

export interface TodayStats {
  calories: number;
  calorieGoal: number;
  workoutMinutes: number;
  steps: number;
  water: number;
  waterGoal: number;
  streak: number;
}

export interface MetricHistoryItem {
  date: string;
  weight: number;
  bodyFat: number;
  muscle: number;
}

export interface ProgressPhotoItem {
  id: string;
  date: string;
  label: string;
  weight: number;
  bodyFat: number;
  url?: string;
}

export interface FitnessDataState {
  user: FitnessUser;
  body: BodyMetricsData;
  today: TodayStats;
  recentMetrics: MetricHistoryItem[];
  progressPhotos: ProgressPhotoItem[];
}

export const initialFitnessData: FitnessDataState = {
  user: {
    name: "Quan",
    level: 17,
    xp: 3240,
    nextLevelXp: 4000,
    str: 68,
    end: 74,
    mob: 58,
    goal: "gain_muscle",
  },
  body: {
    weight: 68.4,
    bodyFat: 15.2,
    muscle: 54.2,
    height: 175,
    bmi: 22.3,
  },
  today: {
    calories: 1820,
    calorieGoal: 2400,
    workoutMinutes: 42,
    steps: 8421,
    water: 1.8,
    waterGoal: 2.5,
    streak: 12,
  },
  recentMetrics: [
    { date: "2026-09-01", weight: 70.2, bodyFat: 16.5, muscle: 53.2 },
    { date: "2026-09-07", weight: 69.5, bodyFat: 16.0, muscle: 53.6 },
    { date: "2026-09-14", weight: 68.9, bodyFat: 15.5, muscle: 54.0 },
    { date: "2026-09-20", weight: 68.4, bodyFat: 15.2, muscle: 54.2 },
  ],
  progressPhotos: [
    {
      id: "photo-1",
      date: "2026-08-01",
      label: "Day 1 Baseline",
      weight: 72.5,
      bodyFat: 18.0,
    },
    {
      id: "photo-2",
      date: "2026-08-20",
      label: "Week 3 Lean Cut",
      weight: 70.8,
      bodyFat: 16.8,
    },
    {
      id: "photo-3",
      date: "2026-09-10",
      label: "Week 6 Definition",
      weight: 69.1,
      bodyFat: 15.6,
    },
    {
      id: "photo-4",
      date: "2026-09-20",
      label: "Current Shape",
      weight: 68.4,
      bodyFat: 15.2,
    },
  ],
};

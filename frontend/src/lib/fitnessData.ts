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
  age?: number;
  gender?: 'male' | 'female';
}

export interface BodyMetricsData {
  weight: number;
  bodyFat: number;
  muscle?: number;
  height: number;
  bmi: number;
  age?: number;
  gender?: 'male' | 'female';
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
  muscle?: number;
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
    level: 50,
    xp: 8800,
    nextLevelXp: 10000,
    str: 95,
    end: 92,
    mob: 88,
    goal: "gain_muscle",
    age: 22,
    gender: "male",
  },
  body: {
    weight: 68.4,
    bodyFat: 15.2,
    muscle: 54.2,
    height: 175,
    bmi: 22.3,
    age: 22,
    gender: "male",
  },
  today: {
    calories: 0,
    calorieGoal: 2400,
    workoutMinutes: 0,
    steps: 0,
    water: 0,
    waterGoal: 2.0,
    streak: 0,
  },
  recentMetrics: [],
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

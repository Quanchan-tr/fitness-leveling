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
    name: '',
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    str: 0,
    end: 0,
    mob: 0,
    goal: 'maintain',
  },
  body: {
    weight: 0,
    bodyFat: 0,
    muscle: 0,
    height: 0,
    bmi: 0,
  },
  today: {
    calories: 0,
    calorieGoal: 2000,
    workoutMinutes: 0,
    steps: 0,
    water: 0,
    waterGoal: 2.0,
    streak: 0,
  },
  recentMetrics: [],
  progressPhotos: [],
};

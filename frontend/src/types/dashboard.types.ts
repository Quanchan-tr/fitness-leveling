// types/dashboard.types.ts

export interface UserProfile {
  name: string;
  level: number;
  exp: { current: number; max: number };
  stats: { STR: number; END: number; AGI: number };
}

export interface NutritionData {
  calories: { current: number; target: number };
  macros: {
    protein: { current: number; target: number }; // gram
    carbs: { current: number; target: number };
    fat: { current: number; target: number };
  };
}

export interface HydrationData {
  water: { current: number; target: number }; // lít, vd 1.8 / 2
  steps: number;
}

export interface WeightSleepData {
  weightHistory: { date: string; weightKg: number }[]; // 7 điểm, ISO date
  sleepLastNight: { hours: number; minutes: number };
}

export interface WorkoutData {
  lastExercise: string;      // "Chest & Triceps"
  muscleGroupIcon: string;   // key icon, vd "chest"
  statGains: { stat: 'STR' | 'END' | 'AGI'; value: number }[];
  completedAt: string;       // ISO datetime
}

export interface DashboardData {
  user: UserProfile;
  nutrition: NutritionData;
  hydration: HydrationData;
  weightSleep: WeightSleepData;
  workout: WorkoutData;
}

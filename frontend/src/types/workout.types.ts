export type MuscleTag = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';

export type CategoryTag = 'Gym' | 'Calisthenics' | 'Cardio' | 'Core';

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'rest';

export interface SetEntry {
  id: string;
  setNumber: number;
  targetReps: number;
  targetWeightKg: number;
  actualReps: number | null;
  actualWeightKg: number | null;
  rpe: number | null; // 1 - 10
  isCompleted: boolean;
  completedAt?: string;
}

export interface ExerciseBlockData {
  id: string;
  name: string;
  nameVi?: string;
  muscleGroup: MuscleTag;
  category: CategoryTag;
  thumbnailUrl?: string;
  notes?: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  day: WeekDay;
  dayVi: string;
  date: string; // e.g. '27/09/2026'
  title: string;
  status: SessionStatus;
  durationMinutes?: number;
  targetMuscleSummary?: string;
  exercises: ExerciseBlockData[];
}

export interface Exercise {
  id: string;
  name: string;
  nameVi?: string;
  category?: string;
  body_part?: string;
  target_muscle?: string;
  secondary_muscles?: string[] | null;
  equipment?: string;
  gif_url?: string;
  thumbnail_url?: string;
  instructions?: Record<string, any> | string[] | string | null;
  has_ai_check?: boolean;
  has_pose_check?: boolean;
  pose_rules_key?: string | null;
  description?: string;
  muscle_group?: string;
}

export interface PaginatedExercisesResponse {
  data: Exercise[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ExerciseDbItem {
  id: string;
  name: string;
  nameVi?: string;
  muscleGroup?: MuscleTag | string;
  category?: CategoryTag | string;
  equipment?: string;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeightKg?: number;
  thumbnailUrl?: string;
  gif_url?: string;
  description?: string;
  has_ai_check?: boolean;
  target_muscle?: string;
  body_part?: string;
}

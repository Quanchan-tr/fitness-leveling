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

export interface ExerciseDbItem {
  id: string;
  name: string;
  nameVi: string;
  muscleGroup: MuscleTag;
  category: CategoryTag;
  equipment?: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg?: number;
  thumbnailUrl?: string;
  description?: string;
}

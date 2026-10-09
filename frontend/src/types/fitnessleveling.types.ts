export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'bodyweight'
  | 'cable'
  | 'cardio';

export type ExerciseType =
  | 'weight_reps'
  | 'bodyweight_reps'
  | 'duration'
  | 'distance_duration';

export type WeekDayVi =
  | 'Thứ 2'
  | 'Thứ 3'
  | 'Thứ 4'
  | 'Thứ 5'
  | 'Thứ 6'
  | 'Thứ 7'
  | 'Chủ nhật';

export type ScheduleStatus =
  | 'completed'
  | 'in_progress'
  | 'rest'
  | 'planned';

export interface Exercise {
  id: string;
  name: string;
  nameVi?: string;
  targetMuscles: string[]; // e.g. ['chest', 'triceps']
  equipment: EquipmentType;
  type: ExerciseType;
  gifPlaceholderUrl?: string;
  description?: string;
}

export interface ExerciseSet {
  setNumber: number;
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  distanceKm?: number;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface RoutineExerciseItem {
  exercise: Exercise;
  sets: ExerciseSet[];
  restTimerSeconds?: number;
  pinnedNote?: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  folderId?: string;
  notes?: string;
  restTimerSeconds: number; // default rest timer
  exercises: RoutineExerciseItem[];
  createdBy: {
    userId: string;
    username: string;
    avatarUrl: string;
  };
}

export interface RoutineFolder {
  id: string;
  name: string;
  isExpanded?: boolean;
}

export interface DaySchedule {
  dayOfWeek: WeekDayVi;
  dateStr: string;
  assignedRoutine?: RoutineItem;
  assignedRoutines?: RoutineItem[];
  status: ScheduleStatus;
}

export interface ActiveWorkoutSession {
  routineId?: string;
  routineTitle: string;
  startTime: number; // timestamp
  elapsedSeconds: number;
  currentExerciseIndex: number;
  exercises: RoutineExerciseItem[];
  isPaused: boolean;
  restTimer: {
    isActive: boolean;
    remainingSeconds: number;
    targetSeconds: number;
    isPaused: boolean;
    exerciseIndex?: number;
    setIndex?: number;
  } | null;
}

export interface WorkoutHistoryRecord {
  id: string;
  routineId?: string;
  routineTitle: string;
  completedAt: string; // ISO string
  durationSeconds: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  exercisesSummary: string[];
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    badge?: string;
  };
  createdAt: string;
  images?: string[];
  videoUrl?: string;
  attachedRoutine?: RoutineItem;
  metrics?: {
    durationMinutes?: number;
    volumeKg?: number;
    distanceKm?: number;
    personalRecords?: string[];
  };
  likesCount: number;
  isLiked?: boolean;
  comments: CommunityComment[];
  tags?: string[];
  hasPoseCheck?: boolean;
}

export interface SuggestedAthlete {
  id: string;
  name: string;
  avatar: string;
  level: number;
  badge: string;
  followersCount: number;
  isFollowing: boolean;
}

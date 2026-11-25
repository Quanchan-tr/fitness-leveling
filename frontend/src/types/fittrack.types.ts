// Moved to packages/shared so web and mobile share one definition.
// `export type` is erased at compile time, so the dev container (which only mounts ./frontend) is unaffected.
export type {
  EquipmentType,
  ExerciseType,
  WeekDayVi,
  ScheduleStatus,
  Exercise,
  ExerciseSet,
  RoutineExerciseItem,
  RoutineItem,
  RoutineFolder,
  DaySchedule,
  ActiveWorkoutSession,
  WorkoutHistoryRecord,
  CommunityComment,
  CommunityPost,
  SuggestedAthlete,
} from '../../../packages/shared/src/types';

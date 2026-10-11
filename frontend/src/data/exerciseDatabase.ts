// Re-export types and API helpers
// Mock data has been migrated to backend PostgreSQL with exercises-dataset.
export type { Exercise, ExerciseDbItem, WorkoutSession } from '@/types/workout.types';
export { fetchExercises } from '@/lib/api';

/**
 * @deprecated Use fetchExercises() from '@/lib/api' to retrieve exercises from the backend.
 */
export const exerciseDatabase = [];

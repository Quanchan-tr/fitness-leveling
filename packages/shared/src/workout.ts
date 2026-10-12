// Pure workout logic shared by web and mobile. Mirrors the rules in
// frontend/src/contexts/FitnessContext.tsx and components/workout/RoutineEditor.tsx.
import type {
  ApiExercise,
  EquipmentType,
  Exercise,
  ExerciseSet,
  ExerciseType,
  RoutineExerciseItem,
  WorkoutHistoryRecord,
} from './types';

const EQUIPMENT: EquipmentType[] = ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'cardio'];

export function apiExerciseToExercise(api: ApiExercise): Exercise {
  const equipment = (api.equipment || '').toLowerCase() as EquipmentType;
  const isBodyweight = equipment === 'bodyweight' || !EQUIPMENT.includes(equipment);
  return {
    id: String(api.id),
    name: api.name,
    nameVi: api.nameVi,
    targetMuscles: [api.target_muscle || api.body_part || api.category || 'other'],
    equipment: isBodyweight ? 'bodyweight' : equipment,
    type: isBodyweight ? 'bodyweight_reps' : 'weight_reps',
    gifPlaceholderUrl: api.gif_url || api.thumbnail_url,
    description: typeof api.instructions === 'string' ? api.instructions : api.description,
  };
}

function blankSet(setNumber: number, type: ExerciseType): ExerciseSet {
  return {
    setNumber,
    weightKg: type === 'weight_reps' ? 20 : undefined,
    reps: type === 'weight_reps' || type === 'bodyweight_reps' ? 10 : undefined,
    durationSeconds: type === 'duration' ? 45 : type === 'distance_duration' ? 1800 : undefined,
    distanceKm: type === 'distance_duration' ? 5 : undefined,
    isCompleted: false,
  };
}

export const defaultSets = (type: ExerciseType): ExerciseSet[] => [1, 2, 3].map((n) => blankSet(n, type));

/** New set copies the previous one so the user only tweaks what changed. */
export function addSet(sets: ExerciseSet[], type: ExerciseType): ExerciseSet[] {
  const last = sets[sets.length - 1];
  const next = last ? { ...last, isCompleted: false, completedAt: undefined } : blankSet(1, type);
  return [...sets, { ...next, setNumber: sets.length + 1 }];
}

/** Keeps at least one set and renumbers. */
export function removeSet(sets: ExerciseSet[], index: number): ExerciseSet[] {
  if (sets.length <= 1) return sets;
  return sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }));
}

/** Fresh copy of a routine's exercises with every set un-completed. */
export const resetExercises = (items: RoutineExerciseItem[]): RoutineExerciseItem[] =>
  items.map((item) => ({
    ...item,
    sets: item.sets.map((s, i) => ({ ...s, setNumber: i + 1, isCompleted: false, completedAt: undefined })),
  }));

export function updateSet(
  items: RoutineExerciseItem[],
  exerciseIndex: number,
  setIndex: number,
  patch: Partial<ExerciseSet>
): RoutineExerciseItem[] {
  return items.map((item, ei) =>
    ei !== exerciseIndex
      ? item
      : { ...item, sets: item.sets.map((s, si) => (si === setIndex ? { ...s, ...patch } : s)) }
  );
}

export function summarizeWorkout(
  items: RoutineExerciseItem[]
): Pick<WorkoutHistoryRecord, 'totalVolumeKg' | 'totalSets' | 'totalReps' | 'exercisesSummary'> {
  let totalVolumeKg = 0;
  let totalSets = 0;
  let totalReps = 0;
  for (const item of items) {
    for (const s of item.sets) {
      if (!s.isCompleted) continue;
      totalSets++;
      totalReps += s.reps ?? 0;
      totalVolumeKg += (s.weightKg ?? 0) * (s.reps ?? 0);
    }
  }
  return { totalVolumeKg, totalSets, totalReps, exercisesSummary: items.map((i) => i.exercise.name) };
}

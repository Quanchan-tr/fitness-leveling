import { RoutineExerciseItem, Exercise } from '@/types/fittrack.types';

export const MUSCLE_LABELS_VI: Record<string, string> = {
  chest: 'Cơ ngực',
  back: 'Lưng xô',
  lats: 'Xô lưng',
  traps: 'Cầu vai',
  shoulders: 'Cơ vai',
  biceps: 'Tay trước',
  triceps: 'Tay sau',
  forearms: 'Cẳng tay',
  abs: 'Cơ bụng',
  obliques: 'Liên sườn',
  quads: 'Đùi trước',
  hamstrings: 'Đùi sau',
  glutes: 'Cơ mông',
  calves: 'Bắp chân',
};

/**
 * Normalizes a target muscle string to standard canonical keys
 */
export function normalizeMuscleKey(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower.includes('chest') || lower.includes('ngực')) return 'chest';
  if (lower.includes('lat') || lower.includes('xô')) return 'lats';
  if (lower.includes('back') || lower.includes('lưng')) return 'back';
  if (lower.includes('trap') || lower.includes('cầu vai')) return 'traps';
  if (lower.includes('shoulder') || lower.includes('vai')) return 'shoulders';
  if (lower.includes('bicep') || lower.includes('tay trước')) return 'biceps';
  if (lower.includes('tricep') || lower.includes('tay sau')) return 'triceps';
  if (lower.includes('quad') || lower.includes('đùi trước')) return 'quads';
  if (lower.includes('hamstring') || lower.includes('đùi sau')) return 'hamstrings';
  if (lower.includes('glute') || lower.includes('mông')) return 'glutes';
  if (lower.includes('calf') || lower.includes('calves') || lower.includes('bắp chuối') || lower.includes('bắp chân')) return 'calves';
  if (lower.includes('core') || lower.includes('ab') || lower.includes('bụng')) return 'abs';
  return lower;
}

/**
 * Calculates total workload sets per muscle group across a routine's exercises
 */
export function calculateMuscleWorkload(
  exercises: { exercise: Exercise; sets: { isCompleted?: boolean }[] }[]
): Record<string, number> {
  const result: Record<string, number> = {};

  exercises.forEach((item) => {
    const setCount = item.sets.length;
    if (!item.exercise || setCount === 0) return;

    const targets = item.exercise.targetMuscles || [];
    targets.forEach((rawMuscle) => {
      const canonical = normalizeMuscleKey(rawMuscle);
      result[canonical] = (result[canonical] || 0) + setCount;
    });
  });

  return result;
}

export interface HeatmapColor {
  fill: string;
  opacity: number;
  intensity: 'none' | 'low' | 'medium' | 'high' | 'intense';
}

/**
 * Maps a muscle's set count to visual heatmap color and opacity
 */
export function getMuscleHeatmapColor(setCount: number): HeatmapColor {
  if (!setCount || setCount <= 0) {
    return { fill: '#CBD5E1', opacity: 0.35, intensity: 'none' };
  }
  if (setCount <= 2) {
    return { fill: '#FDBA74', opacity: 0.75, intensity: 'low' }; // light orange
  }
  if (setCount <= 5) {
    return { fill: '#FB923C', opacity: 0.88, intensity: 'medium' }; // warm orange
  }
  if (setCount <= 8) {
    return { fill: '#EA580C', opacity: 0.95, intensity: 'high' }; // deep orange
  }
  return { fill: '#C2410C', opacity: 1, intensity: 'intense' }; // intense flame
}

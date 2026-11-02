import { RoutineItem, RoutineFolder, DaySchedule, Exercise } from '@/types/fitnessleveling.types';
import exerciseDataset from './exerciseDataset.json';

const dataset = exerciseDataset as any[];

function getDatasetExercise(id: string): Exercise {
  const found = dataset.find((item) => item.id === id);
  if (!found) {
    return {
      id,
      name: 'Custom Exercise',
      targetMuscles: ['chest'],
      equipment: 'bodyweight',
      type: 'weight_reps',
    };
  }
  return {
    id: found.id,
    name: found.name,
    targetMuscles: Array.isArray(found.targetMuscles) && found.targetMuscles.length > 0
      ? found.targetMuscles
      : [found.target_muscle || found.body_part || found.category || 'chest'],
    equipment: (found.equipment || 'bodyweight').toLowerCase(),
    type: found.type || (found.category === 'cardio' ? 'duration' : 'weight_reps'),
    gifPlaceholderUrl: found.gif_url || found.thumbnail_url,
    gif_url: found.gif_url,
    thumbnail_url: found.thumbnail_url,
    description: found.description || found.instructions || found.name,
    has_ai_check: Boolean(found.has_ai_check),
    body_part: found.body_part,
    category: found.category,
    target_muscle: found.target_muscle,
  };
}

export const starterFolders: RoutineFolder[] = [
  {
    id: 'folder-starter-foundation',
    name: 'Lộ trình Khởi đầu Chuẩn',
    isExpanded: true,
  },
];

export const starterRoutines: RoutineItem[] = [
  {
    id: 'routine-starter-fullbody',
    title: 'Full Body Kích Hoạt Toàn Thân',
    folderId: 'folder-starter-foundation',
    notes: 'Lịch tập toàn thân căn bản kết hợp các động tác compound kinh điển từ dataset chuẩn.',
    restTimerSeconds: 60,
    createdBy: {
      userId: 'system-coach',
      username: 'FitLevel Coach',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    exercises: [
      {
        exercise: getDatasetExercise('ex-0025'), // Barbell Bench Press
        restTimerSeconds: 90,
        pinnedNote: 'Kiểm soát nhịp hạ tạ chậm, đẩy dứt khoát',
        sets: [
          { setNumber: 1, weightKg: 40, reps: 10, isCompleted: false },
          { setNumber: 2, weightKg: 40, reps: 10, isCompleted: false },
          { setNumber: 3, weightKg: 40, reps: 10, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-0007'), // Alternate Lateral Pulldown
        restTimerSeconds: 60,
        pinnedNote: 'Kéo bằng cơ lưng xô, siết chặt bả vai',
        sets: [
          { setNumber: 1, weightKg: 35, reps: 12, isCompleted: false },
          { setNumber: 2, weightKg: 35, reps: 12, isCompleted: false },
          { setNumber: 3, weightKg: 35, reps: 12, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-1004'), // Band Squat
        restTimerSeconds: 60,
        pinnedNote: 'Đầu gối hướng theo mũi chân, lưng thẳng',
        sets: [
          { setNumber: 1, reps: 15, isCompleted: false },
          { setNumber: 2, reps: 15, isCompleted: false },
          { setNumber: 3, reps: 15, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-0662'), // Push-Up
        restTimerSeconds: 60,
        pinnedNote: 'Gồng chặt cơ core, form thẳng từ đầu đến gót chân',
        sets: [
          { setNumber: 1, reps: 12, isCompleted: false },
          { setNumber: 2, reps: 12, isCompleted: false },
          { setNumber: 3, reps: 12, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-0464'), // Front Plank With Twist
        restTimerSeconds: 45,
        pinnedNote: 'Giữ nhịp thở đều, xoay hông kiểm soát',
        sets: [
          { setNumber: 1, durationSeconds: 45, isCompleted: false },
          { setNumber: 2, durationSeconds: 45, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'routine-starter-upper',
    title: 'Upper Body Sức Mạnh Thân Trên',
    folderId: 'folder-starter-foundation',
    notes: 'Tập trung phát triển ngực, lưng xô, vai và tay trước với khối lượng cân đối.',
    restTimerSeconds: 60,
    createdBy: {
      userId: 'system-coach',
      username: 'FitLevel Coach',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    exercises: [
      {
        exercise: getDatasetExercise('ex-0025'), // Barbell Bench Press
        restTimerSeconds: 90,
        sets: [
          { setNumber: 1, weightKg: 45, reps: 8, isCompleted: false },
          { setNumber: 2, weightKg: 45, reps: 8, isCompleted: false },
          { setNumber: 3, weightKg: 45, reps: 8, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-1429'), // Wide Grip Pull-Up
        restTimerSeconds: 90,
        sets: [
          { setNumber: 1, reps: 8, isCompleted: false },
          { setNumber: 2, reps: 8, isCompleted: false },
          { setNumber: 3, reps: 8, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-0219'), // Cable Shoulder Press
        restTimerSeconds: 60,
        sets: [
          { setNumber: 1, weightKg: 20, reps: 12, isCompleted: false },
          { setNumber: 2, weightKg: 20, reps: 12, isCompleted: false },
          { setNumber: 3, weightKg: 20, reps: 12, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-1634'), // Cable Lying Bicep Curl
        restTimerSeconds: 45,
        sets: [
          { setNumber: 1, weightKg: 15, reps: 12, isCompleted: false },
          { setNumber: 2, weightKg: 15, reps: 12, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'routine-starter-lower',
    title: 'Lower Body & Core Thân Dưới',
    folderId: 'folder-starter-foundation',
    notes: 'Xây dựng sức mạnh đùi, mông và cơ bụng vững chắc với chuyển động tự nhiên.',
    restTimerSeconds: 60,
    createdBy: {
      userId: 'system-coach',
      username: 'FitLevel Coach',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    exercises: [
      {
        exercise: getDatasetExercise('ex-1004'), // Band Squat
        restTimerSeconds: 60,
        sets: [
          { setNumber: 1, reps: 15, isCompleted: false },
          { setNumber: 2, reps: 15, isCompleted: false },
          { setNumber: 3, reps: 15, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-1001'), // Band Single Leg Split Squat
        restTimerSeconds: 60,
        sets: [
          { setNumber: 1, reps: 10, isCompleted: false },
          { setNumber: 2, reps: 10, isCompleted: false },
          { setNumber: 3, reps: 10, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-0001'), // 3/4 Sit-Up
        restTimerSeconds: 45,
        sets: [
          { setNumber: 1, reps: 15, isCompleted: false },
          { setNumber: 2, reps: 15, isCompleted: false },
        ],
      },
      {
        exercise: getDatasetExercise('ex-3544'), // Bodyweight Incline Side Plank
        restTimerSeconds: 45,
        sets: [
          { setNumber: 1, durationSeconds: 30, isCompleted: false },
          { setNumber: 2, durationSeconds: 30, isCompleted: false },
        ],
      },
    ],
  },
];

export const starterSchedule: DaySchedule[] = [
  {
    dayOfWeek: 'Thứ 2',
    dateStr: 'Thứ 2',
    assignedRoutine: starterRoutines[0],
    assignedRoutines: [starterRoutines[0]],
    status: 'planned',
  },
  {
    dayOfWeek: 'Thứ 3',
    dateStr: 'Thứ 3',
    assignedRoutines: [],
    status: 'rest',
  },
  {
    dayOfWeek: 'Thứ 4',
    dateStr: 'Thứ 4',
    assignedRoutine: starterRoutines[1],
    assignedRoutines: [starterRoutines[1]],
    status: 'planned',
  },
  {
    dayOfWeek: 'Thứ 5',
    dateStr: 'Thứ 5',
    assignedRoutines: [],
    status: 'rest',
  },
  {
    dayOfWeek: 'Thứ 6',
    dateStr: 'Thứ 6',
    assignedRoutine: starterRoutines[2],
    assignedRoutines: [starterRoutines[2]],
    status: 'planned',
  },
  {
    dayOfWeek: 'Thứ 7',
    dateStr: 'Thứ 7',
    assignedRoutines: [],
    status: 'rest',
  },
  {
    dayOfWeek: 'Chủ nhật',
    dateStr: 'Chủ nhật',
    assignedRoutines: [],
    status: 'rest',
  },
];

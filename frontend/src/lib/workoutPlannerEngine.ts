import exerciseDataset from '@/data/exerciseDataset.json';
import {
  DaySchedule,
  Exercise,
  RoutineExerciseItem,
  RoutineItem,
  WeekDayVi,
} from '@/types/fitnessleveling.types';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type SplitType = 'full_body' | 'upper_lower' | 'ppl' | 'bro_split' | 'strength';

export interface SplitInfo {
  id: SplitType;
  name: string;
  shortDesc: string;
  rationale: string;
  recommendedDays: number[];
  minDays: number;
  maxDays: number;
  suitableFor: string;
}

export interface PlannerExerciseItem {
  exercise_id: string;
  exercise_name: string;
  target_muscle: string;
  equipment: string;
  gif_url?: string;
  thumbnail_url?: string;
  has_ai_check?: boolean;
  sets: number;
  reps: string;
  rpe: number;
  rest_seconds: number;
  notes?: string;
}

export interface PlannerSession {
  day_of_week: WeekDayVi;
  is_rest: boolean;
  session_title: string;
  focus_area: string;
  estimated_duration_min: number;
  exercises: PlannerExerciseItem[];
}

export interface WeeklyWorkoutPlan {
  plan_id: string;
  plan_name: string;
  split_type: SplitType;
  split_label: string;
  rationale: string;
  duration_weeks: number;
  days_per_week: number;
  sessions: PlannerSession[];
}

export interface PlannerConfig {
  splitMode: 'auto' | 'manual';
  splitType: SplitType;
  daysPerWeek: number;
  targetDays?: WeekDayVi[];
  durationMinutes: number;
  equipment: 'all' | 'dumbbell' | 'bodyweight';
  injuryConstraints?: string[];
  goal?: 'gain_muscle' | 'lose_fat' | 'endurance' | 'strength';
  experience?: 'beginner' | 'intermediate' | 'advanced';
}

// ─── SPLITS CATALOGUE ────────────────────────────────────────────────────────

export const SPLIT_DEFINITIONS: Record<SplitType, SplitInfo> = {
  full_body: {
    id: 'full_body',
    name: 'Full Body (Toàn thân)',
    shortDesc: 'Tập toàn bộ nhóm cơ chính trong mỗi buổi',
    rationale:
      'Kích thích tất cả nhóm cơ lớn đều đặn, tối ưu tần suất phục hồi cho người bận rộn hoặc mới bắt đầu (2-3 buổi/tuần).',
    recommendedDays: [2, 3],
    minDays: 2,
    maxDays: 4,
    suitableFor: 'Người mới, bận rộn, người tập calisthenics',
  },
  upper_lower: {
    id: 'upper_lower',
    name: 'Upper / Lower (Thân trên / Thân dưới)',
    shortDesc: 'Chia đều 2 buổi Thân trên & 2 buổi Thân dưới',
    rationale:
      'Cân bằng hoàn hảo giữa khối lượng vận động và thời gian phục hồi, cho phép nâng mức tạ nặng hơn (4 buổi/tuần).',
    recommendedDays: [4],
    minDays: 3,
    maxDays: 4,
    suitableFor: 'Người tập trung cấp, hướng tới sức mạnh & hình thể cân đối',
  },
  ppl: {
    id: 'ppl',
    name: 'Push / Pull / Legs (Đẩy / Kéo / Chân)',
    shortDesc: 'Phân bổ theo chuỗi chuyển động học cơ thể',
    rationale:
      'Tập trung tối đa hóa kích thích phì đại cơ bắp (Hypertrophy), giảm xung đột khớp và mỏi thần kinh (3-6 buổi/tuần).',
    recommendedDays: [3, 4, 5, 6],
    minDays: 3,
    maxDays: 6,
    suitableFor: 'Mục tiêu tăng cơ tối đa, thể hình chuyên sâu',
  },
  bro_split: {
    id: 'bro_split',
    name: 'Bro Split (1 Nhóm cơ mỗi ngày)',
    shortDesc: 'Mỗi ngày tập chuyên sâu 1 nhóm cơ lớn',
    rationale:
      'Tập trung khối lượng tạ cực cao vào từng nhóm cơ (Ngực, Lưng, Vai, Tay, Chân), tạo độ phì đại và cảm giác pump đỉnh cao.',
    recommendedDays: [4, 5],
    minDays: 4,
    maxDays: 5,
    suitableFor: 'Người tập trung cấp - nâng cao thích cô lập cơ bắp',
  },
  strength: {
    id: 'strength',
    name: 'Strength & Powerlifting (Sức mạnh nền tảng)',
    shortDesc: 'Xoay quanh Squat, Bench Press, Deadlift & Overhead Press',
    rationale:
      'Xây dựng sức mạnh thô, tăng mật độ xương và khả năng phát lực tối đa thông qua các bài phức hợp compound nặng.',
    recommendedDays: [3, 4],
    minDays: 3,
    maxDays: 4,
    suitableFor: 'Người muốn tăng sức mạnh tuyệt đối và chỉ số 1RM',
  },
};

export const ALL_WEEK_DAYS: WeekDayVi[] = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ nhật',
];

// ─── RECOMMENDATION & VALIDATION LOGIC ────────────────────────────────────────

export function recommendSplit(
  experience: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  daysCount: number = 4,
  goal: string = 'gain_muscle'
): SplitType {
  if (daysCount <= 3) {
    if (goal === 'strength' && experience !== 'beginner') return 'strength';
    return 'full_body';
  }
  if (daysCount === 4) {
    if (goal === 'strength') return 'strength';
    return 'upper_lower';
  }
  // daysCount >= 5
  if (experience === 'advanced' && goal === 'gain_muscle') {
    return 'ppl';
  }
  return 'ppl';
}

export function validateSplit(
  split: SplitType,
  daysCount: number,
  experience: string = 'intermediate'
): { isValid: boolean; warning?: string } {
  const meta = SPLIT_DEFINITIONS[split];
  if (!meta) return { isValid: true };

  if (daysCount < meta.minDays) {
    return {
      isValid: false,
      warning: `Lịch ${meta.name} cần tối thiểu ${meta.minDays} buổi/tuần để đảm bảo phân bổ đủ các nhóm cơ. Bạn đang chọn ${daysCount} buổi.`,
    };
  }

  if (daysCount > meta.maxDays) {
    return {
      isValid: false,
      warning: `Lịch ${meta.name} tối ưu nhất trong khoảng ${meta.recommendedDays.join(', ')} buổi/tuần. ${daysCount} buổi có thể dẫn đến quá tải phục hồi.`,
    };
  }

  if (split === 'bro_split' && experience === 'beginner') {
    return {
      isValid: true,
      warning:
        'Lưu ý: Bro Split tần suất kích thích mỗi cơ chỉ 1 lần/tuần, người mới tập thường đạt hiệu quả kích hoạt cơ tốt hơn với Full Body hoặc Upper/Lower.',
    };
  }

  return { isValid: true };
}

// ─── EXERCISE DATASET INDEXING & SELECTION ───────────────────────────────────

const datasetCache: Exercise[] = exerciseDataset as unknown as Exercise[];

function getCategoryFromFocusKey(focusKey: string): string[] {
  switch (focusKey) {
    case 'chest':
      return ['chest'];
    case 'back':
      return ['back'];
    case 'shoulders':
      return ['shoulders'];
    case 'arms':
      return ['upper arms', 'lower arms'];
    case 'legs':
    case 'lower_a':
    case 'lower_b':
      return ['upper legs', 'lower legs'];
    case 'upper_a':
      return ['chest', 'back', 'shoulders'];
    case 'upper_b':
      return ['back', 'upper arms', 'shoulders'];
    case 'push':
      return ['chest', 'shoulders', 'upper arms'];
    case 'pull':
      return ['back', 'upper arms', 'shoulders'];
    case 'full_body_a':
      return ['chest', 'upper legs', 'back'];
    case 'full_body_b':
      return ['back', 'shoulders', 'upper legs'];
    case 'full_body_c':
      return ['chest', 'upper arms', 'waist', 'upper legs'];
    default:
      return ['chest', 'back', 'upper legs'];
  }
}

function filterCandidateExercises(
  categories: string[],
  equipment: 'all' | 'dumbbell' | 'bodyweight',
  injuryConstraints?: string[]
): Exercise[] {
  const injuries = injuryConstraints || [];
  const avoidKnee = injuries.includes('knee');
  const avoidLowerBack = injuries.includes('lower_back');
  const avoidShoulder = injuries.includes('shoulder');

  return datasetCache.filter((ex) => {
    // 1. Category match
    const category = (ex.category || ex.body_part || '').toLowerCase();
    if (!categories.some((cat) => category.includes(cat))) {
      return false;
    }

    // 2. Equipment match
    const eq = (ex.equipment || '').toLowerCase();
    if (equipment === 'bodyweight') {
      if (!eq.includes('body weight') && !eq.includes('assisted')) return false;
    } else if (equipment === 'dumbbell') {
      if (!eq.includes('dumbbell') && !eq.includes('body weight')) return false;
    }

    // 3. Injury safety filters
    const name = (ex.name || '').toLowerCase();
    if (avoidKnee && (name.includes('squat') || name.includes('jump') || name.includes('lunge'))) {
      return false;
    }
    if (
      avoidLowerBack &&
      (name.includes('deadlift') || name.includes('bent over') || name.includes('good morning'))
    ) {
      return false;
    }
    if (
      avoidShoulder &&
      (name.includes('behind neck') || name.includes('overhead press') || name.includes('upright row'))
    ) {
      return false;
    }

    return true;
  });
}

function selectExercisesForSession(
  focusKey: string,
  goal: string = 'gain_muscle',
  equipment: 'all' | 'dumbbell' | 'bodyweight' = 'all',
  durationMinutes: number = 60,
  injuries?: string[]
): PlannerExerciseItem[] {
  const categories = getCategoryFromFocusKey(focusKey);
  const candidates = filterCandidateExercises(categories, equipment, injuries);

  const count = durationMinutes <= 45 ? 4 : durationMinutes <= 60 ? 5 : 6;
  const selected: PlannerExerciseItem[] = [];

  // Determine reps and sets based on goal
  let repStr = '8-12 reps';
  let rpeTarget = 8.0;
  let restTime = 60;
  let sets = durationMinutes >= 60 ? 4 : 3;

  if (goal === 'strength') {
    repStr = '4-6 reps';
    rpeTarget = 8.5;
    restTime = 90;
    sets = 4;
  } else if (goal === 'lose_fat') {
    repStr = '12-15 reps';
    rpeTarget = 7.5;
    restTime = 45;
  } else if (goal === 'endurance') {
    repStr = '15-20 reps';
    rpeTarget = 7.0;
    restTime = 30;
  }

  // Pick diverse exercises from candidate list
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  const chosen = shuffled.slice(0, count);

  // If not enough candidates found in filtered list, fallback to standard items
  if (chosen.length === 0) {
    return [
      {
        exercise_id: 'ex-fb-1',
        exercise_name: 'Dumbbell Bench Press',
        target_muscle: 'chest',
        equipment: 'dumbbell',
        sets,
        reps: repStr,
        rpe: rpeTarget,
        rest_seconds: restTime,
        notes: 'Giữ vai ổn định và hạ tạ có kiểm soát',
      },
      {
        exercise_id: 'ex-fb-2',
        exercise_name: 'Lat Pulldown',
        target_muscle: 'back',
        equipment: 'cable',
        sets,
        reps: repStr,
        rpe: rpeTarget,
        rest_seconds: restTime,
        notes: 'Kéo bằng cơ lưng xô, ngực mở rộng',
      },
      {
        exercise_id: 'ex-fb-3',
        exercise_name: 'Goblet Squat',
        target_muscle: 'upper legs',
        equipment: 'dumbbell',
        sets,
        reps: repStr,
        rpe: rpeTarget,
        rest_seconds: restTime,
        notes: 'Xuống sâu, giữ lưng thẳng và gối hướng theo mũi chân',
      },
      {
        exercise_id: 'ex-fb-4',
        exercise_name: 'Plank',
        target_muscle: 'waist',
        equipment: 'body weight',
        sets: 3,
        reps: '45-60s',
        rpe: 7.5,
        rest_seconds: 45,
        notes: 'Siết chặt cơ bụng và cơ mông',
      },
    ];
  }

  return chosen.map((ex, index) => {
    const isFirstCompound = index === 0 && (goal === 'strength' || goal === 'gain_muscle');
    return {
      exercise_id: ex.id,
      exercise_name: ex.name,
      target_muscle: ex.target_muscle || ex.category || 'Toàn thân',
      equipment: ex.equipment || 'dumbbell',
      gif_url: ex.gif_url,
      thumbnail_url: ex.thumbnail_url,
      has_ai_check: ex.has_ai_check,
      sets: isFirstCompound ? sets + 1 : sets,
      reps: isFirstCompound && goal === 'strength' ? '5 reps' : repStr,
      rpe: isFirstCompound ? rpeTarget + 0.5 : rpeTarget,
      rest_seconds: isFirstCompound ? restTime + 30 : restTime,
      notes: ex.has_ai_check ? 'Có hỗ trợ AI Pose Check kiểm tra tư thế trực tiếp' : undefined,
    };
  });
}

// ─── 7-DAY ALLOCATION ────────────────────────────────────────────────────────

interface DayAllocation {
  isRest: boolean;
  title: string;
  focusArea: string;
  focusKey: string;
}

function buildSplitDayAllocations(
  split: SplitType,
  daysCount: number,
  targetDays?: WeekDayVi[]
): Record<WeekDayVi, DayAllocation> {
  const result: Record<WeekDayVi, DayAllocation> = {
    'Thứ 2': { isRest: true, title: 'Nghỉ ngơi & Phục hồi', focusArea: 'Rest & Recovery', focusKey: '' },
    'Thứ 3': { isRest: true, title: 'Nghỉ ngơi & Phục hồi', focusArea: 'Rest & Recovery', focusKey: '' },
    'Thứ 4': { isRest: true, title: 'Nghỉ ngơi & Phục hồi', focusArea: 'Rest & Recovery', focusKey: '' },
    'Thứ 5': { isRest: true, title: 'Nghỉ ngơi & Phục hồi', focusArea: 'Rest & Recovery', focusKey: '' },
    'Thứ 6': { isRest: true, title: 'Nghỉ ngơi & Phục hồi', focusArea: 'Rest & Recovery', focusKey: '' },
    'Thứ 7': { isRest: true, title: 'Nghỉ ngơi & Phục hồi', focusArea: 'Rest & Recovery', focusKey: '' },
    'Chủ nhật': { isRest: true, title: 'Nghỉ ngơi & Phục hồi', focusArea: 'Rest & Recovery', focusKey: '' },
  };

  // Determine active days
  let activeDays: WeekDayVi[] = [];
  if (targetDays && targetDays.length > 0) {
    activeDays = targetDays.slice(0, daysCount);
  } else {
    // Science-based default spread
    if (daysCount === 2) activeDays = ['Thứ 2', 'Thứ 5'];
    else if (daysCount === 3) activeDays = ['Thứ 2', 'Thứ 4', 'Thứ 6'];
    else if (daysCount === 4) activeDays = ['Thứ 2', 'Thứ 3', 'Thứ 5', 'Thứ 6'];
    else if (daysCount === 5) activeDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
    else activeDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  }

  // Sequences by split
  const sequenceMap: Record<SplitType, Array<{ title: string; focusArea: string; focusKey: string }>> = {
    full_body: [
      { title: 'Full Body A (Đẩy & Chân trước)', focusArea: 'Ngực, Đùi trước, Lưng xô', focusKey: 'full_body_a' },
      { title: 'Full Body B (Kéo & Đùi sau)', focusArea: 'Lưng xô, Đùi sau, Vai', focusKey: 'full_body_b' },
      { title: 'Full Body C (Sức mạnh & Core)', focusArea: 'Toàn thân bùng nổ, Tay & Bụng', focusKey: 'full_body_c' },
      { title: 'Full Body D (Conditioning)', focusArea: 'Toàn thân chức năng & Kháng lực', focusKey: 'full_body_a' },
    ],
    upper_lower: [
      { title: 'Upper A (Thân trên A)', focusArea: 'Ngực, Lưng xô, Vai trước & Tay sau', focusKey: 'upper_a' },
      { title: 'Lower A (Thân dưới A)', focusArea: 'Đùi trước, Bắp chân, Cơ bụng', focusKey: 'lower_a' },
      { title: 'Upper B (Thân trên B)', focusArea: 'Lưng dày, Vai sau, Tay trước & Ngực trên', focusKey: 'upper_b' },
      { title: 'Lower B (Thân dưới B)', focusArea: 'Đùi sau, Cơ mông, Khớp hông & Core', focusKey: 'lower_b' },
    ],
    ppl: [
      { title: 'Push (Đẩy A)', focusArea: 'Ngực, Vai trước, Tay sau', focusKey: 'push' },
      { title: 'Pull (Kéo A)', focusArea: 'Lưng xô, Vai sau, Tay trước', focusKey: 'pull' },
      { title: 'Legs (Chân A)', focusArea: 'Đùi trước, Đùi sau, Bắp chân, Bụng', focusKey: 'legs' },
      { title: 'Push Focus (Đẩy B)', focusArea: 'Ngực trên, Vai giữa, Tay sau', focusKey: 'push' },
      { title: 'Pull Focus (Kéo B)', focusArea: 'Lưng dày, Cầu vai, Tay trước', focusKey: 'pull' },
      { title: 'Legs Focus (Chân B)', focusArea: 'Đùi sau, Cơ mông, Core', focusKey: 'legs' },
    ],
    bro_split: [
      { title: 'Chest Day (Ngực)', focusArea: 'Cơ ngực toàn diện, Ép ngực & Dips', focusKey: 'chest' },
      { title: 'Back Day (Lưng xô)', focusArea: 'Độ rộng xô, Độ dày lưng, Khóa khớp', focusKey: 'back' },
      { title: 'Shoulders Day (Vai)', focusArea: 'Vai trước, vai giữa, vai sau & Cầu vai', focusKey: 'shoulders' },
      { title: 'Arms Day (Tay)', focusArea: 'Tay trước bắp tay, Tay sau & Cẳng tay', focusKey: 'arms' },
      { title: 'Legs Day (Chân & Bụng)', focusArea: 'Đùi trước, Đùi sau, Bắp chân & Cơ bụng', focusKey: 'legs' },
    ],
    strength: [
      { title: 'Squat Focus', focusArea: 'Squat nặng & Thân dưới phụ trợ', focusKey: 'lower_a' },
      { title: 'Bench Press Focus', focusArea: 'Bench Press nặng & Thân trên phụ trợ', focusKey: 'upper_a' },
      { title: 'Deadlift Focus', focusArea: 'Deadlift nặng & Sức mạnh chuỗi sau', focusKey: 'lower_b' },
      { title: 'Overhead Press Focus', focusArea: 'OHP nặng, Lưng xô & Core bùng nổ', focusKey: 'upper_b' },
    ],
  };

  const splitSeq = sequenceMap[split] || sequenceMap.upper_lower;

  activeDays.forEach((dayName, idx) => {
    const template = splitSeq[idx % splitSeq.length];
    result[dayName] = {
      isRest: false,
      title: template.title,
      focusArea: template.focusArea,
      focusKey: template.focusKey,
    };
  });

  return result;
}

// ─── MAIN GENERATOR ──────────────────────────────────────────────────────────

export function generateWeeklyWorkoutPlan(
  config: PlannerConfig,
  profile?: { id?: string; name?: string; goal?: string }
): WeeklyWorkoutPlan {
  const goal = config.goal || (profile?.goal as any) || 'gain_muscle';
  const experience = config.experience || 'intermediate';
  const daysCount = Math.max(2, Math.min(6, config.daysPerWeek));

  const split: SplitType =
    config.splitMode === 'auto'
      ? recommendSplit(experience, daysCount, goal)
      : config.splitType;

  const splitMeta = SPLIT_DEFINITIONS[split] || SPLIT_DEFINITIONS.upper_lower;
  const dayAllocations = buildSplitDayAllocations(split, daysCount, config.targetDays);

  const sessions: PlannerSession[] = ALL_WEEK_DAYS.map((dayName) => {
    const alloc = dayAllocations[dayName];
    if (alloc.isRest) {
      return {
        day_of_week: dayName,
        is_rest: true,
        session_title: 'Nghỉ ngơi & Phục hồi',
        focus_area: 'Active Recovery & Dinh dưỡng',
        estimated_duration_min: 0,
        exercises: [],
      };
    }

    const exercises = selectExercisesForSession(
      alloc.focusKey,
      goal,
      config.equipment,
      config.durationMinutes,
      config.injuryConstraints
    );

    return {
      day_of_week: dayName,
      is_rest: false,
      session_title: alloc.title,
      focus_area: alloc.focusArea,
      estimated_duration_min: config.durationMinutes,
      exercises,
    };
  });

  return {
    plan_id: `plan-${Date.now()}`,
    plan_name: `Kế hoạch ${splitMeta.name} (${daysCount} buổi/tuần)`,
    split_type: split,
    split_label: splitMeta.name,
    rationale: splitMeta.rationale,
    duration_weeks: 4,
    days_per_week: daysCount,
    sessions,
  };
}

// ─── SCHEDULE & ROUTINE CONVERSION HELPER ───────────────────────────────────

export function convertPlanToScheduleAndRoutines(
  plan: WeeklyWorkoutPlan,
  currentSchedule: DaySchedule[],
  user: { id: string; name: string; avatar: string }
): { newSchedule: DaySchedule[]; newRoutines: RoutineItem[] } {
  const newRoutines: RoutineItem[] = [];

  const newSchedule: DaySchedule[] = ALL_WEEK_DAYS.map((dayName, idx) => {
    const session = plan.sessions.find((s) => s.day_of_week === dayName);
    const existingDay = currentSchedule.find((s) => s.dayOfWeek === dayName);
    const dateStr =
      existingDay?.dateStr ||
      new Date(Date.now() + idx * 86400000).toISOString().split('T')[0];

    if (!session || session.is_rest || session.exercises.length === 0) {
      return {
        dayOfWeek: dayName,
        dateStr,
        status: 'rest',
        assignedRoutine: undefined,
        assignedRoutines: [],
      };
    }

    // Build RoutineExerciseItem[]
    const routineExercises: RoutineExerciseItem[] = session.exercises.map((item) => {
      // Find full exercise in dataset or create conformant Exercise object
      const foundInDataset = datasetCache.find((d) => d.id === item.exercise_id);
      const exObj: Exercise = foundInDataset
        ? {
            ...foundInDataset,
            targetMuscles: Array.isArray(foundInDataset.targetMuscles)
              ? foundInDataset.targetMuscles
              : [foundInDataset.target_muscle || item.target_muscle],
            type: foundInDataset.type || 'weight_reps',
          }
        : {
            id: item.exercise_id,
            name: item.exercise_name,
            targetMuscles: [item.target_muscle],
            type: 'weight_reps',
            category: item.target_muscle,
            equipment: item.equipment,
            gif_url: item.gif_url,
            thumbnail_url: item.thumbnail_url,
            has_ai_check: item.has_ai_check,
          };

      const setsCount = item.sets || 3;
      const parsedReps = parseInt(item.reps, 10) || 10;

      const sets = Array.from({ length: setsCount }, (_, i) => ({
        setNumber: i + 1,
        weightKg: 20,
        reps: parsedReps,
        isCompleted: false,
      }));

      return {
        exercise: exObj,
        sets,
        restTimerSeconds: item.rest_seconds || 60,
        pinnedNote: item.notes,
      };
    });

    const routine: RoutineItem = {
      id: `routine-ai-${dayName.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
      title: session.session_title,
      notes: `Kế hoạch AI (${plan.split_label}) - ${session.focus_area}`,
      restTimerSeconds: 60,
      exercises: routineExercises,
      createdBy: {
        userId: user.id,
        username: user.name,
        avatarUrl: user.avatar,
      },
    };

    newRoutines.push(routine);

    return {
      dayOfWeek: dayName,
      dateStr,
      status: 'planned',
      assignedRoutine: routine,
      assignedRoutines: [routine],
    };
  });

  return { newSchedule, newRoutines };
}

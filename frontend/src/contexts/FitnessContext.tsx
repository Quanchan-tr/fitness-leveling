'use strict';
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Exercise,
  ExerciseSet,
  RoutineExerciseItem,
  RoutineItem,
  RoutineFolder,
  DaySchedule,
  WeekDayVi,
  ScheduleStatus,
  ActiveWorkoutSession,
  WorkoutHistoryRecord,
  CommunityPost,
  CommunityComment,
  SuggestedAthlete,
} from '@/types/fitnessleveling.types';
import exerciseDataset from '@/data/exerciseDataset.json';
import {
  starterFolders,
  starterRoutines,
  starterSchedule,
} from '@/data/starterRoutines';
import {
  initialCommunityPosts,
  initialSuggestedAthletes,
} from '@/data/fitnesslevelingMockData';

const defaultDatasetExercises: Exercise[] = (exerciseDataset as any[]).map((item) => ({
  id: item.id,
  name: item.name,
  targetMuscles: Array.isArray(item.targetMuscles) && item.targetMuscles.length > 0
    ? item.targetMuscles
    : [item.target_muscle || item.body_part || item.category || 'chest'],
  equipment: (item.equipment || 'bodyweight').toLowerCase() as any,
  type: item.type || (item.category === 'cardio' ? 'duration' : 'weight_reps'),
  gifPlaceholderUrl: item.gif_url || item.thumbnail_url,
  gif_url: item.gif_url,
  thumbnail_url: item.thumbnail_url,
  description: item.description || item.instructions || item.name,
  has_ai_check: Boolean(item.has_ai_check),
  body_part: item.body_part,
  category: item.category,
  target_muscle: item.target_muscle,
}));

function calculateRealStreak(history: WorkoutHistoryRecord[]): number {
  if (!history || history.length === 0) return 0;
  const uniqueDates = Array.from(
    new Set(
      history
        .map((h) => {
          try {
            return new Date(h.completedAt).toISOString().split('T')[0];
          } catch {
            return null;
          }
        })
        .filter(Boolean) as string[]
    )
  ).sort().reverse();

  if (uniqueDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const latest = uniqueDates[0];
  if (latest !== todayStr && latest !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(latest);
  for (const dStr of uniqueDates) {
    const currentExpected = checkDate.toISOString().split('T')[0];
    if (dStr === currentExpected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function calculateLevelFromWorkouts(totalWorkouts: number): { level: number; xp: number; maxXp: number } {
  const totalXp = totalWorkouts * 120;
  const maxXp = 1000;
  const level = Math.floor(totalXp / maxXp) + 1;
  const xp = totalXp % maxXp;
  return { level, xp, maxXp };
}
import { playRestTimerBeep } from '@/lib/soundUtils';
import { apiRequest, fetchExercises } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface UserFitnessProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  avatar: string;
  bio: string;
  goal: 'gain_muscle' | 'lose_fat' | 'endurance';
  streak: number;
  totalWorkouts: number;
  followersCount: number;
  followingCount: number;
}

export interface VitalsState {
  water: { current: number; target: number };
  weightHistory: { date: string; weightKg: number }[];
  sleep: { hours: number; minutes: number };
  steps: number;
  nutrition: {
    calories: { current: number; target: number };
    macros: {
      protein: { current: number; target: number };
      carbs: { current: number; target: number };
      fat: { current: number; target: number };
    };
  };
}

interface FitnessContextType {
  // Exercises Library
  exercises: Exercise[];
  addCustomExercise: (newEx: Omit<Exercise, 'id'>) => Exercise;

  // Routines & Folders
  routines: RoutineItem[];
  folders: RoutineFolder[];
  createRoutine: (routine: Omit<RoutineItem, 'id' | 'createdBy'>) => RoutineItem;
  updateRoutine: (routine: RoutineItem) => void;
  deleteRoutine: (routineId: string) => void;
  duplicateRoutine: (routineId: string) => RoutineItem | null;
  cloneRoutine: (routine: RoutineItem, targetFolderId?: string) => RoutineItem;
  createFolder: (name: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;
  toggleFolder: (folderId: string) => void;

  // Weekly Schedule
  schedule: DaySchedule[];
  assignRoutineToDay: (dayOfWeek: WeekDayVi, routineId: string) => void;
  removeRoutineFromDay: (dayOfWeek: WeekDayVi, routineId?: string) => void;
  updateDayStatus: (dayOfWeek: WeekDayVi, status: ScheduleStatus) => void;
  applyWeeklySchedule: (newSchedule: DaySchedule[], createdRoutines?: RoutineItem[]) => void;
  todaySchedule: DaySchedule;

  // Live Workout Session
  activeWorkout: ActiveWorkoutSession | null;
  startWorkout: (routine: RoutineItem) => void;
  pauseWorkout: () => void;
  resumeWorkoutTimer: () => void;
  completeSet: (
    exerciseIndex: number,
    setIndex: number,
    actualData?: { weightKg?: number; reps?: number; durationSeconds?: number; distanceKm?: number }
  ) => void;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<ExerciseSet>) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  skipRestTimer: () => void;
  completeWorkout: () => WorkoutHistoryRecord | null;
  cancelWorkout: () => void;

  // Vitals & Quick Log
  vitals: VitalsState;
  addWater: (amountLiters: number) => void;
  updateWeight: (weightKg: number) => void;
  updateSleep: (hours: number, minutes: number) => void;
  updateNutrition: (nutrition: VitalsState['nutrition']) => void;

  // Community
  posts: CommunityPost[];
  createPost: (postData: {
    title: string;
    content: string;
    routineId?: string;
    images?: string[];
    videoUrl?: string;
    hasPoseCheck?: boolean;
    tags?: string[];
  }) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  athletes: SuggestedAthlete[];
  toggleFollowAthlete: (athleteId: string) => void;

  // Profile & History
  profile: UserFitnessProfile;
  updateProfile: (updated: Partial<UserFitnessProfile>) => void;
  workoutHistory: WorkoutHistoryRecord[];
}

const FitnessContext = createContext<FitnessContextType | null>(null);

const STORAGE_KEY_WORKOUT = 'fitnessleveling_active_workout';
const STORAGE_KEY_ROUTINES = 'fitnessleveling_routines';
const STORAGE_KEY_FOLDERS = 'fitnessleveling_folders';
const STORAGE_KEY_SCHEDULE = 'fitnessleveling_schedule';
const STORAGE_KEY_HISTORY = 'fitnessleveling_history';
const STORAGE_KEY_VITALS = 'fitnessleveling_vitals';

function getSavedStorage(key: string, fallbackKey: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) || localStorage.getItem(fallbackKey);
}

function calculateTodayNutritionFromStorage(): VitalsState['nutrition'] {
  if (typeof window !== 'undefined') {
    try {
      const raw =
        localStorage.getItem('fitnessleveling_food_log_v1') ||
        localStorage.getItem('fittrack_food_log_v1');
      if (raw) {
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          const today = new Date();
          const todayItems = items.filter((item: any) => {
            if (!item.loggedAt) return true;
            const d = new Date(item.loggedAt);
            return (
              !isNaN(d.getTime()) &&
              d.getFullYear() === today.getFullYear() &&
              d.getMonth() === today.getMonth() &&
              d.getDate() === today.getDate()
            );
          });

          return {
            calories: {
              current: todayItems.reduce((acc, cur) => acc + (cur.calories || 0), 0),
              target: 2400,
            },
            macros: {
              protein: {
                current: todayItems.reduce((acc, cur) => acc + (cur.macros?.protein || 0), 0),
                target: 150,
              },
              carbs: {
                current: todayItems.reduce((acc, cur) => acc + (cur.macros?.carbs || 0), 0),
                target: 250,
              },
              fat: {
                current: todayItems.reduce((acc, cur) => acc + (cur.macros?.fat || 0), 0),
                target: 70,
              },
            },
          };
        }
      }
    } catch (e) {
      console.error('Failed reading today nutrition from storage', e);
    }
  }

  return {
    calories: { current: 0, target: 2400 },
    macros: {
      protein: { current: 0, target: 150 },
      carbs: { current: 0, target: 250 },
      fat: { current: 0, target: 70 },
    },
  };
}

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // 1. Exercises (with persistent custom exercises & safe normalization)
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    let customList: Exercise[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fittrack_custom_exercises');
        if (saved) customList = JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading custom exercises', e);
      }
    }
    return [...customList, ...defaultDatasetExercises];
  });

  // Sync exercises from backend API or local clean dataset
  useEffect(() => {
    let mounted = true;
    fetchExercises({ per_page: 2000 })
      .then((res) => {
        if (mounted && res?.data && res.data.length > 0) {
          const mapped: Exercise[] = res.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            nameVi: item.nameVi || undefined,
            targetMuscles: Array.isArray(item.targetMuscles) && item.targetMuscles.length > 0
              ? item.targetMuscles
              : [item.target_muscle || item.body_part || item.category || 'chest'],
            equipment: (item.equipment || 'bodyweight').toLowerCase() as any,
            type: item.type || (item.category === 'cardio' ? 'duration' : 'weight_reps'),
            gifPlaceholderUrl: item.gif_url || item.thumbnail_url || item.gifPlaceholderUrl,
            gif_url: item.gif_url,
            thumbnail_url: item.thumbnail_url,
            description: item.description || item.instructions || item.name,
            has_ai_check: Boolean(item.has_ai_check),
            body_part: item.body_part,
            category: item.category,
            target_muscle: item.target_muscle,
          }));

          let customList: Exercise[] = [];
          if (typeof window !== 'undefined') {
            try {
              const saved = localStorage.getItem('fittrack_custom_exercises');
              if (saved) customList = JSON.parse(saved);
            } catch (e) {}
          }

          // Robust Merge by ID: never truncate dataset, merge remote & custom additions
          const exerciseMap = new Map<string, Exercise>();
          defaultDatasetExercises.forEach((ex) => exerciseMap.set(ex.id, ex));
          mapped.forEach((ex) => exerciseMap.set(ex.id, ex));
          customList.forEach((ex) => exerciseMap.set(ex.id, ex));

          setExercises(Array.from(exerciseMap.values()));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch exercises from backend API, using fallback data', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Folders & Routines
  const [folders, setFolders] = useState<RoutineFolder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = getSavedStorage(STORAGE_KEY_FOLDERS, 'fittrack_folders');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading folders from localStorage', e);
      }
    }
    return starterFolders;
  });

  // Save folders to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
      } catch (e) {
        console.error('Failed saving folders to localStorage', e);
      }
    }
  }, [folders]);

  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = getSavedStorage(STORAGE_KEY_ROUTINES, 'fittrack_routines');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading routines from localStorage', e);
      }
    }
    return starterRoutines;
  });

  // Save routines to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
      } catch (e) {
        console.error('Failed saving routines to localStorage', e);
      }
    }
  }, [routines]);

  // 3. Schedule (7 days: Thứ 2 -> Chủ nhật)
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = getSavedStorage(STORAGE_KEY_SCHEDULE, 'fittrack_schedule');
        if (saved) {
          const parsed: DaySchedule[] = JSON.parse(saved);
          return parsed.map((day) => ({
            ...day,
            assignedRoutines:
              day.assignedRoutines && day.assignedRoutines.length > 0
                ? day.assignedRoutines
                : day.assignedRoutine
                ? [day.assignedRoutine]
                : [],
          }));
        }
      } catch (e) {
        console.error('Failed reading schedule from localStorage', e);
      }
    }
    return starterSchedule.map((day) => ({
      ...day,
      assignedRoutines:
        day.assignedRoutines && day.assignedRoutines.length > 0
          ? day.assignedRoutines
          : day.assignedRoutine
          ? [day.assignedRoutine]
          : [],
    }));
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
      } catch (e) {
        console.error('Failed saving schedule to localStorage', e);
      }
    }
  }, [schedule]);

  // Sunday is today in our scenario
  const todaySchedule = schedule.find((s) => s.dayOfWeek === 'Chủ nhật') || schedule[6];

  // 4. User Profile & Workout History
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = getSavedStorage(STORAGE_KEY_HISTORY, 'fittrack_history');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading history from localStorage', e);
      }
    }
    return [];
  });

  const [profile, setProfile] = useState<UserFitnessProfile>(() => {
    const stats = calculateLevelFromWorkouts(0);
    return {
      id: user?.id || 'user-me',
      name: user?.displayName || 'Vận động viên',
      level: stats.level,
      xp: stats.xp,
      maxXp: stats.maxXp,
      avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Chiến binh thể hình FitLevel • Bắt đầu hành trình bứt phá',
      goal: (user?.goal as any) || 'gain_muscle',
      streak: 0,
      totalWorkouts: 0,
      followersCount: 0,
      followingCount: 0,
    };
  });

  // Prioritize server-authoritative gamification stats if available
  useEffect(() => {
    if (user?.gamification) {
      setProfile((prev) => ({
        ...prev,
        id: user.id || prev.id,
        name: user.displayName || prev.name,
        level: user.gamification?.level ?? prev.level,
        xp: user.gamification?.xp ?? prev.xp,
        maxXp: user.gamification?.next_level_xp ?? prev.maxXp,
        streak: user.gamification?.current_streak ?? prev.streak,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user?.gamification) return;
    const streak = calculateRealStreak(workoutHistory);
    const { level, xp, maxXp } = calculateLevelFromWorkouts(workoutHistory.length);
    setProfile((prev) => ({
      ...prev,
      streak,
      totalWorkouts: workoutHistory.length,
      level,
      xp,
      maxXp,
    }));
  }, [workoutHistory, user?.gamification]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(workoutHistory));
      } catch (e) {
        console.error('Failed saving history to localStorage', e);
      }
    }
  }, [workoutHistory]);

  // 5. Vitals State (Water, Weight, Sleep, Steps, Nutrition)
  const [vitals, setVitals] = useState<VitalsState>(() => {
    const todayNutrition = calculateTodayNutritionFromStorage();
    if (typeof window !== 'undefined') {
      try {
        const saved = getSavedStorage(STORAGE_KEY_VITALS, 'fittrack_vitals');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            nutrition: {
              calories: {
                current: todayNutrition.calories.current,
                target: parsed.nutrition?.calories?.target || 2400,
              },
              macros: {
                protein: {
                  current: todayNutrition.macros.protein.current,
                  target: parsed.nutrition?.macros?.protein?.target || 150,
                },
                carbs: {
                  current: todayNutrition.macros.carbs.current,
                  target: parsed.nutrition?.macros?.carbs?.target || 250,
                },
                fat: {
                  current: todayNutrition.macros.fat.current,
                  target: parsed.nutrition?.macros?.fat?.target || 70,
                },
              },
            },
          };
        }
      } catch (e) {
        console.error('Failed reading vitals from localStorage', e);
      }
    }
    return {
      water: { current: 1.8, target: 2.0 },
      weightHistory: [
        { date: '2026-09-28', weightKg: 68.4 },
        { date: '2026-09-29', weightKg: 68.2 },
        { date: '2026-09-30', weightKg: 68.3 },
        { date: '2026-10-01', weightKg: 68.0 },
        { date: '2026-10-02', weightKg: 67.9 },
        { date: '2026-10-03', weightKg: 67.7 },
        { date: '2026-10-04', weightKg: 67.6 },
      ],
      sleep: { hours: 7, minutes: 30 },
      steps: 5421,
      nutrition: todayNutrition,
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_VITALS, JSON.stringify(vitals));
      } catch (e) {
        console.error('Failed saving vitals to localStorage', e);
      }
    }
  }, [vitals]);

  // Synchronize vitals.nutrition whenever food log changes in localStorage or another tab
  useEffect(() => {
    const handleFoodLogSync = () => {
      const todayNutrition = calculateTodayNutritionFromStorage();
      setVitals((prev) => ({
        ...prev,
        nutrition: {
          calories: {
            current: todayNutrition.calories.current,
            target: prev.nutrition?.calories?.target || 2400,
          },
          macros: {
            protein: {
              current: todayNutrition.macros.protein.current,
              target: prev.nutrition?.macros?.protein?.target || 150,
            },
            carbs: {
              current: todayNutrition.macros.carbs.current,
              target: prev.nutrition?.macros?.carbs?.target || 250,
            },
            fat: {
              current: todayNutrition.macros.fat.current,
              target: prev.nutrition?.macros?.fat?.target || 70,
            },
          },
        },
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('fitnessleveling:food-log-updated', handleFoodLogSync);
      window.addEventListener('storage', handleFoodLogSync);
      return () => {
        window.removeEventListener('fitnessleveling:food-log-updated', handleFoodLogSync);
        window.removeEventListener('storage', handleFoodLogSync);
      };
    }
  }, []);

  // Sync profile & vitals with authenticated user and backend endpoints
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        id: user.id,
        name: user.displayName,
        avatar: user.avatarUrl || prev.avatar,
        goal: (user.goal as any) || prev.goal,
      }));

      // In demo mode, state is stored locally; avoid spamming offline backend
      if (user.id.startsWith('demo-')) {
        return;
      }

      // 1. Sync recent body metrics for weight history
      apiRequest<{ data: Array<{ log_date: string; weight_kg: number }> }>('/body-metrics?per_page=7')
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            const history = res.data
              .map((m) => ({ date: m.log_date, weightKg: Number(m.weight_kg) }))
              .reverse();
            setVitals((prev) => ({ ...prev, weightHistory: history }));
          }
        })
        .catch(() => {});

      // 2. Sync workout count from workout-logs
      apiRequest<{ data: Array<{ id: string; log_date: string }> }>('/workout-logs?per_page=50')
        .then((res) => {
          if (res?.data) {
            setProfile((prev) => ({
              ...prev,
              totalWorkouts: res.data.length,
            }));
          }
        })
        .catch(() => {});

      // 3. Sync today's nutrition logs
      const todayStr = new Date().toISOString().split('T')[0];
      apiRequest<{ data: Array<{ calories: number; protein_g: number; carbs_g: number; fat_g: number; log_date: string }> }>(
        '/nutrition-logs?per_page=50'
      )
        .then((res) => {
          if (res?.data) {
            const todayLogs = res.data.filter((l) => l.log_date === todayStr);
            const totalCalories = todayLogs.reduce((acc, cur) => acc + (cur.calories || 0), 0);
            const totalProtein = todayLogs.reduce((acc, cur) => acc + Number(cur.protein_g || 0), 0);
            const totalCarbs = todayLogs.reduce((acc, cur) => acc + Number(cur.carbs_g || 0), 0);
            const totalFat = todayLogs.reduce((acc, cur) => acc + Number(cur.fat_g || 0), 0);

            setVitals((prev) => ({
              ...prev,
              nutrition: {
                calories: { current: totalCalories, target: prev.nutrition.calories.target },
                macros: {
                  protein: { current: totalProtein, target: prev.nutrition.macros.protein.target },
                  carbs: { current: totalCarbs, target: prev.nutrition.macros.carbs.target },
                  fat: { current: totalFat, target: prev.nutrition.macros.fat.target },
                },
              },
            }));
          }
        })
        .catch(() => {
          // If offline or demo mock token fails, recalculate from local storage
          const todayNutrition = calculateTodayNutritionFromStorage();
          setVitals((prev) => ({
            ...prev,
            nutrition: {
              calories: { current: todayNutrition.calories.current, target: prev.nutrition.calories.target },
              macros: {
                protein: { current: todayNutrition.macros.protein.current, target: prev.nutrition.macros.protein.target },
                carbs: { current: todayNutrition.macros.carbs.current, target: prev.nutrition.macros.carbs.target },
                fat: { current: todayNutrition.macros.fat.current, target: prev.nutrition.macros.fat.target },
              },
            },
          }));
        });

      // 4. Sync custom workout routines from /routines
      apiRequest<{ data: any[] }>('/routines')
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            const serverRoutines: RoutineItem[] = res.data.map((r: any) => ({
              id: r.id,
              title: r.title,
              notes: r.description || '',
              restTimerSeconds: 60,
              exercises: Array.isArray(r.schedule_days) ? r.schedule_days : [],
              createdBy: {
                userId: r.user_id,
                username: user?.displayName || 'Vận động viên',
                avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              },
            }));
            setRoutines((prev) => {
              const serverIds = new Set(serverRoutines.map((sr) => sr.id));
              const remaining = prev.filter((p) => !serverIds.has(p.id));
              return [...serverRoutines, ...remaining];
            });
          }
        })
        .catch(() => {});

      // 5. Sync community posts from /community/posts
      apiRequest<{ data: any[] }>('/community/posts')
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            const serverPosts: CommunityPost[] = res.data.map((p: any) => ({
              id: p.id,
              title: p.workout_log?.notes || 'Buổi tập cá nhân',
              content: p.content,
              author: {
                id: p.user?.id || 'user',
                name: p.user?.name || 'Vận động viên',
                avatar: p.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                level: p.user?.level || 1,
                badge: 'Athlete',
              },
              createdAt: new Date(p.created_at).toLocaleDateString('vi-VN'),
              likesCount: p.likes_count || 0,
              isLiked: Boolean(p.is_liked),
              comments: [],
              tags: ['FITNESSLEVELING'],
            }));
            setPosts((prev) => {
              const serverIds = new Set(serverPosts.map((sp) => sp.id));
              const remaining = prev.filter((pr) => !serverIds.has(pr.id));
              return [...serverPosts, ...remaining];
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // 6. Active Live Workout Session (with localStorage persistence)
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = getSavedStorage(STORAGE_KEY_WORKOUT, 'fittrack_active_workout');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed restoring active workout session', e);
      }
    }
    return null;
  });

  // Sync activeWorkout to localStorage immediately whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (activeWorkout) {
          localStorage.setItem(STORAGE_KEY_WORKOUT, JSON.stringify(activeWorkout));
        } else {
          localStorage.removeItem(STORAGE_KEY_WORKOUT);
          localStorage.removeItem('fittrack_active_workout');
        }
      } catch (e) {
        console.error('Failed writing active workout session to localStorage', e);
      }
    }
  }, [activeWorkout]);

  // Global Workout Stopwatch & Rest Timer Tick (1s interval)
  const beepPlayedRef = useRef(false);

  useEffect(() => {
    if (!activeWorkout || activeWorkout.isPaused) return;

    const timer = setInterval(() => {
      setActiveWorkout((prev) => {
        if (!prev || prev.isPaused) return prev;

        const nextElapsed = prev.elapsedSeconds + 1;
        let nextRestTimer = prev.restTimer;

        if (nextRestTimer && nextRestTimer.isActive && !nextRestTimer.isPaused) {
          const nextRemaining = nextRestTimer.remainingSeconds - 1;
          if (nextRemaining <= 0) {
            // Reached 00:00 -> Play beep once!
            if (!beepPlayedRef.current) {
              beepPlayedRef.current = true;
              playRestTimerBeep();
            }
            nextRestTimer = {
              ...nextRestTimer,
              isActive: false,
              remainingSeconds: 0,
            };
          } else {
            nextRestTimer = {
              ...nextRestTimer,
              remainingSeconds: nextRemaining,
            };
          }
        }

        return {
          ...prev,
          elapsedSeconds: nextElapsed,
          restTimer: nextRestTimer,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkout?.isPaused]);

  // 7. Community Posts & Athletes (with localStorage persistence)
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fittrack_community_posts_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return initialCommunityPosts;
  });

  const [athletes, setAthletes] = useState<SuggestedAthlete[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fittrack_athletes_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return initialSuggestedAthletes;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fittrack_community_posts_v1', JSON.stringify(posts));
      } catch (e) {}
    }
  }, [posts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fittrack_athletes_v1', JSON.stringify(athletes));
      } catch (e) {}
    }
  }, [athletes]);

  // ----------------------------------------------------
  // Exercise Handlers
  // ----------------------------------------------------
  const addCustomExercise = useCallback((newEx: Omit<Exercise, 'id'>): Exercise => {
    const created: Exercise = {
      ...newEx,
      id: `custom-ex-${Date.now()}`,
      targetMuscles: Array.isArray(newEx.targetMuscles) && newEx.targetMuscles.length > 0
        ? newEx.targetMuscles
        : ['chest'],
      equipment: newEx.equipment || 'dumbbell',
      type: newEx.type || 'weight_reps',
    };
    setExercises((prev) => {
      const next = [created, ...prev];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('fittrack_custom_exercises');
          const existing = saved ? JSON.parse(saved) : [];
          localStorage.setItem('fittrack_custom_exercises', JSON.stringify([created, ...existing]));
        } catch (e) {}
      }
      return next;
    });
    return created;
  }, []);

  // ----------------------------------------------------
  // Routine & Folder Handlers
  // ----------------------------------------------------
  const createRoutine = useCallback(
    (routine: Omit<RoutineItem, 'id' | 'createdBy'>): RoutineItem => {
      const created: RoutineItem = {
        ...routine,
        id: `routine-${Date.now()}`,
        createdBy: {
          userId: profile.id,
          username: profile.name,
          avatarUrl: profile.avatar,
        },
      };
      setRoutines((prev) => [created, ...prev]);

      // Synchronize with backend API
      apiRequest<{ data: { id: string } }>('/routines', {
        method: 'POST',
        useIdempotency: true,
        body: JSON.stringify({
          title: routine.title,
          description: routine.notes || '',
          target_split: 'custom',
          schedule_days: routine.exercises,
        }),
      })
        .then((res) => {
          if (res?.data?.id) {
            setRoutines((prev) =>
              prev.map((r) => (r.id === created.id ? { ...r, id: res.data.id } : r))
            );
          }
        })
        .catch(() => {});

      return created;
    },
    [profile]
  );

  const updateRoutine = useCallback((updated: RoutineItem) => {
    setRoutines((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    // Also sync assigned routine in schedule if it's currently assigned
    setSchedule((prev) =>
      prev.map((day) =>
        day.assignedRoutine?.id === updated.id ? { ...day, assignedRoutine: updated } : day
      )
    );

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updated.id)) {
      apiRequest(`/routines/${updated.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: updated.title,
          description: updated.notes || '',
          schedule_days: updated.exercises,
        }),
      }).catch(() => {});
    }
  }, []);

  const deleteRoutine = useCallback((routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    // Clear from schedule if assigned
    setSchedule((prev) =>
      prev.map((day) =>
        day.assignedRoutine?.id === routineId
          ? { ...day, assignedRoutine: undefined, status: day.status === 'in_progress' ? 'planned' : day.status }
          : day
      )
    );

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routineId)) {
      apiRequest(`/routines/${routineId}`, { method: 'DELETE' }).catch(() => {});
    }
  }, []);

  const duplicateRoutine = useCallback(
    (routineId: string): RoutineItem | null => {
      const original = routines.find((r) => r.id === routineId);
      if (!original) return null;

      const duplicated: RoutineItem = {
        ...original,
        id: `routine-${Date.now()}`,
        title: `${original.title} (Bản sao)`,
        createdBy: {
          userId: profile.id,
          username: profile.name,
          avatarUrl: profile.avatar,
        },
        exercises: original.exercises.map((item) => ({
          ...item,
          sets: item.sets.map((s, idx) => ({
            ...s,
            setNumber: idx + 1,
            isCompleted: false,
          })),
        })),
      };

      setRoutines((prev) => [duplicated, ...prev]);
      return duplicated;
    },
    [routines, profile]
  );

  const cloneRoutine = useCallback(
    (sourceRoutine: RoutineItem, targetFolderId?: string): RoutineItem => {
      const cloned: RoutineItem = {
        ...sourceRoutine,
        id: `routine-cloned-${Date.now()}`,
        folderId: targetFolderId,
        title: sourceRoutine.title.includes('Bản sao') ? sourceRoutine.title : `${sourceRoutine.title} (Đã lưu)`,
        createdBy: {
          userId: profile.id,
          username: profile.name,
          avatarUrl: profile.avatar,
        },
        exercises: sourceRoutine.exercises.map((item) => ({
          ...item,
          sets: item.sets.map((s, idx) => ({
            ...s,
            setNumber: idx + 1,
            isCompleted: false,
          })),
        })),
      };

      setRoutines((prev) => [cloned, ...prev]);
      return cloned;
    },
    [profile]
  );

  const createFolder = useCallback((name: string) => {
    const newFolder: RoutineFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim() || 'Thư mục mới',
      isExpanded: true,
    };
    setFolders((prev) => [...prev, newFolder]);
  }, []);

  const renameFolder = useCallback((folderId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f))
    );
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setRoutines((prev) =>
      prev.map((r) => (r.folderId === folderId ? { ...r, folderId: undefined } : r))
    );
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f))
    );
  }, []);

  // ----------------------------------------------------
  // Schedule Handlers
  // ----------------------------------------------------
  const assignRoutineToDay = useCallback(
    (dayOfWeek: WeekDayVi, routineId: string) => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return;

      setSchedule((prev) =>
        prev.map((day) => {
          if (day.dayOfWeek === dayOfWeek) {
            const currentList =
              day.assignedRoutines && day.assignedRoutines.length > 0
                ? day.assignedRoutines
                : day.assignedRoutine
                ? [day.assignedRoutine]
                : [];

            if (currentList.length >= 3) {
              if (typeof window !== 'undefined') {
                alert('Mỗi ngày chỉ có thể xếp tối đa 3 bài tập!');
              }
              return day;
            }

            const nextList = [...currentList, routine];
            return {
              ...day,
              assignedRoutines: nextList,
              assignedRoutine: nextList[0],
              status: day.status === 'rest' ? 'planned' : day.status,
            };
          }
          return day;
        })
      );
    },
    [routines]
  );

  const removeRoutineFromDay = useCallback((dayOfWeek: WeekDayVi, routineId?: string) => {
    setSchedule((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayOfWeek) {
          const currentList =
            day.assignedRoutines && day.assignedRoutines.length > 0
              ? day.assignedRoutines
              : day.assignedRoutine
              ? [day.assignedRoutine]
              : [];

          const nextList = routineId
            ? currentList.filter((r) => r.id !== routineId)
            : [];

          return {
            ...day,
            assignedRoutines: nextList,
            assignedRoutine: nextList.length > 0 ? nextList[0] : undefined,
            status: nextList.length === 0 ? 'planned' : day.status,
          };
        }
        return day;
      })
    );
  }, []);

  const updateDayStatus = useCallback((dayOfWeek: WeekDayVi, status: ScheduleStatus) => {
    setSchedule((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, status } : day))
    );
  }, []);

  const applyWeeklySchedule = useCallback(
    (newSchedule: DaySchedule[], createdRoutines?: RoutineItem[]) => {
      if (createdRoutines && createdRoutines.length > 0) {
        setRoutines((prev) => {
          const next = [...createdRoutines, ...prev];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });
      }
      setSchedule(newSchedule);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(newSchedule));
        } catch (e) {}
      }
    },
    []
  );

  // ----------------------------------------------------
  // Live Workout Session Handlers
  // ----------------------------------------------------
  const startWorkout = useCallback((routine: RoutineItem) => {
    beepPlayedRef.current = false;
    const session: ActiveWorkoutSession = {
      routineId: routine.id,
      routineTitle: routine.title,
      startTime: Date.now(),
      elapsedSeconds: 0,
      currentExerciseIndex: 0,
      exercises: routine.exercises.map((item) => ({
        ...item,
        sets: item.sets.map((s, idx) => ({
          ...s,
          setNumber: idx + 1,
          isCompleted: false,
        })),
      })),
      isPaused: false,
      restTimer: null,
    };

    setActiveWorkout(session);

    // Update today's schedule status to 'in_progress'
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === 'Chủ nhật' ? { ...day, status: 'in_progress', assignedRoutine: routine } : day
      )
    );
  }, []);

  const pauseWorkout = useCallback(() => {
    setActiveWorkout((prev) => (prev ? { ...prev, isPaused: true } : null));
  }, []);

  const resumeWorkoutTimer = useCallback(() => {
    setActiveWorkout((prev) => (prev ? { ...prev, isPaused: false } : null));
  }, []);

  const completeSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      actualData?: { weightKg?: number; reps?: number; durationSeconds?: number; distanceKm?: number }
    ) => {
      beepPlayedRef.current = false;

      setActiveWorkout((prev) => {
        if (!prev) return null;

        const updatedExercises = [...prev.exercises];
        const currentExercise = { ...updatedExercises[exerciseIndex] };
        const sets = [...currentExercise.sets];
        const targetSet = { ...sets[setIndex] };

        // Mark set completed and update actual values
        targetSet.isCompleted = true;
        if (actualData) {
          if (actualData.weightKg !== undefined) targetSet.weightKg = actualData.weightKg;
          if (actualData.reps !== undefined) targetSet.reps = actualData.reps;
          if (actualData.durationSeconds !== undefined) targetSet.durationSeconds = actualData.durationSeconds;
          if (actualData.distanceKm !== undefined) targetSet.distanceKm = actualData.distanceKm;
        }
        sets[setIndex] = targetSet;
        currentExercise.sets = sets;
        updatedExercises[exerciseIndex] = currentExercise;

        // Auto-start Rest Timer!
        const restDuration =
          currentExercise.restTimerSeconds ||
          (prev.exercises[exerciseIndex]?.restTimerSeconds) ||
          60;

        const newRestTimer = {
          isActive: true,
          remainingSeconds: restDuration,
          targetSeconds: restDuration,
          isPaused: false,
          exerciseIndex,
          setIndex,
        };

        // Section 13.1: If final set of current exercise, advance to next exercise!
        const isLastSetOfExercise = setIndex === sets.length - 1;
        let nextExerciseIndex = prev.currentExerciseIndex;

        if (isLastSetOfExercise && exerciseIndex < updatedExercises.length - 1) {
          nextExerciseIndex = exerciseIndex + 1;
        }

        return {
          ...prev,
          exercises: updatedExercises,
          currentExerciseIndex: nextExerciseIndex,
          restTimer: newRestTimer,
        };
      });
    },
    []
  );

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, data: Partial<ExerciseSet>) => {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        const exercisesCopy = [...prev.exercises];
        const ex = { ...exercisesCopy[exerciseIndex] };
        const setsCopy = [...ex.sets];
        setsCopy[setIndex] = { ...setsCopy[setIndex], ...data };
        ex.sets = setsCopy;
        exercisesCopy[exerciseIndex] = ex;
        return { ...prev, exercises: exercisesCopy };
      });
    },
    []
  );

  const adjustRestTimer = useCallback((deltaSeconds: number) => {
    setActiveWorkout((prev) => {
      if (!prev || !prev.restTimer || !prev.restTimer.isActive) return prev;
      const newRemaining = Math.max(0, prev.restTimer.remainingSeconds + deltaSeconds);
      return {
        ...prev,
        restTimer: {
          ...prev.restTimer,
          remainingSeconds: newRemaining,
        },
      };
    });
  }, []);

  const pauseRestTimer = useCallback(() => {
    setActiveWorkout((prev) => {
      if (!prev || !prev.restTimer) return prev;
      return {
        ...prev,
        restTimer: { ...prev.restTimer, isPaused: true },
      };
    });
  }, []);

  const resumeRestTimer = useCallback(() => {
    setActiveWorkout((prev) => {
      if (!prev || !prev.restTimer) return prev;
      return {
        ...prev,
        restTimer: { ...prev.restTimer, isPaused: false },
      };
    });
  }, []);

  const skipRestTimer = useCallback(() => {
    // Section 13: Beep must NOT play when user manually presses Skip!
    beepPlayedRef.current = true;
    setActiveWorkout((prev) => {
      if (!prev || !prev.restTimer) return prev;
      return {
        ...prev,
        restTimer: {
          ...prev.restTimer,
          isActive: false,
          remainingSeconds: 0,
        },
      };
    });
  }, []);

  const completeWorkout = useCallback((): WorkoutHistoryRecord | null => {
    if (!activeWorkout) return null;

    let totalVolumeKg = 0;
    let completedSetsCount = 0;
    let totalRepsCount = 0;
    const exercisesSummary: string[] = [];

    activeWorkout.exercises.forEach((item) => {
      exercisesSummary.push(item.exercise.name);
      item.sets.forEach((set) => {
        if (set.isCompleted) {
          completedSetsCount++;
          if (set.weightKg && set.reps) {
            totalVolumeKg += set.weightKg * set.reps;
          }
          if (set.reps) {
            totalRepsCount += set.reps;
          }
        }
      });
    });

    const record: WorkoutHistoryRecord = {
      id: `history-${Date.now()}`,
      routineId: activeWorkout.routineId,
      routineTitle: activeWorkout.routineTitle,
      completedAt: new Date().toISOString(),
      durationSeconds: activeWorkout.elapsedSeconds,
      totalVolumeKg,
      totalSets: completedSetsCount,
      totalReps: totalRepsCount,
      exercisesSummary,
    };

    // 1. Add to workout history
    setWorkoutHistory((prev) => [record, ...prev]);

    // 2. Section 15: Synchronize weekly schedule: today becomes 'completed'
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === 'Chủ nhật' ? { ...day, status: 'completed' } : day
      )
    );

    // 3. Update profile stats: level up / XP
    setProfile((prev) => {
      const addedXp = 120;
      const nextXp = prev.xp + addedXp;
      const leveledUp = nextXp >= prev.maxXp;
      return {
        ...prev,
        streak: prev.streak + 1,
        totalWorkouts: prev.totalWorkouts + 1,
        level: leveledUp ? prev.level + 1 : prev.level,
        xp: leveledUp ? nextXp - prev.maxXp : nextXp,
      };
    });

    // 4. Synchronize with backend API (POST /api/v1/workout-logs)
    const todayStr = new Date().toISOString().split('T')[0];
    apiRequest<{ data: { id: string; gamification?: any } }>('/workout-logs', {
      method: 'POST',
      useIdempotency: true,
      body: JSON.stringify({
        log_date: todayStr,
        notes: activeWorkout.routineTitle,
      }),
    })
      .then(async (res) => {
        const logId = res?.data?.id;
        if (!logId) return;

        if (res.data.gamification) {
          const g = res.data.gamification;
          setProfile((prev) => ({
            ...prev,
            streak: g.streak ?? prev.streak,
            level: g.level ?? prev.level,
            xp: g.total_xp ?? prev.xp,
            maxXp: g.next_level_xp ?? prev.maxXp,
          }));
        }

        let setNum = 1;
        for (const item of activeWorkout.exercises) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.exercise.id);
          if (!isUuid) continue;

          for (const s of item.sets) {
            if (s.isCompleted) {
              await apiRequest(`/workout-logs/${logId}/sets`, {
                method: 'POST',
                useIdempotency: true,
                body: JSON.stringify({
                  exercise_id: item.exercise.id,
                  set_number: setNum++,
                  reps: s.reps || 10,
                  weight_kg: s.weightKg || 0,
                  duration_sec: s.durationSeconds || 0,
                }),
              }).catch(() => {});
            }
          }
        }

        // Finalize workout on backend to get final gamification summary
        apiRequest<{ data: { gamification?: any } }>(`/workout-logs/${logId}/complete`, {
          method: 'POST',
        })
          .then((compRes) => {
            if (compRes?.data?.gamification) {
              const g = compRes.data.gamification;
              setProfile((prev) => ({
                ...prev,
                streak: g.current_streak ?? prev.streak,
                level: g.level ?? prev.level,
                xp: g.xp ?? prev.xp,
                maxXp: g.next_level_xp ?? prev.maxXp,
              }));
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.warn('Could not sync workout session to backend', err);
      });

    // 5. Clear active workout session
    setActiveWorkout(null);

    return record;
  }, [activeWorkout]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === 'Chủ nhật' ? { ...day, status: 'planned' } : day
      )
    );
  }, []);

  // ----------------------------------------------------
  // Vitals & Quick Log Handlers
  // ----------------------------------------------------
  const addWater = useCallback((amountLiters: number) => {
    setVitals((prev) => ({
      ...prev,
      water: {
        ...prev.water,
        current: parseFloat((prev.water.current + amountLiters).toFixed(2)),
      },
    }));
  }, []);

  const updateWeight = useCallback((weightKg: number) => {
    const todayStr = new Date().toISOString().split('T')[0];

    apiRequest('/body-metrics', {
      method: 'POST',
      body: JSON.stringify({
        log_date: todayStr,
        weight_kg: weightKg,
      }),
    }).catch((err) => {
      console.warn('Failed to sync weight to backend', err);
    });

    setVitals((prev) => {
      const history = [...prev.weightHistory];
      const existingTodayIndex = history.findIndex((h) => h.date === todayStr);
      if (existingTodayIndex >= 0) {
        history[existingTodayIndex] = { date: todayStr, weightKg };
      } else {
        history.push({ date: todayStr, weightKg });
        if (history.length > 7) history.shift();
      }
      return {
        ...prev,
        weightHistory: history,
      };
    });
  }, []);

  const updateSleep = useCallback((hours: number, minutes: number) => {
    setVitals((prev) => ({
      ...prev,
      sleep: { hours, minutes },
    }));
  }, []);

  const updateNutrition = useCallback((nutrition: VitalsState['nutrition']) => {
    setVitals((prev) => {
      if (
        prev.nutrition.calories.current === nutrition.calories.current &&
        prev.nutrition.calories.target === nutrition.calories.target &&
        prev.nutrition.macros.protein.current === nutrition.macros.protein.current &&
        prev.nutrition.macros.protein.target === nutrition.macros.protein.target &&
        prev.nutrition.macros.carbs.current === nutrition.macros.carbs.current &&
        prev.nutrition.macros.carbs.target === nutrition.macros.carbs.target &&
        prev.nutrition.macros.fat.current === nutrition.macros.fat.current &&
        prev.nutrition.macros.fat.target === nutrition.macros.fat.target
      ) {
        return prev;
      }
      return {
        ...prev,
        nutrition,
      };
    });
  }, []);

  // ----------------------------------------------------
  // Community Handlers
  // ----------------------------------------------------
  const createPost = useCallback(
    (postData: {
      title: string;
      content: string;
      routineId?: string;
      images?: string[];
      videoUrl?: string;
      hasPoseCheck?: boolean;
      tags?: string[];
    }) => {
      const attached = postData.routineId
        ? routines.find((r) => r.id === postData.routineId)
        : undefined;

      let volumeKg = 0;
      let durationMinutes = 45;

      if (attached) {
        attached.exercises.forEach((item) => {
          item.sets.forEach((set) => {
            if (set.weightKg && set.reps) {
              volumeKg += set.weightKg * set.reps;
            }
          });
        });
      }

      const newPost: CommunityPost = {
        id: `post-com-${Date.now()}`,
        title: postData.title,
        content: postData.content,
        author: {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          level: profile.level,
          badge: 'Member',
        },
        createdAt: 'Vừa xong',
        images: postData.images || [],
        videoUrl: postData.videoUrl,
        attachedRoutine: attached,
        metrics: attached
          ? {
              durationMinutes,
              volumeKg: volumeKg > 0 ? volumeKg : undefined,
            }
          : undefined,
        likesCount: 0,
        isLiked: false,
        hasPoseCheck: postData.hasPoseCheck || false,
        tags: postData.tags || ['FITNESSLEVELING', 'LUYỆN TẬP'],
        comments: [],
      };

      setPosts((prev) => [newPost, ...prev]);

      // Synchronize with backend API
      apiRequest<{ data: { id: string } }>('/community/posts', {
        method: 'POST',
        useIdempotency: true,
        body: JSON.stringify({
          content: `${postData.title}\n${postData.content}`,
        }),
      })
        .then((res) => {
          if (res?.data?.id) {
            setPosts((prev) =>
              prev.map((p) => (p.id === newPost.id ? { ...p, id: res.data.id } : p))
            );
          }
        })
        .catch(() => {});
    },
    [profile, routines]
  );

  const toggleLikePost = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
        };
      })
    );

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
      apiRequest(`/community/posts/${postId}/like`, { method: 'POST' }).catch(() => {});
    }
  }, []);

  const addComment = useCallback(
    (postId: string, text: string) => {
      if (!text.trim()) return;
      const newComment: CommunityComment = {
        id: `c-${Date.now()}`,
        authorName: profile.name,
        authorAvatar: profile.avatar,
        text: text.trim(),
        createdAt: 'Vừa xong',
      };
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
      );

      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
        apiRequest(`/community/posts/${postId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content: text.trim() }),
        }).catch(() => {});
      }
    },
    [profile]
  );

  const toggleFollowAthlete = useCallback((athleteId: string) => {
    setAthletes((prev) =>
      prev.map((ath) => {
        if (ath.id !== athleteId) return ath;
        const isFollowing = !ath.isFollowing;
        return {
          ...ath,
          isFollowing,
          followersCount: isFollowing ? ath.followersCount + 1 : ath.followersCount - 1,
        };
      })
    );
  }, []);

  const updateProfile = useCallback((updated: Partial<UserFitnessProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  }, []);

  return (
    <FitnessContext.Provider
      value={{
        exercises,
        addCustomExercise,
        routines,
        folders,
        createRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        cloneRoutine,
        createFolder,
        renameFolder,
        deleteFolder,
        toggleFolder,
        schedule,
        assignRoutineToDay,
        removeRoutineFromDay,
        updateDayStatus,
        applyWeeklySchedule,
        todaySchedule,
        activeWorkout,
        startWorkout,
        pauseWorkout,
        resumeWorkoutTimer,
        completeSet,
        updateSet,
        adjustRestTimer,
        pauseRestTimer,
        resumeRestTimer,
        skipRestTimer,
        completeWorkout,
        cancelWorkout,
        vitals,
        addWater,
        updateWeight,
        updateSleep,
        updateNutrition,
        posts,
        createPost,
        toggleLikePost,
        addComment,
        athletes,
        toggleFollowAthlete,
        profile,
        updateProfile,
        workoutHistory,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};

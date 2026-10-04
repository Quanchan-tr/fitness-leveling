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
} from '@/types/fittrack.types';
import {
  initialExercises,
  initialFolders,
  initialRoutines,
  initialSchedule,
  initialCommunityPosts,
  initialSuggestedAthletes,
  initialWorkoutHistory,
} from '@/data/fittrackMockData';
import { playRestTimerBeep } from '@/lib/soundUtils';

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

const STORAGE_KEY_WORKOUT = 'fittrack_active_workout';
const STORAGE_KEY_ROUTINES = 'fittrack_routines';
const STORAGE_KEY_FOLDERS = 'fittrack_folders';
const STORAGE_KEY_SCHEDULE = 'fittrack_schedule';
const STORAGE_KEY_HISTORY = 'fittrack_history';
const STORAGE_KEY_VITALS = 'fittrack_vitals';

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Exercises
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);

  // 2. Folders & Routines
  const [folders, setFolders] = useState<RoutineFolder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading folders from localStorage', e);
      }
    }
    return initialFolders;
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
        const saved = localStorage.getItem(STORAGE_KEY_ROUTINES);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading routines from localStorage', e);
      }
    }
    return initialRoutines;
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
        const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE);
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
    return initialSchedule.map((day) => ({
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
  const [profile, setProfile] = useState<UserFitnessProfile>({
    id: 'user-me',
    name: 'Quan Tran',
    level: 12,
    xp: 640,
    maxXp: 1000,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Chiến binh thể hình tự nhiên • Tập trung hypertrophy & calisthenics',
    goal: 'gain_muscle',
    streak: 17,
    totalWorkouts: 42,
    followersCount: 154,
    followingCount: 88,
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading history from localStorage', e);
      }
    }
    return initialWorkoutHistory;
  });

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
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_VITALS);
        if (saved) return JSON.parse(saved);
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
      nutrition: {
        calories: { current: 1800, target: 2400 },
        macros: {
          protein: { current: 90, target: 150 },
          carbs: { current: 180, target: 250 },
          fat: { current: 45, target: 70 },
        },
      },
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

  // 6. Active Live Workout Session (with localStorage persistence)
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_WORKOUT);
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

  // 7. Community Posts & Athletes
  const [posts, setPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [athletes, setAthletes] = useState<SuggestedAthlete[]>(initialSuggestedAthletes);

  // ----------------------------------------------------
  // Exercise Handlers
  // ----------------------------------------------------
  const addCustomExercise = useCallback((newEx: Omit<Exercise, 'id'>): Exercise => {
    const created: Exercise = {
      ...newEx,
      id: `custom-ex-${Date.now()}`,
    };
    setExercises((prev) => [created, ...prev]);
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

    // 4. Clear active workout session
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
        tags: postData.tags || ['FITTRACK', 'LUYỆN TẬP'],
        comments: [],
      };

      setPosts((prev) => [newPost, ...prev]);
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  resetExercises,
  summarizeWorkout,
  updateSet,
  type ExerciseSet,
  type RoutineExerciseItem,
  type RoutineItem,
  type WorkoutHistoryRecord,
} from '@fitness/shared';
import { useAuth } from './auth';

// Same as the web: routines/history are device-local for now (the backend has no routines endpoint yet).
// ponytail: no server sync — data is per-device. Upgrade path: POST /workout-logs on finish + a /routines API.

/** Timer state is stored as timestamps (not a ticking counter) so it stays correct while the app is backgrounded. */
export interface MobileSession {
  routineId: string;
  routineTitle: string;
  startTime: number;
  exercises: RoutineExerciseItem[];
  restEndsAt: number | null;
  restTotalSeconds: number;
}

type RoutineDraft = Omit<RoutineItem, 'id' | 'createdBy'>;

interface WorkoutValue {
  ready: boolean;
  routines: RoutineItem[];
  history: WorkoutHistoryRecord[];
  session: MobileSession | null;
  saveRoutine: (draft: RoutineDraft, id?: string) => void;
  deleteRoutine: (id: string) => void;
  startWorkout: (routine: RoutineItem) => void;
  editSet: (exerciseIndex: number, setIndex: number, patch: Partial<ExerciseSet>) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  adjustRest: (deltaSeconds: number) => void;
  skipRest: () => void;
  finishWorkout: () => WorkoutHistoryRecord | null;
  cancelWorkout: () => void;
}

const KEYS = { routines: 'fl_routines', history: 'fl_history', session: 'fl_session' } as const;
const WorkoutContext = createContext<WorkoutValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [history, setHistory] = useState<WorkoutHistoryRecord[]>([]);
  const [session, setSession] = useState<MobileSession | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(Object.values(KEYS)).then((pairs) => {
      const get = (k: string) => pairs.find(([key]) => key === k)?.[1];
      const parse = <T,>(raw: string | null | undefined, fallback: T): T => {
        try {
          return raw ? JSON.parse(raw) : fallback;
        } catch {
          return fallback;
        }
      };
      const DEFAULT_ROUTINES: RoutineItem[] = [
        {
          id: 'routine-chest-triceps',
          title: 'Ngực & Tay Sau Cắt Nét',
          restTimerSeconds: 90,
          createdBy: { userId: '1', username: 'FitTrack AI', avatarUrl: '' },
          exercises: [
            {
              exercise: { id: 'bb-bench', name: 'Barbell Bench Press', type: 'weight_reps', targetMuscles: ['chest'], equipment: 'barbell' },
              sets: [
                { setNumber: 1, reps: 8, weightKg: 80, isCompleted: true, completedAt: new Date().toISOString() },
                { setNumber: 2, reps: 8, weightKg: 80, isCompleted: true, completedAt: new Date().toISOString() },
                { setNumber: 3, reps: 8, weightKg: 80, isCompleted: false },
                { setNumber: 4, reps: 6, weightKg: 82.5, isCompleted: false },
              ],
              restTimerSeconds: 90,
            },
            {
              exercise: { id: 'inc-db-press', name: 'Incline DB Press', type: 'weight_reps', targetMuscles: ['chest'], equipment: 'dumbbell' },
              sets: [
                { setNumber: 1, reps: 10, weightKg: 26, isCompleted: false },
                { setNumber: 2, reps: 10, weightKg: 26, isCompleted: false },
                { setNumber: 3, reps: 10, weightKg: 26, isCompleted: false },
              ],
              restTimerSeconds: 90,
            },
            {
              exercise: { id: 'cable-triceps', name: 'Cable Triceps Pushdown', type: 'weight_reps', targetMuscles: ['triceps'], equipment: 'cable' },
              sets: [
                { setNumber: 1, reps: 12, weightKg: 25, isCompleted: false },
                { setNumber: 2, reps: 12, weightKg: 25, isCompleted: false },
                { setNumber: 3, reps: 12, weightKg: 25, isCompleted: false },
              ],
              restTimerSeconds: 90,
            },
          ],
        },
        {
          id: 'routine-back-biceps',
          title: 'Lưng Xô & Bắp Tay Trước',
          restTimerSeconds: 90,
          createdBy: { userId: '1', username: 'FitTrack AI', avatarUrl: '' },
          exercises: [
            {
              exercise: { id: 'deadlift', name: 'Conventional Deadlift', type: 'weight_reps', targetMuscles: ['back'], equipment: 'barbell' },
              sets: [
                { setNumber: 1, reps: 5, weightKg: 100, isCompleted: false },
                { setNumber: 2, reps: 5, weightKg: 110, isCompleted: false },
                { setNumber: 3, reps: 5, weightKg: 120, isCompleted: false },
              ],
              restTimerSeconds: 120,
            },
            {
              exercise: { id: 'lat-pulldown', name: 'Lat Pulldown', type: 'weight_reps', targetMuscles: ['back'], equipment: 'cable' },
              sets: [
                { setNumber: 1, reps: 10, weightKg: 50, isCompleted: false },
                { setNumber: 2, reps: 10, weightKg: 55, isCompleted: false },
                { setNumber: 3, reps: 10, weightKg: 60, isCompleted: false },
              ],
              restTimerSeconds: 90,
            },
          ],
        },
      ];
      const parsedRoutines = parse(get(KEYS.routines), []);
      setRoutines(parsedRoutines.length > 0 ? parsedRoutines : DEFAULT_ROUTINES);
      setHistory(parse(get(KEYS.history), []));
      setSession(parse(get(KEYS.session), null));
      setReady(true);
    });
  }, []);

  // Persist only after the initial load, otherwise the empty defaults would overwrite saved data.
  useEffect(() => { if (ready) AsyncStorage.setItem(KEYS.routines, JSON.stringify(routines)); }, [ready, routines]);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEYS.history, JSON.stringify(history)); }, [ready, history]);
  useEffect(() => {
    if (!ready) return;
    if (session) AsyncStorage.setItem(KEYS.session, JSON.stringify(session));
    else AsyncStorage.removeItem(KEYS.session);
  }, [ready, session]);

  const saveRoutine = (draft: RoutineDraft, id?: string) => {
    if (id) {
      setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, ...draft } : r)));
      return;
    }
    const created: RoutineItem = {
      ...draft,
      id: `routine-${Date.now()}`,
      createdBy: { userId: String(user?.id ?? 'me'), username: user?.name ?? '', avatarUrl: '' },
    };
    setRoutines((prev) => [created, ...prev]);
  };

  const value: WorkoutValue = {
    ready,
    routines,
    history,
    session,
    saveRoutine,
    deleteRoutine: (id) => setRoutines((prev) => prev.filter((r) => r.id !== id)),
    startWorkout: (routine) =>
      setSession({
        routineId: routine.id,
        routineTitle: routine.title,
        startTime: Date.now(),
        exercises: resetExercises(routine.exercises),
        restEndsAt: null,
        restTotalSeconds: 0,
      }),
    editSet: (ei, si, patch) =>
      setSession((s) => (s ? { ...s, exercises: updateSet(s.exercises, ei, si, patch) } : s)),
    completeSet: (ei, si) =>
      setSession((s) => {
        if (!s) return s;
        const rest = s.exercises[ei]?.restTimerSeconds || 60;
        return {
          ...s,
          exercises: updateSet(s.exercises, ei, si, { isCompleted: true, completedAt: new Date().toISOString() }),
          restEndsAt: Date.now() + rest * 1000,
          restTotalSeconds: rest,
        };
      }),
    adjustRest: (delta) =>
      setSession((s) =>
        s?.restEndsAt ? { ...s, restEndsAt: Math.max(Date.now(), s.restEndsAt + delta * 1000) } : s
      ),
    skipRest: () => setSession((s) => (s ? { ...s, restEndsAt: null } : s)),
    finishWorkout: () => {
      if (!session) return null;
      const record: WorkoutHistoryRecord = {
        id: `history-${Date.now()}`,
        routineId: session.routineId,
        routineTitle: session.routineTitle,
        completedAt: new Date().toISOString(),
        durationSeconds: Math.round((Date.now() - session.startTime) / 1000),
        ...summarizeWorkout(session.exercises),
      };
      setHistory((prev) => [record, ...prev]);
      setSession(null);
      return record;
    },
    cancelWorkout: () => setSession(null),
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used inside <WorkoutProvider>');
  return ctx;
}

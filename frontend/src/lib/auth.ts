/**
 * FitnessLeveling — Authentication Service
 *
 * Connects with Laravel Sanctum API (/api/v1/auth) and manages
 * Bearer token persistence in localStorage.
 */

import { apiRequest } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  isEmailVerified: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  avatarUrl?: string;
  weightKg?: number;
  heightCm?: number;
  goal?: string;
  gender?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface FitnessProfile {
  /** Biological sex for metabolic calculations */
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  /** Training experience level */
  trainingExperience: 'beginner' | 'some_experience' | 'intermediate' | 'advanced';
  /** Daily activity level → maps to TDEE multiplier */
  dailyActivityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  /** Primary fitness goal */
  fitnessGoal: 'lose_fat' | 'maintain' | 'build_muscle';
}

export interface AuthState {
  user: AuthUser | null;
  fitnessProfile: FitnessProfile | null;
  isLoading: boolean;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar_url?: string | null;
  goal?: string;
  weight_kg?: number;
  height_cm?: number;
  birth_date?: string;
  gender?: string;
  activity_level?: string;
  email_verified_at?: string | null;
  created_at?: string;
}

interface AuthResponse {
  data: {
    user: BackendUser;
    token: string;
  };
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  user: 'fitnessleveling_auth_user',
  fitnessProfile: 'fitnessleveling_fitness_profile',
  token: 'fitnessleveling_token',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

function _readFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const fallbackKey = key.replace('fitnessleveling_', 'fittrack_');
    const raw = localStorage.getItem(key) || localStorage.getItem(fallbackKey);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function _removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
  const fallbackKey = key.replace('fitnessleveling_', 'fittrack_');
  localStorage.removeItem(fallbackKey);
}

function _mapBackendUserToAuthUser(u: BackendUser): AuthUser {
  const hasOnboarded = Boolean(
    u.gender && u.gender !== 'other' && u.weight_kg && u.height_cm
  );

  return {
    id: u.id,
    email: u.email,
    displayName: u.name || u.email.split('@')[0],
    isEmailVerified: Boolean(u.email_verified_at),
    hasCompletedOnboarding: hasOnboarded,
    createdAt: u.created_at || new Date().toISOString(),
    avatarUrl: u.avatar_url || undefined,
    weightKg: u.weight_kg ? Number(u.weight_kg) : undefined,
    heightCm: u.height_cm ? Number(u.height_cm) : undefined,
    goal: u.goal,
    gender: u.gender,
  };
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /** Load persisted auth state from storage */
  loadSession(): Pick<AuthState, 'user' | 'fitnessProfile'> {
    const user = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    const fitnessProfile = _readFromStorage<FitnessProfile>(STORAGE_KEYS.fitnessProfile);
    return { user, fitnessProfile };
  },

  /** Verify session with GET /api/v1/auth/me */
  async verifySession(): Promise<AuthUser | null> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEYS.token) || localStorage.getItem('fittrack_token')
        : null;
    if (!token) return null;

    try {
      const res = await apiRequest<{ data: BackendUser }>('/auth/me', {
        method: 'GET',
      });
      const user = _mapBackendUserToAuthUser(res.data);
      _saveToStorage(STORAGE_KEYS.user, user);
      return user;
    } catch {
      // Token is invalid or expired
      _removeFromStorage(STORAGE_KEYS.token);
      _removeFromStorage(STORAGE_KEYS.user);
      return null;
    }
  },

  /** Register a new account via POST /api/v1/auth/register */
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({
        name: payload.displayName || payload.email.split('@')[0],
        email: payload.email,
        password: payload.password,
      }),
    });

    const user = _mapBackendUserToAuthUser(res.data.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.token, res.data.token);
    }
    _saveToStorage(STORAGE_KEYS.user, user);

    return user;
  },

  /** Log in via POST /api/v1/auth/login */
  async login(payload: LoginPayload): Promise<AuthUser> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });

    const user = _mapBackendUserToAuthUser(res.data.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.token, res.data.token);
    }
    _saveToStorage(STORAGE_KEYS.user, user);

    return user;
  },

  /** Mark email as verified */
  async verifyEmail(): Promise<AuthUser> {
    const user = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    if (!user) throw new Error('Phiên đăng nhập không hợp lệ.');

    const verified: AuthUser = { ...user, isEmailVerified: true };
    _saveToStorage(STORAGE_KEYS.user, verified);
    return verified;
  },

  async resendVerificationEmail(): Promise<void> {
    // Stub for email verification trigger
  },

  async requestPasswordReset(_email: string): Promise<void> {
    // Stub for password reset trigger
  },

  async resetPassword(_email: string, _newPassword: string): Promise<void> {
    // Stub for password reset update
  },

  /** Save fitness onboarding profile and sync with PUT /api/v1/auth/profile */
  async saveFitnessProfile(profile: FitnessProfile): Promise<{ user: AuthUser; fitnessProfile: FitnessProfile }> {
    const user = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    if (!user) throw new Error('Phiên đăng nhập không hợp lệ.');

    const goalMap: Record<string, string> = {
      lose_fat: 'lose_weight',
      build_muscle: 'gain_muscle',
      maintain: 'maintain',
    };

    const activityMap: Record<string, string> = {
      sedentary: 'sedentary',
      lightly_active: 'light',
      moderately_active: 'moderate',
      very_active: 'active',
      extremely_active: 'active',
    };

    const birthYear = new Date().getFullYear() - (profile.age || 25);
    const birthDate = `${birthYear}-01-01`;

    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          weight_kg: profile.weightKg,
          height_cm: profile.heightCm,
          gender: profile.gender,
          goal: goalMap[profile.fitnessGoal] || 'maintain',
          activity_level: activityMap[profile.dailyActivityLevel] || 'moderate',
          birth_date: birthDate,
        }),
      });
    } catch (e) {
      console.warn('Could not sync profile to backend immediately, saving locally', e);
    }

    const updatedUser: AuthUser = {
      ...user,
      hasCompletedOnboarding: true,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      gender: profile.gender,
      goal: goalMap[profile.fitnessGoal] || 'maintain',
    };

    _saveToStorage(STORAGE_KEYS.user, updatedUser);
    _saveToStorage(STORAGE_KEYS.fitnessProfile, profile);

    return { user: updatedUser, fitnessProfile: profile };
  },

  /** One-click demo login */
  async loginDemo(): Promise<AuthUser> {
    try {
      return await this.login({
        email: 'test@example.com',
        password: 'password',
      });
    } catch {
      // Offline fallback for previewing
      const demoUser: AuthUser = {
        id: 'demo-user-quan',
        email: 'test@example.com',
        displayName: 'Quân Trần',
        isEmailVerified: true,
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };
      _saveToStorage(STORAGE_KEYS.user, demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.token, 'mock_token_demo_user');
      }
      return demoUser;
    }
  },

  /** Sign out: call backend logout and clear storage */
  async signOut(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      _removeFromStorage(STORAGE_KEYS.user);
      _removeFromStorage(STORAGE_KEYS.fitnessProfile);
      _removeFromStorage(STORAGE_KEYS.token);
    }
  },
};

// ─── TDEE / Calculation helpers ───────────────────────────────────────────────

/** Mifflin-St Jeor BMR formula */
export function calculateBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

const ACTIVITY_MULTIPLIERS: Record<FitnessProfile['dailyActivityLevel'], number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export function calculateTdee(bmr: number, activityLevel: FitnessProfile['dailyActivityLevel']): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * FitnessLeveling — Mock Authentication Service
 *
 * This module provides a mock authentication layer that mirrors the shape of a
 * real backend integration. All state is persisted to localStorage so that a
 * page refresh restores the session. Replace the `_mockApiCall` internals with
 * real `apiRequest()` calls when the Laravel backend is ready.
 */

import { generateUUID } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  isEmailVerified: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
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
}

/** Simulates a network round-trip of `ms` milliseconds */
function _mockApiCall(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /** Load persisted auth state (call once on app mount). */
  loadSession(): Pick<AuthState, 'user' | 'fitnessProfile'> {
    const user = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    const fitnessProfile = _readFromStorage<FitnessProfile>(STORAGE_KEYS.fitnessProfile);
    return { user, fitnessProfile };
  },

  /**
   * Register a new account.
   * In demo mode this always succeeds.
   */
  async register(payload: RegisterPayload): Promise<AuthUser> {
    await _mockApiCall(800);

    // Mock: reject if email already "exists" (stored)
    const existing = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    if (existing && existing.email === payload.email) {
      throw new Error('Email này đã được đăng ký. Vui lòng đăng nhập.');
    }

    const newUser: AuthUser = {
      id: generateUUID(),
      email: payload.email,
      displayName: payload.displayName || payload.email.split('@')[0],
      isEmailVerified: false,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
    };

    // Persist user + issue a mock token
    _saveToStorage(STORAGE_KEYS.user, newUser);
    _saveToStorage(STORAGE_KEYS.token, `mock_token_${newUser.id}`);

    return newUser;
  },

  /**
   * Log in with email and password.
   */
  async login(payload: LoginPayload): Promise<AuthUser> {
    await _mockApiCall(600);

    const existing = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    if (existing && existing.email.toLowerCase() === payload.email.toLowerCase()) {
      _saveToStorage(STORAGE_KEYS.token, `mock_token_${existing.id}`);
      return existing;
    }

    const user: AuthUser = {
      id: generateUUID(),
      email: payload.email,
      displayName: payload.email.split('@')[0],
      isEmailVerified: true,
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    };

    _saveToStorage(STORAGE_KEYS.user, user);
    _saveToStorage(STORAGE_KEYS.token, `mock_token_${user.id}`);
    return user;
  },

  /**
   * Simulate email verification confirmation.
   * In a real system this would call POST /auth/verify-email.
   */
  async verifyEmail(): Promise<AuthUser> {
    await _mockApiCall(600);

    const user = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    if (!user) throw new Error('Phiên đăng nhập không hợp lệ.');

    const verified: AuthUser = { ...user, isEmailVerified: true };
    _saveToStorage(STORAGE_KEYS.user, verified);
    return verified;
  },

  /**
   * Simulate resending a verification email.
   */
  async resendVerificationEmail(): Promise<void> {
    await _mockApiCall(600);
    // In a real system: POST /auth/resend-verification
  },

  /**
   * Simulate requesting password reset OTP/email.
   */
  async requestPasswordReset(email: string): Promise<void> {
    await _mockApiCall(600);
    // In a real system: POST /auth/forgot-password
  },

  /**
   * Simulate updating password.
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    await _mockApiCall(700);
    // In a real system: POST /auth/reset-password
  },

  /**
   * Save the fitness onboarding profile and mark onboarding as complete.
   */
  async saveFitnessProfile(profile: FitnessProfile): Promise<{ user: AuthUser; fitnessProfile: FitnessProfile }> {
    await _mockApiCall(700);

    const user = _readFromStorage<AuthUser>(STORAGE_KEYS.user);
    if (!user) throw new Error('Phiên đăng nhập không hợp lệ.');

    const updatedUser: AuthUser = { ...user, hasCompletedOnboarding: true };
    _saveToStorage(STORAGE_KEYS.user, updatedUser);
    _saveToStorage(STORAGE_KEYS.fitnessProfile, profile);

    return { user: updatedUser, fitnessProfile: profile };
  },

  /**
   * One-click demo login for previewing the full dashboard immediately.
   */
  async loginDemo(): Promise<AuthUser> {
    const demoUser: AuthUser = {
      id: 'demo-user-quan',
      email: 'demo@fitnessleveling.com',
      displayName: 'Quân Trần',
      isEmailVerified: true,
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    };
    _saveToStorage(STORAGE_KEYS.user, demoUser);
    _saveToStorage(STORAGE_KEYS.token, 'mock_token_demo_user');
    return demoUser;
  },

  /**
   * Sign out: clear all persisted state.
   */
  async signOut(): Promise<void> {
    _removeFromStorage(STORAGE_KEYS.user);
    _removeFromStorage(STORAGE_KEYS.fitnessProfile);
    _removeFromStorage(STORAGE_KEYS.token);
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

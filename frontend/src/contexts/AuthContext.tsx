'use strict';
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService, type AuthUser, type FitnessProfile, type RegisterPayload, type LoginPayload } from '@/lib/auth';

// ─── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The currently authenticated user, or null if not logged in. */
  user: AuthUser | null;
  /** The fitness profile collected during onboarding, or null. */
  fitnessProfile: FitnessProfile | null;
  /** True while the initial session is being restored from storage. */
  isLoading: boolean;
  /** Log in with an existing account. */
  login: (payload: LoginPayload) => Promise<AuthUser>;
  /** Register a new account and navigate to the verification screen. */
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  /** Confirm email verification (mock). */
  verifyEmail: () => Promise<void>;
  /** Resend verification email. */
  resendVerificationEmail: () => Promise<void>;
  /** Save fitness onboarding data and mark onboarding complete. */
  saveFitnessProfile: (profile: FitnessProfile) => Promise<void>;
  /** Sign out and clear all state. */
  signOut: () => Promise<void>;
  /** One-click demo login to immediately preview the full dashboard. */
  loginDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on first mount
  useEffect(() => {
    const { user: savedUser, fitnessProfile: savedProfile } = authService.loadSession();
    setUser(savedUser);
    setFitnessProfile(savedProfile);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const loggedUser = await authService.login(payload);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthUser> => {
    const newUser = await authService.register(payload);
    setUser(newUser);
    return newUser;
  }, []);

  const verifyEmail = useCallback(async (): Promise<void> => {
    const updatedUser = await authService.verifyEmail();
    setUser(updatedUser);
  }, []);

  const resendVerificationEmail = useCallback(async (): Promise<void> => {
    await authService.resendVerificationEmail();
  }, []);

  const saveFitnessProfile = useCallback(async (profile: FitnessProfile): Promise<void> => {
    const { user: updatedUser, fitnessProfile: savedProfile } =
      await authService.saveFitnessProfile(profile);
    setUser(updatedUser);
    setFitnessProfile(savedProfile);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setFitnessProfile(null);
  }, []);

  const loginDemo = useCallback(async (): Promise<void> => {
    const demoUser = await authService.loginDemo();
    setUser(demoUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        fitnessProfile,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerificationEmail,
        saveFitnessProfile,
        signOut,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

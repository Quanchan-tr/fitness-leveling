import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ApiException, configureApi, fetchMe, login as apiLogin, logout as apiLogout, type ApiUser } from '@fitness/shared';

const TOKEN_KEY = 'fitnessleveling_token';
const USER_KEY = 'fitnessleveling_user';

configureApi({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
});

interface AuthValue {
  user: ApiUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clear = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  };

  // Restore the cached user immediately (works offline at the gym), then refresh from /auth/me.
  useEffect(() => {
    (async () => {
      const cached = await SecureStore.getItemAsync(USER_KEY);
      if (cached) setUser(JSON.parse(cached));
      setIsLoading(false);
      if (!(await SecureStore.getItemAsync(TOKEN_KEY))) return;
      try {
        const me = await fetchMe();
        setUser(me);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(me));
      } catch (e) {
        if (e instanceof ApiException && e.status === 401) await clear();
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: u, token } = await apiLogin(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signOut = async () => {
    await apiLogout().catch(() => {}); // token is dropped locally even if the server is unreachable
    await clear();
  };

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

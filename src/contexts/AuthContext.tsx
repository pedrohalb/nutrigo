import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api/auth';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ hasProfile: boolean }>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'user']).then(([[, t], [, u]]) => {
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      setIsLoading(false);
    });
  }, []);

  async function persist(t: string, u: AuthUser) {
    await AsyncStorage.multiSet([['token', t], ['user', JSON.stringify(u)]]);
    setToken(t);
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    await persist(res.token, res.user);
    return { hasProfile: res.hasProfile };
  }

  async function signup(email: string, password: string) {
    const res = await authApi.signup(email, password);
    await persist(res.token, res.user);
  }

  async function logout() {
    await authApi.logout().catch(() => {});
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

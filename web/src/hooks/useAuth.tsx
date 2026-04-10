import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthResponse } from '../types';
import api from '../api/client';

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('wf_token');
    const u = localStorage.getItem('wf_user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const persist = (data: AuthResponse) => {
    localStorage.setItem('wf_token', data.token);
    localStorage.setItem('wf_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    persist(data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/register', { name, email, password });
    persist(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wf_token');
    localStorage.removeItem('wf_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

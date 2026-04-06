import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@repo/shared';
import * as authApi from '@/api/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  showLoginDialog: boolean;
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    authApi
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setUser(res.user);
    setShowLoginDialog(false);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const openLoginDialog = useCallback(() => setShowLoginDialog(true), []);
  const closeLoginDialog = useCallback(() => setShowLoginDialog(false), []);

  return (
    <AuthContext.Provider value={{ user, loading, showLoginDialog, openLoginDialog, closeLoginDialog, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

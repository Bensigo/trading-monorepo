import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from './LoginForm';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (!user) return <LoginForm />;

  return <>{children}</>;
}

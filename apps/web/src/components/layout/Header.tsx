import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">TD</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Trading Dashboard</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 hidden sm:block">{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}

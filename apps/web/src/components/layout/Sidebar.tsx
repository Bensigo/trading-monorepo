import { cn } from '@/lib/utils';
import { TickerList } from '@/components/ticker/TickerList';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-14 bottom-0 z-40 w-72 border-r border-border bg-surface overflow-y-auto transition-transform duration-200',
          'lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-3">
          <h2 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Watchlist
          </h2>
          <TickerList />
        </div>
      </aside>
    </>
  );
}

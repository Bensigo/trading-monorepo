import { memo } from 'react';
import type { PriceUpdate } from '@repo/shared';
import { cn } from '@/lib/utils';
import { formatPrice, formatChange, formatVolume } from '@/lib/utils';
import { useTickerStore } from '@/stores/tickerStore';
import { Skeleton } from '@/components/ui/skeleton';

interface TickerCardProps {
  symbol: string;
  name: string;
  price?: PriceUpdate;
}

export const TickerCard = memo(function TickerCard({ symbol, name, price }: TickerCardProps) {
  const selectedTicker = useTickerStore((s) => s.selectedTicker);
  const setSelectedTicker = useTickerStore((s) => s.setSelectedTicker);
  const isSelected = selectedTicker === symbol;

  const change = price?.change24h ?? 0;
  const isUp = change >= 0;

  return (
    <button
      onClick={() => setSelectedTicker(symbol)}
      className={cn(
        'w-full text-left rounded-lg p-3 transition-all hover:bg-slate-50',
        isSelected && 'bg-slate-50 ring-1 ring-slate-200'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-semibold text-slate-900">{symbol}</span>
          <span className="ml-2 text-xs text-slate-400">{name}</span>
        </div>
        {price ? (
          <span
            className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              isUp ? 'text-up-text bg-up-muted' : 'text-down-text bg-down-muted'
            )}
          >
            {isUp ? '\u25B2' : '\u25BC'}
          </span>
        ) : (
          <Skeleton className="h-5 w-5 rounded" />
        )}
      </div>
      <div className="flex items-baseline justify-between">
        {price ? (
          <>
            <span className="font-price text-base font-semibold">
              ${formatPrice(price.price)}
            </span>
            <span
              className={cn('font-price text-xs font-medium', isUp ? 'text-up-text' : 'text-down-text')}
            >
              {formatChange(price.change24h)}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-14" />
          </>
        )}
      </div>
      {price ? (
        <>
          <div className="mt-1 text-xs text-slate-400">
            Vol: {formatVolume(price.volume24h)}
          </div>
          <div className="mt-1 h-6">
            <svg viewBox="0 0 100 24" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke={isUp ? '#22C55E' : '#EF4444'}
                strokeWidth="1.5"
                points={generateSparkline()}
              />
            </svg>
          </div>
        </>
      ) : (
        <>
          <Skeleton className="mt-1 h-3 w-20" />
          <Skeleton className="mt-1 h-6 w-full" />
        </>
      )}
    </button>
  );
}, (prev, next) => prev.price?.price === next.price?.price && prev.price?.change24h === next.price?.change24h);

function generateSparkline(): string {
  const points: string[] = [];
  let y = 12;
  for (let x = 0; x <= 100; x += 5) {
    y = Math.max(2, Math.min(22, y + (Math.random() - 0.5) * 6));
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

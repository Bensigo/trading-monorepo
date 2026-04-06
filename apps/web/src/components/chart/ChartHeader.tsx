import { TICKERS } from '@repo/shared';
import type { PriceUpdate } from '@repo/shared';
import { PriceDisplay } from '@/components/ticker/PriceDisplay';
import { TimeframeToggle } from './TimeframeToggle';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatChange } from '@/lib/utils';

interface ChartHeaderProps {
  symbol: string;
  price?: PriceUpdate;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export function ChartHeader({ symbol, price, timeframe, onTimeframeChange }: ChartHeaderProps) {
  const ticker = TICKERS.find((t) => t.symbol === symbol);
  const change = price?.change24h ?? 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{ticker?.name || symbol}</h2>
          <Badge variant={change >= 0 ? 'up' : 'down'}>{ticker?.category}</Badge>
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          {price ? (
            <>
              <PriceDisplay price={price.price} size="lg" />
              <span
                className={`font-price text-sm font-medium ${
                  change >= 0 ? 'text-up-text' : 'text-down-text'
                }`}
              >
                {formatChange(change)}
              </span>
            </>
          ) : (
            <>
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-16" />
            </>
          )}
        </div>
      </div>
      <TimeframeToggle value={timeframe} onChange={onTimeframeChange} />
    </div>
  );
}

import { TICKERS } from '@repo/shared';
import { useTickerStore } from '@/stores/tickerStore';
import { TickerCard } from './TickerCard';

export function TickerList() {
  const livePrices = useTickerStore((s) => s.livePrices);

  return (
    <div className="space-y-1">
      {TICKERS.map((ticker) => (
        <TickerCard
          key={ticker.symbol}
          symbol={ticker.symbol}
          name={ticker.name}
          price={livePrices.get(ticker.symbol)}
        />
      ))}
    </div>
  );
}

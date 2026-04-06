import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '@/api/tickers';

export function useHistoricalData(symbol: string, timeframe: string = '1m') {
  return useQuery({
    queryKey: ['history', symbol, timeframe],
    queryFn: () => fetchHistory(symbol, timeframe, 200),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!symbol,
  });
}

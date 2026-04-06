import { useQuery } from '@tanstack/react-query';
import { fetchTickers } from '@/api/tickers';

export function useTickers() {
  return useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

import { apiClient } from './client';
import type { Ticker, PriceUpdate, OHLC } from '@repo/shared';

export function fetchTickers(): Promise<{ tickers: (Ticker & PriceUpdate)[] }> {
  return apiClient<{ tickers: (Ticker & PriceUpdate)[] }>('/tickers');
}

export function fetchHistory(
  symbol: string,
  timeframe: string = '1m',
  limit: number = 200
): Promise<{ symbol: string; timeframe: string; data: OHLC[] }> {
  return apiClient<{ symbol: string; timeframe: string; data: OHLC[] }>(
    `/tickers/${symbol}/history?timeframe=${timeframe}&limit=${limit}`
  );
}

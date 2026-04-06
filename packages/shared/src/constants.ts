import type { Ticker } from './types/ticker';

export const TICKERS: Ticker[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin', category: 'crypto', basePrice: 67500, volatility: 0.03 },
  { symbol: 'ETH-USD', name: 'Ethereum', category: 'crypto', basePrice: 3450, volatility: 0.04 },
  { symbol: 'SOL-USD', name: 'Solana', category: 'crypto', basePrice: 178, volatility: 0.05 },
  { symbol: 'AAPL', name: 'Apple', category: 'stock', basePrice: 182, volatility: 0.01 },
  { symbol: 'TSLA', name: 'Tesla', category: 'stock', basePrice: 248, volatility: 0.025 },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'stock', basePrice: 875, volatility: 0.02 },
];

export const WS_RECONNECT_INTERVAL = 3000;
export const PRICE_UPDATE_THROTTLE = 100;
export const HISTORY_STALE_TIME = 5 * 60 * 1000;

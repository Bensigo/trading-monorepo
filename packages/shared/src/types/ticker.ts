export interface Ticker {
  symbol: string;
  name: string;
  category: 'crypto' | 'stock';
  basePrice: number;
  volatility: number;
}

export interface OHLC {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  change24h: number;
  changeAbsolute: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

import type { OHLC } from '@repo/shared';

const MAX_CANDLES = 43200; // 30 days of 1-min data

export class CacheStore {
  private store = new Map<string, OHLC[]>();

  getHistory(symbol: string, timeframe: string = '1m', limit: number = 100): OHLC[] {
    const raw = this.store.get(symbol) || [];

    let aggregated: OHLC[];
    switch (timeframe) {
      case '5m':
        aggregated = this.aggregate(raw, 5);
        break;
      case '1h':
        aggregated = this.aggregate(raw, 60);
        break;
      case '1d':
        aggregated = this.aggregate(raw, 1440);
        break;
      default:
        aggregated = raw;
    }

    return aggregated.slice(-limit);
  }

  appendCandle(symbol: string, candle: OHLC): void {
    if (!this.store.has(symbol)) {
      this.store.set(symbol, []);
    }
    const candles = this.store.get(symbol)!;
    candles.push(candle);

    if (candles.length > MAX_CANDLES) {
      candles.splice(0, candles.length - MAX_CANDLES);
    }
  }

  setHistory(symbol: string, candles: OHLC[]): void {
    this.store.set(symbol, candles);
  }

  private aggregate(candles: OHLC[], periodMinutes: number): OHLC[] {
    if (candles.length === 0) return [];

    const periodMs = periodMinutes * 60 * 1000;
    const result: OHLC[] = [];
    let bucket: OHLC | null = null;
    let bucketStart = 0;

    for (const candle of candles) {
      const currentBucketStart = Math.floor(candle.timestamp / periodMs) * periodMs;

      if (bucket === null || currentBucketStart !== bucketStart) {
        if (bucket) result.push(bucket);
        bucketStart = currentBucketStart;
        bucket = { ...candle, timestamp: bucketStart };
      } else {
        bucket.high = Math.max(bucket.high, candle.high);
        bucket.low = Math.min(bucket.low, candle.low);
        bucket.close = candle.close;
        bucket.volume += candle.volume;
      }
    }

    if (bucket) result.push(bucket);
    return result;
  }
}

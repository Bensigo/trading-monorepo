import { describe, it, expect, beforeEach } from 'vitest';
import { CacheStore } from '../services/cacheStore';
import type { OHLC } from '@repo/shared';

describe('CacheStore', () => {
  let store: CacheStore;

  beforeEach(() => {
    store = new CacheStore();
  });

  it('returns empty array for unknown symbol', () => {
    expect(store.getHistory('UNKNOWN')).toEqual([]);
  });

  it('appends and retrieves candles', () => {
    const candle: OHLC = {
      timestamp: 1000,
      open: 100,
      high: 110,
      low: 90,
      close: 105,
      volume: 1000,
    };

    store.appendCandle('BTC-USD', candle);
    const history = store.getHistory('BTC-USD');
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(candle);
  });

  it('respects limit parameter', () => {
    for (let i = 0; i < 10; i++) {
      store.appendCandle('BTC-USD', {
        timestamp: i * 60000,
        open: 100 + i,
        high: 110 + i,
        low: 90 + i,
        close: 105 + i,
        volume: 1000,
      });
    }

    const history = store.getHistory('BTC-USD', '1m', 5);
    expect(history).toHaveLength(5);
    expect(history[0].timestamp).toBe(5 * 60000);
  });

  it('aggregates 5-minute candles', () => {
    const baseTime = 0;
    for (let i = 0; i < 10; i++) {
      store.appendCandle('ETH-USD', {
        timestamp: baseTime + i * 60000,
        open: 100 + i,
        high: 110 + i,
        low: 90,
        close: 105 + i,
        volume: 100,
      });
    }

    const history = store.getHistory('ETH-USD', '5m', 100);
    expect(history).toHaveLength(2);
    expect(history[0].volume).toBe(500);
    expect(history[1].volume).toBe(500);
  });

  it('sets history directly', () => {
    const candles: OHLC[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { timestamp: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1500 },
    ];

    store.setHistory('SOL-USD', candles);
    expect(store.getHistory('SOL-USD')).toHaveLength(2);
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { PriceGenerator } from '../services/priceGenerator';
import { CacheStore } from '../services/cacheStore';
import type { PriceUpdate } from '@repo/shared';

describe('PriceGenerator', () => {
  let generator: PriceGenerator;
  let cacheStore: CacheStore;

  afterEach(() => {
    generator?.stop();
  });

  it('generates historical data on initialization', () => {
    cacheStore = new CacheStore();
    generator = new PriceGenerator(cacheStore);

    const btcHistory = cacheStore.getHistory('BTC-USD', '1m', 50000);
    expect(btcHistory.length).toBeGreaterThan(1000);

    const ethHistory = cacheStore.getHistory('ETH-USD', '1m', 50000);
    expect(ethHistory.length).toBeGreaterThan(1000);
  });

  it('returns current prices for all tickers', () => {
    cacheStore = new CacheStore();
    generator = new PriceGenerator(cacheStore);

    const prices = generator.getCurrentPrices();
    expect(prices).toHaveLength(6);
    expect(prices[0].symbol).toBe('BTC-USD');
    expect(prices[0].price).toBeGreaterThan(0);
    expect(prices[0].timestamp).toBeGreaterThan(0);
  });

  it('emits tick events when started', async () => {
    cacheStore = new CacheStore();
    generator = new PriceGenerator(cacheStore);

    const updates = await new Promise<PriceUpdate[]>((resolve) => {
      generator.on('tick', (data: PriceUpdate[]) => {
        generator.stop();
        resolve(data);
      });
      generator.start();
    });

    expect(updates).toHaveLength(6);
    expect(updates[0]).toHaveProperty('symbol');
    expect(updates[0]).toHaveProperty('price');
    expect(updates[0]).toHaveProperty('change24h');
  });

  it('prices change between ticks', async () => {
    cacheStore = new CacheStore();
    generator = new PriceGenerator(cacheStore);

    const firstPrices = generator.getCurrentPrices();

    const secondPrices = await new Promise<PriceUpdate[]>((resolve) => {
      generator.on('tick', (data: PriceUpdate[]) => {
        generator.stop();
        resolve(data);
      });
      generator.start();
    });

    // At least one price should differ (extremely unlikely all stay same)
    const anyDifferent = firstPrices.some((p, i) => p.price !== secondPrices[i].price);
    expect(anyDifferent).toBe(true);
  });
});

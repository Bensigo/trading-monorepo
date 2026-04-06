import { EventEmitter } from 'events';
import { TICKERS } from '@repo/shared';
import type { PriceUpdate, OHLC } from '@repo/shared';
import { CacheStore } from './cacheStore';
import { randomNormal, roundToDecimals } from '../utils/math';
import { config } from '../config';

interface TickerState {
  currentPrice: number;
  previousPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  openPrice24h: number;
}

export class PriceGenerator extends EventEmitter {
  private state = new Map<string, TickerState>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private cacheStore: CacheStore;

  constructor(cacheStore: CacheStore) {
    super();
    this.cacheStore = cacheStore;
    this.initializeState();
    this.generateHistoricalData();
  }

  private initializeState(): void {
    for (const ticker of TICKERS) {
      this.state.set(ticker.symbol, {
        currentPrice: ticker.basePrice,
        previousPrice: ticker.basePrice,
        high24h: ticker.basePrice * 1.02,
        low24h: ticker.basePrice * 0.98,
        volume24h: this.generateBaseVolume(ticker.basePrice),
        openPrice24h: ticker.basePrice,
      });
    }
  }

  private generateBaseVolume(price: number): number {
    return roundToDecimals(price * (50000 + Math.random() * 100000), 0);
  }

  private generateHistoricalData(): void {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const oneMinuteMs = 60 * 1000;

    for (const ticker of TICKERS) {
      const candles: OHLC[] = [];
      let price = ticker.basePrice * (0.9 + Math.random() * 0.2);

      for (let t = now - thirtyDaysMs; t < now; t += oneMinuteMs) {
        const dt = 1 / (24 * 60);
        const drift = 0;
        const change = Math.exp(
          (drift - 0.5 * ticker.volatility * ticker.volatility) * dt +
          ticker.volatility * Math.sqrt(dt) * randomNormal()
        );
        const open = price;
        price = roundToDecimals(price * change, 2);

        const intraHigh = Math.max(open, price) * (1 + Math.random() * 0.002);
        const intraLow = Math.min(open, price) * (1 - Math.random() * 0.002);

        candles.push({
          timestamp: t,
          open: roundToDecimals(open, 2),
          high: roundToDecimals(intraHigh, 2),
          low: roundToDecimals(intraLow, 2),
          close: roundToDecimals(price, 2),
          volume: roundToDecimals(ticker.basePrice * (100 + Math.random() * 500), 0),
        });
      }

      this.cacheStore.setHistory(ticker.symbol, candles);

      // Set current price to last candle close
      const lastCandle = candles[candles.length - 1];
      const state = this.state.get(ticker.symbol)!;
      state.currentPrice = lastCandle.close;
      state.previousPrice = lastCandle.close;
      state.openPrice24h = candles[Math.max(0, candles.length - 1440)]?.open || lastCandle.open;
      state.high24h = Math.max(...candles.slice(-1440).map(c => c.high));
      state.low24h = Math.min(...candles.slice(-1440).map(c => c.low));
    }
  }

  start(): void {
    if (this.interval) return;

    let lastCandleTime = Math.floor(Date.now() / 60000) * 60000;

    this.interval = setInterval(() => {
      const updates: PriceUpdate[] = [];
      const now = Date.now();
      const currentCandleTime = Math.floor(now / 60000) * 60000;

      for (const ticker of TICKERS) {
        const state = this.state.get(ticker.symbol)!;
        const dt = config.tickInterval / (24 * 60 * 60 * 1000);
        const change = Math.exp(
          (0 - 0.5 * ticker.volatility * ticker.volatility) * dt +
          ticker.volatility * Math.sqrt(dt) * randomNormal()
        );

        state.previousPrice = state.currentPrice;
        state.currentPrice = roundToDecimals(state.currentPrice * change, 2);

        state.high24h = Math.max(state.high24h, state.currentPrice);
        state.low24h = Math.min(state.low24h, state.currentPrice);
        state.volume24h += roundToDecimals(ticker.basePrice * Math.random() * 10, 0);

        const change24h = ((state.currentPrice - state.openPrice24h) / state.openPrice24h) * 100;

        updates.push({
          symbol: ticker.symbol,
          price: state.currentPrice,
          timestamp: now,
          change24h: roundToDecimals(change24h, 2),
          changeAbsolute: roundToDecimals(state.currentPrice - state.openPrice24h, 2),
          volume24h: state.volume24h,
          high24h: state.high24h,
          low24h: state.low24h,
        });

        // Append candle on minute boundary
        if (currentCandleTime > lastCandleTime) {
          this.cacheStore.appendCandle(ticker.symbol, {
            timestamp: lastCandleTime,
            open: state.previousPrice,
            high: Math.max(state.previousPrice, state.currentPrice),
            low: Math.min(state.previousPrice, state.currentPrice),
            close: state.currentPrice,
            volume: roundToDecimals(ticker.basePrice * (100 + Math.random() * 500), 0),
          });
        }
      }

      if (currentCandleTime > lastCandleTime) {
        lastCandleTime = currentCandleTime;
      }

      this.emit('tick', updates);
    }, config.tickInterval);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getCurrentPrices(): PriceUpdate[] {
    const now = Date.now();
    return TICKERS.map(ticker => {
      const state = this.state.get(ticker.symbol)!;
      const change24h = ((state.currentPrice - state.openPrice24h) / state.openPrice24h) * 100;
      return {
        symbol: ticker.symbol,
        price: state.currentPrice,
        timestamp: now,
        change24h: roundToDecimals(change24h, 2),
        changeAbsolute: roundToDecimals(state.currentPrice - state.openPrice24h, 2),
        volume24h: state.volume24h,
        high24h: state.high24h,
        low24h: state.low24h,
      };
    });
  }
}

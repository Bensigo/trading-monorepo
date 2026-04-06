import { Router } from 'express';
import { TICKERS } from '@repo/shared';
import type { CacheStore } from '../services/cacheStore';
import type { PriceGenerator } from '../services/priceGenerator';

export function tickersRouter(cacheStore: CacheStore, priceGenerator: PriceGenerator): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    const prices = priceGenerator.getCurrentPrices();
    const tickers = TICKERS.map(ticker => {
      const price = prices.find(p => p.symbol === ticker.symbol);
      return { ...ticker, ...price };
    });
    res.json({ tickers });
  });

  router.get('/:symbol/history', (req, res) => {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as string) || '1m';
    const limit = parseInt((req.query.limit as string) || '100', 10);

    const ticker = TICKERS.find(t => t.symbol === symbol);
    if (!ticker) {
      res.status(404).json({ error: 'Ticker not found' });
      return;
    }

    const history = cacheStore.getHistory(symbol, timeframe, limit);
    res.json({ symbol, timeframe, data: history });
  });

  return router;
}

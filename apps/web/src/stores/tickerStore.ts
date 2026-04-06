import { create } from 'zustand';
import type { PriceUpdate } from '@repo/shared';

interface TickerStore {
  selectedTicker: string;
  livePrices: Map<string, PriceUpdate>;
  setSelectedTicker: (symbol: string) => void;
  updatePrice: (update: PriceUpdate) => void;
  updatePrices: (updates: PriceUpdate[]) => void;
}

export const useTickerStore = create<TickerStore>((set) => ({
  selectedTicker: 'BTC-USD',
  livePrices: new Map(),
  setSelectedTicker: (symbol) => set({ selectedTicker: symbol }),
  updatePrice: (update) =>
    set((state) => {
      const newPrices = new Map(state.livePrices);
      newPrices.set(update.symbol, update);
      return { livePrices: newPrices };
    }),
  updatePrices: (updates) =>
    set((state) => {
      const newPrices = new Map(state.livePrices);
      for (const update of updates) {
        newPrices.set(update.symbol, update);
      }
      return { livePrices: newPrices };
    }),
}));

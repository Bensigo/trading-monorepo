import type { PriceUpdate } from './ticker';

export type WSClientMessage =
  | { type: 'subscribe'; symbols: string[] }
  | { type: 'unsubscribe'; symbols: string[] };

export type WSServerMessage =
  | { type: 'tick'; data: PriceUpdate }
  | { type: 'subscribed'; symbols: string[] }
  | { type: 'error'; message: string };

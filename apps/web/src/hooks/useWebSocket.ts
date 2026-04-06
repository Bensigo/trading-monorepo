import { useEffect, useRef, useCallback } from 'react';
import type { PriceUpdate, WSServerMessage } from '@repo/shared';
import { useTickerStore } from '@/stores/tickerStore';
import { PRICE_UPDATE_THROTTLE } from '@repo/shared';

export function useWebSocket(enabled: boolean) {
  const wsRef = useRef<WebSocket | null>(null);
  const pendingUpdates = useRef<Map<string, PriceUpdate>>(new Map());
  const rafRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(1000);
  const updatePrices = useTickerStore((s) => s.updatePrices);

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.size > 0) {
      updatePrices(Array.from(pendingUpdates.current.values()));
      pendingUpdates.current.clear();
    }
  }, [updatePrices]);

  useEffect(() => {
    if (!enabled) return;

    let throttleTimer: ReturnType<typeof setInterval> | null = null;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay.current = 1000;
        // Subscribe to all tickers
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'AAPL', 'TSLA', 'NVDA'],
          })
        );

        // Start throttled flush
        throttleTimer = setInterval(flushUpdates, PRICE_UPDATE_THROTTLE);
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);
          if (msg.type === 'tick') {
            pendingUpdates.current.set(msg.data.symbol, msg.data);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = (event) => {
        if (throttleTimer) clearInterval(throttleTimer);
        wsRef.current = null;

        // Don't reconnect if 401 (auth failure)
        if (event.code === 1008 || event.reason === 'Unauthorized') return;

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 16000);
          connect();
        }, reconnectDelay.current);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (throttleTimer) clearInterval(throttleTimer);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, flushUpdates]);

  return wsRef;
}

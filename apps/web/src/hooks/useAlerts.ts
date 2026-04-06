import { useEffect, useRef } from 'react';
import { useAlertStore } from '@/stores/alertStore';
import { useTickerStore } from '@/stores/tickerStore';

export function useAlertChecker() {
  const alerts = useAlertStore((s) => s.alerts);
  const triggerAlert = useAlertStore((s) => s.triggerAlert);
  const livePrices = useTickerStore((s) => s.livePrices);
  const toastCallbackRef = useRef<((alert: { symbol: string; direction: string; targetPrice: number; price: number }) => void) | null>(null);

  useEffect(() => {
    for (const alert of alerts) {
      if (!alert.active) continue;
      const price = livePrices.get(alert.symbol);
      if (!price) continue;

      const triggered =
        (alert.direction === 'above' && price.price >= alert.targetPrice) ||
        (alert.direction === 'below' && price.price <= alert.targetPrice);

      if (triggered) {
        triggerAlert(alert.id);
        toastCallbackRef.current?.({
          symbol: alert.symbol,
          direction: alert.direction,
          targetPrice: alert.targetPrice,
          price: price.price,
        });
      }
    }
  }, [alerts, livePrices, triggerAlert]);

  return toastCallbackRef;
}

import { create } from 'zustand';

export interface PriceAlert {
  id: string;
  symbol: string;
  direction: 'above' | 'below';
  targetPrice: number;
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}

interface AlertStore {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>) => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string) => void;
}

const loadAlerts = (): PriceAlert[] => {
  try {
    const stored = localStorage.getItem('price-alerts');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveAlerts = (alerts: PriceAlert[]) => {
  localStorage.setItem('price-alerts', JSON.stringify(alerts));
};

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: loadAlerts(),

  addAlert: (alert) =>
    set((state) => {
      const newAlert: PriceAlert = {
        ...alert,
        id: crypto.randomUUID(),
        active: true,
        createdAt: Date.now(),
      };
      const alerts = [...state.alerts, newAlert];
      saveAlerts(alerts);
      return { alerts };
    }),

  removeAlert: (id) =>
    set((state) => {
      const alerts = state.alerts.filter((a) => a.id !== id);
      saveAlerts(alerts);
      return { alerts };
    }),

  triggerAlert: (id) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id ? { ...a, active: false, triggeredAt: Date.now() } : a
      );
      saveAlerts(alerts);
      return { alerts };
    }),
}));

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PriceChart } from '@/components/chart/PriceChart';
import { AlertPanel } from '@/components/alerts/AlertPanel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAlertChecker } from '@/hooks/useAlerts';
import { useToast } from '@/components/ui/toast';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useWebSocket(true);

  const { toast } = useToast();
  const toastCallbackRef = useAlertChecker();
  toastCallbackRef.current = (alert) => {
    toast({
      title: `Price Alert: ${alert.symbol}`,
      description: `Price ${alert.direction} $${alert.targetPrice.toLocaleString()} (now $${alert.price.toLocaleString()})`,
      variant: 'success',
    });
  };

  return (
    <div className="flex h-screen flex-col">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
          <PriceChart />
          <AlertPanel />
        </main>
      </div>
    </div>
  );
}

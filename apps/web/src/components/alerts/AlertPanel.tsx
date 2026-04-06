import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAlertStore } from '@/stores/alertStore';
import { AlertForm } from './AlertForm';
import { formatPrice } from '@/lib/utils';

export function AlertPanel() {
  const [formOpen, setFormOpen] = useState(false);
  const alerts = useAlertStore((s) => s.alerts);
  const removeAlert = useAlertStore((s) => s.removeAlert);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Price Alerts</h3>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            + New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No alerts configured. Create one to get notified when prices hit your targets.
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{alert.symbol}</span>
                  <Badge variant={alert.direction === 'above' ? 'up' : 'down'}>
                    {alert.direction === 'above' ? '\u25B2 Above' : '\u25BC Below'}
                  </Badge>
                  <span className="font-price text-sm font-medium">
                    ${formatPrice(alert.targetPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {alert.triggeredAt && (
                    <span className="text-xs text-slate-400">Triggered</span>
                  )}
                  {alert.active && (
                    <span className="h-2 w-2 rounded-full bg-up animate-pulse" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-down-text"
                    onClick={() => removeAlert(alert.id)}
                  >
                    &times;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <AlertForm open={formOpen} onClose={() => setFormOpen(false)} />
    </Card>
  );
}

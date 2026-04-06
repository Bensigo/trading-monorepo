import { useState, type FormEvent } from 'react';
import { TICKERS } from '@repo/shared';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertStore } from '@/stores/alertStore';
import { useTickerStore } from '@/stores/tickerStore';

interface AlertFormProps {
  open: boolean;
  onClose: () => void;
}

export function AlertForm({ open, onClose }: AlertFormProps) {
  const selectedTicker = useTickerStore((s) => s.selectedTicker);
  const addAlert = useAlertStore((s) => s.addAlert);
  const [symbol, setSymbol] = useState(selectedTicker);
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    addAlert({ symbol, direction, targetPrice: price });
    setTargetPrice('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Create Price Alert</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ticker</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-border bg-transparent px-3 py-1 text-sm"
          >
            {TICKERS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol} — {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Direction</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={direction === 'above' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDirection('above')}
            >
              Price Above
            </Button>
            <Button
              type="button"
              variant={direction === 'below' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDirection('below')}
            >
              Price Below
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Target Price ($)</label>
          <Input
            type="number"
            step="any"
            min="0"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter price..."
            required
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Alert</Button>
        </div>
      </form>
    </Dialog>
  );
}

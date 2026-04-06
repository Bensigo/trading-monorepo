import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIMEFRAMES = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '1h', label: '1H' },
  { value: '1d', label: '1D' },
];

interface TimeframeToggleProps {
  value: string;
  onChange: (tf: string) => void;
}

export function TimeframeToggle({ value, onChange }: TimeframeToggleProps) {
  return (
    <div className="flex gap-1">
      {TIMEFRAMES.map((tf) => (
        <Button
          key={tf.value}
          variant={value === tf.value ? 'default' : 'ghost'}
          size="sm"
          className={cn('text-xs px-2.5', value === tf.value && 'pointer-events-none')}
          onClick={() => onChange(tf.value)}
        >
          {tf.label}
        </Button>
      ))}
    </div>
  );
}

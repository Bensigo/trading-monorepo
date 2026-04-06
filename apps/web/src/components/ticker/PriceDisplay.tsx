import { memo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceDisplay = memo(function PriceDisplay({ price, size = 'md' }: PriceDisplayProps) {
  const prevPriceRef = useRef(price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price !== prevPriceRef.current) {
      setFlash(price > prevPriceRef.current ? 'up' : 'down');
      prevPriceRef.current = price;
      const timer = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(timer);
    }
  }, [price]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg font-semibold',
    lg: 'text-3xl font-bold',
  };

  return (
    <span
      className={cn(
        'font-price inline-block rounded px-1 transition-colors',
        sizeClasses[size],
        flash === 'up' && 'animate-price-flash-up',
        flash === 'down' && 'animate-price-flash-down'
      )}
    >
      ${formatPrice(price)}
    </span>
  );
}, (prev, next) => prev.price === next.price && prev.size === next.size);

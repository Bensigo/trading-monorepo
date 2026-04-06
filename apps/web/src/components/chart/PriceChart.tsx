import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartHeader } from './ChartHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useTickerStore } from '@/stores/tickerStore';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { formatPrice } from '@/lib/utils';

export function PriceChart() {
  const selectedTicker = useTickerStore((s) => s.selectedTicker);
  const livePrices = useTickerStore((s) => s.livePrices);
  const [timeframe, setTimeframe] = useState('1m');

  const { data: historyData, isLoading } = useHistoricalData(selectedTicker, timeframe);
  const currentPrice = livePrices.get(selectedTicker);

  const chartData = useMemo(() => {
    if (!historyData?.data) return [];
    const points = historyData.data.map((candle) => ({
      time: candle.timestamp,
      price: candle.close,
      high: candle.high,
      low: candle.low,
      volume: candle.volume,
    }));

    // Append live price as last point
    if (currentPrice) {
      points.push({
        time: currentPrice.timestamp,
        price: currentPrice.price,
        high: currentPrice.price,
        low: currentPrice.price,
        volume: 0,
      });
    }

    return points;
  }, [historyData, currentPrice]);

  const priceChange = chartData.length >= 2
    ? chartData[chartData.length - 1].price - chartData[0].price
    : 0;
  const isUp = priceChange >= 0;
  const color = isUp ? '#22C55E' : '#EF4444';

  return (
    <Card>
      <CardContent className="pt-4">
        <ChartHeader
          symbol={selectedTicker}
          price={currentPrice}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
        <div className="mt-4 h-[280px] lg:h-[400px]">
          {isLoading ? (
            <div className="flex h-full flex-col justify-between py-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => {
                    const d = new Date(t);
                    return timeframe === '1d'
                      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  }}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `$${formatPrice(v)}`}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(t) => new Date(t).toLocaleString()}
                  formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={color}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

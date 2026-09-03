import type { Candle } from "@/lib/market/types";

type MarketChartProps = {
  candles: Candle[];
};

export function MarketChart({ candles }: MarketChartProps) {
  const visible = candles.slice(-42);
  const lows = visible.map((candle) => candle.low);
  const highs = visible.map((candle) => candle.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || 1;

  return (
    <div className="h-72 border border-border bg-background p-4">
      <div className="flex h-full items-end gap-1 border-b border-l border-chart-grid px-3 pb-3">
        {visible.map((candle) => {
          const height = ((candle.high - candle.low) / range) * 100;
          const offset = ((candle.low - min) / range) * 100;
          const positive = candle.close >= candle.open;

          return (
            <div className="relative h-full flex-1" key={candle.timestamp}>
              <div
                className={positive ? "absolute w-full bg-positive" : "absolute w-full bg-negative"}
                style={{ bottom: `${offset}%`, height: `${Math.max(height, 3)}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

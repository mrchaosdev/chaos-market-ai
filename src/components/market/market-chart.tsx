import type { Candle } from "@/lib/market/types";

type MarketChartProps = {
  candles: Candle[];
};

export function MarketChart({ candles }: MarketChartProps) {
  const visible = candles.slice(-48);
  const lows = visible.map((candle) => candle.low);
  const highs = visible.map((candle) => candle.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || 1;

  return (
    <div className="chaos-cut relative h-80 overflow-hidden border border-border bg-background p-4">
      <div className="chaos-lattice absolute inset-0 opacity-25" />
      <div className="relative flex h-full items-end gap-1 border-b border-l border-chart-grid px-3 pb-3">
        <div className="absolute left-3 right-0 top-1/4 h-px bg-border" />
        <div className="absolute left-3 right-0 top-1/2 h-px bg-border" />
        <div className="absolute left-3 right-0 top-3/4 h-px bg-border" />
        {visible.map((candle) => {
          const wickHeight = ((candle.high - candle.low) / range) * 100;
          const wickOffset = ((candle.low - min) / range) * 100;
          const bodyHeight = (Math.abs(candle.close - candle.open) / range) * 100;
          const bodyOffset = ((Math.min(candle.open, candle.close) - min) / range) * 100;
          const positive = candle.close >= candle.open;

          return (
            <div className="relative h-full flex-1" key={candle.timestamp}>
              <div
                className={positive ? "absolute left-1/2 w-px -translate-x-1/2 bg-positive-muted" : "absolute left-1/2 w-px -translate-x-1/2 bg-negative-muted"}
                style={{ bottom: `${wickOffset}%`, height: `${Math.max(wickHeight, 3)}%` }}
              />
              <div
                className={positive ? "absolute w-full bg-positive" : "absolute w-full bg-negative"}
                style={{ bottom: `${bodyOffset}%`, height: `${Math.max(bodyHeight, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

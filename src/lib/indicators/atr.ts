import type { Candle } from "@/lib/market/types";

export function calculateATR(candles: Candle[], period = 14): number | null {
  if (candles.length <= period) {
    return null;
  }

  const recent = candles.slice(-period);
  const ranges = recent.map((candle, index) => {
    const previousClose = index === 0 ? candle.close : recent[index - 1].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });

  return ranges.reduce((total, range) => total + range, 0) / period;
}

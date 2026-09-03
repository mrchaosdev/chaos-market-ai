import { describe, expect, it } from "vitest";
import { calculateSupportResistance } from "../../src/lib/analysis/support-resistance";
import { calculateMarketStructure } from "../../src/lib/analysis/market-structure";
import { calculateSignalScore } from "../../src/lib/analysis/signal-engine";
import { compareSignals, maxSignalScore, normalizeSignal, signalComponentMax } from "../../src/lib/analysis/comparison";
import type { Candle } from "../../src/lib/market/types";

function candlesFrom(closes: number[]): Candle[] {
  return closes.map((close, index) => ({
    timestamp: index * 1000,
    open: close,
    high: close + 1,
    low: close - 1,
    close,
    volume: 100,
  }));
}

describe("support and resistance", () => {
  it("selects the nearest swing low below price and swing high above price", () => {
    const candles = candlesFrom([10, 6, 10, 14, 20, 14, 9, 13, 18, 13, 11]);
    const levels = calculateSupportResistance(candles, { pivotStrength: 2 });

    expect(levels.support).not.toBeNull();
    expect(levels.resistance).not.toBeNull();
    expect(levels.support as number).toBeLessThan(11);
    expect(levels.resistance as number).toBeGreaterThan(11);
  });

  it("falls back to window extremes when no pivot qualifies", () => {
    const candles = candlesFrom([1, 2, 3, 4, 5]);
    const levels = calculateSupportResistance(candles, { pivotStrength: 2 });

    expect(levels.support).toBe(0);
    expect(levels.resistance).toBe(6);
  });

  it("returns null levels for an empty series", () => {
    expect(calculateSupportResistance([])).toEqual({ support: null, resistance: null });
  });
});

describe("volatility classification", () => {
  const base = { candles: candlesFrom([100, 100, 100]), ema20: 99, ema50: 98, rsi: 55, volumeChange: 0 };

  it("classifies a wide ATR ratio as high", () => {
    expect(calculateMarketStructure({ ...base, atr: 4 }).volatility).toBe("high");
  });

  it("classifies a mid ATR ratio as medium", () => {
    expect(calculateMarketStructure({ ...base, atr: 2 }).volatility).toBe("medium");
  });

  it("classifies a tight ATR ratio as low", () => {
    expect(calculateMarketStructure({ ...base, atr: 0.5 }).volatility).toBe("low");
  });

  it("falls back to medium without an ATR value", () => {
    expect(calculateMarketStructure({ ...base, atr: null }).volatility).toBe("medium");
  });
});

describe("signal component weighting", () => {
  const bullish = {
    structure: { trend: "bullish", momentum: "strong", volatility: "medium", volume: "expanding", support: 1, resistance: 2 } as const,
    funding: { symbol: "BTCUSDT", rate: 0.0001 },
    orderBook: { bids: [{ price: 1, quantity: 10 }], asks: [{ price: 2, quantity: 1 }], timestamp: 0 },
  };

  it("gives trend the largest weight of any component", () => {
    const signal = calculateSignalScore(bullish);
    const others = Object.entries(signal.components).filter(([key]) => key !== "trend");

    for (const [, value] of others) {
      expect(signal.components.trend).toBeGreaterThanOrEqual(value);
    }
  });

  it("sums components into the total score and never exceeds the maximum", () => {
    const signal = calculateSignalScore(bullish);

    expect(signal.score).toBe(Object.values(signal.components).reduce((total, value) => total + value, 0));
    expect(signal.score).toBeLessThanOrEqual(maxSignalScore);

    for (const [component, value] of Object.entries(signal.components)) {
      expect(value).toBeLessThanOrEqual(signalComponentMax[component as keyof typeof signalComponentMax]);
    }
  });

  it("lowers the score when the structure degrades", () => {
    const bearish = calculateSignalScore({
      ...bullish,
      structure: { trend: "bearish", momentum: "weak", volatility: "high", volume: "declining", support: 1, resistance: 2 },
      orderBook: { bids: [{ price: 1, quantity: 1 }], asks: [{ price: 2, quantity: 12 }], timestamp: 0 },
    });

    expect(bearish.score).toBeLessThan(calculateSignalScore(bullish).score);
    expect(bearish.bias).toBe("bearish");
  });

  it("normalizes every dimension into a 0-100 range", () => {
    const values = normalizeSignal(calculateSignalScore(bullish));

    for (const value of Object.values(values)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("reports no leader when assets are identical", () => {
    const signal = calculateSignalScore(bullish);
    const comparison = compareSignals([
      { symbol: "BTCUSDT", signal },
      { symbol: "ETHUSDT", signal },
    ]);

    expect(comparison.relativeStrength).toBeNull();
  });
});

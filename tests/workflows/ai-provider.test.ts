import { describe, expect, it } from "vitest";
import { LocalProvider } from "../../src/lib/ai/providers/local";
import type { AnalysisContext } from "../../src/lib/ai/types";

const context: AnalysisContext = {
  symbol: "BTCUSDT",
  timeframe: "4h",
  market: {
    price: 112481.32,
    change24hPercent: 2.31,
    volume24h: 42810,
  },
  structure: {
    trend: "bullish",
    momentum: "moderate",
    volatility: "medium",
    volume: "expanding",
    support: 108000,
    resistance: 115000,
  },
  indicators: {
    rsi: 61.4,
    ema20: 111400,
    ema50: 109800,
    atr: 1280,
  },
  funding: {
    rate: 0.0001,
  },
  signal: {
    score: 72,
    bias: "bullish",
  },
};

describe("local ai provider", () => {
  it("returns structured interpretation", async () => {
    const result = await new LocalProvider().analyze(context);

    expect(result.bias).toBe("bullish");
    expect(result.conclusion).toContain("Not a trading instruction");
    expect(result.observations.length).toBeGreaterThan(0);
  });
});

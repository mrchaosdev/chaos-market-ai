import { describe, expect, it } from "vitest";
import { calculateSignalScore } from "../../src/lib/analysis/signal-engine";

describe("signal engine", () => {
  it("returns deterministic signal score", () => {
    const signal = calculateSignalScore({
      structure: {
        trend: "bullish",
        momentum: "moderate",
        volatility: "medium",
        volume: "expanding",
        support: 100,
        resistance: 120,
      },
      funding: { symbol: "BTCUSDT", rate: 0.0001 },
      orderBook: {
        bids: [{ price: 100, quantity: 2 }],
        asks: [{ price: 101, quantity: 1 }],
        timestamp: 1,
      },
    });

    expect(signal.score).toBe(91);
    expect(signal.bias).toBe("strong-bullish");
  });
});

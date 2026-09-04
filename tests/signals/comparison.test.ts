import { describe, expect, it } from "vitest";
import { compareAssets, type ComparisonInput } from "../../src/lib/analysis/comparison";
import { calculateSignalScore } from "../../src/lib/analysis/signal-engine";

const structure = { trend: "bullish", momentum: "strong", volatility: "medium", volume: "expanding", support: 1, resistance: 2 } as const;

const signal = calculateSignalScore({
  structure,
  funding: { symbol: "X", rate: 0.0001 },
  orderBook: { bids: [{ price: 1, quantity: 10 }], asks: [{ price: 2, quantity: 1 }], timestamp: 0 },
});

function asset(overrides: Partial<ComparisonInput> & { symbol: string }): ComparisonInput {
  return {
    price: 100,
    indicators: { ema20: 98, ema50: 95, rsi: 60, atr: 2, volumeChange: 10 },
    structure,
    fundingRate: 0.0001,
    signal,
    ...overrides,
  };
}

function row(result: ReturnType<typeof compareAssets>, dimension: string) {
  const found = result.rows.find((entry) => entry.dimension === dimension);

  if (!found) {
    throw new Error(`missing dimension ${dimension}`);
  }

  return found;
}

describe("asset comparison", () => {
  it("separates two assets that the bucketed signal components would tie", () => {
    // Both are bullish / strong / expanding, so every signal component is identical.
    const result = compareAssets([
      asset({ symbol: "BTCUSDT", price: 100, indicators: { ema20: 98, ema50: 95, rsi: 72, atr: 2, volumeChange: 40 } }),
      asset({ symbol: "ETHUSDT", price: 100, indicators: { ema20: 99, ema50: 99, rsi: 61, atr: 5, volumeChange: 12 } }),
    ]);

    expect(row(result, "trend").leader).toBe("BTCUSDT");
    expect(row(result, "momentum").leader).toBe("BTCUSDT");
    expect(row(result, "volume").leader).toBe("BTCUSDT");
    expect(row(result, "risk").leader).toBe("BTCUSDT");

    const undecided = result.rows.filter((entry) => entry.leader === null);
    expect(undecided.map((entry) => entry.dimension)).toEqual(["funding", "total"]);
  });

  it("treats lower funding pressure and lower volatility as the stronger side", () => {
    const result = compareAssets([
      asset({ symbol: "CALM", fundingRate: 0.00005, indicators: { ema20: 98, ema50: 95, rsi: 60, atr: 1, volumeChange: 10 } }),
      asset({ symbol: "HOT", fundingRate: 0.0009, indicators: { ema20: 98, ema50: 95, rsi: 60, atr: 9, volumeChange: 10 } }),
    ]);

    expect(row(result, "funding").leader).toBe("CALM");
    expect(row(result, "risk").leader).toBe("CALM");
    expect(row(result, "funding").higherIsStronger).toBe(false);
    expect(row(result, "risk").higherIsStronger).toBe(false);
  });

  it("reports no leader when the assets genuinely match", () => {
    const result = compareAssets([asset({ symbol: "BTCUSDT" }), asset({ symbol: "ETHUSDT" })]);

    expect(result.rows.every((entry) => entry.leader === null)).toBe(true);
    expect(result.relativeStrength).toBeNull();
  });

  it("shows every value with its unit rather than a bare index", () => {
    const result = compareAssets([
      asset({ symbol: "BTCUSDT" }),
      asset({ symbol: "ETHUSDT", indicators: { ema20: 99, ema50: 99, rsi: 50, atr: 4, volumeChange: -20 } }),
    ]);

    expect(row(result, "trend").readings[0].display).toBe("+5.26%");
    expect(row(result, "momentum").readings[0].display).toBe("60.0");
    expect(row(result, "volume").readings[1].display).toBe("-20.00%");
    expect(row(result, "funding").readings[0].display).toBe("0.0100%");
    expect(row(result, "total").readings[0].display).toBe(`${signal.score} / 95`);
  });

  it("marks a missing measurement as n/a instead of guessing", () => {
    const result = compareAssets([
      asset({ symbol: "BTCUSDT", indicators: { ema20: null, ema50: null, rsi: null, atr: null, volumeChange: null } }),
      asset({ symbol: "ETHUSDT" }),
    ]);

    expect(row(result, "trend").readings[0].display).toBe("n/a");
    expect(row(result, "momentum").readings[0].value).toBeNull();
    // A single measured side cannot be a leader over an unmeasured one.
    expect(row(result, "trend").leader).toBeNull();
  });

  it("relative strength follows the signal alignment row", () => {
    const weaker = calculateSignalScore({
      structure: { ...structure, trend: "bearish", momentum: "weak" },
      funding: { symbol: "X", rate: 0.0001 },
      orderBook: { bids: [{ price: 1, quantity: 1 }], asks: [{ price: 2, quantity: 9 }], timestamp: 0 },
    });

    const result = compareAssets([asset({ symbol: "BTCUSDT" }), asset({ symbol: "ETHUSDT", signal: weaker })]);

    expect(result.relativeStrength).toBe("BTCUSDT");
    expect(row(result, "total").leader).toBe("BTCUSDT");
  });
});

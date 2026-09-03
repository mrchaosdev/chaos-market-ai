import { describe, expect, it } from "vitest";
import { calculateEMA } from "../../src/lib/indicators/ema";
import { calculateRSI } from "../../src/lib/indicators/rsi";

const values = Array.from({ length: 30 }).map((_, index) => index + 1);

describe("indicators", () => {
  it("calculates EMA series", () => {
    expect(calculateEMA(values, 20)).toHaveLength(values.length);
  });

  it("calculates RSI", () => {
    expect(calculateRSI(values)).toBe(100);
  });
});

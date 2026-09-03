import { describe, expect, it } from "vitest";
import { calculateRSI } from "../../src/lib/indicators/rsi";

describe("wilder rsi", () => {
  it("returns null without enough history", () => {
    expect(calculateRSI([1, 2, 3])).toBeNull();
  });

  it("returns 100 for an uninterrupted advance", () => {
    expect(calculateRSI(Array.from({ length: 30 }).map((_, index) => index + 1))).toBe(100);
  });

  it("returns 0 for an uninterrupted decline", () => {
    expect(calculateRSI(Array.from({ length: 30 }).map((_, index) => 100 - index))).toBe(0);
  });

  it("returns 50 for a flat series", () => {
    expect(calculateRSI(Array.from({ length: 30 }).fill(100) as number[])).toBe(50);
  });

  it("matches the published Wilder reference for the first fourteen periods", () => {
    const closes = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28];

    expect(calculateRSI(closes) as number).toBeCloseTo(70.46, 1);
  });

  it("smooths later moves instead of only reading the last window", () => {
    const closes = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28];
    const withPullback = [...closes, 46.0, 46.03, 46.41, 46.22, 45.64];

    const initial = calculateRSI(closes) as number;
    const smoothed = calculateRSI(withPullback) as number;

    expect(smoothed).toBeLessThan(initial);
    expect(smoothed).toBeGreaterThan(50);
  });
});

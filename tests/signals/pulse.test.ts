import { describe, expect, it } from "vitest";
import { derivePulse, heartbeat, maxAmplitude, minAmplitude, type PulseInput } from "../../src/lib/analysis/pulse";

const base: PulseInput = { volatility: "medium", trend: "bullish", volume: "stable", signalScore: 50 };

describe("pulse mapping", () => {
  it("raises the rate with volatility", () => {
    const low = derivePulse({ ...base, volatility: "low" }).bpm;
    const medium = derivePulse({ ...base, volatility: "medium" }).bpm;
    const high = derivePulse({ ...base, volatility: "high" }).bpm;

    expect(low).toBeLessThan(medium);
    expect(medium).toBeLessThan(high);
  });

  it("lets volume state nudge the rate in both directions", () => {
    expect(derivePulse({ ...base, volume: "expanding" }).bpm).toBeGreaterThan(derivePulse(base).bpm);
    expect(derivePulse({ ...base, volume: "declining" }).bpm).toBeLessThan(derivePulse(base).bpm);
  });

  it("keeps the cycle consistent with the rate", () => {
    const pulse = derivePulse(base);

    expect(pulse.cycleMs).toBeCloseTo((60 / pulse.bpm) * 1000, 6);
  });

  it("scales amplitude with signal alignment inside the documented bounds", () => {
    expect(derivePulse({ ...base, signalScore: 0 }).amplitude).toBeCloseTo(minAmplitude, 6);
    expect(derivePulse({ ...base, signalScore: 100 }).amplitude).toBeCloseTo(maxAmplitude, 6);
    expect(derivePulse({ ...base, signalScore: 250 }).amplitude).toBeCloseTo(maxAmplitude, 6);
    expect(derivePulse({ ...base, signalScore: -40 }).amplitude).toBeCloseTo(minAmplitude, 6);
  });

  it("maps trend to a market tone, never to a decorative colour", () => {
    expect(derivePulse({ ...base, trend: "bullish" }).tone).toBe("positive");
    expect(derivePulse({ ...base, trend: "bearish" }).tone).toBe("negative");
    expect(derivePulse({ ...base, trend: "neutral" }).tone).toBe("neutral");
  });

  it("is deterministic for the same market structure", () => {
    expect(derivePulse(base)).toEqual(derivePulse(base));
  });
});

describe("heartbeat envelope", () => {
  it("rests at the start and end of the cycle", () => {
    expect(heartbeat(0)).toBeCloseTo(0, 6);
    expect(heartbeat(0.9)).toBeLessThan(0.01);
  });

  it("peaks on the systolic beat", () => {
    expect(heartbeat(0.045)).toBeCloseTo(1, 3);
  });

  it("produces a second, weaker dicrotic beat", () => {
    const systolic = heartbeat(0.045);
    const dicrotic = heartbeat(0.228);

    expect(dicrotic).toBeGreaterThan(0.1);
    expect(dicrotic).toBeLessThan(systolic);
  });

  it("dips between the two beats so they read as lub-dub", () => {
    const trough = heartbeat(0.13);

    expect(trough).toBeLessThan(heartbeat(0.045));
    expect(trough).toBeLessThan(heartbeat(0.228));
  });

  it("never goes negative", () => {
    for (let phase = 0; phase < 1; phase += 0.01) {
      expect(heartbeat(phase)).toBeGreaterThanOrEqual(0);
    }
  });
});

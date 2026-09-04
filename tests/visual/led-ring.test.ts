import { describe, expect, it } from "vitest";
import { rampStops } from "../../src/lib/visual/led-ring";

describe("accent ramp", () => {
  it("walks the stops in order and wraps back to the first", () => {
    expect(rampStops(0, 3)).toEqual({ from: 0, to: 1, blend: 0 });
    expect(rampStops(0.5, 3).from).toBe(1);
    // Past the last stop it must return to the first, so the cycle has no seam.
    expect(rampStops(0.99, 3)).toMatchObject({ from: 2, to: 0 });
  });

  it("never selects a stop outside the palette", () => {
    for (const stopCount of [2, 3]) {
      for (let mix = -1; mix < 2; mix += 0.037) {
        const { from, to } = rampStops(mix, stopCount);

        expect(from).toBeGreaterThanOrEqual(0);
        expect(from).toBeLessThan(stopCount);
        expect(to).toBeGreaterThanOrEqual(0);
        expect(to).toBeLessThan(stopCount);
      }
    }
  });

  it("blends monotonically between two stops", () => {
    expect(rampStops(0.1, 3).blend).toBeLessThan(rampStops(0.2, 3).blend);
    expect(rampStops(0.1, 3).blend).toBeGreaterThanOrEqual(0);
    expect(rampStops(0.9, 3).blend).toBeLessThan(1);
  });

  it("repeats every full cycle, so the colour returns to where it started", () => {
    expect(rampStops(0.25, 3)).toEqual(rampStops(1.25, 3));
    expect(rampStops(0.25, 3)).toEqual(rampStops(4.25, 3));
  });

  it("handles a negative phase, which a delayed point on the far side produces", () => {
    expect(rampStops(-0.25, 3)).toEqual(rampStops(0.75, 3));
  });

  it("works for a two-stop ramp as well as a three-stop one", () => {
    expect(rampStops(0.6, 2)).toMatchObject({ from: 1, to: 0 });
  });

  it("degrades safely for an empty ramp instead of indexing out of bounds", () => {
    expect(rampStops(0.5, 0)).toEqual({ from: 0, to: 0, blend: 0 });
  });
});

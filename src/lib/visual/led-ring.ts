/**
 * Colour ramp helpers for the LED sphere. Each point on the surface takes its
 * colour from its own local pulse phase, so the ramp sweeps across the sphere in
 * step with the contraction rather than running on a separate clock.
 */

/**
 * Picks the two ramp stops a position falls between, and how far between them.
 * Wraps past the last stop back to the first so the cycle has no visible seam.
 */
export function rampStops(mix: number, stopCount: number): { from: number; to: number; blend: number } {
  if (stopCount <= 0) {
    return { from: 0, to: 0, blend: 0 };
  }

  const scaled = wrap(mix) * stopCount;
  const from = Math.floor(scaled) % stopCount;

  return { from, to: (from + 1) % stopCount, blend: scaled - Math.floor(scaled) };
}

function wrap(value: number) {
  return value - Math.floor(value);
}

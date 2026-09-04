import { describe, expect, it } from "vitest";
import { fillHeight, scrollProgress, scrollTargetFor } from "../../src/lib/visual/scrollbar";

describe("scroll progress", () => {
  it("reports nothing scrolled when the page fits the viewport", () => {
    expect(scrollProgress(0, 800, 800)).toBe(0);
    expect(scrollProgress(0, 600, 800)).toBe(0);
  });

  it("maps the top and bottom of the page to 0 and 1", () => {
    expect(scrollProgress(0, 2000, 800)).toBe(0);
    expect(scrollProgress(1200, 2000, 800)).toBe(1);
    expect(scrollProgress(600, 2000, 800)).toBeCloseTo(0.5, 5);
  });

  it("clamps a rubber-banded scroll position instead of overshooting", () => {
    expect(scrollProgress(-80, 2000, 800)).toBe(0);
    expect(scrollProgress(9999, 2000, 800)).toBe(1);
  });
});

describe("gutter fill", () => {
  it("fills in step with how far the page has been read", () => {
    expect(fillHeight(0, 800)).toBe(0);
    expect(fillHeight(0.5, 800)).toBe(400);
    expect(fillHeight(1, 800)).toBe(800);
  });

  it("never overflows the track, whatever progress it is handed", () => {
    expect(fillHeight(4, 800)).toBe(800);
    expect(fillHeight(-2, 800)).toBe(0);
  });

  it("has nothing to fill in a zero-height track", () => {
    expect(fillHeight(0.5, 0)).toBe(0);
    expect(fillHeight(1, -10)).toBe(0);
  });
});

describe("dragging the gutter", () => {
  it("maps the ends of the track to the ends of the page", () => {
    expect(scrollTargetFor(0, 800, 2000, 800)).toBe(0);
    expect(scrollTargetFor(800, 800, 2000, 800)).toBe(1200);
    expect(scrollTargetFor(400, 800, 2000, 800)).toBe(600);
  });

  it("clamps a grab that lands outside the track", () => {
    expect(scrollTargetFor(-50, 800, 2000, 800)).toBe(0);
    expect(scrollTargetFor(5000, 800, 2000, 800)).toBe(1200);
  });

  it("round-trips a position through progress, fill and back", () => {
    const [track, scrollHeight, viewport] = [800, 2000, 800];
    const progress = scrollProgress(450, scrollHeight, viewport);

    expect(scrollTargetFor(fillHeight(progress, track), track, scrollHeight, viewport)).toBeCloseTo(450, 5);
  });

  it("cannot scroll a page that does not scroll", () => {
    expect(scrollTargetFor(400, 800, 600, 800)).toBe(0);
    expect(scrollTargetFor(400, 0, 2000, 800)).toBe(0);
  });
});

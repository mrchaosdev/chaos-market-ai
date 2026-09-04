/**
 * Geometry for the scroll gutter. It fills from the top as the page is read, so
 * the bar reports position rather than the thumb-and-track proportion a native
 * scrollbar shows — how much is left to read is not encoded here.
 */

/** Scroll position as a 0..1 fraction, safe when the page does not scroll at all. */
export function scrollProgress(scrollTop: number, scrollHeight: number, viewportHeight: number): number {
  const scrollable = scrollHeight - viewportHeight;

  if (scrollable <= 0) {
    return 0;
  }

  return clamp(scrollTop / scrollable, 0, 1);
}

/** Height of the filled part of the gutter. */
export function fillHeight(progress: number, trackHeight: number): number {
  if (trackHeight <= 0) {
    return 0;
  }

  return clamp(progress, 0, 1) * trackHeight;
}

/** Inverse: where to scroll when the gutter is grabbed at a given offset. */
export function scrollTargetFor(pointerOffset: number, trackHeight: number, scrollHeight: number, viewportHeight: number): number {
  const scrollable = Math.max(scrollHeight - viewportHeight, 0);

  if (trackHeight <= 0) {
    return 0;
  }

  return clamp(pointerOffset / trackHeight, 0, 1) * scrollable;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import { fillHeight, scrollProgress, scrollTargetFor } from "@/lib/visual/scrollbar";

/**
 * The left gutter, filling from the top as the page is read. Scroll updates write
 * straight to the fill's style rather than going through React state, so it tracks
 * the page without a render in between.
 */
export function ChaosScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const frameRef = useRef(0);

  const paint = useCallback(() => {
    const track = trackRef.current;
    const fill = fillRef.current;

    if (!track || !fill) {
      return;
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const progress = scrollProgress(window.scrollY, scrollHeight, viewportHeight);

    fill.style.height = `${fillHeight(progress, track.clientHeight)}px`;
    // Nothing to scroll means nothing to report.
    track.style.opacity = scrollHeight - viewportHeight > 4 ? "1" : "0";
    track.dataset.scrollProgress = progress.toFixed(3);
  }, []);

  const schedulePaint = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(paint);
  }, [paint]);

  useEffect(() => {
    // Paint straight away rather than waiting for a frame: scheduling the first
    // one through rAF leaves the gutter empty for a frame, which reads as a flash.
    paint();
    window.addEventListener("scroll", schedulePaint, { passive: true });
    window.addEventListener("resize", paint);

    // The page grows when a workflow renders its result, and the fill has to
    // re-scale for it even though neither scroll nor viewport moved.
    const observer = new ResizeObserver(paint);
    observer.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", schedulePaint);
      window.removeEventListener("resize", paint);
      observer.disconnect();
    };
  }, [paint, schedulePaint]);

  const scrollFromPointer = useCallback((clientY: number) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const box = track.getBoundingClientRect();

    window.scrollTo({
      top: scrollTargetFor(clientY - box.top, box.height, document.documentElement.scrollHeight, window.innerHeight),
      behavior: "auto",
    });
  }, []);

  return (
    <div
      className="fixed inset-y-0 left-5 z-40 hidden w-[50px] cursor-pointer touch-none overflow-hidden border-x border-border bg-surface opacity-0 transition-opacity sm:block"
      data-scroll-progress="0"
      data-scrollbar
      onPointerDown={(event) => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        scrollFromPointer(event.clientY);
      }}
      onPointerMove={(event) => {
        if (draggingRef.current) {
          scrollFromPointer(event.clientY);
        }
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }}
      ref={trackRef}
    >
      <div className="w-full bg-foreground/90" data-scrollbar-fill ref={fillRef} style={{ height: 0 }} />
    </div>
  );
}

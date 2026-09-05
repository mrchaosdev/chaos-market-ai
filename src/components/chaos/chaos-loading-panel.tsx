type ChaosLoadingPanelProps = {
  label?: string;
};

/**
 * Route-level `loading.tsx` fallback for the workflow pages. Without one, an
 * App Router navigation to a `force-dynamic` page — every symbol/timeframe
 * switch on Analyze/Compare/Entry/Overview, since each re-runs the Binance
 * fetch and the deterministic pipeline server-side — leaves the *old* page
 * frozen on screen for however long that takes (measured 250-580ms locally,
 * longer under real network conditions) with zero feedback, then snaps to the
 * new one. That gap is what read as stutter, not frame rate: this fallback is
 * what Next shows instantly in its place while the real page streams in.
 *
 * Plain CSS animation, not GSAP: this has to paint before any script for the
 * destination page has even started running, so it cannot depend on one.
 */
export function ChaosLoadingPanel({ label = "Fetching live market data" }: ChaosLoadingPanelProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="cm-loading-panel border border-border bg-background p-8" data-loading-panel role="status">
      <div className="cm-loading-panel__row flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span aria-hidden className="cm-loading-panel__bars flex h-4 items-end gap-[3px]">
          <span className="cm-loading-panel__bar h-full w-[3px] rounded-full bg-primary" />
          <span className="cm-loading-panel__bar h-full w-[3px] rounded-full bg-primary" />
          <span className="cm-loading-panel__bar h-full w-[3px] rounded-full bg-primary" />
          <span className="cm-loading-panel__bar h-full w-[3px] rounded-full bg-primary" />
        </span>
        {label}
      </div>
    </div>
  );
}

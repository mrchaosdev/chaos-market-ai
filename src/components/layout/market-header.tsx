import { ChaosMetric } from "@/components/chaos/chaos-metric";
import { AppTopNav } from "./app-top-nav";

/**
 * The title band sits below the floating nav (see app-top-nav.tsx) and scrolls
 * away under it — only the nav pins. Left-cleared by the same 70px gutter width
 * as the scrollbar, so its content never sits under the fixed gutter.
 */
export function MarketHeader() {
  return (
    <>
      <AppTopNav />

      <div className="border-b border-border sm:pl-[70px]" data-market-header>
        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:pr-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Binance Agent OS Mini Hackathon</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Chaos Market AI</h1>
          </div>
          <div className="grid grid-cols-3 gap-3 tabular">
            <ChaosMetric label="Track" value="A" />
            <ChaosMetric label="Deadline" value="SEP 08" />
            <ChaosMetric label="Mode" value="READ ONLY" />
          </div>
        </div>
      </div>
    </>
  );
}

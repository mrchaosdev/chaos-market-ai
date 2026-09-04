import Link from "next/link";
import { ChaosLogo } from "@/components/chaos/chaos-logo";
import { ChaosMetric } from "@/components/chaos/chaos-metric";
import { AppNav } from "./app-nav";

export function MarketHeader() {
  return (
    <header className="border-b border-border bg-background/95" data-market-header>
      <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link className="flex items-center gap-4 transition-opacity hover:opacity-80" href="/">
          <ChaosLogo size={38} />
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Binance Agent OS Mini Hackathon</span>
            <span className="mt-2 block text-2xl font-semibold tracking-tight md:text-3xl">Chaos Market AI</span>
          </span>
        </Link>
        <div className="grid grid-cols-3 gap-3 tabular">
          <ChaosMetric label="Track" value="A" />
          <ChaosMetric label="Deadline" value="SEP 08" />
          <ChaosMetric label="Mode" value="READ ONLY" />
        </div>
      </div>

      <AppNav />
    </header>
  );
}

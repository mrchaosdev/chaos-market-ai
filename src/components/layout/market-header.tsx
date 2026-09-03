import { ChaosMetric } from "@/components/chaos/chaos-metric";

export function MarketHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background/95 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Binance Agent OS Mini Hackathon</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Chaos Market AI</h1>
      </div>
      <div className="grid grid-cols-3 gap-3 tabular">
        <ChaosMetric label="Track" value="A / B" />
        <ChaosMetric label="Deadline" value="SEP 08" />
        <ChaosMetric label="Mode" value="READ ONLY" />
      </div>
    </header>
  );
}

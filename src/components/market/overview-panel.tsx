import { formatNumber } from "@/lib/utils/format-number";
import { formatPercent } from "@/lib/utils/format-market";
import type { MarketOverviewResult } from "@/lib/workflows/types";
import { MarketAnalysisPanel } from "./market-analysis-panel";

export function OverviewPanel({ result }: { result: MarketOverviewResult }) {
  const [primary] = result.analyses;
  const movers = [...result.analyses].sort((a, b) => b.market.ticker.change24hPercent - a.market.ticker.change24hPercent);

  return (
    <div className="space-y-px bg-border">
      <section className="bg-background p-4 md:p-5">
        <div className="grid gap-px bg-border md:grid-cols-[1fr_200px]">
          <div className="bg-background p-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Market regime · {result.timeframe.toUpperCase()}</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{result.regime}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Derived from the mean deterministic signal alignment of {result.analyses.map((analysis) => analysis.symbol).join(", ")}.
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Average alignment</p>
            <p className="mt-4 font-mono text-4xl text-primary tabular">{result.averageScore}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">/ 100</p>
          </div>
        </div>

        <div className="mt-5 grid gap-px bg-border md:grid-cols-3">
          {movers.map((analysis) => (
            <div className="bg-background p-4" key={analysis.symbol}>
              <p className="font-mono text-xs text-muted-foreground">{analysis.symbol}</p>
              <p className="mt-3 font-mono text-2xl tabular">{formatNumber(analysis.market.ticker.price, 2)}</p>
              <p className={`mt-1 font-mono text-xs tabular ${analysis.market.ticker.change24hPercent >= 0 ? "text-positive" : "text-negative"}`}>
                {formatPercent(analysis.market.ticker.change24hPercent)} 24h
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">
                {analysis.signal.score} / 100 · {analysis.structure.trend}
              </p>
            </div>
          ))}
        </div>
      </section>

      {primary ? (
        <section className="bg-background">
          <MarketAnalysisPanel analysis={primary} />
        </section>
      ) : null}
    </div>
  );
}

import { maxSignalScore } from "@/lib/analysis/comparison";
import { formatNumber } from "@/lib/utils/format-number";
import { formatPercent } from "@/lib/utils/format-market";
import type { AssetAnalysis } from "@/lib/workflows/types";

export function MarketWatch({ analyses }: { analyses: AssetAnalysis[] }) {
  return (
    <div className="border border-border bg-background">
      <div className="border-b border-border p-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Market Watch</p>
      </div>
      <div className="divide-y divide-border">
        {analyses.map((analysis) => (
          <div className="grid grid-cols-4 gap-3 p-4 font-mono text-xs tabular" key={analysis.symbol}>
            <span>{analysis.symbol}</span>
            <span>{formatNumber(analysis.market.ticker.price, 2)}</span>
            <span className={analysis.market.ticker.change24hPercent >= 0 ? "text-positive" : "text-negative"}>
              {formatPercent(analysis.market.ticker.change24hPercent)}
            </span>
            <span className="text-muted-foreground">{analysis.signal.score} / {maxSignalScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

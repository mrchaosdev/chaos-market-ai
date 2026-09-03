import { comparisonDimensions, type ComparisonDimension } from "@/lib/analysis/comparison";
import { formatNumber } from "@/lib/utils/format-number";
import { formatPercent } from "@/lib/utils/format-market";
import type { CompareAssetsResult } from "@/lib/workflows/types";

const dimensionLabels: Record<ComparisonDimension, string> = {
  trend: "Trend",
  momentum: "Momentum",
  volume: "Volume",
  funding: "Funding",
  risk: "Risk Posture",
  total: "Total Signal",
};

export function ComparePanel({ result }: { result: CompareAssetsResult }) {
  return (
    <div className="space-y-px bg-border">
      <section className="bg-background p-4 md:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Relative Strength · {result.timeframe.toUpperCase()}</p>
        <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{result.relativeStrength ?? "No separation between assets"}</p>
        <div className="mt-5 grid gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
          {result.analyses.map((analysis) => (
            <div className="bg-background p-4" key={analysis.symbol}>
              <p className="font-mono text-xs text-muted-foreground">{analysis.symbol}</p>
              <p className="mt-3 font-mono text-3xl tabular">{formatNumber(analysis.market.ticker.price, 2)}</p>
              <p className={`mt-1 font-mono text-xs tabular ${analysis.market.ticker.change24hPercent >= 0 ? "text-positive" : "text-negative"}`}>
                {formatPercent(analysis.market.ticker.change24hPercent)} 24h
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">Signal {analysis.signal.score} / 100</p>
              <p className="mt-1 text-sm capitalize text-foreground">{analysis.signal.bias.replaceAll("-", " ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background p-4 md:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Normalized Dimensions</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">
                <th className="py-2 pr-4 font-normal">Dimension</th>
                {result.comparison.entries.map((entry) => (
                  <th className="py-2 pr-4 font-normal" key={entry.symbol}>
                    {entry.symbol}
                  </th>
                ))}
                <th className="py-2 font-normal">Leader</th>
              </tr>
            </thead>
            <tbody>
              {comparisonDimensions.map((dimension) => (
                <tr className="border-b border-border last:border-b-0" key={dimension}>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{dimensionLabels[dimension]}</td>
                  {result.comparison.entries.map((entry) => (
                    <td className="py-3 pr-4 font-mono text-sm tabular" key={entry.symbol}>
                      {entry.values[dimension]}
                    </td>
                  ))}
                  <td className="py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                    {result.comparison.leaders[dimension] ?? "tied"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle-foreground">
          Values are deterministic signal components normalized to 0-100. They are not probabilities.
        </p>
      </section>

      <section className="bg-background p-4 md:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Interpretation</p>
        <div className="mt-5 grid gap-px bg-border md:grid-cols-2">
          {result.analyses.map((analysis) => (
            <div className="bg-background p-4" key={analysis.symbol}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">{analysis.symbol}</p>
              <p className="mt-3 text-sm leading-6 text-foreground">{analysis.ai.summary}</p>
              <div className="mt-3 space-y-2">
                {analysis.ai.risks.map((risk) => (
                  <p className="text-sm leading-6 text-muted-foreground" key={risk}>
                    - {risk}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

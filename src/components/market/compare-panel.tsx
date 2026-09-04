import { maxSignalScore } from "@/lib/analysis/comparison";
import { formatNumber } from "@/lib/utils/format-number";
import { formatPercent } from "@/lib/utils/format-market";
import type { CompareAssetsResult } from "@/lib/workflows/types";

export function ComparePanel({ result }: { result: CompareAssetsResult }) {
  const count = result.analyses.length;
  const leader = result.analyses.find((analysis) => analysis.symbol === result.relativeStrength);

  return (
    <div className="cm-compare-panel space-y-px bg-border">
      <section className="cm-compare-panel__summary bg-background p-4 md:p-5">
        <p className="cm-compare-panel__title font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Relative strength · {result.timeframe.toUpperCase()}</p>

        {leader ? (
          <p className="cm-compare-panel__leader mt-4 text-3xl font-semibold tracking-[-0.04em]">
            {leader.symbol} leads on signal alignment
            <span className="cm-compare-panel__leader-score ml-3 font-mono text-xl text-primary tabular">{leader.signal.score} / {maxSignalScore}</span>
          </p>
        ) : (
          <p className="cm-compare-panel__leader cm-compare-panel__leader--tied mt-4 text-3xl font-semibold tracking-[-0.04em] text-muted-foreground">No asset separates on signal alignment</p>
        )}

        <div
          className="cm-compare-panel__assets mt-5 grid gap-px bg-border"
          style={{ gridTemplateColumns: `repeat(${Math.min(count, 3)}, minmax(0, 1fr))` }}
        >
          {result.analyses.map((analysis) => (
            <div className="cm-compare-asset bg-background p-4" key={analysis.symbol}>
              <p className="cm-compare-asset__symbol font-mono text-xs text-muted-foreground">{analysis.symbol}</p>
              <p className="cm-compare-asset__price mt-3 font-mono text-3xl tabular">{formatNumber(analysis.market.ticker.price, 2)}</p>
              <p className={`cm-compare-asset__change mt-1 font-mono text-xs tabular ${analysis.market.ticker.change24hPercent >= 0 ? "text-positive" : "text-negative"}`}>
                {formatPercent(analysis.market.ticker.change24hPercent)} 24h
              </p>
              <p className="cm-compare-asset__signal mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">Signal {analysis.signal.score} / {maxSignalScore}</p>
              <p className="cm-compare-asset__bias mt-1 text-sm capitalize text-foreground">{analysis.signal.bias.replaceAll("-", " ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cm-compare-panel__dimensions bg-background p-4 md:p-5">
        <p className="cm-compare-panel__section-title font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Measured dimensions</p>
        <div className="cm-compare-table__scroll mt-5 overflow-x-auto">
          <table className="cm-compare-table w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="cm-compare-table__header border-b border-border font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">
                <th className="py-2 pr-4 font-normal">Dimension</th>
                {result.comparison.rows[0]?.readings.map((reading) => (
                  <th className="py-2 pr-4 text-right font-normal" key={reading.symbol}>
                    {reading.symbol}
                  </th>
                ))}
                <th className="py-2 font-normal">Leader</th>
              </tr>
            </thead>
            <tbody>
              {result.comparison.rows.map((row) => (
                <tr className="cm-compare-table__row border-b border-border last:border-b-0" key={row.dimension}>
                  <td className="py-3 pr-4">
                    <span className="block text-sm text-foreground">{row.label}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-subtle-foreground">{row.measures}</span>
                  </td>
                  {row.readings.map((reading) => (
                    <td
                      className={`py-3 pr-4 text-right font-mono text-sm tabular ${reading.symbol === row.leader ? "text-primary" : "text-muted-foreground"}`}
                      key={reading.symbol}
                    >
                      {reading.display}
                    </td>
                  ))}
                  <td className="py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{row.leader ?? "tied"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cm-compare-panel__dimensions-note mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle-foreground">
          Every value is a measurement the workflow already took. None of them is a probability.
        </p>
      </section>

      <section className="cm-compare-panel__interpretation bg-background p-4 md:p-5">
        <p className="cm-compare-panel__section-title font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Interpretation</p>
        <div className="cm-compare-panel__interpretation-grid mt-5 grid gap-px bg-border md:grid-cols-2">
          {result.analyses.map((analysis) => (
            <div className="cm-compare-interpretation bg-background p-4" key={analysis.symbol}>
              <p className="cm-compare-interpretation__symbol font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">{analysis.symbol}</p>
              <p className="cm-compare-interpretation__summary mt-3 text-sm leading-6 text-foreground">{analysis.ai.summary}</p>
              <div className="cm-compare-interpretation__risks mt-3 space-y-2">
                {analysis.ai.risks.map((risk) => (
                  <p className="cm-compare-interpretation__risk text-sm leading-6 text-muted-foreground" key={risk}>
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

import { signalComponentMax } from "@/lib/analysis/comparison";
import { formatNumber } from "@/lib/utils/format-number";
import { formatPercent } from "@/lib/utils/format-market";
import type { AssetAnalysis } from "@/lib/workflows/types";
import { MarketChart } from "./market-chart";

type MarketAnalysisPanelProps = {
  analysis: AssetAnalysis;
  showChart?: boolean;
};

export function MarketAnalysisPanel({ analysis, showChart = true }: MarketAnalysisPanelProps) {
  const evidence = buildEvidence(analysis);

  return (
    <div className="grid gap-px bg-border xl:grid-cols-[1.25fr_0.75fr]">
      <div className="bg-surface p-4 md:p-5">
        <div className="grid gap-px bg-border md:grid-cols-[1fr_170px]">
          <div className="bg-background p-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {analysis.market.ticker.symbol} · {analysis.timeframe.toUpperCase()}
            </p>
            <p className="mt-4 font-mono text-5xl tracking-[-0.06em] tabular">{formatNumber(analysis.market.ticker.price)}</p>
          </div>
          <div className="bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Signal Alignment</p>
            <p className="mt-4 font-mono text-4xl text-primary tabular">{analysis.signal.score}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">/ 100 · not a probability</p>
          </div>
        </div>

        {showChart ? (
          <div className="mt-5">
            <MarketChart candles={analysis.market.candles} resistance={analysis.structure.resistance} support={analysis.structure.support} />
          </div>
        ) : null}

        <div className="mt-5 grid gap-px bg-border grid-cols-2 md:grid-cols-4">
          <Cell label="RSI" value={formatNullable(analysis.indicators.rsi, 1)} />
          <Cell label="EMA20" value={formatNullable(analysis.indicators.ema20, 2)} />
          <Cell label="EMA50" value={formatNullable(analysis.indicators.ema50, 2)} />
          <Cell label="ATR" value={formatNullable(analysis.indicators.atr, 2)} />
          <Cell label="Support" value={formatNullable(analysis.structure.support, 2)} />
          <Cell label="Resistance" value={formatNullable(analysis.structure.resistance, 2)} />
          <Cell label="Funding" value={`${formatNumber(analysis.market.funding.rate * 100, 4)}%`} />
          <Cell
            label="24H"
            tone={analysis.market.ticker.change24hPercent >= 0 ? "positive" : "negative"}
            value={formatPercent(analysis.market.ticker.change24hPercent)}
          />
        </div>

        <div className="mt-5 border border-border bg-background p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Signal Components</p>
          <div className="mt-4 space-y-3">
            {Object.entries(analysis.signal.components).map(([component, value]) => (
              <ComponentBar
                key={component}
                label={component}
                max={signalComponentMax[component as keyof typeof signalComponentMax]}
                value={value}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background p-4 md:p-5">
        <div className="grid gap-px bg-border">
          <section className="bg-surface p-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Market Structure</p>
            <p className="mt-5 text-3xl font-semibold capitalize tracking-[-0.04em]">{analysis.signal.bias.replaceAll("-", " ")}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <Definition label="Trend" value={analysis.structure.trend} />
              <Definition label="Momentum" value={analysis.structure.momentum} />
              <Definition label="Volatility" value={analysis.structure.volatility} />
              <Definition label="Volume" value={analysis.structure.volume} />
            </dl>
          </section>

          <section className="bg-surface p-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Evidence</p>
            <div className="mt-5 space-y-3">
              {evidence.map((item, index) => (
                <div className="grid grid-cols-[34px_1fr] gap-3 text-sm" key={item}>
                  <span className="font-mono text-xs text-subtle-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface p-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Interpretation</p>
            {analysis.aiDegraded ? (
              <p className="mt-3 border border-warning px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-warning">
                Provider degraded · deterministic interpretation
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-foreground">{analysis.ai.summary}</p>
            <div className="mt-4 space-y-2">
              {analysis.ai.observations.map((observation) => (
                <p className="text-sm leading-6 text-muted-foreground" key={observation}>
                  {observation}
                </p>
              ))}
            </div>
          </section>

          <section className="bg-surface p-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Risk</p>
            <div className="mt-4 space-y-2">
              {analysis.ai.risks.map((risk) => (
                <p className="text-sm leading-6 text-muted-foreground" key={risk}>
                  - {risk}
                </p>
              ))}
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs text-subtle-foreground">{analysis.ai.conclusion}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "positive" | "negative" }) {
  const toneClass = tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground";

  return (
    <div className="bg-background p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-mono text-sm tabular ${toneClass}`}>{value}</p>
    </div>
  );
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-subtle-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function ComponentBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="grid grid-cols-[92px_1fr_48px] items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="h-1.5 bg-surface-raised">
        <span className="block h-full bg-primary" style={{ width: `${Math.round((value / max) * 100)}%` }} />
      </span>
      <span className="text-right font-mono text-[11px] text-muted-foreground tabular">
        {value}/{max}
      </span>
    </div>
  );
}

function buildEvidence(analysis: AssetAnalysis) {
  return [
    `Price ${formatNumber(analysis.market.ticker.price, 2)} against EMA20 ${formatNullable(analysis.indicators.ema20, 2)} and EMA50 ${formatNullable(analysis.indicators.ema50, 2)}.`,
    `RSI ${formatNullable(analysis.indicators.rsi, 1)} classifies momentum as ${analysis.structure.momentum}.`,
    `ATR ${formatNullable(analysis.indicators.atr, 2)} classifies volatility as ${analysis.structure.volatility}.`,
    `Volume across the last ten candles is ${analysis.structure.volume}.`,
    `Funding rate is ${formatNumber(analysis.market.funding.rate * 100, 4)}%.`,
    `Order book depth: ${analysis.market.orderBook.bids.length} bid levels against ${analysis.market.orderBook.asks.length} ask levels.`,
  ];
}

function formatNullable(value: number | null, digits: number) {
  return value === null ? "n/a" : formatNumber(value, digits);
}

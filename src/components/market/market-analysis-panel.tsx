import type { AnalyzeAssetResult } from "@/lib/workflows/types";
import { formatNumber } from "@/lib/utils/format-number";
import { formatPercent } from "@/lib/utils/format-market";
import { MarketChart } from "./market-chart";

type MarketAnalysisPanelProps = {
  result: AnalyzeAssetResult;
};

export function MarketAnalysisPanel({ result }: MarketAnalysisPanelProps) {
  const evidence = buildEvidence(result);

  return (
    <div className="grid gap-px bg-border xl:grid-cols-[1.2fr_0.8fr]">
      <div className="bg-surface p-4 md:p-5">
        <div className="grid gap-px bg-border md:grid-cols-[1fr_170px]">
          <div className="bg-background p-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">{result.market.ticker.symbol} · 4H</p>
            <p className="mt-4 font-mono text-5xl tracking-[-0.06em] tabular">{formatNumber(result.market.ticker.price)}</p>
          </div>
          <div className="bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Signal Alignment</p>
            <p className="mt-4 font-mono text-4xl text-primary tabular">{result.signal.score}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">/ 100</p>
          </div>
        </div>

        <div className="mt-5">
          <MarketChart candles={result.market.candles} />
        </div>

        <div className="mt-5 grid gap-px bg-border md:grid-cols-4">
          <Cell label="RSI" value={result.indicators.rsi === null ? "n/a" : formatNumber(result.indicators.rsi, 1)} />
          <Cell label="EMA20" value={formatNullable(result.indicators.ema20)} />
          <Cell label="EMA50" value={formatNullable(result.indicators.ema50)} />
          <Cell label="24H" value={formatPercent(result.market.ticker.change24hPercent)} tone={result.market.ticker.change24hPercent >= 0 ? "positive" : "negative"} />
        </div>
      </div>

      <div className="bg-background p-4 md:p-5">
        <div className="grid gap-px bg-border">
          <section className="bg-surface p-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Bias</p>
            <p className="mt-5 text-3xl font-semibold capitalize tracking-[-0.04em]">{result.signal.bias.replaceAll("-", " ")}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{result.ai.summary}</p>
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
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Risk</p>
            <div className="mt-4 space-y-2">
              {result.ai.risks.map((risk) => (
                <p className="text-sm text-muted-foreground" key={risk}>- {risk}</p>
              ))}
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs text-subtle-foreground">{result.ai.conclusion}</p>
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

function buildEvidence(result: AnalyzeAssetResult) {
  return [
    `Trend structure: ${result.structure.trend}`,
    `Momentum: ${result.structure.momentum}`,
    `Volume state: ${result.structure.volume}`,
    `Funding rate: ${formatNumber(result.market.funding.rate * 100, 4)}%`,
  ];
}

function formatNullable(value: number | null) {
  return value === null ? "n/a" : formatNumber(value, 2);
}

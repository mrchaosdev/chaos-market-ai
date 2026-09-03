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
    <div className="grid gap-px bg-border md:grid-cols-[1fr_0.78fr]">
      <div className="bg-surface p-4 md:p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{result.market.ticker.symbol} · 4H Market Analysis</p>
            <p className="mt-2 font-mono text-3xl tabular">{formatNumber(result.market.ticker.price)}</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-positive tabular">{result.signal.score} / 100</span>
            <p className={result.market.ticker.change24hPercent >= 0 ? "mt-2 font-mono text-sm text-positive tabular" : "mt-2 font-mono text-sm text-negative tabular"}>
              {formatPercent(result.market.ticker.change24hPercent)}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <MarketChart candles={result.market.candles} />
        </div>
      </div>

      <div className="bg-surface p-4 md:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Evidence</p>
        <div className="mt-5 space-y-4">
          {evidence.map((item) => (
            <div className="grid grid-cols-[18px_1fr] gap-3 text-sm" key={item}>
              <span className="font-mono text-positive">+</span>
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-border pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Result</p>
          <p className="mt-2 text-2xl font-semibold capitalize">{result.signal.bias.replaceAll("-", " ")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{result.ai.summary}</p>
          <p className="mt-4 text-xs text-subtle-foreground">{result.ai.conclusion}</p>
        </div>
      </div>
    </div>
  );
}

function buildEvidence(result: AnalyzeAssetResult) {
  return [
    `Trend structure: ${result.structure.trend}`,
    `RSI: ${result.indicators.rsi === null ? "n/a" : formatNumber(result.indicators.rsi, 1)}`,
    `EMA20 / EMA50: ${formatNullable(result.indicators.ema20)} / ${formatNullable(result.indicators.ema50)}`,
    `Funding rate: ${formatNumber(result.market.funding.rate * 100, 4)}%`,
  ];
}

function formatNullable(value: number | null) {
  return value === null ? "n/a" : formatNumber(value, 2);
}

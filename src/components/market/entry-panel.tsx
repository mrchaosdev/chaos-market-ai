import { formatNumber } from "@/lib/utils/format-number";
import type { EntryAnalysisResult } from "@/lib/workflows/types";
import { MarketAnalysisPanel } from "./market-analysis-panel";

export function EntryPanel({ result }: { result: EntryAnalysisResult }) {
  const { entry } = result;

  return (
    <div className="space-y-px bg-border">
      <section className="bg-background p-4 md:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Entry-area structure · {result.symbol} · {result.timeframe.toUpperCase()}
        </p>

        <div className="mt-5 grid gap-px bg-border md:grid-cols-2 xl:grid-cols-4">
          <Field label="Current structure" value={entry.currentStructure} />
          <Field label="Current price" value={formatNumber(entry.currentPrice, 2)} />
          <Field
            label="Potential zone"
            value={entry.potentialZone === null ? "n/a" : `${formatNumber(entry.potentialZone.from, 2)} – ${formatNumber(entry.potentialZone.to, 2)}`}
          />
          <Field label="Invalidation" value={entry.invalidation === null ? "n/a" : formatNumber(entry.invalidation, 2)} />
          <Field label="Distance to support" value={formatNullablePercent(entry.distanceToSupportPercent)} />
          <Field label="Distance to resistance" value={formatNullablePercent(entry.distanceToResistancePercent)} />
          <Field label="Risk" value={entry.risk} tone="warning" />
          <Field label="Signal alignment" value={`${entry.signalAlignment} / 100`} />
        </div>

        <div className="mt-5 border border-border bg-surface p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Evidence</p>
          <div className="mt-4 space-y-3">
            {entry.evidence.map((item, index) => (
              <div className="grid grid-cols-[34px_1fr] gap-3 text-sm" key={item}>
                <span className="font-mono text-xs text-subtle-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs text-subtle-foreground">{entry.disclaimer}</p>
        </div>
      </section>

      <section className="bg-background">
        <MarketAnalysisPanel analysis={result} />
      </section>
    </div>
  );
}

function Field({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" }) {
  return (
    <div className="bg-background p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-mono text-sm capitalize tabular ${tone === "warning" ? "text-warning" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function formatNullablePercent(value: number | null) {
  return value === null ? "n/a" : `${formatNumber(value, 2)}%`;
}

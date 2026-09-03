import { AlertTriangle } from "lucide-react";
import type { ChaosErrorPayload } from "@/lib/utils/errors";

type ChaosDomainErrorProps = {
  error: ChaosErrorPayload;
  runId?: string | null;
  onRetry?: () => void;
};

export function ChaosDomainError({ error, runId, onRetry }: ChaosDomainErrorProps) {
  return (
    <section className="border border-negative bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-negative px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden className="size-4 text-negative" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-negative">{error.code}</p>
        </div>
        {runId ? <span className="font-mono text-[11px] text-subtle-foreground">{runId}</span> : null}
      </div>
      <div className="space-y-4 p-4">
        <p className="text-sm leading-6 text-foreground">{error.message}</p>
        <p className="border-l border-border pl-3 text-sm leading-6 text-muted-foreground">{error.hint}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">
          No analysis is produced from placeholder prices.
        </p>
        {onRetry ? (
          <button
            className="border border-border-strong px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-surface-hover"
            onClick={onRetry}
            type="button"
          >
            Run again
          </button>
        ) : null}
      </div>
    </section>
  );
}

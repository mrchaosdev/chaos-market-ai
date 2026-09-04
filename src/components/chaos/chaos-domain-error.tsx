import { AlertTriangle } from "lucide-react";
import type { ChaosErrorPayload } from "@/lib/utils/errors";

type ChaosDomainErrorProps = {
  error: ChaosErrorPayload;
  runId?: string | null;
  onRetry?: () => void;
};

export function ChaosDomainError({ error, runId, onRetry }: ChaosDomainErrorProps) {
  return (
    <section className="cm-domain-error border border-negative bg-background">
      <div className="cm-domain-error__header flex items-center justify-between gap-3 border-b border-negative px-4 py-3">
        <div className="cm-domain-error__identity flex items-center gap-2">
          <AlertTriangle aria-hidden className="size-4 text-negative" />
          <p className="cm-domain-error__code font-mono text-xs uppercase tracking-[0.2em] text-negative">{error.code}</p>
        </div>
        {runId ? <span className="cm-domain-error__run-id font-mono text-[11px] text-subtle-foreground">{runId}</span> : null}
      </div>
      <div className="cm-domain-error__body space-y-4 p-4">
        <p className="cm-domain-error__message text-sm leading-6 text-foreground">{error.message}</p>
        <p className="cm-domain-error__hint border-l border-border pl-3 text-sm leading-6 text-muted-foreground">{error.hint}</p>
        <p className="cm-domain-error__notice font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">
          No analysis is produced from placeholder prices.
        </p>
        {onRetry ? (
          <button
            className="cm-domain-error__retry border border-border-strong px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-surface-hover"
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

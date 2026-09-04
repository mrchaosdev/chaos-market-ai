export type ChaosStatusTone = "queued" | "running" | "success" | "warning" | "error";

export function ChaosStatus({ status }: { status: ChaosStatusTone }) {
  const className = {
    queued: "text-muted-foreground border-border",
    running: "text-primary border-primary",
    success: "text-positive border-positive",
    warning: "text-warning border-warning",
    error: "text-negative border-negative",
  }[status];

  return <span className={`cm-status cm-status--${status} shrink-0 whitespace-nowrap border px-2 py-1 font-mono text-[11px] uppercase ${className}`}>{status}</span>;
}

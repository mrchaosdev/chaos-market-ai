import { ChaosStatus, type ChaosStatusTone } from "./chaos-status";

export type ChaosTraceRowProps = {
  index: string;
  tool: string;
  detail: string;
  latency?: string;
  status: ChaosStatusTone;
};

export function ChaosTraceRow({ index, tool, detail, latency, status }: ChaosTraceRowProps) {
  return (
    <div className="grid grid-cols-[34px_1fr] gap-3 p-4 md:grid-cols-[34px_1fr_140px_80px]">
      <span className="font-mono text-xs text-subtle-foreground">{index}</span>
      <span className="text-sm">{tool}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{detail}</span>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground tabular">{latency}</span>
        <ChaosStatus status={status} />
      </div>
    </div>
  );
}

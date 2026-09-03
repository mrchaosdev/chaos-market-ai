import { ChaosStatus, type ChaosStatusTone } from "./chaos-status";

export type ChaosTraceRowProps = {
  index: string;
  tool: string;
  detail?: string;
  latency?: string;
  status: ChaosStatusTone;
};

export function ChaosTraceRow({ index, tool, detail, latency, status }: ChaosTraceRowProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <span className="w-6 shrink-0 font-mono text-xs text-subtle-foreground">{index}</span>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{tool}</span>
        {latency ? <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular">{latency}</span> : null}
        <ChaosStatus status={status} />
      </div>
      {detail ? <p className="mt-2 pl-9 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

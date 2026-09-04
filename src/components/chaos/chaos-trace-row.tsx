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
    <div className="cm-trace-row p-4">
      <div className="cm-trace-row__summary flex items-center gap-3">
        <span className="cm-trace-row__index w-6 shrink-0 font-mono text-xs text-subtle-foreground">{index}</span>
        <span className="cm-trace-row__tool min-w-0 flex-1 truncate font-mono text-xs text-foreground">{tool}</span>
        {latency ? <span className="cm-trace-row__latency shrink-0 font-mono text-[11px] text-muted-foreground tabular">{latency}</span> : null}
        <ChaosStatus status={status} />
      </div>
      {detail ? <p className="cm-trace-row__detail mt-2 pl-9 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

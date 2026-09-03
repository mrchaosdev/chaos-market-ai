import { ChaosTraceRow, type ChaosTraceRowProps } from "./chaos-trace-row";

export function ChaosTrace({ rows }: { rows: ChaosTraceRowProps[] }) {
  return (
    <div className="divide-y divide-border border border-border bg-background">
      {rows.map((row) => (
        <ChaosTraceRow {...row} key={`${row.index}-${row.tool}`} />
      ))}
    </div>
  );
}

import { Activity, Clock, Cpu, Database } from "lucide-react";
import type { WorkflowMeta } from "@/lib/workflows/types";

type WorkflowMetaBarProps = {
  meta: WorkflowMeta;
  runId: string;
  workflow: string;
};

export function WorkflowMetaBar({ meta, runId, workflow }: WorkflowMetaBarProps) {
  return (
    <div className="cm-workflow-meta flex flex-wrap items-center gap-x-5 gap-y-2 border border-border bg-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
      <Item icon={<Activity aria-hidden className="size-3.5" />} label={workflow} />
      <Item icon={<Database aria-hidden className="size-3.5" />} label={meta.dataProvider} tone={meta.isDemoData ? "warning" : "default"} />
      <Item icon={<Cpu aria-hidden className="size-3.5" />} label={`${meta.aiProvider} · ${meta.aiModel}`} tone={meta.aiDegraded ? "warning" : "default"} />
      <Item icon={<Clock aria-hidden className="size-3.5" />} label={`${meta.latencyMs}ms`} />
      <span className="cm-workflow-meta__run-id ml-auto text-subtle-foreground">{runId}</span>
    </div>
  );
}

function Item({ icon, label, tone = "default" }: { icon: React.ReactNode; label: string; tone?: "default" | "warning" }) {
  return (
    <span className={`cm-workflow-meta__item cm-workflow-meta__item--${tone} flex items-center gap-2 ${tone === "warning" ? "text-warning" : ""}`}>
      {icon}
      {label}
    </span>
  );
}

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { AgentTraceEvent, TracePhase } from "@/lib/agent/events";
import { ChaosStatus } from "@/components/chaos/chaos-status";

type AgentTraceProps = {
  events: AgentTraceEvent[];
  runId: string | null;
  isRunning: boolean;
};

const phaseLabels: Record<TracePhase, string> = {
  intent: "Intent",
  market_data: "Market Data",
  analytics: "Analytics",
  signal: "Signal",
  ai: "Reasoning",
  persistence: "Persistence",
};

const phaseOrder: TracePhase[] = ["intent", "market_data", "analytics", "signal", "ai", "persistence"];

export function AgentTrace({ events, runId, isRunning }: AgentTraceProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-trace-row]", { opacity: 0, x: -8, duration: 0.28, stagger: 0.04, ease: "power2.out" });
      });

      return () => media.revert();
    },
    { scope: container, dependencies: [events.length, runId] },
  );

  const groups = phaseOrder
    .map((phase) => ({ phase, rows: events.filter((event) => event.phase === phase) }))
    .filter((group) => group.rows.length > 0);

  return (
    <div className="border border-border bg-background" ref={container}>
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Chaos / {runId ?? "no run"}</p>
          <h3 className="mt-2 text-xl font-semibold">Agent execution stream</h3>
        </div>
        <span className="border border-primary px-2 py-1 font-mono text-[11px] uppercase text-primary">{isRunning ? "Running" : "Read only"}</span>
      </div>

      {events.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {isRunning ? "Workflow started. Trace rows appear as real steps complete." : "No workflow has been executed in this session yet."}
        </p>
      ) : (
        <div className="divide-y divide-border">
          {groups.map((group) => (
            <div key={group.phase}>
              <p className="bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle-foreground">{phaseLabels[group.phase]}</p>
              <div className="divide-y divide-border">
                {group.rows.map((event) => (
                  <TraceRow event={event} key={`${event.id}-${event.toolName ?? event.phase}-${event.createdAt}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TraceRow({ event }: { event: AgentTraceEvent }) {
  return (
    <div className="p-4" data-trace-row>
      <div className="flex items-center gap-3">
        <span className="w-6 shrink-0 font-mono text-xs text-subtle-foreground">{event.id}</span>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{event.toolName ?? phaseLabels[event.phase]}</span>
        {event.latencyMs === undefined ? null : (
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular">{event.latencyMs}ms</span>
        )}
        <ChaosStatus status={event.status} />
      </div>
      {event.inputSummary || event.outputSummary ? (
        <p className="mt-2 pl-9 text-xs leading-5 text-muted-foreground">
          {event.inputSummary ? <span className="text-subtle-foreground">{event.inputSummary} · </span> : null}
          {event.outputSummary ?? ""}
        </p>
      ) : null}
    </div>
  );
}

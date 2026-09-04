"use client";

import { ChaosSphere } from "@/components/chaos/chaos-sphere";
import type { AgentTraceEvent } from "@/lib/agent/events";
import { deriveAgentVitals, type AgentActivity } from "@/lib/agent/vitals";

type AgentSphereProps = {
  activity: AgentActivity;
  trace: AgentTraceEvent[];
  runId: string | null;
};

/**
 * The agent, as a body rather than as a caption. It beats faster while tools are
 * running and sends one ripple across its surface for every trace event that
 * actually completes, so the motion is the execution rather than a decoration
 * standing in for it. Drag to turn it.
 */
export function AgentSphere({ activity, trace, runId }: AgentSphereProps) {
  const vitals = deriveAgentVitals(activity, trace);

  return (
    <section className="border border-border bg-background" data-agent-sphere data-agent-state={vitals.state.toLowerCase()}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Chaos Agent</p>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle-foreground">{runId ?? "no run"}</span>
      </div>

      <ChaosSphere
        amplitude={vitals.amplitude}
        bpm={vitals.bpm}
        busy={vitals.busy}
        height={260}
        impulse={trace.length}
        interactive
        led
        points={780}
        tone={vitals.tone}
      />

      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border">
        <div className="bg-background px-4 py-3">
          <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">State</dt>
          <dd className={`mt-2 font-mono text-sm ${toneClass(vitals.tone)}`} data-agent-state-label>
            {vitals.state}
          </dd>
        </div>
        <div className="bg-background px-4 py-3">
          <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Rate</dt>
          <dd className="mt-2 font-mono text-sm tabular text-foreground">{vitals.bpm} BPM</dd>
        </div>
      </dl>

      <p className="border-t border-border px-4 py-3 text-xs leading-5 text-muted-foreground">{vitals.detail}</p>
    </section>
  );
}

function toneClass(tone: "positive" | "negative" | "neutral") {
  if (tone === "positive") {
    return "text-positive";
  }

  return tone === "negative" ? "text-negative" : "text-foreground";
}

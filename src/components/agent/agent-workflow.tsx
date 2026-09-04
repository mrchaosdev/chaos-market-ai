"use client";

import { useState } from "react";
import { AgentSphere } from "@/components/agent/agent-sphere";
import { AgentTrace } from "@/components/agent/agent-trace";
import { RunFeedback } from "@/components/agent/run-feedback";
import { ChaosCommandInput } from "@/components/chaos/chaos-command-input";
import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { ChaosTerminalSurface } from "@/components/chaos/chaos-terminal-surface";
import { WorkflowResult } from "@/components/market/workflow-result";
import type { AgentTraceEvent } from "@/lib/agent/events";
import type { AgentExecution } from "@/lib/agent/execute";
import type { AgentActivity } from "@/lib/agent/vitals";
import { createStreamParser } from "@/lib/agent/stream-protocol";
import { routedCommandExamples } from "@/lib/agent/router";

type WorkflowState = "idle" | "running" | "settled";

export function AgentWorkflow() {
  const [command, setCommand] = useState("Analyze BTC on 4H");
  const [state, setState] = useState<WorkflowState>("idle");
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [liveTrace, setLiveTrace] = useState<AgentTraceEvent[]>([]);
  const [transportError, setTransportError] = useState<string | null>(null);

  async function run(nextCommand: string) {
    setState("running");
    setExecution(null);
    setLiveTrace([]);
    setTransportError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: nextCommand, stream: true }),
      });

      if (!response.body) {
        throw new Error("NO_STREAM_BODY");
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      const parser = createStreamParser();

      const apply = (messages: ReturnType<typeof parser.push>) => {
        for (const message of messages) {
          if (message.type === "trace") {
            setLiveTrace((previous) => [...previous, message.event]);
          }

          if (message.type === "done") {
            setExecution(message.execution);
          }
        }
      };

      for (;;) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        apply(parser.push(value));
      }

      apply(parser.flush());
    } catch {
      setTransportError("The agent API could not be reached from this browser session.");
    } finally {
      setState("settled");
    }
  }

  // While the workflow runs the trace comes from the stream; once it settles the
  // authoritative trace from the execution takes over (it also carries the
  // synthesised intent and persistence rows).
  const activity: AgentActivity =
    state === "running"
      ? "running"
      : execution?.status === "error" || transportError !== null
        ? "failed"
        : execution?.status === "not_routed"
          ? "not_routed"
          : execution?.status === "success"
            ? "settled"
            : "idle";

  const settledTrace = execution && "trace" in execution ? execution.trace : null;
  const trace = settledTrace ?? liveTrace;
  const runId = execution && "runId" in execution ? execution.runId : (liveTrace[0]?.runId ?? null);

  return (
    <div className="grid gap-px bg-border xl:grid-cols-[minmax(460px,34%)_1fr]">
      <section className="space-y-8 bg-background/95 p-5 lg:p-8">
        <AgentSphere activity={activity} runId={runId} trace={trace} />

        <ChaosTerminalSurface>
          <div className="p-5">
            <ChaosCommandInput disabled={state === "running"} onChange={setCommand} onSubmit={() => run(command)} value={command} />
            <div className="mt-3 flex flex-wrap gap-2">
              {routedCommandExamples.map((example) => (
                <button
                  className="border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
                  disabled={state === "running"}
                  key={example}
                  onClick={() => {
                    setCommand(example);
                    void run(example);
                  }}
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </ChaosTerminalSurface>

        <div>
          <AgentTrace events={trace} isRunning={state === "running"} runId={runId} />
        </div>

        {execution?.status === "success" ? (
          <div className="mt-4">
            <RunFeedback persistence={execution.persistence} runId={execution.runId} />
          </div>
        ) : null}
      </section>

      <section className="bg-surface p-5 lg:p-8">
        {transportError ? (
          <ChaosDomainError
            error={{ code: "MARKET_DATA_ERROR", message: transportError, hint: "Check that the Next.js server is running and reachable." }}
            onRetry={() => run(command)}
          />
        ) : null}

        {execution?.status === "error" ? <ChaosDomainError error={execution.error} onRetry={() => run(command)} runId={execution.runId} /> : null}

        {execution?.status === "not_routed" ? <NotRouted execution={execution} onPick={(next) => { setCommand(next); void run(next); }} /> : null}

        {execution?.status === "success" ? <WorkflowResult result={execution.result} /> : null}

        {execution === null && !transportError ? <IdleState isRunning={state === "running"} /> : null}
      </section>
    </div>
  );
}

function NotRouted({ execution, onPick }: { execution: Extract<AgentExecution, { status: "not_routed" }>; onPick: (command: string) => void }) {
  return (
    <section className="border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warning">{execution.message}</p>
      </div>
      <div className="space-y-4 p-4">
        <p className="text-sm leading-6 text-muted-foreground">
          <span className="font-mono text-foreground">{execution.command}</span> does not map to a V1 workflow. The agent does not fall back to a general
          chatbot.
        </p>
        <div className="flex flex-wrap gap-2">
          {execution.suggestions.map((suggestion) => (
            <button
              className="border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover"
              key={suggestion}
              onClick={() => onPick(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function IdleState({ isRunning }: { isRunning: boolean }) {
  const steps = [
    { index: "01", label: "Market Data", detail: "ticker · klines · funding · order book" },
    { index: "02", label: "Calculation", detail: "EMA · RSI · ATR · volume · levels" },
    { index: "03", label: "Evidence", detail: "signal alignment before prose" },
  ];

  return (
    <section className="border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{isRunning ? "Workflow running" : "No workflow executed"}</p>
      </div>
      <div className="grid gap-px bg-border md:grid-cols-3">
        {steps.map((step) => (
          <div className="bg-background p-4" key={step.index}>
            <p className="font-mono text-xs text-subtle-foreground">{step.index}</p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{step.label}</p>
            <p className="mt-2 text-xs leading-5 text-subtle-foreground">{step.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

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
type ResultView = "output" | "execution";

export function AgentWorkflow() {
  const [command, setCommand] = useState("Analyze BTC on 4H");
  const [state, setState] = useState<WorkflowState>("idle");
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [liveTrace, setLiveTrace] = useState<AgentTraceEvent[]>([]);
  const [transportError, setTransportError] = useState<string | null>(null);
  const [resultView, setResultView] = useState<ResultView>("output");

  async function run(nextCommand: string) {
    setState("running");
    setExecution(null);
    setLiveTrace([]);
    setTransportError(null);
    setResultView("execution");

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
            setResultView("output");
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
      setResultView("output");
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
    <div className="cm-agent-workflow grid gap-px bg-border xl:grid-cols-[minmax(460px,34%)_1fr]">
      <section className="cm-agent-workflow__sidebar bg-background/95">
        <div className="cm-agent-workflow__controls h-full w-full p-5 lg:p-8">
          <div className="cm-agent-workflow__dock xl:sticky xl:top-[70px]">
            <AgentSphere activity={activity} runId={runId} trace={trace} />

            <div className="cm-agent-workflow__composer -mt-px">
              <ChaosTerminalSurface>
                <div className="cm-agent-workflow__command p-5">
                  <ChaosCommandInput disabled={state === "running"} onChange={setCommand} onSubmit={() => run(command)} value={command} />
                  <div className="cm-agent-workflow__examples mt-3 flex flex-wrap gap-2">
                    {routedCommandExamples.map((example) => (
                      <button
                        className="cm-agent-workflow__example border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
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
            </div>
          </div>
        </div>
      </section>

      <section className="cm-agent-workflow__result min-w-0 bg-surface">
        <header className="cm-agent-result-header border-b border-border bg-background px-5 py-3 lg:px-8 xl:sticky xl:top-[70px] xl:z-30">
          <div className="cm-agent-result-header__inner flex flex-wrap items-center justify-between gap-3">
            <div aria-label="Agent result view" className="cm-agent-result-tabs flex items-center gap-1" role="tablist">
              <button
                aria-controls="agent-output-panel"
                aria-selected={resultView === "output"}
                className={`cm-agent-result-tabs__tab cm-agent-result-tabs__tab--output min-w-24 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  resultView === "output" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-surface-hover"
                }`}
                id="agent-output-tab"
                onClick={() => setResultView("output")}
                role="tab"
                type="button"
              >
                Output
              </button>
              <button
                aria-controls="agent-execution-panel"
                aria-selected={resultView === "execution"}
                className={`cm-agent-result-tabs__tab cm-agent-result-tabs__tab--execution min-w-24 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  resultView === "execution" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-surface-hover"
                }`}
                id="agent-execution-tab"
                onClick={() => setResultView("execution")}
                role="tab"
                type="button"
              >
                Execution <span className="cm-agent-result-tabs__count tabular">{trace.length}</span>
              </button>
            </div>

            <div className="cm-agent-result-header__status flex min-w-0 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
              <span className={activity === "failed" ? "text-negative" : activity === "running" ? "text-primary" : "text-muted-foreground"}>
                {activityLabel(activity)}
              </span>
              <span className="cm-agent-result-header__run-id max-w-48 truncate text-subtle-foreground">{runId ?? "no run"}</span>
            </div>
          </div>
        </header>

        <div className="cm-agent-workflow__result-body p-5 lg:p-8">
          {resultView === "execution" ? (
            <div aria-labelledby="agent-execution-tab" className="cm-agent-workflow__trace" id="agent-execution-panel" role="tabpanel">
              <AgentTrace embedded events={trace} isRunning={state === "running"} runId={runId} />
            </div>
          ) : (
            <div aria-labelledby="agent-output-tab" className="cm-agent-workflow__output space-y-4" id="agent-output-panel" role="tabpanel">
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

              {execution?.status === "success" ? (
                <div className="cm-agent-workflow__feedback">
                  <RunFeedback persistence={execution.persistence} runId={execution.runId} />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function activityLabel(activity: AgentActivity) {
  if (activity === "settled") {
    return "complete";
  }

  return activity.replace("_", " ");
}

function NotRouted({ execution, onPick }: { execution: Extract<AgentExecution, { status: "not_routed" }>; onPick: (command: string) => void }) {
  return (
    <section className="cm-not-routed border border-border bg-background">
      <div className="cm-not-routed__header border-b border-border px-4 py-3">
        <p className="cm-not-routed__title font-mono text-xs uppercase tracking-[0.2em] text-warning">{execution.message}</p>
      </div>
      <div className="cm-not-routed__body space-y-4 p-4">
        <p className="cm-not-routed__message text-sm leading-6 text-muted-foreground">
          <span className="font-mono text-foreground">{execution.command}</span> does not map to a V1 workflow. The agent does not fall back to a general
          chatbot.
        </p>
        <div className="cm-not-routed__suggestions flex flex-wrap gap-2">
          {execution.suggestions.map((suggestion) => (
            <button
              className="cm-not-routed__suggestion border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover"
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
    <section className="cm-agent-idle border border-border bg-background">
      <div className="cm-agent-idle__header border-b border-border px-4 py-3">
        <p className="cm-agent-idle__title font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{isRunning ? "Workflow running" : "No workflow executed"}</p>
      </div>
      <div className="cm-agent-idle__steps grid gap-px bg-border md:grid-cols-3">
        {steps.map((step) => (
          <div className="cm-agent-idle__step bg-background p-4" key={step.index}>
            <p className="cm-agent-idle__step-index font-mono text-xs text-subtle-foreground">{step.index}</p>
            <p className="cm-agent-idle__step-label mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{step.label}</p>
            <p className="cm-agent-idle__step-detail mt-2 text-xs leading-5 text-subtle-foreground">{step.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

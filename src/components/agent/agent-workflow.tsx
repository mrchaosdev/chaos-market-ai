"use client";

import { useState } from "react";
import { AgentTrace } from "@/components/agent/agent-trace";
import { ChaosCommand } from "@/components/chaos/chaos-command";
import { ChaosPanel } from "@/components/chaos/chaos-panel";
import { ChaosTerminalSurface } from "@/components/chaos/chaos-terminal-surface";
import { MarketAnalysisPanel } from "@/components/market/market-analysis-panel";
import type { AnalyzeAssetResult } from "@/lib/workflows/types";

type WorkflowState = "idle" | "running" | "complete" | "error";

export function AgentWorkflow() {
  const [state, setState] = useState<WorkflowState>("idle");
  const [result, setResult] = useState<AnalyzeAssetResult | null>(null);

  async function runAnalysis() {
    setState("running");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: "BTCUSDT", timeframe: "4h" }),
      });

      if (!response.ok) {
        throw new Error("ANALYZE_WORKFLOW_FAILED");
      }

      const payload = (await response.json()) as AnalyzeAssetResult;
      setResult(payload);
      setState("complete");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="grid gap-px bg-border xl:grid-cols-[450px_1fr]">
      <section className="bg-background/95 p-5 lg:p-8">
        <ChaosTerminalSurface>
          <div className="p-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Chaos Agent</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.06em]">Intent becomes workflow. Workflow becomes evidence.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">No chat bubbles. No trading. The agent only routes commands into deterministic market inspection.</p>
          </div>
          <div className="border-t border-border p-5">
            <button className="block w-full text-left" onClick={runAnalysis} type="button">
              <ChaosCommand value="Analyze BTC on 4H" />
            </button>
          </div>
        </ChaosTerminalSurface>

        <div className="mt-8">
          <AgentTrace state={state} runId={result?.runId} />
        </div>
      </section>

      <section className="bg-surface p-5 lg:p-8">
        {result ? (
          <MarketAnalysisPanel result={result} />
        ) : (
          <ChaosPanel title="No Analysis Selected" meta="QUEUED">
            <div className="grid gap-px bg-border md:grid-cols-3">
              <EmptyStep index="01" label="Market Data" />
              <EmptyStep index="02" label="Calculation" />
              <EmptyStep index="03" label="Evidence" />
            </div>
          </ChaosPanel>
        )}
      </section>
    </div>
  );
}

function EmptyStep({ index, label }: { index: string; label: string }) {
  return (
    <div className="bg-background p-4">
      <p className="font-mono text-xs text-subtle-foreground">{index}</p>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AgentTrace } from "@/components/agent/agent-trace";
import { ChaosCommand } from "@/components/chaos/chaos-command";
import { ChaosPanel } from "@/components/chaos/chaos-panel";
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
    <div className="grid gap-px bg-border xl:grid-cols-[420px_1fr]">
      <section className="bg-surface p-5 lg:p-8">
        <div className="mb-5 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Chaos Agent</p>
          <h2 className="mt-2 text-2xl font-semibold">Run market inspection using natural language.</h2>
        </div>
        <button className="block w-full text-left" onClick={runAnalysis} type="button">
          <ChaosCommand value="Analyze BTC on 4H" />
        </button>
        <div className="mt-8">
          <AgentTrace state={state} runId={result?.runId} />
        </div>
      </section>

      <section className="bg-background p-5 lg:p-8">
        {result ? (
          <MarketAnalysisPanel result={result} />
        ) : (
          <ChaosPanel title="No Analysis Selected">
            <p className="text-sm text-muted-foreground">Run Chaos inspection to retrieve market data, calculate deterministic signals, and produce evidence-first interpretation.</p>
          </ChaosPanel>
        )}
      </section>
    </div>
  );
}

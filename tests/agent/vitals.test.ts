import { describe, expect, it } from "vitest";
import { deriveAgentVitals, idleBpm } from "../../src/lib/agent/vitals";
import type { AgentTraceEvent, TracePhase } from "../../src/lib/agent/events";

function event(phase: TracePhase, overrides: Partial<AgentTraceEvent> = {}): AgentTraceEvent {
  return {
    id: "01",
    runId: "run_test",
    workflow: "AnalyzeAssetWorkflow",
    phase,
    status: "success",
    createdAt: 1,
    ...overrides,
  };
}

describe("agent vitals", () => {
  it("rests slowly with nothing to do", () => {
    const vitals = deriveAgentVitals("idle", []);

    expect(vitals.bpm).toBe(idleBpm);
    expect(vitals.busy).toBe(false);
    expect(vitals.state).toBe("Resting");
  });

  it("beats fastest while Binance tools are in flight", () => {
    const marketData = deriveAgentVitals("running", [event("market_data")]);
    const analytics = deriveAgentVitals("running", [event("analytics")]);
    const interpretation = deriveAgentVitals("running", [event("ai")]);

    expect(marketData.bpm).toBeGreaterThan(analytics.bpm);
    expect(analytics.bpm).toBeGreaterThan(interpretation.bpm);
    expect(marketData.busy).toBe(true);
  });

  it("always beats faster while working than at rest", () => {
    const phases: TracePhase[] = ["intent", "market_data", "analytics", "signal", "ai", "persistence"];

    for (const phase of phases) {
      expect(deriveAgentVitals("running", [event(phase)]).bpm).toBeGreaterThan(idleBpm);
    }
  });

  it("describes the current phase in the workflow's own vocabulary", () => {
    expect(deriveAgentVitals("running", [event("market_data")]).detail).toMatch(/binance market data/i);
    expect(deriveAgentVitals("running", [event("signal")]).detail).toMatch(/signal alignment/i);
  });

  it("turns negative and slows when the workflow halts", () => {
    const vitals = deriveAgentVitals("failed", [event("market_data", { status: "error", outputSummary: "Binance is unreachable" })]);

    expect(vitals.tone).toBe("negative");
    expect(vitals.bpm).toBeLessThan(idleBpm);
    expect(vitals.detail).toBe("Binance is unreachable");
    expect(vitals.busy).toBe(false);
  });

  it("settles positive once a run completes, and reports how many steps ran", () => {
    const vitals = deriveAgentVitals("settled", [event("intent"), event("market_data"), event("ai")]);

    expect(vitals.tone).toBe("positive");
    expect(vitals.state).toBe("Complete");
    expect(vitals.detail).toBe("3 steps executed");
    expect(vitals.busy).toBe(false);
  });

  it("stays neutral and calm for an unrouted command", () => {
    const vitals = deriveAgentVitals("not_routed", []);

    expect(vitals.tone).toBe("neutral");
    expect(vitals.bpm).toBe(idleBpm);
    expect(vitals.state).toBe("Not routed");
  });

  it("never claims a state it cannot support", () => {
    const halted = deriveAgentVitals("failed", []);

    expect(halted.detail).toBe("The workflow stopped before interpretation");
  });
});

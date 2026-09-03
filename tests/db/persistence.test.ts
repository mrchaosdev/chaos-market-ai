import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isPersistenceEnabled, listAnalysisRuns, saveAnalysisRun, saveFeedback } from "../../src/lib/db/queries";
import type { AgentTraceEvent } from "../../src/lib/agent/events";

const originalUrl = process.env.DATABASE_URL;

const trace: AgentTraceEvent[] = [
  {
    id: "01",
    runId: "run_test",
    workflow: "AnalyzeAssetWorkflow",
    phase: "market_data",
    toolName: "getTicker",
    inputSummary: "BTCUSDT",
    outputSummary: "112,481.32",
    status: "success",
    latencyMs: 42,
    createdAt: 1,
  },
];

beforeEach(() => {
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  if (originalUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalUrl;
  }
});

describe("persistence without a database", () => {
  it("reports persistence as disabled", () => {
    expect(isPersistenceEnabled()).toBe(false);
  });

  it("does not fail a run when DATABASE_URL is missing", async () => {
    const status = await saveAnalysisRun({
      runId: "run_test",
      userQuery: "Analyze BTC on 4H",
      workflow: "AnalyzeAssetWorkflow",
      symbol: "BTCUSDT",
      timeframe: "4h",
      model: "chaos-deterministic",
      status: "success",
      latencyMs: 120,
      trace,
    });

    expect(status).toEqual({
      persisted: false,
      reason: "PERSISTENCE_DISABLED",
      message: "DATABASE_URL is not configured, so this run was not persisted.",
    });
  });

  it("reports feedback as not persisted rather than throwing", async () => {
    const status = await saveFeedback({ runId: "run_test", helpful: true });

    expect(status.persisted).toBe(false);
    expect(status.reason).toBe("PERSISTENCE_DISABLED");
  });

  it("returns an empty history instead of failing", async () => {
    expect(await listAnalysisRuns()).toEqual([]);
  });

  it("enables persistence when DATABASE_URL is present", () => {
    process.env.DATABASE_URL = "postgres://user:password@localhost:5432/chaos_market_ai";

    expect(isPersistenceEnabled()).toBe(true);
  });
});

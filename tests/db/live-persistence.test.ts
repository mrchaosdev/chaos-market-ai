import postgres from "postgres";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { AgentTraceEvent } from "../../src/lib/agent/events";

/**
 * Runs against a real PostgreSQL. Start one with:
 *
 *   docker run --name chaos-pg-test -e POSTGRES_PASSWORD=chaos -e POSTGRES_DB=chaos_test \
 *     -p 55432:5432 -d postgres:16
 *   DATABASE_URL=postgres://postgres:chaos@localhost:55432/chaos_test npx drizzle-kit migrate
 *
 * The suite skips loudly rather than silently when no database is reachable, so a
 * green run never hides the fact that nothing was exercised.
 */
const databaseUrl = process.env.TEST_DATABASE_URL ?? "postgres://postgres:chaos@localhost:55432/chaos_test";
const reachable = await canConnect(databaseUrl);

if (!reachable) {
  console.warn(`\n[live-persistence] SKIPPED — no PostgreSQL at ${databaseUrl.replace(/:[^:@]*@/, ":***@")}\n`);
}

// The query layer reads DATABASE_URL and memoises its connection on first use,
// so this has to be set before the module under test is imported.
process.env.DATABASE_URL = databaseUrl;

const { getRunFeedback, listAnalysisRuns, saveAnalysisRun, saveFeedback } = await import("../../src/lib/db/queries");

const sql = reachable ? postgres(databaseUrl, { max: 2 }) : null;

const trace: AgentTraceEvent[] = [
  {
    id: "01",
    runId: "run_live",
    workflow: "AnalyzeAssetWorkflow",
    phase: "market_data",
    toolName: "getTicker",
    inputSummary: "BTCUSDT",
    outputSummary: "112,481.32 · 2.31% 24h",
    status: "success",
    latencyMs: 42,
    createdAt: 1,
  },
  {
    id: "02",
    runId: "run_live",
    workflow: "AnalyzeAssetWorkflow",
    phase: "market_data",
    toolName: "getKlines",
    inputSummary: "BTCUSDT 4h",
    outputSummary: "200 candles",
    status: "success",
    latencyMs: 51,
    createdAt: 2,
  },
  // Not a tool call: analytics runs in-process and must not land in tool_calls.
  {
    id: "03",
    runId: "run_live",
    workflow: "AnalyzeAssetWorkflow",
    phase: "analytics",
    toolName: "indicatorEngine",
    outputSummary: "RSI 61.4",
    status: "success",
    latencyMs: 0,
    createdAt: 3,
  },
];

function runRecord(overrides: Partial<Parameters<typeof saveAnalysisRun>[0]> = {}) {
  return {
    runId: "run_live",
    userQuery: "Analyze BTC on 4H",
    workflow: "AnalyzeAssetWorkflow",
    symbol: "BTCUSDT",
    timeframe: "4h",
    model: "chaos-deterministic",
    status: "success" as const,
    latencyMs: 120,
    trace,
    marketContext: { price: 112481.32 },
    indicatorContext: { rsi: 61.4 },
    signalContext: { score: 88 },
    aiOutput: { summary: "structural read" },
    ...overrides,
  };
}

beforeEach(async () => {
  if (!sql) {
    return;
  }

  await sql`truncate table analysis_runs, tool_calls, analysis_results, feedback restart identity cascade`;
});

afterAll(async () => {
  await sql?.end({ timeout: 5 });
});

describe.skipIf(!reachable)("live persistence", () => {
  it("writes the run, its tool calls and its result in one save", async () => {
    const status = await saveAnalysisRun(runRecord());

    expect(status).toEqual({ persisted: true, reason: "SAVED", message: "Run run_live persisted." });

    const runs = await sql!`select * from analysis_runs`;
    expect(runs).toHaveLength(1);
    expect(runs[0].user_query).toBe("Analyze BTC on 4H");
    expect(runs[0].latency_ms).toBe(120);
    expect(runs[0].created_at).toBeInstanceOf(Date);

    const calls = await sql!`select * from tool_calls order by id`;
    expect(calls.map((call) => call.tool_name)).toEqual(["getTicker", "getKlines"]);
    expect(calls[0].latency_ms).toBe(42);
    expect(calls[0].output_json).toEqual({ summary: "112,481.32 · 2.31% 24h", errorCode: null });

    const results = await sql!`select * from analysis_results`;
    expect(results).toHaveLength(1);
    expect(results[0].market_context_json).toEqual({ price: 112481.32 });
    expect(results[0].ai_output_json).toEqual({ summary: "structural read" });
  });

  it("persists a failed run with its domain error instead of an AI output", async () => {
    await saveAnalysisRun(
      runRecord({
        runId: "run_failed",
        status: "error",
        model: null,
        aiOutput: undefined,
        error: { code: "BINANCE_UNAVAILABLE", message: "unreachable", hint: "check the region" },
      }),
    );

    const [run] = await sql!`select * from analysis_runs where id = 'run_failed'`;
    expect(run.status).toBe("error");
    expect(run.model).toBeNull();

    const [result] = await sql!`select * from analysis_results where analysis_run_id = 'run_failed'`;
    expect(result.ai_output_json.error.code).toBe("BINANCE_UNAVAILABLE");
    expect(result.ai_output_json.trace).toHaveLength(trace.length);
  });

  it("reads runs back newest first and honours the limit", async () => {
    await saveAnalysisRun(runRecord({ runId: "run_a" }));
    await sql!`update analysis_runs set created_at = now() - interval '1 hour' where id = 'run_a'`;
    await saveAnalysisRun(runRecord({ runId: "run_b", symbol: "ETHUSDT" }));

    const runs = await listAnalysisRuns();
    expect(runs.map((run) => run.id)).toEqual(["run_b", "run_a"]);
    expect(runs[0].symbol).toBe("ETHUSDT");
    expect(typeof runs[0].createdAt).toBe("string");

    expect(await listAnalysisRuns(1)).toHaveLength(1);
  });

  it("stores feedback against a run and reads it back", async () => {
    await saveAnalysisRun(runRecord());

    const status = await saveFeedback({ runId: "run_live", helpful: true, rating: 5, comment: "evidence was clear" });
    expect(status.persisted).toBe(true);

    const stored = await getRunFeedback("run_live");
    expect(stored).toHaveLength(1);
    expect(stored[0].helpful).toBe(true);
    expect(stored[0].rating).toBe(5);
    expect(stored[0].comment).toBe("evidence was clear");
  });

  it("refuses feedback for a run that does not exist", async () => {
    const status = await saveFeedback({ runId: "run_missing", helpful: true });

    expect(status.persisted).toBe(false);
    expect(status.reason).toBe("DATABASE_ERROR");
  });

  it("reports a duplicate run id as a database error rather than throwing", async () => {
    await saveAnalysisRun(runRecord());
    const second = await saveAnalysisRun(runRecord());

    expect(second.persisted).toBe(false);
    expect(second.reason).toBe("DATABASE_ERROR");
  });

  it("cascades children when a run is deleted", async () => {
    await saveAnalysisRun(runRecord());
    await saveFeedback({ runId: "run_live", helpful: false });

    await sql!`delete from analysis_runs where id = 'run_live'`;

    expect(await sql!`select 1 from tool_calls`).toHaveLength(0);
    expect(await sql!`select 1 from analysis_results`).toHaveLength(0);
    expect(await sql!`select 1 from feedback`).toHaveLength(0);
  });
});

async function canConnect(url: string) {
  const probe = postgres(url, { max: 1, connect_timeout: 3, onnotice: () => {} });

  try {
    await probe`select 1`;
    return true;
  } catch {
    return false;
  } finally {
    await probe.end({ timeout: 3 }).catch(() => {});
  }
}

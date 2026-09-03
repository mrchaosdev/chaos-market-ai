import { desc, eq } from "drizzle-orm";
import type { AgentTraceEvent } from "@/lib/agent/events";
import type { ChaosErrorPayload } from "@/lib/utils/errors";
import { createDb, isPersistenceEnabled } from "./index";
import { analysisResults, analysisRuns, feedback, toolCalls } from "./schema";

export type PersistenceReason = "SAVED" | "PERSISTENCE_DISABLED" | "DATABASE_ERROR";

export type PersistenceStatus = {
  persisted: boolean;
  reason: PersistenceReason;
  message: string;
};

export type AnalysisRunRecord = {
  runId: string;
  userQuery: string | null;
  workflow: string;
  symbol: string | null;
  timeframe: string | null;
  model: string | null;
  status: "success" | "error";
  latencyMs: number;
  trace: AgentTraceEvent[];
  marketContext?: unknown;
  indicatorContext?: unknown;
  signalContext?: unknown;
  aiOutput?: unknown;
  error?: ChaosErrorPayload | null;
};

export type AnalysisRunSummary = {
  id: string;
  userQuery: string | null;
  workflow: string;
  symbol: string | null;
  timeframe: string | null;
  model: string | null;
  status: string;
  latencyMs: number | null;
  createdAt: string;
};

export const persistenceDisabled: PersistenceStatus = {
  persisted: false,
  reason: "PERSISTENCE_DISABLED",
  message: "DATABASE_URL is not configured, so this run was not persisted.",
};

export async function saveAnalysisRun(record: AnalysisRunRecord): Promise<PersistenceStatus> {
  const db = createDb();

  if (!db) {
    return persistenceDisabled;
  }

  try {
    await db.insert(analysisRuns).values({
      id: record.runId,
      userQuery: record.userQuery,
      workflow: record.workflow,
      symbol: record.symbol,
      timeframe: record.timeframe,
      model: record.model,
      status: record.status,
      latencyMs: record.latencyMs,
    });

    const toolRows = record.trace
      .filter((event) => event.phase === "market_data" && event.toolName)
      .map((event) => ({
        id: `${record.runId}_${event.id}`,
        analysisRunId: record.runId,
        toolName: event.toolName as string,
        inputJson: { summary: event.inputSummary ?? null },
        outputJson: { summary: event.outputSummary ?? null, errorCode: event.errorCode ?? null },
        latencyMs: event.latencyMs ?? null,
        status: event.status,
      }));

    if (toolRows.length > 0) {
      await db.insert(toolCalls).values(toolRows);
    }

    await db.insert(analysisResults).values({
      id: `${record.runId}_result`,
      analysisRunId: record.runId,
      marketContextJson: toJson(record.marketContext),
      indicatorContextJson: toJson(record.indicatorContext),
      signalContextJson: toJson(record.signalContext),
      aiOutputJson: toJson(record.error ? { error: record.error, trace: record.trace } : record.aiOutput),
    });

    return { persisted: true, reason: "SAVED", message: `Run ${record.runId} persisted.` };
  } catch (error) {
    return {
      persisted: false,
      reason: "DATABASE_ERROR",
      message: error instanceof Error ? error.message : "Persistence failed.",
    };
  }
}

export async function listAnalysisRuns(limit = 25): Promise<AnalysisRunSummary[]> {
  const db = createDb();

  if (!db) {
    return [];
  }

  const rows = await db.select().from(analysisRuns).orderBy(desc(analysisRuns.createdAt)).limit(limit);

  return rows.map((row) => ({
    id: row.id,
    userQuery: row.userQuery,
    workflow: row.workflow,
    symbol: row.symbol,
    timeframe: row.timeframe,
    model: row.model,
    status: row.status,
    latencyMs: row.latencyMs,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function saveFeedback(input: { runId: string; helpful: boolean; rating?: number; comment?: string }): Promise<PersistenceStatus> {
  const db = createDb();

  if (!db) {
    return persistenceDisabled;
  }

  try {
    await db.insert(feedback).values({
      id: `${input.runId}_${Date.now().toString(36)}`,
      analysisRunId: input.runId,
      helpful: input.helpful,
      rating: input.rating ?? null,
      comment: input.comment ?? null,
    });

    return { persisted: true, reason: "SAVED", message: "Feedback saved." };
  } catch (error) {
    return {
      persisted: false,
      reason: "DATABASE_ERROR",
      message: error instanceof Error ? error.message : "Feedback persistence failed.",
    };
  }
}

export async function getRunFeedback(runId: string) {
  const db = createDb();

  if (!db) {
    return [];
  }

  return db.select().from(feedback).where(eq(feedback.analysisRunId, runId));
}

export { isPersistenceEnabled };

function toJson(value: unknown) {
  return value === undefined ? null : JSON.parse(JSON.stringify(value));
}

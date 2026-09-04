import type { AgentTraceEvent, TraceListener } from "@/lib/agent/events";
import { createMarketDataProvider } from "@/lib/market/factory";
import type { Timeframe } from "@/lib/market/types";
import { saveAnalysisRun, type PersistenceStatus } from "@/lib/db/queries";
import { logRun } from "@/lib/logger";
import { toChaosError, type ChaosErrorPayload } from "@/lib/utils/errors";
import { WorkflowFailure } from "@/lib/workflows/context";
import { analyzeAssetWorkflow, type AnalyzeAssetResult } from "@/lib/workflows/analyze-asset";
import { compareAssetsWorkflow, type CompareAssetsResult } from "@/lib/workflows/compare-assets";
import { entryAnalysisWorkflow, type EntryAnalysisResult } from "@/lib/workflows/entry-analysis";
import { marketOverviewWorkflow, type MarketOverviewResult } from "@/lib/workflows/market-overview";
import { defaultTimeframe, parseSymbols, parseTimeframe } from "./parse-command";
import { routeAgentIntent, routedCommandExamples, type AgentIntent } from "./router";

export type AgentWorkflowResult = AnalyzeAssetResult | CompareAssetsResult | EntryAnalysisResult | MarketOverviewResult;

export type AgentExecution =
  | {
      status: "success";
      intent: Exclude<AgentIntent, "UNKNOWN">;
      command: string;
      runId: string;
      trace: AgentTraceEvent[];
      result: AgentWorkflowResult;
      persistence: PersistenceStatus;
    }
  | {
      status: "not_routed";
      intent: "UNKNOWN";
      command: string;
      message: string;
      suggestions: string[];
    }
  | {
      status: "error";
      intent: AgentIntent;
      command: string;
      runId: string | null;
      trace: AgentTraceEvent[];
      error: ChaosErrorPayload;
      persistence: PersistenceStatus;
    };

export type ExecuteOptions = {
  onEvent?: TraceListener;
};

export async function executeAgentCommand(command: string, options: ExecuteOptions = {}): Promise<AgentExecution> {
  const startedAt = Date.now();
  const intent = routeAgentIntent(command);

  if (intent === "UNKNOWN") {
    logRun({ runId: null, workflow: "none", intent, status: "not_routed", latencyMs: Date.now() - startedAt });

    return {
      status: "not_routed",
      intent,
      command,
      message: "COMMAND NOT ROUTED",
      suggestions: routedCommandExamples,
    };
  }

  const timeframe = parseTimeframe(command);
  const symbols = parseSymbols(command);

  try {
    const result = await runWorkflow(intent, symbols, timeframe, options);
    const trace = [buildIntentEvent(result.runId, result.workflow, command, intent, startedAt), ...result.trace];
    const persistence = await persist(command, result, trace, startedAt);
    logRun({
      runId: result.runId,
      workflow: result.workflow,
      intent,
      status: "success",
      latencyMs: Date.now() - startedAt,
      persisted: persistence.persisted,
    });

    return {
      status: "success",
      intent,
      command,
      runId: result.runId,
      trace: [...trace, buildPersistenceEvent(result.runId, result.workflow, persistence)],
      result,
      persistence,
    };
  } catch (error) {
    const failure = error instanceof WorkflowFailure ? error : null;
    const chaosError = toChaosError(error);
    const runId = failure?.runId ?? null;
    const trace = failure
      ? [buildIntentEvent(failure.runId, failure.workflow, command, intent, startedAt), ...failure.trace]
      : [];
    const persistence = failure
      ? await saveAnalysisRun({
          runId: failure.runId,
          userQuery: command,
          workflow: failure.workflow,
          symbol: symbols[0] ?? null,
          timeframe,
          model: null,
          status: "error",
          latencyMs: Date.now() - startedAt,
          trace,
          error: chaosError.toPayload(),
        })
      : { persisted: false, reason: "DATABASE_ERROR" as const, message: "No run context to persist." };

    logRun({
      runId,
      workflow: failure?.workflow ?? "none",
      intent,
      status: "error",
      latencyMs: Date.now() - startedAt,
      errorCode: chaosError.code,
      persisted: persistence.persisted,
    });

    return {
      status: "error",
      intent,
      command,
      runId,
      trace,
      error: chaosError.toPayload(),
      persistence,
    };
  }
}

async function runWorkflow(intent: Exclude<AgentIntent, "UNKNOWN">, symbols: string[], timeframe: Timeframe, options: ExecuteOptions): Promise<AgentWorkflowResult> {
  const provider = createMarketDataProvider();

  if (intent === "MARKET_OVERVIEW") {
    return marketOverviewWorkflow(provider, timeframe, options);
  }

  if (intent === "COMPARE_ASSETS") {
    const pair = symbols.length >= 2 ? symbols.slice(0, 3) : ["BTCUSDT", "ETHUSDT"];
    return compareAssetsWorkflow(provider, pair, timeframe, options);
  }

  if (intent === "ENTRY_ANALYSIS") {
    return entryAnalysisWorkflow(provider, symbols[0] ?? "BTCUSDT", timeframe, options);
  }

  return analyzeAssetWorkflow(provider, { symbol: symbols[0] ?? "BTCUSDT", timeframe: timeframe ?? defaultTimeframe }, options);
}

async function persist(command: string, result: AgentWorkflowResult, trace: AgentTraceEvent[], startedAt: number) {
  const primary = "analyses" in result ? result.analyses[0] : result;

  return saveAnalysisRun({
    runId: result.runId,
    userQuery: command,
    workflow: result.workflow,
    symbol: "symbol" in primary ? primary.symbol : null,
    timeframe: result.timeframe,
    model: result.meta.aiModel,
    status: "success",
    latencyMs: Date.now() - startedAt,
    trace,
    marketContext: primary.aiContext.market,
    indicatorContext: primary.aiContext.indicators,
    signalContext: primary.signal,
    aiOutput: primary.ai,
  });
}

function buildIntentEvent(runId: string, workflow: string, command: string, intent: AgentIntent, startedAt: number): AgentTraceEvent {
  return {
    id: "00",
    runId,
    workflow,
    phase: "intent",
    inputSummary: command,
    outputSummary: `${intent} → ${workflow}`,
    status: "success",
    latencyMs: 0,
    createdAt: startedAt,
  };
}

function buildPersistenceEvent(runId: string, workflow: string, persistence: PersistenceStatus): AgentTraceEvent {
  return {
    id: "99",
    runId,
    workflow,
    phase: "persistence",
    toolName: "saveAnalysisRun",
    inputSummary: runId,
    outputSummary: persistence.message,
    status: persistence.persisted ? "success" : persistence.reason === "PERSISTENCE_DISABLED" ? "warning" : "error",
    createdAt: Date.now(),
  };
}

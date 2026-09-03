import { createAIProvider, createFallbackAIProvider } from "@/lib/ai/factory";
import type { AIProvider } from "@/lib/ai/provider";
import { createRunId, TraceRecorder, type AgentTraceEvent } from "@/lib/agent/events";
import { getMarketProviderDescriptor, type MarketProviderDescriptor } from "@/lib/market/factory";
import { ChaosError, toChaosError } from "@/lib/utils/errors";

export type WorkflowName = "AnalyzeAssetWorkflow" | "MarketOverviewWorkflow" | "CompareAssetsWorkflow" | "EntryAnalysisWorkflow";

export type WorkflowMeta = {
  aiProvider: string;
  aiModel: string;
  aiDegraded: boolean;
  dataProvider: string;
  isDemoData: boolean;
  latencyMs: number;
};

export type WorkflowContext = {
  recorder: TraceRecorder;
  ai: AIProvider;
  fallbackAi: AIProvider;
  dataProvider: MarketProviderDescriptor;
  startedAt: number;
};

export function createWorkflowContext(workflow: WorkflowName, runIdPrefix: string): WorkflowContext {
  return {
    recorder: new TraceRecorder(createRunId(runIdPrefix), workflow),
    ai: createAIProvider(),
    fallbackAi: createFallbackAIProvider(),
    dataProvider: getMarketProviderDescriptor(),
    startedAt: Date.now(),
  };
}

export class WorkflowFailure extends ChaosError {
  constructor(
    source: ChaosError,
    readonly runId: string,
    readonly workflow: WorkflowName,
    readonly trace: AgentTraceEvent[],
  ) {
    super(source.code, source.message, source.cause);
    this.name = "WorkflowFailure";
  }
}

export function toWorkflowFailure(error: unknown, context: WorkflowContext) {
  if (error instanceof WorkflowFailure) {
    return error;
  }

  return new WorkflowFailure(
    toChaosError(error),
    context.recorder.runId,
    context.recorder.workflow as WorkflowName,
    context.recorder.snapshot(),
  );
}

export function buildWorkflowMeta(context: WorkflowContext, aiDegraded: boolean): WorkflowMeta {
  const active = aiDegraded ? context.fallbackAi.descriptor : context.ai.descriptor;

  return {
    aiProvider: active.name,
    aiModel: active.model,
    aiDegraded,
    dataProvider: context.dataProvider.label,
    isDemoData: context.dataProvider.isDemo,
    latencyMs: Date.now() - context.startedAt,
  };
}

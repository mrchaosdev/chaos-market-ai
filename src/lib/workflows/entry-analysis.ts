import type { AgentTraceEvent } from "@/lib/agent/events";
import type { MarketDataProvider } from "@/lib/market/provider";
import type { Timeframe } from "@/lib/market/types";
import { analyzeAsset, type AssetAnalysis } from "./analyze-asset";
import { buildWorkflowMeta, createWorkflowContext, toWorkflowFailure, type WorkflowMeta } from "./context";

export type EntryContext = {
  currentStructure: AssetAnalysis["structure"]["trend"];
  currentPrice: number;
  distanceToSupportPercent: number | null;
  distanceToResistancePercent: number | null;
  potentialZone: { from: number; to: number } | null;
  invalidation: number | null;
  risk: "Elevated" | "Moderate" | "High";
  signalAlignment: number;
  evidence: string[];
  disclaimer: string;
};

export type EntryAnalysisResult = AssetAnalysis & {
  runId: string;
  workflow: "EntryAnalysisWorkflow";
  entry: EntryContext;
  trace: AgentTraceEvent[];
  meta: WorkflowMeta;
};

export async function entryAnalysisWorkflow(provider: MarketDataProvider, symbol: string, timeframe: Timeframe): Promise<EntryAnalysisResult> {
  const context = createWorkflowContext("EntryAnalysisWorkflow", "entry");

  try {
    const analysis = await analyzeAsset(provider, { symbol, timeframe }, context);

    const entry = await context.recorder.track(
      { phase: "signal", toolName: "entryContext", inputSummary: `${symbol} ${timeframe}` },
      () => buildEntryContext(analysis),
      { summarize: (value) => `${value.risk} risk · alignment ${value.signalAlignment}`, errorCode: "ANALYTICS_ERROR" },
    );

    return {
      ...analysis,
      runId: context.recorder.runId,
      workflow: "EntryAnalysisWorkflow",
      entry,
      trace: context.recorder.snapshot(),
      meta: buildWorkflowMeta(context, analysis.aiDegraded),
    };
  } catch (error) {
    throw toWorkflowFailure(error, context);
  }
}

function buildEntryContext(analysis: AssetAnalysis): EntryContext {
  const price = analysis.market.ticker.price;
  const { support, resistance } = analysis.structure;
  const atr = analysis.indicators.atr;

  return {
    currentStructure: analysis.structure.trend,
    currentPrice: price,
    distanceToSupportPercent: support === null ? null : ((price - support) / price) * 100,
    distanceToResistancePercent: resistance === null ? null : ((resistance - price) / price) * 100,
    potentialZone: support === null || atr === null ? null : { from: support, to: support + atr * 0.5 },
    invalidation: support === null || atr === null ? null : support - atr,
    risk: getRisk(analysis),
    signalAlignment: analysis.signal.score,
    evidence: buildEvidence(analysis),
    disclaimer: "Structural analysis only. This is not a trading instruction and signal alignment is not a probability.",
  };
}

function getRisk(analysis: AssetAnalysis): EntryContext["risk"] {
  if (analysis.structure.volatility === "high") {
    return "High";
  }

  return analysis.signal.score >= 62 ? "Moderate" : "Elevated";
}

function buildEvidence(analysis: AssetAnalysis) {
  return [
    `Trend structure is ${analysis.structure.trend} on ${analysis.timeframe}.`,
    `Momentum is ${analysis.structure.momentum} and volatility is ${analysis.structure.volatility}.`,
    `Volume state is ${analysis.structure.volume}.`,
    `Signal alignment is ${analysis.signal.score} out of 100 across six deterministic components.`,
  ];
}

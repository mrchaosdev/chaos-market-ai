import type { AgentTraceEvent } from "@/lib/agent/events";
import type { MarketDataProvider } from "@/lib/market/provider";
import type { Timeframe } from "@/lib/market/types";
import { analyzeAsset, type AssetAnalysis } from "./analyze-asset";
import { buildWorkflowMeta, createWorkflowContext, toWorkflowFailure, type WorkflowMeta, type WorkflowOptions } from "./context";

export const overviewSymbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

export type MarketRegime = "Moderately Bullish" | "Neutral" | "Defensive";

export type MarketOverviewResult = {
  runId: string;
  workflow: "MarketOverviewWorkflow";
  timeframe: Timeframe;
  regime: MarketRegime;
  averageScore: number;
  analyses: AssetAnalysis[];
  trace: AgentTraceEvent[];
  meta: WorkflowMeta;
};

export async function marketOverviewWorkflow(provider: MarketDataProvider, timeframe: Timeframe = "4h", options: WorkflowOptions = {}): Promise<MarketOverviewResult> {
  const context = createWorkflowContext("MarketOverviewWorkflow", "overview", options);

  try {
    const analyses = await Promise.all(overviewSymbols.map((symbol) => analyzeAsset(provider, { symbol, timeframe }, context)));
    const averageScore = Math.round(analyses.reduce((total, analysis) => total + analysis.signal.score, 0) / analyses.length);

    return {
      runId: context.recorder.runId,
      workflow: "MarketOverviewWorkflow",
      timeframe,
      regime: getRegime(averageScore),
      averageScore,
      analyses,
      trace: context.recorder.snapshot(),
      meta: buildWorkflowMeta(context, analyses.some((analysis) => analysis.aiDegraded)),
    };
  } catch (error) {
    throw toWorkflowFailure(error, context);
  }
}

function getRegime(averageScore: number): MarketRegime {
  if (averageScore >= 62) {
    return "Moderately Bullish";
  }

  if (averageScore >= 42) {
    return "Neutral";
  }

  return "Defensive";
}

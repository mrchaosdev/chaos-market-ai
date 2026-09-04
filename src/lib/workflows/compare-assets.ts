import type { AgentTraceEvent } from "@/lib/agent/events";
import { compareAssets, type ComparisonResult } from "@/lib/analysis/comparison";
import type { MarketDataProvider } from "@/lib/market/provider";
import type { Timeframe } from "@/lib/market/types";
import { analyzeAsset, type AssetAnalysis } from "./analyze-asset";
import { buildWorkflowMeta, createWorkflowContext, toWorkflowFailure, type WorkflowMeta, type WorkflowOptions } from "./context";

export type CompareAssetsResult = {
  runId: string;
  workflow: "CompareAssetsWorkflow";
  timeframe: Timeframe;
  analyses: AssetAnalysis[];
  comparison: ComparisonResult;
  relativeStrength: string | null;
  trace: AgentTraceEvent[];
  meta: WorkflowMeta;
};

export async function compareAssetsWorkflow(provider: MarketDataProvider, symbols: string[], timeframe: Timeframe, options: WorkflowOptions = {}): Promise<CompareAssetsResult> {
  const context = createWorkflowContext("CompareAssetsWorkflow", "compare", options);

  try {
    const analyses = await Promise.all(symbols.map((symbol) => analyzeAsset(provider, { symbol, timeframe }, context)));

    const comparison = await context.recorder.track(
      { phase: "signal", toolName: "comparisonEngine", inputSummary: symbols.join(" / ") },
      () =>
        compareAssets(
          analyses.map((analysis) => ({
            symbol: analysis.symbol,
            price: analysis.market.ticker.price,
            indicators: analysis.indicators,
            structure: analysis.structure,
            fundingRate: analysis.market.funding.rate,
            signal: analysis.signal,
          })),
        ),
      { summarize: (value) => `relative strength ${value.relativeStrength ?? "tied"}`, errorCode: "ANALYTICS_ERROR" },
    );

    return {
      runId: context.recorder.runId,
      workflow: "CompareAssetsWorkflow",
      timeframe,
      analyses,
      comparison,
      relativeStrength: comparison.relativeStrength,
      trace: context.recorder.snapshot(),
      meta: buildWorkflowMeta(context, analyses.some((analysis) => analysis.aiDegraded)),
    };
  } catch (error) {
    throw toWorkflowFailure(error, context);
  }
}

import type { MarketDataProvider } from "@/lib/market/provider";
import type { Timeframe } from "@/lib/market/types";
import { analyzeAssetWorkflow } from "./analyze-asset";

export async function entryAnalysisWorkflow(provider: MarketDataProvider, symbol: string, timeframe: Timeframe) {
  const analysis = await analyzeAssetWorkflow(provider, { symbol, timeframe });

  return {
    ...analysis,
    entryContext: {
      currentStructure: analysis.structure.trend,
      currentPrice: analysis.market.ticker.price,
      potentialArea: analysis.structure.support,
      resistance: analysis.structure.resistance,
      invalidation: analysis.structure.support,
      risk: analysis.signal.score >= 62 ? "Medium" : "High",
      disclaimer: "Market analysis only. Not a trading instruction.",
    },
  };
}

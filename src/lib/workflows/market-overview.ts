import type { MarketDataProvider } from "@/lib/market/provider";
import { analyzeAssetWorkflow } from "./analyze-asset";

export async function marketOverviewWorkflow(provider: MarketDataProvider) {
  const analyses = await Promise.all(["BTCUSDT", "ETHUSDT", "BNBUSDT"].map((symbol) => analyzeAssetWorkflow(provider, { symbol, timeframe: "4h" })));
  const averageScore = Math.round(analyses.reduce((total, analysis) => total + analysis.signal.score, 0) / analyses.length);

  return {
    runId: `overview_${Date.now().toString(36)}`,
    regime: averageScore >= 62 ? "Moderately Bullish" : averageScore >= 42 ? "Neutral" : "Defensive",
    averageScore,
    analyses,
  };
}

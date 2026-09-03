import type { MarketDataProvider } from "@/lib/market/provider";
import type { Timeframe } from "@/lib/market/types";
import { analyzeAssetWorkflow } from "./analyze-asset";

export async function compareAssetsWorkflow(provider: MarketDataProvider, symbols: string[], timeframe: Timeframe) {
  const analyses = await Promise.all(symbols.map((symbol) => analyzeAssetWorkflow(provider, { symbol, timeframe })));
  const [leader] = [...analyses].sort((a, b) => b.signal.score - a.signal.score);

  return {
    runId: `compare_${Date.now().toString(36)}`,
    timeframe,
    analyses,
    relativeStrength: leader.market.ticker.symbol,
  };
}

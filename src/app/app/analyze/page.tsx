import { AppShell } from "@/components/layout/app-shell";
import { MarketAnalysisPanel } from "@/components/market/market-analysis-panel";
import { BinanceDemoAdapter } from "@/lib/market/binance/adapter";
import { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";

export default async function AnalyzePage() {
  const result = await analyzeAssetWorkflow(new BinanceDemoAdapter(), { symbol: "BTCUSDT", timeframe: "4h" });

  return (
    <AppShell>
      <section className="bg-background p-5 lg:p-8">
        <MarketAnalysisPanel result={result} />
      </section>
    </AppShell>
  );
}

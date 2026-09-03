import { AppShell } from "@/components/layout/app-shell";
import { MarketAnalysisPanel } from "@/components/market/market-analysis-panel";
import { MarketWatch } from "@/components/market/market-watch";
import { createMarketDataProvider } from "@/lib/market/factory";
import { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const result = await analyzeAssetWorkflow(createMarketDataProvider(), { symbol: "BTCUSDT", timeframe: "4h" });

  return (
    <AppShell>
      <div className="grid flex-1 grid-cols-1 gap-px bg-border xl:grid-cols-[1fr_380px]">
        <section className="bg-background p-5 lg:p-8">
          <MarketAnalysisPanel result={result} />
        </section>
        <section className="bg-surface p-5 lg:p-8">
          <MarketWatch />
        </section>
      </div>
    </AppShell>
  );
}

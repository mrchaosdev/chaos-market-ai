import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { MarketAnalysisPanel } from "@/components/market/market-analysis-panel";
import { SymbolPicker } from "@/components/market/symbol-picker";
import { WorkflowMetaBar } from "@/components/market/workflow-meta-bar";
import { resolveSymbol } from "@/lib/agent/parse-command";
import { createMarketDataProvider } from "@/lib/market/factory";
import type { Timeframe } from "@/lib/market/types";
import { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";
import { runSafely } from "@/lib/workflows/safe-run";

export const dynamic = "force-dynamic";

const timeframes: Timeframe[] = ["15m", "1h", "4h", "1d"];

type AnalyzePageProps = {
  searchParams: Promise<{ symbol?: string; timeframe?: string }>;
};

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const params = await searchParams;
  const symbol = resolveSymbol(params.symbol);
  const timeframe = timeframes.find((value) => value === params.timeframe) ?? "4h";
  const outcome = await runSafely(() => analyzeAssetWorkflow(createMarketDataProvider(), { symbol, timeframe }));

  if (!outcome.ok) {
    return (
      <section className="cm-page cm-page--analyze cm-page--error space-y-4 bg-background p-5 lg:p-8">
        <SymbolPicker activeSymbol={symbol} basePath="/app/analyze" timeframe={timeframe} />
        <ChaosDomainError error={outcome.error} runId={outcome.runId} />
      </section>
    );
  }

  return (
    <section className="cm-page cm-page--analyze space-y-4 bg-background p-5 lg:p-8">
      <WorkflowMetaBar meta={outcome.data.meta} runId={outcome.data.runId} workflow={outcome.data.workflow} />
      <SymbolPicker activeSymbol={symbol} basePath="/app/analyze" timeframe={timeframe} />
      <MarketAnalysisPanel analysis={outcome.data} />
    </section>
  );
}

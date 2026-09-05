import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { ComparePanel } from "@/components/market/compare-panel";
import { SymbolMultiPicker } from "@/components/market/symbol-picker";
import { WorkflowMetaBar } from "@/components/market/workflow-meta-bar";
import { resolveSymbol } from "@/lib/agent/parse-command";
import { createMarketDataProvider } from "@/lib/market/factory";
import type { Timeframe } from "@/lib/market/types";
import { compareAssetsWorkflow } from "@/lib/workflows/compare-assets";
import { runSafely } from "@/lib/workflows/safe-run";

export const dynamic = "force-dynamic";

const timeframes: Timeframe[] = ["15m", "1h", "4h", "1d"];

type ComparePageProps = {
  searchParams: Promise<{ symbols?: string; timeframe?: string }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const requested = params.symbols?.split(",").filter((entry) => entry.trim().length > 0) ?? [];
  const resolved = [...new Set(requested.map((entry) => resolveSymbol(entry, "")).filter(Boolean))].slice(0, 3);
  const symbols = resolved.length > 0 ? resolved : ["BTCUSDT", "ETHUSDT"];
  const timeframe = timeframes.find((value) => value === params.timeframe) ?? "4h";
  const outcome = await runSafely(() => compareAssetsWorkflow(createMarketDataProvider(), symbols, timeframe));

  if (!outcome.ok) {
    return (
      <section className="cm-page cm-page--compare cm-page--error space-y-4 bg-background p-5 lg:p-8">
        <SymbolMultiPicker activeSymbols={symbols} basePath="/app/compare" timeframe={timeframe} />
        <ChaosDomainError error={outcome.error} runId={outcome.runId} />
      </section>
    );
  }

  return (
    <section className="cm-page cm-page--compare space-y-4 bg-background p-5 lg:p-8">
      <WorkflowMetaBar meta={outcome.data.meta} runId={outcome.data.runId} workflow={outcome.data.workflow} />
      <SymbolMultiPicker activeSymbols={symbols} basePath="/app/compare" timeframe={timeframe} />
      <ComparePanel result={outcome.data} />
    </section>
  );
}

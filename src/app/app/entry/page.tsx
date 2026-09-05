import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { EntryPanel } from "@/components/market/entry-panel";
import { SymbolPicker } from "@/components/market/symbol-picker";
import { WorkflowMetaBar } from "@/components/market/workflow-meta-bar";
import { resolveSymbol } from "@/lib/agent/parse-command";
import { createMarketDataProvider } from "@/lib/market/factory";
import type { Timeframe } from "@/lib/market/types";
import { entryAnalysisWorkflow } from "@/lib/workflows/entry-analysis";
import { runSafely } from "@/lib/workflows/safe-run";

export const dynamic = "force-dynamic";

const timeframes: Timeframe[] = ["15m", "1h", "4h", "1d"];

type EntryPageProps = {
  searchParams: Promise<{ symbol?: string; timeframe?: string }>;
};

export default async function EntryPage({ searchParams }: EntryPageProps) {
  const params = await searchParams;
  const symbol = resolveSymbol(params.symbol);
  const timeframe = timeframes.find((value) => value === params.timeframe) ?? "4h";
  const outcome = await runSafely(() => entryAnalysisWorkflow(createMarketDataProvider(), symbol, timeframe));

  if (!outcome.ok) {
    return (
      <section className="cm-page cm-page--entry cm-page--error space-y-4 bg-background p-5 lg:p-8">
        <SymbolPicker activeSymbol={symbol} basePath="/app/entry" timeframe={timeframe} />
        <ChaosDomainError error={outcome.error} runId={outcome.runId} />
      </section>
    );
  }

  return (
    <section className="cm-page cm-page--entry space-y-4 bg-background p-5 lg:p-8">
      <WorkflowMetaBar meta={outcome.data.meta} runId={outcome.data.runId} workflow={outcome.data.workflow} />
      <SymbolPicker activeSymbol={symbol} basePath="/app/entry" timeframe={timeframe} />
      <EntryPanel result={outcome.data} />
    </section>
  );
}

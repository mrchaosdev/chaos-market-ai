import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { AppShell } from "@/components/layout/app-shell";
import { EntryPanel } from "@/components/market/entry-panel";
import { WorkflowMetaBar } from "@/components/market/workflow-meta-bar";
import { normalizeSymbol } from "@/lib/agent/parse-command";
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
  const symbol = normalizeSymbol(params.symbol ?? "BTCUSDT");
  const timeframe = timeframes.find((value) => value === params.timeframe) ?? "4h";
  const outcome = await runSafely(() => entryAnalysisWorkflow(createMarketDataProvider(), symbol, timeframe));

  if (!outcome.ok) {
    return (
      <AppShell>
        <section className="cm-page cm-page--entry cm-page--error bg-background p-5 lg:p-8">
          <ChaosDomainError error={outcome.error} runId={outcome.runId} />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="cm-page cm-page--entry space-y-4 bg-background p-5 lg:p-8">
        <WorkflowMetaBar meta={outcome.data.meta} runId={outcome.data.runId} workflow={outcome.data.workflow} />
        <EntryPanel result={outcome.data} />
      </section>
    </AppShell>
  );
}

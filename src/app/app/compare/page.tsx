import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { AppShell } from "@/components/layout/app-shell";
import { ComparePanel } from "@/components/market/compare-panel";
import { WorkflowMetaBar } from "@/components/market/workflow-meta-bar";
import { normalizeSymbol } from "@/lib/agent/parse-command";
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
  const symbols = (params.symbols?.split(",") ?? ["BTCUSDT", "ETHUSDT"]).slice(0, 3).map(normalizeSymbol);
  const timeframe = timeframes.find((value) => value === params.timeframe) ?? "4h";
  const outcome = await runSafely(() => compareAssetsWorkflow(createMarketDataProvider(), symbols, timeframe));

  if (!outcome.ok) {
    return (
      <AppShell>
        <section className="bg-background p-5 lg:p-8">
          <ChaosDomainError error={outcome.error} runId={outcome.runId} />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="space-y-4 bg-background p-5 lg:p-8">
        <WorkflowMetaBar meta={outcome.data.meta} runId={outcome.data.runId} workflow={outcome.data.workflow} />
        <ComparePanel result={outcome.data} />
      </section>
    </AppShell>
  );
}

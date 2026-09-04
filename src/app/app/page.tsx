import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { AppShell } from "@/components/layout/app-shell";
import { MarketPulse } from "@/components/market/market-pulse";
import { MarketWatch } from "@/components/market/market-watch";
import { OverviewPanel } from "@/components/market/overview-panel";
import { WorkflowMetaBar } from "@/components/market/workflow-meta-bar";
import { createMarketDataProvider } from "@/lib/market/factory";
import { marketOverviewWorkflow } from "@/lib/workflows/market-overview";
import { runSafely } from "@/lib/workflows/safe-run";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const outcome = await runSafely(() => marketOverviewWorkflow(createMarketDataProvider()));

  if (!outcome.ok) {
    return (
      <AppShell>
        <section className="cm-page cm-page--overview cm-page--error bg-background p-5 lg:p-8">
          <ChaosDomainError error={outcome.error} runId={outcome.runId} />
        </section>
      </AppShell>
    );
  }

  const result = outcome.data;
  const [primary] = result.analyses;

  return (
    <AppShell>
      <div className="cm-overview-page grid flex-1 grid-cols-1 gap-px bg-border xl:grid-cols-[1fr_380px]">
        <section className="cm-overview-page__main space-y-4 bg-background p-5 lg:p-8">
          <WorkflowMetaBar meta={result.meta} runId={result.runId} workflow={result.workflow} />
          <OverviewPanel result={result} />
        </section>
        <section className="cm-overview-page__aside space-y-4 bg-surface p-5 lg:p-8">
          <MarketWatch analyses={result.analyses} />
          {primary ? (
            <MarketPulse
              signalScore={result.averageScore}
              trend={primary.structure.trend}
              volatility={primary.structure.volatility}
              volume={primary.structure.volume}
            />
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

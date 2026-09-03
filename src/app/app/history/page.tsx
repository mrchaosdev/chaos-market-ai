import { ChaosPanel } from "@/components/chaos/chaos-panel";
import { ChaosStatus, type ChaosStatusTone } from "@/components/chaos/chaos-status";
import { AppShell } from "@/components/layout/app-shell";
import { isPersistenceEnabled, listAnalysisRuns } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  if (!isPersistenceEnabled()) {
    return (
      <AppShell>
        <section className="bg-background p-5 lg:p-8">
          <ChaosPanel meta="PERSISTENCE DISABLED" title="Analysis History">
            <p className="text-sm leading-6 text-muted-foreground">
              <span className="font-mono text-foreground">DATABASE_URL</span> is not configured, so workflow runs are executed but not persisted. Set it in
              <span className="font-mono text-foreground"> .env.local</span> and run <span className="font-mono text-foreground">npm run db:migrate</span> to
              enable history.
            </p>
          </ChaosPanel>
        </section>
      </AppShell>
    );
  }

  const runs = await listAnalysisRuns();

  return (
    <AppShell>
      <section className="bg-background p-5 lg:p-8">
        <ChaosPanel meta={`${runs.length} RUNS`} title="Analysis History">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs persisted yet. Execute a workflow from the agent screen.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">
                    <th className="py-2 pr-4 font-normal">Run</th>
                    <th className="py-2 pr-4 font-normal">Workflow</th>
                    <th className="py-2 pr-4 font-normal">Symbol</th>
                    <th className="py-2 pr-4 font-normal">TF</th>
                    <th className="py-2 pr-4 font-normal">Model</th>
                    <th className="py-2 pr-4 font-normal">Latency</th>
                    <th className="py-2 pr-4 font-normal">Created</th>
                    <th className="py-2 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr className="border-b border-border last:border-b-0" key={run.id}>
                      <td className="py-3 pr-4 font-mono text-xs text-subtle-foreground">{run.id}</td>
                      <td className="py-3 pr-4 text-sm text-foreground">{run.workflow}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{run.symbol ?? "-"}</td>
                      <td className="py-3 pr-4 font-mono text-xs uppercase">{run.timeframe ?? "-"}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{run.model ?? "-"}</td>
                      <td className="py-3 pr-4 font-mono text-xs tabular">{run.latencyMs === null ? "-" : `${run.latencyMs}ms`}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{run.createdAt.replace("T", " ").slice(0, 19)}</td>
                      <td className="py-3">
                        <ChaosStatus status={toStatusTone(run.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChaosPanel>
      </section>
    </AppShell>
  );
}

function toStatusTone(status: string): ChaosStatusTone {
  return status === "success" || status === "error" || status === "warning" || status === "running" ? status : "queued";
}

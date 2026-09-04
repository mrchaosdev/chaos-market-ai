import { ChaosPanel } from "@/components/chaos/chaos-panel";
import { ChaosStatus, type ChaosStatusTone } from "@/components/chaos/chaos-status";
import { AppShell } from "@/components/layout/app-shell";
import { isPersistenceEnabled, listAnalysisRuns } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const persistedTables = [
  {
    name: "analysis_runs",
    purpose: "One row per executed workflow, with the command that triggered it and how long it took.",
    columns: "id · user_query · workflow · symbol · timeframe · model · status · latency_ms",
  },
  {
    name: "tool_calls",
    purpose: "One row per Binance call the workflow actually made, with its latency and outcome.",
    columns: "id · analysis_run_id · tool_name · input_json · output_json · latency_ms · status",
  },
  {
    name: "analysis_results",
    purpose: "The market context, deterministic indicators, signal result and validated AI output.",
    columns: "id · analysis_run_id · market_context · indicator_context · signal_context · ai_output",
  },
  {
    name: "feedback",
    purpose: "Whether a run was useful, which is the seed corpus for later evaluation work.",
    columns: "id · analysis_run_id · helpful · rating · comment",
  },
];

export default async function HistoryPage() {
  if (!isPersistenceEnabled()) {
    return (
      <AppShell>
        <section className="cm-page cm-page--history cm-history--disabled space-y-4 bg-background p-5 lg:p-8">
          <ChaosPanel meta="PERSISTENCE DISABLED" title="Analysis History">
            <p className="cm-history__disabled-message text-sm leading-6 text-muted-foreground">
              <span className="font-mono text-foreground">DATABASE_URL</span> is not configured, so workflow runs execute normally but are not written anywhere.
              The agent screen reports the same thing on every run rather than pretending a run was saved.
            </p>
            <p className="cm-history__setup-hint mt-4 text-sm leading-6 text-muted-foreground">
              Set it in <span className="font-mono text-foreground">.env.local</span> and run{" "}
              <span className="font-mono text-foreground">npm run db:migrate</span> to enable history.
            </p>
          </ChaosPanel>

          <ChaosPanel meta="DRIZZLE SCHEMA" title="What A Run Would Persist">
            <div className="cm-history__schema-grid grid gap-px bg-border md:grid-cols-2">
              {persistedTables.map((table) => (
                <div className="cm-history__schema-card bg-background p-4" key={table.name}>
                  <p className="cm-history__schema-name font-mono text-xs uppercase tracking-[0.18em] text-primary">{table.name}</p>
                  <p className="cm-history__schema-purpose mt-2 text-sm leading-6 text-muted-foreground">{table.purpose}</p>
                  <p className="cm-history__schema-columns mt-3 font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-subtle-foreground">{table.columns}</p>
                </div>
              ))}
            </div>
            <p className="cm-history__privacy-note mt-4 text-xs leading-5 text-subtle-foreground">
              Sanitised summaries only. No secrets, no credentials, and no raw ticker firehose — see <span className="font-mono">docs/DATABASE.md</span> §4.
            </p>
          </ChaosPanel>
        </section>
      </AppShell>
    );
  }

  const runs = await listAnalysisRuns();

  return (
    <AppShell>
      <section className="cm-page cm-page--history bg-background p-5 lg:p-8">
        <ChaosPanel meta={`${runs.length} RUNS`} title="Analysis History">
          {runs.length === 0 ? (
            <p className="cm-history__empty text-sm text-muted-foreground">No runs persisted yet. Execute a workflow from the agent screen.</p>
          ) : (
            <div className="cm-history__table-scroll overflow-x-auto">
              <table className="cm-history__table w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="cm-history__table-header border-b border-border font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">
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
                    <tr className="cm-history__row border-b border-border last:border-b-0" key={run.id}>
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

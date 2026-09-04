import { ChaosPanel } from "@/components/chaos/chaos-panel";
import { ChaosStatus } from "@/components/chaos/chaos-status";
import { AppShell } from "@/components/layout/app-shell";
import { createAIProvider } from "@/lib/ai/factory";
import { isPersistenceEnabled } from "@/lib/db/queries";
import { getMarketProviderDescriptor } from "@/lib/market/factory";
import { marketCacheTtlMs } from "@/lib/market/cache";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const marketProvider = getMarketProviderDescriptor();
  const ai = createAIProvider().descriptor;
  const persistence = isPersistenceEnabled();

  return (
    <AppShell>
      <section className="cm-page cm-page--settings space-y-px bg-border">
        <div className="cm-settings__runtime bg-background p-5 lg:p-8">
          <ChaosPanel meta="SERVER ONLY" title="Runtime Configuration">
            <div className="cm-settings__runtime-grid grid gap-px bg-border md:grid-cols-2">
              <Row label="Market provider" value={marketProvider.label} status={marketProvider.isDemo ? "warning" : "success"} />
              <Row label="AI provider" value={ai.name} status={ai.isFallback ? "warning" : "success"} />
              <Row label="AI model" value={ai.model} status="queued" />
              <Row label="Persistence" value={persistence ? "PostgreSQL configured" : "DATABASE_URL not set"} status={persistence ? "success" : "warning"} />
              <Row label="Ticker cache TTL" value={`${marketCacheTtlMs.ticker / 1000}s`} status="queued" />
              <Row label="Funding cache TTL" value={`${marketCacheTtlMs.funding / 1000}s`} status="queued" />
            </div>
          </ChaosPanel>
        </div>

        <div className="cm-settings__safety bg-background p-5 lg:p-8">
          <ChaosPanel meta="READ ONLY" title="Safety Posture">
            <ul className="cm-settings__safety-list space-y-3 text-sm leading-6 text-muted-foreground">
              <li>No trading API keys are read, stored, or required.</li>
              <li>No order, cancel, or withdrawal route exists in this application.</li>
              <li>
                Secrets are read from server-only environment variables. Nothing is exposed through <span className="font-mono text-foreground">NEXT_PUBLIC_*</span>.
              </li>
              <li>Signal alignment is a deterministic component score, never a probability of outcome.</li>
            </ul>
          </ChaosPanel>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ label, value, status }: { label: string; value: string; status: "success" | "warning" | "queued" }) {
  return (
    <div className="cm-settings-row flex items-center justify-between gap-3 bg-background p-4">
      <div className="cm-settings-row__content">
        <p className="cm-settings-row__label font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="cm-settings-row__value mt-2 font-mono text-sm text-foreground">{value}</p>
      </div>
      <ChaosStatus status={status} />
    </div>
  );
}

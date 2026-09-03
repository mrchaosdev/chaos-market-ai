import { ChaosPanel } from "@/components/chaos/chaos-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="bg-background p-5 lg:p-8">
        <ChaosPanel title="Settings">
          <div className="grid gap-4 text-sm text-muted-foreground">
            <p>AI provider, Binance MCP URL, and database URL are configured through server-only environment variables.</p>
            <p>V1 is read-only and does not use trading API keys.</p>
          </div>
        </ChaosPanel>
      </section>
    </AppShell>
  );
}

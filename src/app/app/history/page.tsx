import { ChaosPanel } from "@/components/chaos/chaos-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function HistoryPage() {
  return (
    <AppShell>
      <section className="bg-background p-5 lg:p-8">
        <ChaosPanel title="Analysis History">
          <p className="text-sm text-muted-foreground">No persisted runs yet. PostgreSQL history is scaffolded for V1 integration.</p>
        </ChaosPanel>
      </section>
    </AppShell>
  );
}

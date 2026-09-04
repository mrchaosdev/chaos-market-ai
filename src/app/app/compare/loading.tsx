import { ChaosLoadingPanel } from "@/components/chaos/chaos-loading-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <section className="cm-page cm-page--compare cm-page--loading bg-background p-5 lg:p-8">
        <ChaosLoadingPanel label="Fetching assets to compare" />
      </section>
    </AppShell>
  );
}
